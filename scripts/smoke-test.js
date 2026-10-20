import { ChromaClient } from 'chromadb';
import { MongoClient } from 'mongodb';
import { callLLM, getDailyUsage } from '../server/src/services/llm.js';
import { embedQuery } from '../server/src/services/embed.js';
import { config } from '../server/src/config.js';

async function runSmokeTest() {
  console.log('========================================');
  console.log('STARTING SMOKE TEST');
  console.log('========================================\n');

  let allPass = true;

  // ----------------------------------------
  // Test (a): Groq Call (bypassCache: true)
  // ----------------------------------------
  let groqResult1;
  let usageBeforeGroq = getDailyUsage().tokens;
  try {
    process.stdout.write('(a) Groq Call (Reply with exactly: OK, bypassCache=true)... ');
    groqResult1 = await callLLM({
      prompt: 'Reply with exactly: OK',
      maxTokens: 10,
      bypassCache: true
    });

    if (groqResult1.cached !== false || !groqResult1.text) {
      throw new Error(`Unexpected result: cached=${groqResult1.cached}, text="${groqResult1.text}"`);
    }
    console.log(`PASS (text: "${groqResult1.text.trim()}", latency: ${groqResult1.latencyMs}ms, tokens: ${groqResult1.tokens.total})`);
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    allPass = false;
  }

  // ----------------------------------------
  // Test (b): Groq Call from Cache
  // ----------------------------------------
  try {
    process.stdout.write('(b) Groq Call (same prompt served from cache)... ');
    const usageBeforeCached = getDailyUsage().tokens;
    const groqResult2 = await callLLM({
      prompt: 'Reply with exactly: OK',
      maxTokens: 10,
      bypassCache: false
    });

    const usageAfterCached = getDailyUsage().tokens;

    if (groqResult2.cached !== true) {
      throw new Error(`Expected cached: true, got cached: ${groqResult2.cached}`);
    }
    if (!groqResult2.text || groqResult2.text.trim() !== 'OK') {
      throw new Error(`Text mismatch: expected "OK", got "${groqResult2.text}"`);
    }
    if (typeof groqResult2.latencyMs !== 'number' || groqResult2.latencyMs <= 0) {
      throw new Error(`Invalid stored latency: ${groqResult2.latencyMs}`);
    }
    if (typeof groqResult2.tokens?.total !== 'number' || groqResult2.tokens.total <= 0) {
      throw new Error(`Invalid stored tokens: ${groqResult2.tokens?.total}`);
    }
    if (usageAfterCached !== usageBeforeCached) {
      throw new Error(`Usage increased on cache hit: ${usageBeforeCached} -> ${usageAfterCached}`);
    }
    console.log(`PASS (cached=true, stored latency: ${groqResult2.latencyMs}ms, tokens: ${groqResult2.tokens.total}, zero token increase)`);
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    allPass = false;
  }

  // ----------------------------------------
  // Test (c): Gemini Embedding twice
  // ----------------------------------------
  try {
    process.stdout.write('(c) Gemini Embeddings (embedQuery("test") twice)... ');
    const vec1 = await embedQuery('test', { bypassCache: true });
    if (!Array.isArray(vec1) || vec1.length === 0) {
      throw new Error(`Expected non-empty vector, got length: ${vec1 ? vec1.length : 0}`);
    }

    const vec2 = await embedQuery('test', { bypassCache: false });
    if (!Array.isArray(vec2) || vec2.length !== vec1.length) {
      throw new Error(`Cached vector length mismatch: ${vec2 ? vec2.length : 0} vs ${vec1.length}`);
    }
    if (vec1[0] !== vec2[0] || vec1[vec1.length - 1] !== vec2[vec2.length - 1]) {
      throw new Error('Cached vector values mismatch');
    }
    console.log(`PASS (dimension: ${vec1.length}, cached retrieval verified)`);
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    allPass = false;
  }

  // ----------------------------------------
  // Test (d): Chroma Heartbeat & MongoDB Ping
  // ----------------------------------------
  try {
    process.stdout.write('(d.1) Chroma heartbeat... ');
    const chroma = new ChromaClient({ path: config.CHROMA_URL || 'http://localhost:8000' });
    const hb = await chroma.heartbeat();
    console.log(`PASS (heartbeat: ${hb})`);
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    allPass = false;
  }

  try {
    process.stdout.write('(d.2) MongoDB ping... ');
    const client = new MongoClient(config.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
    const db = client.db(config.MONGODB_DB || 'travel_qa');
    const pingResult = await db.command({ ping: 1 });
    await client.close();
    if (!pingResult || pingResult.ok !== 1) {
      throw new Error(`Unexpected ping response: ${JSON.stringify(pingResult)}`);
    }
    console.log(`PASS (ping: 1)`);
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    allPass = false;
  }

  // Print Groq rate limit headers
  const usage = getDailyUsage();
  console.log('\n--- Groq Rate Limit Headers ---');
  if (usage.lastHeaders && Object.keys(usage.lastHeaders).length > 0) {
    for (const [k, v] of Object.entries(usage.lastHeaders)) {
      console.log(`${k}: ${v}`);
    }
  } else {
    console.log('No rate limit headers captured yet.');
  }

  console.log('\n========================================');
  if (allPass) {
    console.log('SMOKE TEST RESULT: ALL PASS');
    console.log('========================================');
    process.exit(0);
  } else {
    console.log('SMOKE TEST RESULT: FAIL');
    console.log('========================================');
    process.exit(1);
  }
}

runSmokeTest();
