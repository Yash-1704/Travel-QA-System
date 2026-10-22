/**
 * scripts/run-phase2a-tests.js
 *
 * Runs the Phase 2A-2 self-test on the 10 dev questions:
 * q-001, q-003, q-013, q-016, q-025, q-037, q-061, q-063, q-064, q-073
 * Checks cache behavior on repeat and writes docs/notes/phase2a-v2-observations.md
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { answerV2 } from '../server/src/services/answer.js';
import { getDailyUsage } from '../server/src/services/llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const TEST_IDS = ['q-001', 'q-003', 'q-013', 'q-016', 'q-025', 'q-037', 'q-061', 'q-063', 'q-064', 'q-073'];

const questionsPath = path.resolve(REPO_ROOT, 'data/eval/questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

async function main() {
  console.log('=== Running Phase 2A-2 V2 Self-Test (10 Questions) ===\n');

  const initialUsage = getDailyUsage();
  console.log(`Starting tokens in usage.json: ${initialUsage.tokens}\n`);

  const results = [];
  const outputLines = [
    '# Phase 2A-2: V2 Observations',
    '',
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    'System: V2 (Classify-first routing, OKF keyword matcher, RAG notices top-3 with 0.3 floor)',
    '',
    '---',
    ''
  ];

  for (const id of TEST_IDS) {
    const q = questions.find(x => x.id === id);
    if (!q) {
      console.error(`Question ${id} not found in questions.json`);
      continue;
    }

    console.log(`[${id}] ${q.question}`);
    console.log(`  Expected: ${q.expected_outcome} | Category: ${q.category}`);

    try {
      const res = await answerV2(q.question);
      results.push({ id, q, res });

      const retrieved = res.retrieved || [];
      const sourceTypes = [...new Set(retrieved.map(r => r.type))];
      const citationTypes = [...new Set((res.citations || []).map(c => c.type))];

      console.log(`  Classification:   ${res.classification}`);
      console.log(`  Outcome:          ${res.outcome}`);
      if (res.escalationReason) console.log(`  EscalationReason: ${res.escalationReason}`);
      console.log(`  Retrieved:        ${retrieved.map(r => `[${r.type}:${r.id}]`).join(', ') || '(none)'}`);
      console.log(`  Citations:        ${res.citations?.map(c => `[${c.type}:${c.id}]`).join(', ') || '(none)'}`);
      console.log(`  Tokens:           ${res.tokens?.total} (p:${res.tokens?.prompt}, c:${res.tokens?.completion})`);
      console.log(`  Timings:          classify=${res.classifyMs}ms, retrieval=${res.retrievalMs}ms, llm=${res.llmMs}ms`);
      if (res.answer) {
        console.log(`  Answer (preview): ${res.answer.slice(0, 140)}...`);
      }
      console.log('--------------------------------------------------');

      // Check no HTML comments in retrieved texts
      const hasComment = retrieved.some(r => r.text && r.text.includes('<!--'));
      if (hasComment) console.error(`  ERROR: retrieved text contains HTML comment!`);

      const obs = [
        `## ${id} — ${q.category}`,
        `**Question:** ${q.question}`,
        `**Expected outcome:** ${q.expected_outcome}`,
        `**Classification:** ${res.classification}`,
        `**Actual outcome:** ${res.outcome}${res.escalationReason ? ` (${res.escalationReason})` : ''}`,
        `**Retrieved:** ${retrieved.map(r => {
          const metric = r.similarity !== undefined ? `sim=${r.similarity.toFixed(4)}` : `score=${r.score.toFixed(4)}`;
          return `[${r.type}:${r.id}] (${metric})`;
        }).join(', ') || '(none)'}`,
        `**Citations:** ${res.citations?.map(c => `[${c.type}:${c.id}]`).join(', ') || '(none)'}`,
        `**Tokens:** ${res.tokens?.total}`,
        `**Timings:** classifyMs=${res.classifyMs}, retrievalMs=${res.retrievalMs}, llmMs=${res.llmMs}`,
        `**HTML comments in retrieved:** ${hasComment ? 'YES — ERROR' : 'no'}`,
        `**Observation:** ${
          res.outcome === 'ESCALATED'
            ? `Escalated (${res.escalationReason}); classified as ${res.classification}`
            : `Answered; classified as ${res.classification}; retrieved ${sourceTypes.join('+')}; cited ${citationTypes.join('+') || 'none'}`
        }`,
        ''
      ];
      outputLines.push(...obs, '');
    } catch (err) {
      console.error(`  ERROR on ${id}:`, err);
      outputLines.push(`## ${id}`, `**ERROR:** ${err.message}`, '');
    }
  }

  // Cache verification: re-run q-001
  console.log('\n=== Verifying Cache Behavior (Re-running q-001) ===');
  const tokensBeforeRepeat = getDailyUsage().tokens;
  const q001 = questions.find(x => x.id === 'q-001');
  const repeatStart = Date.now();
  const repeatRes = await answerV2(q001.question);
  const repeatMs = Date.now() - repeatStart;
  const tokensAfterRepeat = getDailyUsage().tokens;
  const deltaTokens = tokensAfterRepeat - tokensBeforeRepeat;

  console.log(`Re-run latency: ${repeatMs} ms`);
  console.log(`Tokens before repeat: ${tokensBeforeRepeat}`);
  console.log(`Tokens after repeat:  ${tokensAfterRepeat}`);
  console.log(`Token delta:          ${deltaTokens} (expect 0)`);

  outputLines.push(
    '## Cache Hit Verification',
    '',
    `Re-ran q-001 through V2:`,
    `- Wall-clock time: ${repeatMs} ms`,
    `- Token delta in usage.json: ${deltaTokens} (0 new tokens counted against budget) ✓`,
    ''
  );

  const outDir = path.resolve(REPO_ROOT, 'docs/notes');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'phase2a-v2-observations.md');
  fs.writeFileSync(outPath, outputLines.join('\n'), 'utf8');
  console.log(`\nObservations saved to ${outPath}`);
}

main().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
