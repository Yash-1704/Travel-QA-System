import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config, requireEnv } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../');

const CACHE_DIR = path.resolve(REPO_ROOT, 'cache');
const EMBED_CACHE_FILE = path.join(CACHE_DIR, 'embed-cache.json');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

let embedCache = {};
if (fs.existsSync(EMBED_CACHE_FILE)) {
  try {
    embedCache = JSON.parse(fs.readFileSync(EMBED_CACHE_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to parse embed-cache.json, using empty cache:', err.message);
    embedCache = {};
  }
}

function saveEmbedCache() {
  const tmpFile = `${EMBED_CACHE_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(embedCache), 'utf8');
  fs.renameSync(tmpFile, EMBED_CACHE_FILE);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let lastEmbedCallTime = 0;
let embedQueue = Promise.resolve();

function computeCacheKey(model, taskType, text) {
  return crypto.createHash('sha256').update(`${model}${taskType}${text}`).digest('hex');
}

/**
 * Probe available Gemini embedding models and return chosen model name & dimension.
 */
export async function probeEmbeddingModel(apiKey) {
  const key = apiKey || requireEnv('GEMINI_API_KEY');
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: { 'x-goog-api-key': key }
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to list Gemini models (${res.status}): ${body}`);
  }

  const data = await res.json();
  const candidateModels = (data.models || []).filter(m => {
    const methods = m.supportedGenerationMethods || [];
    return methods.includes('embedContent') || methods.includes('batchEmbedContents');
  });

  if (candidateModels.length === 0) {
    throw new Error('No embedding-capable models found for this Gemini API key');
  }

  // Prefer name containing "gemini-embedding" (e.g. text-embedding-004 or gemini-embedding-...)
  let selected = candidateModels.find(m => m.name.includes('gemini-embedding'));
  if (!selected) {
    // Prefer text-embedding-004 if present
    selected = candidateModels.find(m => m.name.includes('text-embedding-004'));
  }
  if (!selected) {
    selected = candidateModels[0];
  }

  const modelName = selected.name.replace(/^models\//, '');

  // Confirm with a real embedding call to verify and obtain dimension
  const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:batchEmbedContents`;
  const testRes = await fetch(testUrl, {
    method: 'POST',
    headers: {
      'x-goog-api-key': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          model: `models/${modelName}`,
          content: { parts: [{ text: 'test probe' }] },
          taskType: 'RETRIEVAL_QUERY'
        }
      ]
    })
  });

  if (!testRes.ok) {
    const body = await testRes.text().catch(() => '');
    throw new Error(`Probe confirmation test failed for ${modelName} (${testRes.status}): ${body}`);
  }

  const testData = await testRes.json();
  const dimension = testData.embeddings?.[0]?.values?.length;

  return {
    model: modelName,
    dimension
  };
}

/**
 * Embed multiple texts using Gemini batchEmbedContents with caching, batching (<=50), and throttling.
 * @param {string[]} texts
 * @param {object} [opts]
 * @param {string} [opts.taskType="RETRIEVAL_DOCUMENT"]
 * @param {boolean} [opts.bypassCache=false]
 * @returns {Promise<number[][]>} embeddings in input order
 */
export async function embedTexts(texts, { taskType = 'RETRIEVAL_DOCUMENT', bypassCache = false } = {}) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const model = config.GEMINI_EMBED_MODEL;
  if (!model) {
    throw new Error('GEMINI_EMBED_MODEL is not set in environment or config');
  }

  const apiKey = requireEnv('GEMINI_API_KEY');
  const results = new Array(texts.length);
  const uncachedIndices = [];

  // Identify cached items
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const key = computeCacheKey(model, taskType, text);
    if (!bypassCache && embedCache[key]) {
      results[i] = embedCache[key];
    } else {
      uncachedIndices.push(i);
    }
  }

  if (uncachedIndices.length === 0) {
    return results;
  }

  // Send uncached texts in batches of at most 50
  const BATCH_SIZE = 50;
  for (let b = 0; b < uncachedIndices.length; b += BATCH_SIZE) {
    const batchIndices = uncachedIndices.slice(b, b + BATCH_SIZE);
    const batchRequests = batchIndices.map(idx => ({
      model: `models/${model}`,
      content: { parts: [{ text: texts[idx] }] },
      taskType
    }));

    // Execute through serial queue to respect GEMINI_EMBED_MIN_INTERVAL_MS
    const executeBatch = async () => {
      const minInterval = config.GEMINI_EMBED_MIN_INTERVAL_MS || 1000;
      const now = Date.now();
      const elapsed = now - lastEmbedCallTime;
      if (lastEmbedCallTime > 0 && elapsed < minInterval) {
        await sleep(minInterval - elapsed);
      }
      lastEmbedCallTime = Date.now();

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents`;
      let attempt = 0;
      const maxAttempts = 5;

      while (attempt < maxAttempts) {
        attempt++;
        let res;
        try {
          res = await fetch(url, {
            method: 'POST',
            headers: {
              'x-goog-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests: batchRequests })
          });
        } catch (netErr) {
          if (attempt >= maxAttempts) throw netErr;
          await sleep(Math.pow(2, attempt) * 1000);
          continue;
        }

        if (res.status === 429 || res.status >= 500) {
          if (attempt >= maxAttempts) {
            const body = await res.text().catch(() => '');
            throw new Error(`Gemini embed failed with status ${res.status} after ${maxAttempts} attempts: ${body}`);
          }
          const retryHeader = res.headers.get('retry-after');
          const retrySec = retryHeader ? parseFloat(retryHeader) : null;
          const waitMs = (retrySec !== null && !isNaN(retrySec))
            ? retrySec * 1000
            : Math.pow(2, attempt) * 1000;
          await sleep(waitMs);
          continue;
        }

        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`Gemini embed request failed with status ${res.status}: ${body}`);
        }

        const data = await res.json();
        const embeddings = data.embeddings || [];

        if (embeddings.length !== batchIndices.length) {
          throw new Error(`Gemini batchEmbedContents returned ${embeddings.length} embeddings, expected ${batchIndices.length}`);
        }

        let newCacheEntries = 0;
        for (let j = 0; j < batchIndices.length; j++) {
          const originalIdx = batchIndices[j];
          const embeddingVector = embeddings[j].values;
          results[originalIdx] = embeddingVector;

          const text = texts[originalIdx];
          const key = computeCacheKey(model, taskType, text);
          if (!embedCache[key]) {
            embedCache[key] = embeddingVector;
            newCacheEntries++;
          }
        }

        if (newCacheEntries > 0) {
          saveEmbedCache();
        }

        return;
      }

      throw new Error(`Gemini embed failed after ${maxAttempts} attempts`);
    };

    const batchPromise = embedQueue.then(executeBatch, executeBatch);
    embedQueue = batchPromise.catch(() => {});
    await batchPromise;
  }

  return results;
}

/**
 * Embed a single query string using RETRIEVAL_QUERY taskType.
 * @param {string} text
 * @param {object} [opts]
 * @param {boolean} [opts.bypassCache=false]
 * @returns {Promise<number[]>}
 */
export async function embedQuery(text, { bypassCache = false } = {}) {
  const [vector] = await embedTexts([text], {
    taskType: 'RETRIEVAL_QUERY',
    bypassCache
  });
  return vector;
}

export default {
  embedTexts,
  embedQuery,
  probeEmbeddingModel
};
