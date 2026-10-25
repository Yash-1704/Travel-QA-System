/**
 * scripts/test-grade.js
 *
 * Unit tests for grade.js logic.
 */

import { normalize, gradeResult } from '../server/src/services/grade.js';

let passes = 0;
let fails = 0;

function assert(condition, desc) {
  if (condition) {
    passes++;
    console.log(`[PASS] ${desc}`);
  } else {
    fails++;
    console.error(`[FAIL] ${desc}`);
  }
}

// 1. normalize tests
assert(normalize('  Hello   World*! `test`  ') === 'hello world! test', 'normalize collapses space & strips * and `');
assert(normalize('USD 115, non-refundable.') === 'usd 115, non-refundable.', 'normalize keeps commas and periods');

// 2. Non-escalate question
const q1 = {
  id: 'q-001',
  category: 'okf_only',
  expected_outcome: 'OKF_ONLY',
  key_facts: ['USD 45', '72 hours']
};

// Answered with all key facts
const res1Good = {
  system: 'V2',
  outcome: 'ANSWERED',
  answer: 'The fee is **USD 45** if canceled at least `72 hours` in advance.',
  classification: 'OKF_ONLY'
};
const g1Good = gradeResult(q1, res1Good);
assert(g1Good.correct === true && g1Good.wrongAnswer === false && g1Good.needsManualReview === false && g1Good.routingCorrect === true, 'Non-escalate answered with all key facts is correct');

// Answered missing key fact
const res1Miss = {
  system: 'V2',
  outcome: 'ANSWERED',
  answer: 'The fee is USD 45.',
  classification: 'OKF_ONLY'
};
const g1Miss = gradeResult(q1, res1Miss);
assert(g1Miss.correct === false && g1Miss.wrongAnswer === true && g1Miss.needsManualReview === true, 'Non-escalate missing key fact is wrongAnswer and needsManualReview');

// Unnecessary escalation
const res1Esc = {
  system: 'V2',
  outcome: 'ESCALATED',
  escalationReason: 'INSUFFICIENT',
  classification: 'OKF_ONLY'
};
const g1Esc = gradeResult(q1, res1Esc);
assert(g1Esc.correct === false && g1Esc.unnecessaryEscalation === true && g1Esc.wrongAnswer === false && g1Esc.needsManualReview === false, 'Non-escalate escalated is unnecessaryEscalation');

// 3. Escalate question - general
const qEscGen = {
  id: 'q-061',
  category: 'human_fallback_no_evidence',
  expected_outcome: 'ESCALATE'
};
const resEscGen = {
  system: 'V2',
  outcome: 'ESCALATED',
  escalationReason: 'CLASSIFIER_ESCALATE',
  classification: 'ESCALATE'
};
const gEscGen = gradeResult(qEscGen, resEscGen);
assert(gEscGen.correct === true && gEscGen.wrongAnswer === false && gEscGen.safeEscalation === true, 'General ESCALATE category escalated is correct');

// 4. Escalate question - conflict
const qConflict = {
  id: 'q-073',
  category: 'human_fallback_conflict',
  expected_outcome: 'ESCALATE'
};
const resConfPass = {
  system: 'V2',
  outcome: 'ESCALATED',
  escalationReason: 'CONFLICT',
  classification: 'HYBRID'
};
const gConfPass = gradeResult(qConflict, resConfPass);
assert(gConfPass.correct === true && gConfPass.wrongAnswer === false, 'Conflict category escalated with CONFLICT reason is correct');

const resConfFail = {
  system: 'V2',
  outcome: 'ESCALATED',
  escalationReason: 'INSUFFICIENT',
  classification: 'HYBRID'
};
const gConfFail = gradeResult(qConflict, resConfFail);
assert(gConfFail.correct === false && gConfFail.safeEscalation === true, 'Conflict category escalated with non-CONFLICT reason is not correct, but safeEscalation is true');

// 5. Routing correctness
assert(gradeResult(q1, { system: 'V1', outcome: 'ANSWERED', answer: 'USD 45 72 hours' }).routingCorrect === null, 'V1 routingCorrect is null');
assert(gradeResult(q1, { system: 'V2', classification: 'INVALID', outcome: 'ESCALATED' }).routingCorrect === false, 'V2 INVALID classification is routingCorrect false');

console.log(`\nGrade unit test results: ${passes}/${passes + fails} PASS\n`);
if (fails > 0) process.exit(1);
