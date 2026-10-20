import assert from 'node:assert/strict';
import { interpretAnswerReply } from '../server/src/services/answer.js';

assert.deepEqual(interpretAnswerReply('INSUFFICIENT'), {
  outcome: 'ESCALATED',
  escalationReason: 'INSUFFICIENT',
  answer: null
});

assert.deepEqual(interpretAnswerReply('"CONFLICT."'), {
  outcome: 'ESCALATED',
  escalationReason: 'CONFLICT',
  answer: null
});

for (const text of [
  'INSUFFICIENT because the evidence is incomplete.',
  'CONFLICT: the records disagree.'
]) {
  assert.deepEqual(interpretAnswerReply(text), {
    outcome: 'ANSWERED',
    escalationReason: null,
    answer: text
  });
}

console.log('PASS: only exact normalized sentinel replies escalate');