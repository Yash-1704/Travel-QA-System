/**
 * services/answer.js
 *
 * Exports answerV1 and answerV2 per AGENTS.md A6 contract.
 * Never touches MongoDB.
 */

import { retrieve } from './rag.js';
import { callLLM } from './llm.js';
import { buildAnswerPrompt, formatEvidence } from './prompts.js';
import { classifyQuestion } from './classifier.js';
import { matchOkf } from './okf.js';
import { RAG_SIM_FLOOR } from '../config.js';

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

export function interpretAnswerReply(raw) {
  const normalized = normalizeReply(raw);

  if (normalized === 'INSUFFICIENT' || normalized === 'CONFLICT') {
    return { outcome: 'ESCALATED', escalationReason: normalized, answer: null };
  }

  return { outcome: 'ANSWERED', escalationReason: null, answer: raw.trim() };
}

/**
 * Parse [OKF:filename] and [RAG:notice-id] citation tags from the answer text.
 * Keep only ids that appear in retrievedItems (OKF id = filename, RAG id = notice id).
 * Deduplicate. Returns {citations, droppedCitations}.
 *
 * @param {string} answerText
 * @param {Array<{id: string, type?: string, metadata?: {kind: string, filename?: string, noticeId?: string}}>} retrievedItems
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
    if (item.metadata?.kind === 'okf') {
      validIds.add(`OKF:${item.metadata.filename}`);
    } else if (item.metadata?.kind === 'notice') {
      validIds.add(`RAG:${item.metadata.noticeId}`);
    } else if (item.type && item.id) {
      validIds.add(`${item.type}:${item.id}`);
    } else {
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

  const { outcome, escalationReason, answer } = interpretAnswerReply(llmResult.text);

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
// V2: Classify-first (Phase 2A-2)
// ──────────────────────────────────────────────────────────────

/**
 * answerV2 — classify-first pipeline.
 *
 * @param {string} question
 * @param {object} [opts]
 * @param {boolean} [opts.bypassCache=false]
 * @returns {Promise<object>}  A6 contract with system "V2"
 */
export async function answerV2(question, opts = {}) {
  const bypassCache = opts.bypassCache || false;

  // 1. Classify question (sees ONLY question text)
  const classifyRes = await classifyQuestion(question, { bypassCache });
  const classifyMs = classifyRes.latencyMs;
  const classification = classifyRes.label;
  const classifyTokens = classifyRes.tokens;

  // 2. Pre-retrieval escalations
  if (classification === 'INVALID' || classification === 'ESCALATE') {
    const escalationReason = classification === 'INVALID'
      ? 'CLASSIFIER_INVALID'
      : 'CLASSIFIER_ESCALATE';

    return {
      system: 'V2',
      outcome: 'ESCALATED',
      answer: null,
      escalationReason,
      classification,
      citations: [],
      retrieved: [],
      classifyMs,
      retrievalMs: 0,
      llmMs: 0,
      tokens: { ...classifyTokens },
      droppedCitations: 0
    };
  }

  let evidenceItems = [];
  let retrieved = [];
  let retrievalMs = 0;

  // 3. OKF_ONLY
  if (classification === 'OKF_ONLY') {
    const okfRes = matchOkf(question);
    retrievalMs = okfRes.retrievalMs;

    if (!okfRes.match) {
      return {
        system: 'V2',
        outcome: 'ESCALATED',
        answer: null,
        escalationReason: 'NO_OKF_MATCH',
        classification,
        citations: [],
        retrieved: [],
        classifyMs,
        retrievalMs,
        llmMs: 0,
        tokens: { ...classifyTokens },
        droppedCitations: 0
      };
    }

    evidenceItems.push({
      type: 'OKF',
      id: okfRes.match.filename,
      text: okfRes.match.text
    });
    retrieved.push({
      type: 'OKF',
      id: okfRes.match.filename,
      score: okfRes.match.score,
      text: okfRes.match.text
    });
  }

  // 4. RAG_ONLY
  else if (classification === 'RAG_ONLY') {
    const ragRes = await retrieve('notices', question, 3, { bypassCache });
    retrievalMs = ragRes.retrievalMs;

    const bestSim = ragRes.items.length > 0
      ? Math.max(...ragRes.items.map(i => i.similarity))
      : 0;

    if (ragRes.items.length === 0 || bestSim < RAG_SIM_FLOOR) {
      return {
        system: 'V2',
        outcome: 'ESCALATED',
        answer: null,
        escalationReason: 'NO_RAG_MATCH',
        classification,
        citations: [],
        retrieved: [],
        classifyMs,
        retrievalMs,
        llmMs: 0,
        tokens: { ...classifyTokens },
        droppedCitations: 0
      };
    }

    for (const item of ragRes.items) {
      const noticeId = item.metadata?.noticeId || item.id;
      evidenceItems.push({ type: 'RAG', id: noticeId, text: item.text });
      retrieved.push({ type: 'RAG', id: noticeId, similarity: item.similarity, text: item.text });
    }
  }

  // 5. HYBRID
  else if (classification === 'HYBRID') {
    const okfRes = matchOkf(question);
    const ragRes = await retrieve('notices', question, 3, { bypassCache });
    retrievalMs = okfRes.retrievalMs + ragRes.retrievalMs;

    const hasOkf = okfRes.match !== null;
    const bestSim = ragRes.items.length > 0
      ? Math.max(...ragRes.items.map(i => i.similarity))
      : 0;
    const hasRag = ragRes.items.length > 0 && bestSim >= RAG_SIM_FLOOR;

    if (!hasOkf && !hasRag) {
      return {
        system: 'V2',
        outcome: 'ESCALATED',
        answer: null,
        escalationReason: 'NO_EVIDENCE',
        classification,
        citations: [],
        retrieved: [],
        classifyMs,
        retrievalMs,
        llmMs: 0,
        tokens: { ...classifyTokens },
        droppedCitations: 0
      };
    }

    // Evidence = OKF first, then RAG chunks
    if (hasOkf) {
      evidenceItems.push({
        type: 'OKF',
        id: okfRes.match.filename,
        text: okfRes.match.text
      });
      retrieved.push({
        type: 'OKF',
        id: okfRes.match.filename,
        score: okfRes.match.score,
        text: okfRes.match.text
      });
    }

    if (hasRag) {
      for (const item of ragRes.items) {
        const noticeId = item.metadata?.noticeId || item.id;
        evidenceItems.push({ type: 'RAG', id: noticeId, text: item.text });
        retrieved.push({ type: 'RAG', id: noticeId, similarity: item.similarity, text: item.text });
      }
    }
  }

  // 6. Generate answer
  const evidenceBlocks = formatEvidence(evidenceItems);
  const prompt = buildAnswerPrompt(question, evidenceBlocks);

  const llmResult = await callLLM({ prompt, maxTokens: 400, bypassCache });
  const llmMs = llmResult.latencyMs;

  const { outcome, escalationReason, answer } = interpretAnswerReply(llmResult.text);

  const { citations, droppedCitations } = parseCitations(
    answer || '',
    retrieved
  );

  const totalTokens = {
    prompt: classifyTokens.prompt + llmResult.tokens.prompt,
    completion: classifyTokens.completion + llmResult.tokens.completion,
    total: classifyTokens.total + llmResult.tokens.total
  };

  return {
    system: 'V2',
    outcome,
    answer,
    escalationReason,
    classification,
    citations,
    retrieved,
    classifyMs,
    retrievalMs,
    llmMs,
    tokens: totalTokens,
    droppedCitations
  };
}

export default { answerV1, answerV2 };
