/**
 * scripts/run-phase1-tests.js
 *
 * Run all Phase 1 self-test questions and save observations.
 * Questions: q-001, q-003, q-013, q-016, q-025, q-037, q-061, q-063, q-064, q-073
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { answerV1 } from '../server/src/services/answer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const TEST_IDS = ['q-001', 'q-003', 'q-013', 'q-016', 'q-025', 'q-037', 'q-061', 'q-063', 'q-064', 'q-073'];

const questionsPath = path.resolve(REPO_ROOT, 'data/eval/questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const outputLines = [
  '# Phase 1: V1 Observations',
  '',
  `Date: ${new Date().toISOString().slice(0, 10)}`,
  `System: V1 (RAG-only baseline, combined collection, top-3 cosine)`,
  '',
  '---',
  ''
];

async function main() {
  for (const id of TEST_IDS) {
    const q = questions.find(x => x.id === id);
    if (!q) {
      console.error(`Question ${id} not found`);
      continue;
    }

    console.log(`\n[${id}] ${q.question}`);
    console.log(`  Expected: ${q.expected_outcome}, Category: ${q.category}`);

    try {
      const result = await answerV1(q.question);

      const retrieved = result.retrieved || [];
      const sourceTypes = [...new Set(retrieved.map(r => r.type))];
      const citationTypes = [...new Set((result.citations || []).map(c => c.type))];
      const similarities = retrieved.map(r => r.similarity.toFixed(4)).join(', ');

      console.log(`  Outcome: ${result.outcome}`);
      if (result.escalationReason) console.log(`  EscalationReason: ${result.escalationReason}`);
      console.log(`  Retrieved types: ${sourceTypes.join(', ')}`);
      console.log(`  Similarities: ${similarities}`);
      console.log(`  Citations: ${result.citations?.map(c => `[${c.type}:${c.id}]`).join(', ') || '(none)'}`);
      console.log(`  Tokens: ${result.tokens?.total}`);
      if (result.answer) console.log(`  Answer (first 120): ${result.answer.slice(0, 120)}`);

      // Check no HTML comments in retrieved texts
      const hasComment = retrieved.some(r => r.text && r.text.includes('<!--'));
      if (hasComment) console.error(`  ERROR: retrieved text contains HTML comment!`);

      // Build observation line
      const obs = [
        `## ${id} — ${q.category}`,
        `**Question:** ${q.question}`,
        `**Expected outcome:** ${q.expected_outcome}`,
        `**Actual outcome:** ${result.outcome}${result.escalationReason ? ` (${result.escalationReason})` : ''}`,
        `**Retrieved:** ${retrieved.map(r => `[${r.type}:${r.id}] sim=${r.similarity.toFixed(4)}`).join(', ') || '(none)'}`,
        `**Citations:** ${result.citations?.map(c => `[${c.type}:${c.id}]`).join(', ') || '(none)'}`,
        `**Tokens:** ${result.tokens?.total}`,
        `**HTML comments in retrieved:** ${hasComment ? 'YES — ERROR' : 'no'}`,
        `**Observation:** ${
          result.outcome === 'ESCALATED'
            ? `Escalated (${result.escalationReason}); source types retrieved: ${sourceTypes.join(', ') || 'none'}`
            : `Answered; sources retrieved: ${sourceTypes.join('+')}; cited: ${citationTypes.join('+') || 'none'}`
        }`,
        ''
      ];

      outputLines.push(...obs, '');
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      outputLines.push(`## ${id}`, `**ERROR:** ${err.message}`, '');
    }
  }

  const outDir = path.resolve(REPO_ROOT, 'docs/notes');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'phase1-v1-observations.md');
  fs.writeFileSync(outPath, outputLines.join('\n'), 'utf8');
  console.log(`\n\nObservations saved to ${outPath}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
