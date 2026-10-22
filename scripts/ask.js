/**
 * scripts/ask.js
 *
 * CLI tool to ask a single question through V1 or V2.
 *
 * Usage:
 *   node scripts/ask.js v1 "Your question here"
 *   node scripts/ask.js v2 "Your question here"
 *   node scripts/ask.js v1 --id q-001
 *   node scripts/ask.js v2 --id q-013
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { answerV1, answerV2 } from '../server/src/services/answer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/ask.js <v1|v2> "question"');
  console.error('       node scripts/ask.js <v1|v2> --id q-001');
  process.exit(1);
}

const system = args[0].toLowerCase();
if (!['v1', 'v2'].includes(system)) {
  console.error('First argument must be "v1" or "v2"');
  process.exit(1);
}

let question;

const idFlag = args.indexOf('--id');
if (idFlag !== -1) {
  const questionId = args[idFlag + 1];
  if (!questionId) {
    console.error('--id requires a question id argument (e.g. q-001)');
    process.exit(1);
  }
  const questionsPath = path.resolve(REPO_ROOT, 'data/eval/questions.json');
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  const q = questions.find(x => x.id === questionId);
  if (!q) {
    console.error(`Question "${questionId}" not found in questions.json`);
    process.exit(1);
  }
  question = q.question;
  console.log(`\nQuestion ID: ${q.id}`);
  console.log(`Category: ${q.category}`);
  console.log(`Expected outcome: ${q.expected_outcome}`);
  console.log(`Split: ${q.split}`);
} else {
  question = args[1];
}

console.log(`\n${'='.repeat(60)}`);
console.log(`System: ${system.toUpperCase()}`);
console.log(`Question: ${question}`);
console.log(`${'='.repeat(60)}\n`);

async function run() {
  let result;
  const startTotal = Date.now();

  const bypassCache = args.includes('--bypass-cache');

  if (system === 'v1') {
    result = await answerV1(question, { bypassCache });
  } else {
    result = await answerV2(question, { bypassCache });
  }

  const totalMs = Date.now() - startTotal;

  console.log(`Outcome:          ${result.outcome}`);
  console.log(`Escalation Reason:${result.escalationReason ? ' ' + result.escalationReason : ' (none)'}`);

  if (result.classification !== undefined && result.classification !== null) {
    console.log(`Classification:   ${result.classification}`);
  }

  console.log(`\nAnswer:\n${result.answer ?? '(no answer — escalated)'}`);

  if (result.citations && result.citations.length > 0) {
    console.log(`\nCitations:`);
    for (const c of result.citations) {
      console.log(`  [${c.type}:${c.id}]`);
    }
  } else {
    console.log('\nCitations: (none)');
  }

  if (result.retrieved && result.retrieved.length > 0) {
    console.log(`\nRetrieved items:`);
    for (const r of result.retrieved) {
      const simOrScore = r.similarity !== undefined
        ? `similarity=${r.similarity.toFixed(4)}`
        : r.score !== undefined
          ? `score=${r.score.toFixed(4)}`
          : '';
      console.log(`  [${r.type}:${r.id}] ${simOrScore}`);
    }
  }

  console.log(`\nTimings:`);
  console.log(`  classifyMs:   ${result.classifyMs ?? 0} ms`);
  console.log(`  retrievalMs:  ${result.retrievalMs ?? 0} ms`);
  console.log(`  llmMs:        ${result.llmMs ?? 0} ms`);
  console.log(`  totalMs:      ${totalMs} ms`);

  console.log(`\nTokens:`);
  if (result.tokens) {
    console.log(`  prompt:     ${result.tokens.prompt}`);
    console.log(`  completion: ${result.tokens.completion}`);
    console.log(`  total:      ${result.tokens.total}`);
  } else {
    console.log('  (none)');
  }

  if (result.droppedCitations !== undefined && result.droppedCitations > 0) {
    console.log(`\nWarning: ${result.droppedCitations} citation(s) dropped (not in retrieved set)`);
  }
}

run().catch(err => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
