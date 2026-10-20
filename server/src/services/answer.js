/**
 * services/answer.js
 *
 * Exports answerV1 and answerV2 per AGENTS.md A6 contract.
 * Never touches MongoDB.
 */

import { retrieve } from './rag.js';
import { callLLM } from './llm.js';
import { buildAnswerPrompt, formatEvidence } from './prompts.js';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

/**
 * Normalize an LLM reply for comparison.
 * Trim, strip surrounding quotes and trailing period, uppercase.
 */
function normalizeReply(raw) {
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')  // strip surrounding quotes/backticks
    .replace(/\.$/, '')               // strip trailing period
    .toUpperCase();
}

/**
 * Parse [OKF:filename] and [RAG:notice-id] citation tags from the answer text.
 * Keep only ids that appear in retrievedItems (OKF id = filename, RAG id = notice id).
 * Deduplicate. Returns {citations, droppedCitations}.
 *
 * @param {string} answerText
 * @param {Array<{id: string, metadata: {kind: string, filename?: string, noticeId?: string}}>} retrievedItems
 */
function parseCitations(answerText, retrievedItems) {
  const pattern = /\[(OKF|RAG):([^\]]+)\]/g;
  const seen = new Set();
  const raw = [];

  let match;
  while ((match = pattern.exec(answerText)) !== null) {
    const type = match[1];
    const id = match[2].trim();
    const key = `${type}:${id}`;
    if (!seen.has(key)) {
      seen.add(key);
      raw.push({ type, id });
    }
  }

  // Build a set of valid retrieved ids
  const validIds = new Set();
  for (const item of retrievedItems) {
    // OKF items have id like 'okf:<filename>' in Chroma; but citation uses just filename
    if (item.metadata?.kind === 'okf') {
      validIds.add(`OKF:${item.metadata.filename}`);
    } else if (item.metadata?.kind === 'notice') {
      validIds.add(`RAG:${item.metadata.noticeId}`);
    } else {
      // Fallback: item.id might be 'okf:filename' or 'notice-xxxx'
      if (item.id?.startsWith('okf:')) {
        const filename = item.id.slice(4);
        validIds.add(`OKF:${filename}`);
      } else {
        validIds.add(`RAG:${item.id}`);
      }
    }
  }

  const citations = [];
  let droppedCitations = 0;
  for (const c of raw) {
    if (validIds.has(`${c.type}:${c.id}`)) {
      citations.push(c);
    } else {
      droppedCitations++;
    }
  }

  return { citations, droppedCitations };
}

// ──────────────────────────────────────────────────────────────
// V1: RAG-only baseline
// ──────────────────────────────────────────────────────────────

/**
 * answerV1 — retrieve from 'combined', one LLM call, no classification.
 * No similarity floor, no MongoDB, no case saving.
 *
 * @param {string} question
 * @param {object} [opts]
 * @param {boolean} [opts.bypassCache=false]
 * @returns {Promise<object>}  A6 contract with system "V1"
 */
export async function answerV1(question, opts = {}) {
  const bypassCache = opts.bypassCache || false;

  // Retrieve top-3 from combined collection
  const { items, retrievalMs } = await retrieve('combined', question, 3, { bypassCache });

  // Build evidence blocks
  // Map retrieved items to evidence format
  const evidenceItems = items.map(item => {
    if (item.metadata?.kind === 'okf') {
      return { type: 'OKF', id: item.metadata.filename, text: item.text };
    } else {
      const noticeId = item.metadata?.noticeId || item.id;
      return { type: 'RAG', id: noticeId, text: item.text };
    }
  });

  const evidenceBlocks = formatEvidence(evidenceItems);
  const prompt = buildAnswerPrompt(question, evidenceBlocks);

  // One LLM call
  const llmStart = Date.now();
  const llmResult = await callLLM({ prompt, maxTokens: 400, bypassCache });
  const llmMs = Date.now() - llmStart;

  const normalized = normalizeReply(llmResult.text);

  let outcome;
  let answer;
  let escalationReason = null;

  if (normalized === 'INSUFFICIENT') {
    outcome = 'ESCALATED';
    escalationReason = 'INSUFFICIENT';
    answer = null;
  } else if (normalized === 'CONFLICT') {
    outcome = 'ESCALATED';
    escalationReason = 'CONFLICT';
    answer = null;
  } else {
    outcome = 'ANSWERED';
    answer = llmResult.text.trim();
  }

  const { citations, droppedCitations } = parseCitations(
    answer || '',
    items
  );

  // Build retrieved list for A6
  const retrieved = items.map(item => {
    const type = item.metadata?.kind === 'okf' ? 'OKF' : 'RAG';
    const id = item.metadata?.kind === 'okf'
      ? item.metadata.filename
      : (item.metadata?.noticeId || item.id);
    return { type, id, similarity: item.similarity, text: item.text };
  });

  return {
    system: 'V1',
    outcome,
    answer,
    escalationReason,
    classification: null,
    citations,
    retrieved,
    classifyMs: 0,
    retrievalMs,
    llmMs: llmResult.latencyMs,
    tokens: { ...llmResult.tokens },
    droppedCitations
  };
}

// ──────────────────────────────────────────────────────────────
// V2: Classify-first (stub — implemented in Phase 2A-2)
// ──────────────────────────────────────────────────────────────

/**
 * answerV2 — classify-first pipeline.
 * Full implementation in Phase 2A-2. Placeholder here returns error.
 */
export async function answerV2(question, opts = {}) {
  throw new Error('answerV2 is not yet implemented — available from Phase 2A-2');
}

export default { answerV1, answerV2 };
