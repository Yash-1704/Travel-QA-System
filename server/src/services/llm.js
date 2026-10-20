import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config, requireEnv } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../');

const CACHE_DIR = path.resolve(REPO_ROOT, 'cache');
const LLM_CACHE_FILE = path.join(CACHE_DIR, 'llm-cache.json');
const USAGE_FILE = path.join(CACHE_DIR, 'usage.json');

export class DailyBudgetError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DailyBudgetError';
  }
}

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// In-memory cache loaded once
let llmCache = {};
if (fs.existsSync(LLM_CACHE_FILE)) {
  try {
    llmCache = JSON.parse(fs.readFileSync(LLM_CACHE_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to parse llm-cache.json, starting with empty cache:', err.message);
    llmCache = {};
  }
}

function saveLlmCache() {
  const tmpFile = `${LLM_CACHE_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(llmCache, null, 2), 'utf8');
  fs.renameSync(tmpFile, LLM_CACHE_FILE);
}

function getUtcToday() {
  return new Date().toISOString().slice(0, 10);
}

function loadUsage() {
  const today = getUtcToday();
  if (fs.existsSync(USAGE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
      if (data && data.date === today) {
        return data;
      }
    } catch {
      // ignore
    }
  }
  return { date: today, tokens: 0, lastHeaders: {} };
}

let usageState = loadUsage();

function saveUsage() {
  const tmpFile = `${USAGE_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(usageState, null, 2), 'utf8');
  fs.renameSync(tmpFile, USAGE_FILE);
}

export function getDailyUsage() {
  const today = getUtcToday();
  if (usageState.date !== today) {
    usageState = { date: today, tokens: 0, lastHeaders: {} };
    saveUsage();
  }
  return { ...usageState };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Queue for serializing real Groq calls and enforcing min interval
let callQueue = Promise.resolve();
let lastCallStartTime = 0;

function computeCacheKey(model, system, prompt, maxTokens) {
  const payload = JSON.stringify({
    model,
    system: system || null,
    prompt,
    maxTokens,
    temperature: 0
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Call Groq chat completion API with caching, throttling, and retry logic.
 */
export async function callLLM({ system, prompt, maxTokens = 512, bypassCache = false }) {
  const model = config.GROQ_MODEL || 'qwen/qwen3.8-27b';
  const cacheKey = computeCacheKey(model, system, prompt, maxTokens);

  // Check cache first if not bypassing
  if (!bypassCache && llmCache[cacheKey]) {
    const entry = llmCache[cacheKey];
    return {
      text: entry.text,
      latencyMs: entry.latencyMs,
      tokens: { ...entry.tokens },
      cached: true
    };
  }

  // Queue up the real call
  const executeCall = async () => {
    // Check usage cap
    const currentUsage = getDailyUsage();
    const cap = config.GROQ_DAILY_TOKEN_CAP;
    if (currentUsage.tokens >= cap) {
      throw new DailyBudgetError(
        `Daily token cap reached: ${currentUsage.tokens}/${cap}. Resume after the quota resets; cached results are kept.`
      );
    }

    // Throttle: ensure GROQ_MIN_INTERVAL_MS between call starts
    const minInterval = config.GROQ_MIN_INTERVAL_MS || 5000;
    const now = Date.now();
    const elapsed = now - lastCallStartTime;
    if (lastCallStartTime > 0 && elapsed < minInterval) {
      await sleep(minInterval - elapsed);
    }
    lastCallStartTime = Date.now();

    const apiKey = requireEnv('GROQ_API_KEY');
    const messages = [];
    if (system) {
      messages.push({ role: 'system', content: system });
    }
    messages.push({ role: 'user', content: prompt });

    const reqBody = {
      model,
      messages,
      temperature: 0,
      max_tokens: maxTokens
    };

    let attempt = 0;
    const maxAttempts = 5;

    while (attempt < maxAttempts) {
      attempt++;
      const startTime = Date.now();
      let res;
      try {
        res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqBody)
        });
      } catch (networkErr) {
        if (attempt >= maxAttempts) throw networkErr;
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      const latencyMs = Date.now() - startTime;

      // Extract ratelimit headers
      const headersObj = {};
      for (const [k, v] of res.headers.entries()) {
        if (k.toLowerCase().startsWith('x-ratelimit-')) {
          headersObj[k.toLowerCase()] = v;
        }
      }

      if (res.status === 429) {
        const retryAfterHeader = res.headers.get('retry-after');
        const retryAfterSec = retryAfterHeader ? parseFloat(retryAfterHeader) : null;

        if (retryAfterSec !== null && retryAfterSec > 120) {
          // Treat as daily exhaustion
          usageState.tokens = config.GROQ_DAILY_TOKEN_CAP;
          usageState.lastHeaders = headersObj;
          saveUsage();
          throw new DailyBudgetError(
            `Daily token cap reached: ${usageState.tokens}/${config.GROQ_DAILY_TOKEN_CAP}. Resume after the quota resets; cached results are kept.`
          );
        }

        if (attempt >= maxAttempts) {
          const bodyText = await res.text().catch(() => '');
          throw new Error(`Groq 429 rate limit exceeded after ${maxAttempts} attempts: ${bodyText}`);
        }

        const waitMs = (retryAfterSec !== null && !isNaN(retryAfterSec))
          ? retryAfterSec * 1000
          : Math.pow(2, attempt) * 1000;
        await sleep(waitMs);
        continue;
      }

      if (res.status >= 500) {
        if (attempt >= maxAttempts) {
          const bodyText = await res.text().catch(() => '');
          throw new Error(`Groq 5xx server error (${res.status}) after ${maxAttempts} attempts: ${bodyText}`);
        }
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        throw new Error(`Groq request failed with status ${res.status}: ${bodyText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const tokens = {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0
      };

      // Update usage
      usageState.tokens += tokens.total;
      usageState.lastHeaders = headersObj;
      saveUsage();

      console.log(
        `[Groq] latency: ${latencyMs}ms, tokens: ${tokens.total} (p:${tokens.prompt}, c:${tokens.completion}), daily: ${usageState.tokens}/${config.GROQ_DAILY_TOKEN_CAP}`
      );

      // Save to cache if key doesn't exist (never overwrite on bypass)
      if (!llmCache[cacheKey]) {
        llmCache[cacheKey] = {
          text,
          latencyMs,
          tokens,
          createdAt: new Date().toISOString()
        };
        saveLlmCache();
      }

      return {
        text,
        latencyMs,
        tokens,
        cached: false
      };
    }

    throw new Error(`Groq call failed after ${maxAttempts} attempts`);
  };

  // Run sequentially in the promise queue
  const resultPromise = callQueue.then(executeCall, executeCall);
  callQueue = resultPromise.catch(() => {});
  return resultPromise;
}

export default {
  callLLM,
  getDailyUsage,
  DailyBudgetError
};
