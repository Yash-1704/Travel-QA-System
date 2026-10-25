#!/usr/bin/env node
/**
 * scripts/make-review-queue.js
 *
 * Generates the manual review queue per AGENTS.md Phase 5A / 5B:
 * 1. Collects every needsManualReview row, determines substring matches, proposes strict verdicts,
 *    and writes them to data/eval/manual-grades.json (source: "agent-proposed", preserving any author edits).
 * 2. Pulls a deterministic seeded random sample of 5 auto-graded rows (2 correct, 2 wrong, 1 correct escalation)
 *    for author spot-checking.
 * 3. Writes formatted data/eval/results/review-queue.md.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connect, getCollection } from '../server/src/services/db.js';
import { normalize } from '../server/src/services/grade.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

function parseArgs() {
  const args = process.argv.slice(2);
  let runId = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--run-id' && i + 1 < args.length) {
      runId = args[++i];
    }
  }
  return { runId };
}

// Simple seeded pseudo-random number generator (Mulberry32)
function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sample(arr, count, rng) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

async function main() {
  const { runId } = parseArgs();
  if (!runId) {
    console.error('Error: --run-id <id> is required.');
    process.exit(1);
  }

  console.log(`Generating review queue for runId: "${runId}"...`);

  await connect();
  const expCol = getCollection('experiment_logs');
  const rows = await expCol.find({ runId, rep: 0, kind: 'eval' }).sort({ questionId: 1 }).toArray();

  if (rows.length === 0) {
    console.error(`Error: No evaluation logs found for runId "${runId}".`);
    process.exit(1);
  }

  const questionsPath = path.resolve(REPO_ROOT, 'data/eval/questions.json');
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  const questionMap = new Map(questions.map(q => [q.id, q]));

  // Load existing manual-grades.json
  const manualGradesPath = path.resolve(REPO_ROOT, 'data/eval/manual-grades.json');
  let existingManualGrades = [];
  if (fs.existsSync(manualGradesPath)) {
    try {
      existingManualGrades = JSON.parse(fs.readFileSync(manualGradesPath, 'utf8'));
    } catch (e) {
      console.warn('Could not read existing manual-grades.json:', e.message);
    }
  }

  // Preserve author overrides, overwrite or add agent-proposed
  const authorGradeMap = new Map();
  const existingOtherGrades = [];
  for (const mg of existingManualGrades) {
    if (mg.source === 'author') {
      authorGradeMap.set(`${mg.runId}:${mg.systemName}:${mg.questionId}`, mg);
    } else if (mg.runId !== runId) {
      existingOtherGrades.push(mg);
    }
  }

  const needsReviewRows = rows.filter(r => r.needsManualReview);
  const newProposedGrades = [];

  let md = '';
  md += `# Manual Review Queue: ${runId}\n\n`;
  md += `**Date:** ${new Date().toISOString()}  \n`;
  md += `**Total Rows Needing Review (Substring Grader Failed):** ${needsReviewRows.length}  \n\n`;
  md += `Review instructions: If you disagree with an agent-proposed verdict, edit \`data/eval/manual-grades.json\`, change \`correct\` to \`true\` or \`false\`, and set \`source: "author"\`. Then re-run \`node scripts/report.js --run-id ${runId}\`.\n\n`;

  md += `## 1. Questions Needing Manual Review (${needsReviewRows.length})\n\n`;

  if (needsReviewRows.length === 0) {
    md += `*No rows require manual review. All non-escalated answers satisfied automated key-fact substring checks.*\n\n`;
  } else {
    for (const row of needsReviewRows) {
      const q = questionMap.get(row.questionId);
      const normalizedAnswer = normalize(row.answer || '');
      const keyFacts = q.key_facts || [];

      const matched = keyFacts.filter(kf => normalizedAnswer.includes(normalize(kf)));
      const missing = keyFacts.filter(kf => !normalizedAnswer.includes(normalize(kf)));

      // Strict agent proposal rule
      // Propose false if missing facts, unless all missing facts are clearly conveyed in answer
      const authorExisting = authorGradeMap.get(`${runId}:${row.systemName}:${row.questionId}`);
      let proposedCorrect = false;
      let proposedReason = `Missing required key fact(s): ${missing.map(m => `"${m}"`).join(', ')}.`;

      if (authorExisting) {
        proposedCorrect = authorExisting.correct;
        proposedReason = `Author verdict: ${authorExisting.note || (authorExisting.correct ? 'Approved' : 'Rejected')}`;
      }

      newProposedGrades.push({
        runId,
        systemName: row.systemName,
        questionId: row.questionId,
        correct: proposedCorrect,
        note: proposedReason,
        source: authorExisting ? 'author' : 'agent-proposed'
      });

      md += `### [${row.systemName}] ${row.questionId} (${q.category})\n\n`;
      md += `- **Question:** "${q.question}"\n`;
      md += `- **Expected Answer:** "${q.correct_answer}"\n`;
      md += `- **Key Facts Required:** ${keyFacts.map(k => `\`${k}\``).join(', ')}\n`;
      md += `- **System Answer:** "${row.answer}"\n`;
      md += `- **Key Facts Matched by Substring:** ${matched.length > 0 ? matched.map(k => `\`${k}\``).join(', ') : 'None'}\n`;
      md += `- **Key Facts Missing by Substring:** ${missing.map(k => `\`${k}\``).join(', ')}\n`;
      md += `- **Agent Proposed Verdict:** \`${proposedCorrect ? 'CORRECT' : 'WRONG'}\` — *${proposedReason}*\n\n`;
      md += `---\n\n`;
    }
  }

  // Combine manual grades
  const finalManualGrades = [
    ...existingOtherGrades,
    ...authorGradeMap.values(),
    ...newProposedGrades.filter(g => !authorGradeMap.has(`${g.runId}:${g.systemName}:${g.questionId}`))
  ];

  fs.writeFileSync(manualGradesPath, JSON.stringify(finalManualGrades, null, 2), 'utf8');
  console.log(`Updated manual grades in ${manualGradesPath}`);

  // Part 2: Seeded Random Spot-Check Sample (5 rows)
  const rng = mulberry32(42); // deterministic seed
  const autoCorrectRows = rows.filter(r => r.correct && r.outcome !== 'ESCALATED');
  const autoWrongRows = rows.filter(r => r.wrongAnswer && r.outcome !== 'ESCALATED');
  const autoCorrectEscRows = rows.filter(r => r.correct && r.outcome === 'ESCALATED');

  const sampleCorrect = sample(autoCorrectRows, 2, rng);
  const sampleWrong = sample(autoWrongRows, 2, rng);
  const sampleEsc = sample(autoCorrectEscRows, 1, rng);

  const spotCheckSample = [...sampleCorrect, ...sampleWrong, ...sampleEsc];

  md += `## 2. Author Spot-Check Sample (5 Seeded Random Auto-Graded Rows)\n\n`;
  md += `These rows were automatically graded. Spot-check them to verify that automated key-fact substring grading and escalation rules operated reliably.\n\n`;

  for (const row of spotCheckSample) {
    const q = questionMap.get(row.questionId);
    md += `### Spot-Check: [${row.systemName}] ${row.questionId} (${q.category})\n\n`;
    md += `- **Question:** "${q.question}"\n`;
    md += `- **Expected Outcome:** \`${q.expected_outcome}\`\n`;
    md += `- **Expected Answer:** ${q.correct_answer ? `"${q.correct_answer}"` : 'null (expected escalation)'}\n`;
    md += `- **Key Facts:** ${(q.key_facts || []).map(k => `\`${k}\``).join(', ') || '[]'}\n`;
    md += `- **System Outcome:** \`${row.outcome}\` ${row.escalationReason ? `(Reason: ${row.escalationReason})` : ''}\n`;
    md += `- **System Answer:** ${row.answer ? `"${row.answer}"` : 'null'}\n`;
    md += `- **Automated Grade:** \`${row.correct ? 'PASS (Correct)' : 'FAIL (Wrong / Misrouted)'}\`\n\n`;
    md += `---\n\n`;
  }

  const resultsDir = path.resolve(REPO_ROOT, 'data/eval/results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  const reviewQueuePath = path.resolve(resultsDir, 'review-queue.md');
  fs.writeFileSync(reviewQueuePath, md, 'utf8');
  console.log(`Review queue written to ${reviewQueuePath}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Unhandled review queue error:', err);
  process.exit(1);
});
