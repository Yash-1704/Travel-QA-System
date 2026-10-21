/**
 * services/classifier.js
 *
 * Question classifier service for V2 routing.
 * One callLLM, maxTokens 10, bypassCache passthrough.
 * The classifier sees ONLY the question text.
 */

import { callLLM } from './llm.js';
import { buildClassifyPrompt } from './prompts.js';

const VALID_LABELS = new Set(['OKF_ONLY', 'RAG_ONLY', 'HYBRID', 'ESCALATE']);

/**
 * Clean raw classifier output:
 * Trim, strip surrounding quotes/backticks/punctuation, uppercase.
 * @param {string} raw
 * @returns {string}
 */
export function cleanClassifierOutput(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '') // remove surrounding quotes/backticks
    .replace(/^[^a-zA-Z0-9_]+|[^a-zA-Z0-9_]+$/g, '') // remove surrounding punctuation
    .trim()
    .toUpperCase();
}

/**
 * Classify a customer's question into one of the four routing categories.
 *
 * @param {string} question - Question text
 * @param {object} [opts={}]
 * @param {boolean} [opts.bypassCache=false]
 * @returns {Promise<{label: string, raw: string, valid: boolean, latencyMs: number, tokens: {prompt: number, completion: number, total: number}}>}
 */
export async function classifyQuestion(question, opts = {}) {
  const prompt = buildClassifyPrompt(question);

  const llmResult = await callLLM({
    prompt,
    maxTokens: 10,
    bypassCache: opts.bypassCache || false
  });

  const raw = llmResult.text;
  const cleaned = cleanClassifierOutput(raw);
  const valid = VALID_LABELS.has(cleaned);
  const label = valid ? cleaned : 'INVALID';

  return {
    label,
    raw,
    valid,
    latencyMs: llmResult.latencyMs,
    tokens: { ...llmResult.tokens }
  };
}

export default {
  classifyQuestion,
  cleanClassifierOutput
};
