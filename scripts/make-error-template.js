#!/usr/bin/env node
/**
 * scripts/make-error-template.js
 *
 * Generates the error analysis markdown template for qualitative analysis per AGENTS.md Phase 5A / 5B.
 * Lists every incorrect row (after manual overrides) and every V2 row with routingCorrect: false.
 * Leaves the failure explanation blank for author completion.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connect, getCollection } from '../server/src/services/db.js';

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

async function main() {
  const { runId } = parseArgs();
  if (!runId) {
    console.error('Error: --run-id <id> is required.');
    process.exit(1);
  }

  console.log(`Generating error analysis template for runId: "${runId}"...`);

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

  // Apply manual grades if present
  const manualGradesPath = path.resolve(REPO_ROOT, 'data/eval/manual-grades.json');
  if (fs.existsSync(manualGradesPath)) {
    try {
      const manualGrades = JSON.parse(fs.readFileSync(manualGradesPath, 'utf8'));
      const manualMap = new Map(manualGrades.filter(g => g.runId === runId).map(g => [`${g.systemName}:${g.questionId}`, g]));
      for (const row of rows) {
        const mg = manualMap.get(`${row.systemName}:${row.questionId}`);
        if (mg) {
          row.correct = Boolean(mg.correct);
        }
      }
    } catch (e) {
      console.warn('Warning reading manual grades:', e.message);
    }
  }

  // Filter rows: EVERY incorrect row (after overrides) and EVERY V2 row with routingCorrect === false
  const errorRows = rows.filter(r => !r.correct || (r.systemName === 'V2' && r.routingCorrect === false));

  let md = '';
  md += `# Error Analysis Template: ${runId}\n\n`;
  md += `**Date:** ${new Date().toISOString()}  \n`;
  md += `**Total Error & Misrouted Cases for Review:** ${errorRows.length}  \n\n`;
  md += `> [!NOTE]\n`;
  md += `> Instructions for Author: For each failure case below, write a one-sentence factual diagnosis\n`;
  md += `> explaining why the error occurred, and select one failure type.\n\n`;

  if (errorRows.length === 0) {
    md += `*No errors or misrouted questions found for this run.*\n`;
  } else {
    for (const row of errorRows) {
      const q = questionMap.get(row.questionId);
      const retrievedStr = (row.retrievedIds || []).map(r => r.id).join(', ') || 'None';
      const expectedSourceRetrieved = row.sourceRetrieved === null ? 'n.a.' : (row.sourceRetrieved ? 'yes' : 'no');
      const answerSnippet = (row.answer || 'null').slice(0, 300);

      md += `### [${row.systemName}] ${row.questionId} (${q.category})\n\n`;
      md += `- **Question:** "${q.question}"\n`;
      md += `- **Expected Outcome:** \`${q.expected_outcome}\`\n`;
      if (q.correct_answer) {
        md += `- **Expected Answer:** "${q.correct_answer}"\n`;
      }
      md += `- **What Happened:** Classification=\`${row.llmClassification || 'null'}\`, Outcome=\`${row.outcome}\`, Reason=\`${row.escalationReason || 'null'}\`\n`;
      md += `- **System Answer (first 300 chars):** "${answerSnippet}"\n`;
      md += `- **Retrieved Items:** \`${retrievedStr}\`\n`;
      md += `- **Expected Source Retrieved:** \`${expectedSourceRetrieved}\`\n`;
      md += `\n`;
      md += `Why it failed (one sentence, written by the author): ______  \n`;
      md += `Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  \n\n`;
      md += `---\n\n`;
    }
  }

  const resultsDir = path.resolve(REPO_ROOT, 'data/eval/results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  const errorPath = path.resolve(resultsDir, `error-analysis-${runId}.md`);
  fs.writeFileSync(errorPath, md, 'utf8');
  console.log(`Error analysis template written to ${errorPath}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Unhandled error template error:', err);
  process.exit(1);
});
