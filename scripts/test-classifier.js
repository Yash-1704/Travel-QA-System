#!/usr/bin/env node
/**
 * scripts/test-classifier.js
 *
 * Test script for question classifier service (Phase 2A-1).
 * Usage:
 *   node scripts/test-classifier.js q-001 q-003 q-013 ...
 *   node scripts/test-classifier.js --text "What is the cancellation fee?"
 *
 * Never reads correct_answer from questions.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyQuestion } from '../server/src/services/classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const QUESTIONS_FILE = path.join(REPO_ROOT, 'data/eval/questions.json');

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage:
  node scripts/test-classifier.js <question-id> [question-id ...]
  node scripts/test-classifier.js --text "<custom question text>"
  node scripts/test-classifier.js --bypass-cache <question-id ...>

Examples:
  node scripts/test-classifier.js q-001 q-003 q-013 q-016 q-025 q-028 q-037 q-061 q-063 q-064
  node scripts/test-classifier.js --text "Can I bring my pet cat in cabin on VistaAir?"
`);
  process.exit(0);
}

const bypassCache = args.includes('--bypass-cache');
const filteredArgs = args.filter(a => a !== '--bypass-cache');

async function run() {
  let itemsToTest = [];

  const textIndex = filteredArgs.indexOf('--text');
  if (textIndex !== -1) {
    const text = filteredArgs[textIndex + 1];
    if (!text) {
      console.error('Error: --text requires a question string argument');
      process.exit(1);
    }
    itemsToTest.push({
      id: null,
      question: text,
      expectedOutcome: null
    });
  } else {
    if (!fs.existsSync(QUESTIONS_FILE)) {
      console.error(`Error: Questions file not found at ${QUESTIONS_FILE}`);
      process.exit(1);
    }
    const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
    const qMap = new Map();
    for (const q of questions) {
      // Intentionally only extracting id, question, expected_outcome
      qMap.set(q.id, {
        id: q.id,
        question: q.question,
        expectedOutcome: q.expected_outcome
      });
    }

    for (const qId of filteredArgs) {
      const found = qMap.get(qId);
      if (!found) {
        console.error(`Warning: Question ID "${qId}" not found in questions.json; skipping.`);
        continue;
      }
      itemsToTest.push(found);
    }
  }

  if (itemsToTest.length === 0) {
    console.error('No questions to test.');
    process.exit(1);
  }

  console.log(`=== Testing Question Classifier (${itemsToTest.length} items) ===\n`);

  let validCount = 0;
  let matchCount = 0;
  const results = [];

  for (const item of itemsToTest) {
    const res = await classifyQuestion(item.question, { bypassCache });
    if (res.valid) validCount++;
    const matchesExpected = item.expectedOutcome ? (res.label === item.expectedOutcome) : null;
    if (matchesExpected) matchCount++;

    results.push({
      id: item.id || 'N/A',
      question: item.question,
      raw: res.raw,
      rawJson: JSON.stringify(res.raw),
      valid: res.valid,
      label: res.label,
      expected: item.expectedOutcome || 'N/A',
      matchesExpected,
      latencyMs: res.latencyMs,
      tokens: res.tokens
    });

    console.log(`ID:       ${item.id || 'N/A'}`);
    console.log(`Question: ${item.question}`);
    console.log(`Raw:      ${JSON.stringify(res.raw)}`);
    console.log(`Valid:    ${res.valid}`);
    console.log(`Label:    ${res.label}`);
    if (item.expectedOutcome) {
      console.log(`Expected: ${item.expectedOutcome} ${matchesExpected ? '(MATCH)' : '(MISMATCH)'}`);
    }
    console.log(`Latency:  ${res.latencyMs} ms | Tokens: ${res.tokens.total} (p:${res.tokens.prompt}, c:${res.tokens.completion})`);
    console.log('--------------------------------------------------');
  }

  console.log(`\nSummary:`);
  console.log(`Total questions: ${itemsToTest.length}`);
  console.log(`Valid format:    ${validCount}/${itemsToTest.length}`);
  if (itemsToTest.some(i => i.expectedOutcome)) {
    const totalWithExpected = itemsToTest.filter(i => i.expectedOutcome).length;
    console.log(`Label matches:   ${matchCount}/${totalWithExpected}`);
  }

  return { results, validCount, total: itemsToTest.length };
}

run().catch(err => {
  console.error('Classifier test failed:', err);
  process.exit(1);
});
