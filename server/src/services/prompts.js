/**
 * LLM prompts — verbatim per AGENTS.md A7.
 * Never reword. These strings are frozen once finalized.
 */

/**
 * Build the classification prompt (Phase 2A-1).
 * @param {string} question
 * @returns {string}
 */
export function buildClassifyPrompt(question) {
  return `You are a question classifier for a travel support system.
Given the customer's question, classify it as exactly one of:

- OKF_ONLY   — the question asks about a policy or rule (cancellation fees,
               visa requirements, baggage limits, loyalty terms)
- RAG_ONLY   — the question asks about a specific event or incident
               (a flight delay, a baggage report, an operational notice)
- HYBRID     — the question needs both a policy rule AND event facts
               (e.g. compensation for a specific delay: needs the rule
               AND the delay record)
- ESCALATE   — the question is out of scope, too vague to route, or
               not covered by any travel policy or event record

Reply with exactly one of the four labels above and nothing else.

Question: ${question}`;
}

/**
 * Format evidence items into the block string used in the answer prompt.
 * OKF items:    [OKF:<filename>]\n<text>
 * RAG/notice:   [RAG:<notice id>]\n<text>
 *
 * @param {Array<{type: 'OKF'|'RAG', id: string, text: string}>} items
 * @returns {string}  blocks joined by a blank line
 */
export function formatEvidence(items) {
  return items
    .map(item => {
      const tag = item.type === 'OKF' ? `[OKF:${item.id}]` : `[RAG:${item.id}]`;
      return `${tag}\n${item.text}`;
    })
    .join('\n\n');
}

/**
 * Build the answer prompt — verbatim per AGENTS.md A7.
 * @param {string} question
 * @param {string} evidenceBlocks  output of formatEvidence(items)
 * @returns {string}
 */
export function buildAnswerPrompt(question, evidenceBlocks) {
  return `You are a travel agency support assistant.
Answer the customer's question using ONLY the evidence below.
Cite the evidence you used: [OKF:filename] or [RAG:chunk-id].
If the evidence does not contain enough information to answer,
reply with exactly: INSUFFICIENT
If pieces of evidence contradict each other on the facts needed to answer,
reply with exactly: CONFLICT
Do not use outside knowledge.

Evidence:
${evidenceBlocks}

Question: ${question}`;
}

export default { buildClassifyPrompt, formatEvidence, buildAnswerPrompt };
