/**
 * server/src/services/grade.js
 *
 * Pure evaluation grading service per AGENTS.md Phase 5A.
 * Implements strict key-fact substring matching and category-specific escalation evaluation.
 */

/**
 * Normalizes text for substring evaluation:
 * - Lowercases
 * - Removes asterisks and backticks (markdown styling)
 * - Collapses consecutive whitespace to single space (preserves commas and punctuation)
 * - Trims
 *
 * @param {string} s
 * @returns {string}
 */
export function normalize(s) {
  if (!s || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Grade an individual result against question expectations.
 *
 * @param {Object} question
 * @param {string} question.id
 * @param {string} question.category
 * @param {string} question.expected_outcome - OKF_ONLY | RAG_ONLY | HYBRID | ESCALATE
 * @param {string[]} [question.key_facts]
 * @param {Object} result - contract returned by answerV1 or answerV2
 * @param {string} result.system - V1 | V2
 * @param {string} result.outcome - ANSWERED | ESCALATED
 * @param {string|null} [result.answer]
 * @param {string|null} [result.escalationReason]
 * @param {string|null} [result.classification]
 * @returns {{
 *   correct: boolean,
 *   wrongAnswer: boolean,
 *   needsManualReview: boolean,
 *   unnecessaryEscalation: boolean,
 *   safeEscalation: boolean,
 *   routingCorrect: boolean|null
 * }}
 */
export function gradeResult(question, result) {
  const escalated = result.outcome === 'ESCALATED';
  const isV2 = result.system === 'V2';

  // Routing correctness (V2 only): classification === expected_outcome, "INVALID" is never correct
  const routingCorrect = isV2
    ? (result.classification === question.expected_outcome && result.classification !== 'INVALID')
    : null;

  const expectedOutcome = question.expected_outcome;

  if (expectedOutcome !== 'ESCALATE') {
    // Non-escalate questions (OKF_ONLY, RAG_ONLY, HYBRID, human_fallback_stale)
    const normalizedAnswer = normalize(result.answer || '');
    const keyFacts = Array.isArray(question.key_facts) ? question.key_facts : [];

    const allKeyFactsPresent =
      keyFacts.length > 0 &&
      keyFacts.every(kf => normalizedAnswer.includes(normalize(kf)));

    const correct = !escalated && allKeyFactsPresent;
    const answered = !escalated;
    const wrongAnswer = answered && !correct;
    const needsManualReview = answered && !correct;
    const unnecessaryEscalation = escalated;
    const safeEscalation = escalated;

    return {
      correct,
      wrongAnswer,
      needsManualReview,
      unnecessaryEscalation,
      safeEscalation,
      routingCorrect
    };
  } else {
    // Escalate questions (human_fallback_no_evidence, human_fallback_ambiguous, human_fallback_conflict)
    let correct = false;
    if (question.category === 'human_fallback_conflict') {
      correct = escalated && result.escalationReason === 'CONFLICT';
    } else {
      correct = escalated;
    }

    const wrongAnswer = !escalated;
    const needsManualReview = false;
    const unnecessaryEscalation = false;
    const safeEscalation = escalated;

    return {
      correct,
      wrongAnswer,
      needsManualReview,
      unnecessaryEscalation,
      safeEscalation,
      routingCorrect
    };
  }
}
