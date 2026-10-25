#!/usr/bin/env node
/**
 * scripts/report.js
 *
 * Generates Markdown and CSV evaluation reports from experiment_logs per AGENTS.md Phase 5A.
 * Computes headline correctness, sensitivity analysis (excluding stale category),
 * conflict deep-dive, confusion matrix, routing accuracy, tokens, and retrieval hit rate.
 * Every percentage includes explicit counts: "X/Y (Z%)".
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

function pct(n, d) {
  if (!d || d === 0) return '0/0 (N/A)';
  const val = ((n / d) * 100).toFixed(1);
  return `${n}/${d} (${val}%)`;
}

function median(nums) {
  if (!nums || nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

function mean(nums) {
  if (!nums || nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  const { runId } = parseArgs();
  if (!runId) {
    console.error('Error: --run-id <id> is required.');
    process.exit(1);
  }

  console.log(`Generating evaluation report for runId: "${runId}"...`);

  await connect();
  const expCol = getCollection('experiment_logs');
  const rows = await expCol.find({ runId, rep: 0, kind: 'eval' }).sort({ questionId: 1 }).toArray();

  if (rows.length === 0) {
    console.error(`Error: No evaluation logs found in MongoDB for runId "${runId}".`);
    process.exit(1);
  }

  // Check for manual grades
  const manualGradesPath = path.resolve(REPO_ROOT, 'data/eval/manual-grades.json');
  let manualGrades = [];
  if (fs.existsSync(manualGradesPath)) {
    try {
      manualGrades = JSON.parse(fs.readFileSync(manualGradesPath, 'utf8'));
    } catch (e) {
      console.warn('Warning: Could not parse manual-grades.json:', e.message);
    }
  }

  const manualGradeMap = new Map();
  for (const mg of manualGrades) {
    if (mg.runId === runId) {
      manualGradeMap.set(`${mg.systemName}:${mg.questionId}`, mg);
    }
  }

  let overridesAuthor = 0;
  let overridesAgent = 0;
  let unreviewedNeedsManual = 0;

  for (const row of rows) {
    const key = `${row.systemName}:${row.questionId}`;
    const mg = manualGradeMap.get(key);
    row.autoCorrect = row.correct;

    if (mg) {
      if (mg.source === 'author') overridesAuthor++;
      else overridesAgent++;
      row.correct = Boolean(mg.correct);
      row.manualNote = mg.note;
      row.manualSource = mg.source;

      // Recompute wrongAnswer
      if (row.expectedOutcome !== 'ESCALATE') {
        row.wrongAnswer = (row.outcome !== 'ESCALATED') && !row.correct;
      } else {
        row.wrongAnswer = (row.outcome !== 'ESCALATED');
      }
    } else {
      if (row.needsManualReview) {
        unreviewedNeedsManual++;
      }
    }
  }

  console.log(`Manual Grade Overrides applied: ${overridesAuthor} author, ${overridesAgent} agent-proposed.`);
  console.log(`Unreviewed rows needing manual review: ${unreviewedNeedsManual}`);

  // Split into V1 and V2
  const v1Rows = rows.filter(r => r.systemName === 'V1');
  const v2Rows = rows.filter(r => r.systemName === 'V2');

  const categories = [
    'okf_only',
    'rag_only',
    'hybrid',
    'human_fallback_stale',
    'human_fallback_no_evidence',
    'human_fallback_ambiguous',
    'human_fallback_conflict'
  ];

  function computeMetrics(dataset) {
    const total = dataset.length;
    const correctCount = dataset.filter(r => r.correct).length;
    const escalatedCount = dataset.filter(r => r.outcome === 'ESCALATED').length;
    const wrongAnswerCount = dataset.filter(r => r.wrongAnswer).length;

    // Non-escalate questions
    const nonEsc = dataset.filter(r => r.expectedOutcome !== 'ESCALATE');
    const nonEscAnswered = nonEsc.filter(r => r.outcome !== 'ESCALATED');
    const nonEscAnsweredCorrect = nonEscAnswered.filter(r => r.correct).length;

    // Unnecessary escalations
    const unnecessaryEscCount = dataset.filter(r => r.unnecessaryEscalation).length;

    return {
      total,
      correctCount,
      escalatedCount,
      wrongAnswerCount,
      nonEscTotal: nonEsc.length,
      nonEscAnsweredTotal: nonEscAnswered.length,
      nonEscAnsweredCorrect,
      unnecessaryEscCount
    };
  }

  const v1All = computeMetrics(v1Rows);
  const v2All = computeMetrics(v2Rows);

  const v1ExStale = computeMetrics(v1Rows.filter(r => r.category !== 'human_fallback_stale'));
  const v2ExStale = computeMetrics(v2Rows.filter(r => r.category !== 'human_fallback_stale'));

  // Conflict category analysis
  const v1Conflicts = v1Rows.filter(r => r.category === 'human_fallback_conflict');
  const v2Conflicts = v2Rows.filter(r => r.category === 'human_fallback_conflict');

  function analyzeConflict(rows) {
    const total = rows.length;
    const correctConflictReason = rows.filter(r => r.outcome === 'ESCALATED' && r.escalationReason === 'CONFLICT').length;
    const safeEscalated = rows.filter(r => r.outcome === 'ESCALATED').length;
    const retrievedBoth = rows.filter(r => {
      const ids = (r.retrievedIds || []).map(item => item.id);
      const hasGeneral = ids.includes('refund-policy-general.md');
      const hasAirline = ids.some(id => typeof id === 'string' && id.startsWith('cancellation-') && id.endsWith('.md'));
      return hasGeneral && hasAirline;
    }).length;
    return { total, correctConflictReason, safeEscalated, retrievedBoth };
  }

  const v1ConfAnalysis = analyzeConflict(v1Conflicts);
  const v2ConfAnalysis = analyzeConflict(v2Conflicts);

  // V2 Routing & Confusion Matrix
  const v2RoutingCorrect = v2Rows.filter(r => r.routingCorrect).length;
  const labels = ['OKF_ONLY', 'RAG_ONLY', 'HYBRID', 'ESCALATE'];
  const confusionMatrix = {};
  for (const exp of labels) {
    confusionMatrix[exp] = { OKF_ONLY: 0, RAG_ONLY: 0, HYBRID: 0, ESCALATE: 0, INVALID: 0 };
  }
  let v2InvalidCount = 0;

  for (const r of v2Rows) {
    const exp = r.expectedOutcome;
    const pred = r.llmClassification || 'INVALID';
    if (confusionMatrix[exp]) {
      if (confusionMatrix[exp][pred] !== undefined) {
        confusionMatrix[exp][pred]++;
      } else {
        confusionMatrix[exp].INVALID++;
        v2InvalidCount++;
      }
    }
  }

  // V2 Floor fired (best RAG similarity < 0.3)
  const v2FloorFiredCount = v2Rows.filter(r => r.escalationReason === 'NO_RAG_MATCH').length;

  // V2 Escalations by reason
  const v2EscByReason = {};
  for (const r of v2Rows) {
    if (r.outcome === 'ESCALATED') {
      const reason = r.escalationReason || 'UNKNOWN';
      v2EscByReason[reason] = (v2EscByReason[reason] || 0) + 1;
    }
  }

  // V2 conditional accuracy on routing
  const v2RouteCorrectRows = v2Rows.filter(r => r.routingCorrect);
  const v2RouteWrongRows = v2Rows.filter(r => !r.routingCorrect);
  const v2RouteCorrectNonEsc = v2RouteCorrectRows.filter(r => r.expectedOutcome !== 'ESCALATE' && r.outcome !== 'ESCALATED');
  const v2RouteCorrectAcc = pct(v2RouteCorrectNonEsc.filter(r => r.correct).length, v2RouteCorrectNonEsc.length);
  const v2RouteWrongNonEsc = v2RouteWrongRows.filter(r => r.expectedOutcome !== 'ESCALATE' && r.outcome !== 'ESCALATED');
  const v2RouteWrongAcc = pct(v2RouteWrongNonEsc.filter(r => r.correct).length, v2RouteWrongNonEsc.length);

  // Tokens & Latency
  const v1Tokens = v1Rows.map(r => r.tokens || 0);
  const v2Tokens = v2Rows.map(r => r.tokens || 0);
  const v2ClassifyTokens = v2Rows.map(r => (r.tokenBreakdown?.prompt || 0) + (r.tokenBreakdown?.completion || 0) - (r.tokens || 0)); // estimate or logged
  const v1Latencies = v1Rows.map(r => r.latencyMs || 0);
  const v2Latencies = v2Rows.map(r => r.latencyMs || 0);

  // Retrieval hit rate
  const v1WithSource = v1Rows.filter(r => r.sourceRetrieved !== null);
  const v1SourceHitRate = pct(v1WithSource.filter(r => r.sourceRetrieved).length, v1WithSource.length);
  const v2WithSource = v2Rows.filter(r => r.sourceRetrieved !== null);
  const v2SourceHitRate = pct(v2WithSource.filter(r => r.sourceRetrieved).length, v2WithSource.length);

  // ----------------------------------------------------
  // Generate Markdown Report
  // ----------------------------------------------------
  let md = '';
  md += `# Evaluation Report: ${runId}\n\n`;
  md += `**Date:** ${new Date().toISOString()}  \n`;
  md += `**Evaluated Questions:** ${v1Rows.length} (V1: ${v1Rows.length}, V2: ${v2Rows.length})  \n`;
  md += `**Manual Overrides Applied:** ${overridesAuthor} (author), ${overridesAgent} (agent-proposed)  \n\n`;

  md += `## 1. Headline Results & Sensitivity Analysis\n\n`;
  md += `### Primary Evaluation (All ${v1All.total} Questions)\n\n`;
  md += `| Metric | V1 (RAG Baseline) | V2 (Classify-First) |\n`;
  md += `|---|---|---|\n`;
  md += `| **Overall Correctness** | ${pct(v1All.correctCount, v1All.total)} | ${pct(v2All.correctCount, v2All.total)} |\n`;
  md += `| **Answer Accuracy** (on non-escalated) | ${pct(v1All.nonEscAnsweredCorrect, v1All.nonEscAnsweredTotal)} | ${pct(v2All.nonEscAnsweredCorrect, v2All.nonEscAnsweredTotal)} |\n`;
  md += `| **Wrong Answer Rate** | ${pct(v1All.wrongAnswerCount, v1All.total)} | ${pct(v2All.wrongAnswerCount, v2All.total)} |\n`;
  md += `| **Escalation Rate** | ${pct(v1All.escalatedCount, v1All.total)} | ${pct(v2All.escalatedCount, v2All.total)} |\n`;
  md += `| **Unnecessary Escalation Rate** | ${pct(v1All.unnecessaryEscCount, v1All.nonEscTotal)} | ${pct(v2All.unnecessaryEscCount, v2All.nonEscTotal)} |\n\n`;

  md += `> [!NOTE]\n`;
  md += `> **Sensitivity Analysis (Excluding Stale Policy Category):** The \`human_fallback_stale\` category deliberately tests source-faithfulness to outdated document text. Below is the primary sensitivity check across the remaining ${v1ExStale.total} questions.\n\n`;
  md += `| Metric (Excl. Stale) | V1 (RAG Baseline) | V2 (Classify-First) |\n`;
  md += `|---|---|---|\n`;
  md += `| **Overall Correctness** | ${pct(v1ExStale.correctCount, v1ExStale.total)} | ${pct(v2ExStale.correctCount, v2ExStale.total)} |\n`;
  md += `| **Answer Accuracy** (on non-escalated) | ${pct(v1ExStale.nonEscAnsweredCorrect, v1ExStale.nonEscAnsweredTotal)} | ${pct(v2ExStale.nonEscAnsweredCorrect, v2ExStale.nonEscAnsweredTotal)} |\n`;
  md += `| **Wrong Answer Rate** | ${pct(v1ExStale.wrongAnswerCount, v1ExStale.total)} | ${pct(v2ExStale.wrongAnswerCount, v2ExStale.total)} |\n\n`;

  md += `## 2. Per-Category Breakdown\n\n`;
  md += `| Category | Expected Outcome | V1 Correct | V2 Correct | V1 Escalated | V2 Escalated | V1 Wrong | V2 Wrong |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;

  for (const cat of categories) {
    const v1Cat = v1Rows.filter(r => r.category === cat);
    const v2Cat = v2Rows.filter(r => r.category === cat);
    const exp = v1Cat[0]?.expectedOutcome || '-';
    md += `| \`${cat}\` | ${exp} | ${pct(v1Cat.filter(r => r.correct).length, v1Cat.length)} | ${pct(v2Cat.filter(r => r.correct).length, v2Cat.length)} | ${pct(v1Cat.filter(r => r.outcome === 'ESCALATED').length, v1Cat.length)} | ${pct(v2Cat.filter(r => r.outcome === 'ESCALATED').length, v2Cat.length)} | ${pct(v1Cat.filter(r => r.wrongAnswer).length, v1Cat.length)} | ${pct(v2Cat.filter(r => r.wrongAnswer).length, v2Cat.length)} |\n`;
  }
  md += `\n`;

  md += `## 3. Conflict Category Deep-Dive & Source Asymmetry\n\n`;
  md += `The conflict category (\`human_fallback_conflict\`) requires detecting contradictory policies between the airline-specific policy and \`refund-policy-general.md\`. Scoring rules require escalating specifically with reason \`CONFLICT\`.\n\n`;
  md += `| Conflict Metric | V1 | V2 |\n`;
  md += `|---|---|---|\n`;
  md += `| **Correct Escalation via CONFLICT** | ${pct(v1ConfAnalysis.correctConflictReason, v1ConfAnalysis.total)} | ${pct(v2ConfAnalysis.correctConflictReason, v2ConfAnalysis.total)} |\n`;
  md += `| **Safe Escalation (Any Escalation Reason)** | ${pct(v1ConfAnalysis.safeEscalated, v1ConfAnalysis.total)} | ${pct(v2ConfAnalysis.safeEscalated, v2ConfAnalysis.total)} |\n`;
  md += `| **Retrieved Both Conflicting Files** | ${pct(v1ConfAnalysis.retrievedBoth, v1ConfAnalysis.total)} | ${pct(v2ConfAnalysis.retrievedBoth, v2ConfAnalysis.total)} |\n\n`;
  md += `*Design Limitation Note:* V1 retrieves top-3 from the combined collection, providing an opportunity to pull both policy documents simultaneously. V2 routes to OKF matching, which returns at most ONE top-scoring policy file, and ESCALATE routing bypasses retrieval entirely. This architectural asymmetry explains why V2 cannot detect cross-document contradiction unless multi-document retrieval is added.\n\n`;

  md += `## 4. V2 Classification & Routing Performance\n\n`;
  md += `**Overall V2 Routing Accuracy:** ${pct(v2RoutingCorrect, v2Rows.length)}  \n`;
  md += `**INVALID Classifications:** ${v2InvalidCount}  \n`;
  md += `**Similarity Floor Firings (similarity < 0.3):** ${v2FloorFiredCount} times  \n\n`;

  md += `### Confusion Matrix (V2)\n\n`;
  md += `| Expected \\ Predicted | OKF_ONLY | RAG_ONLY | HYBRID | ESCALATE | INVALID |\n`;
  md += `|---|---|---|---|---|---|\n`;
  for (const exp of labels) {
    const row = confusionMatrix[exp];
    md += `| **${exp}** | ${row.OKF_ONLY} | ${row.RAG_ONLY} | ${row.HYBRID} | ${row.ESCALATE} | ${row.INVALID} |\n`;
  }
  md += `\n`;

  md += `### V2 Escalations by Reason\n\n`;
  md += `| Reason | Count |\n`;
  md += `|---|---|\n`;
  for (const [reason, count] of Object.entries(v2EscByReason)) {
    md += `| \`${reason}\` | ${count} |\n`;
  }
  md += `\n`;

  md += `### V2 Accuracy Conditional on Routing\n\n`;
  md += `- **When Routing was Correct:** ${v2RouteCorrectAcc}\n`;
  md += `- **When Routing was Misclassified:** ${v2RouteWrongAcc}\n\n`;

  md += `## 5. Token Efficiency & Latency (indicative only)\n\n`;
  md += `| Metric | V1 | V2 |\n`;
  md += `|---|---|---|\n`;
  md += `| **Mean Tokens / Question** | ${mean(v1Tokens)} | ${mean(v2Tokens)} |\n`;
  md += `| **Median Latency** | ${median(v1Latencies)} ms | ${median(v2Latencies)} ms |\n`;
  md += `| **Mean Latency** | ${mean(v1Latencies)} ms | ${mean(v2Latencies)} ms |\n`;
  md += `| **Retrieval Hit Rate** (\`sourceRetrieved\`) | ${v1SourceHitRate} | ${v2SourceHitRate} |\n\n`;

  // Write Markdown Report
  const reportPath = path.resolve(REPO_ROOT, `data/eval/results/${runId}-report.md`);
  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`Report written to ${reportPath}`);

  // ----------------------------------------------------
  // Generate CSV Rows Export
  // ----------------------------------------------------
  const csvHeaders = [
    'runId',
    'systemName',
    'questionId',
    'category',
    'split',
    'expectedOutcome',
    'llmClassification',
    'outcome',
    'escalationReason',
    'correct',
    'autoCorrect',
    'wrongAnswer',
    'needsManualReview',
    'unnecessaryEscalation',
    'routingCorrect',
    'sourceRetrieved',
    'classifyMs',
    'retrievalMs',
    'llmMs',
    'latencyMs',
    'tokens',
    'citations',
    'retrievedIds',
    'answer'
  ];

  const csvLines = [csvHeaders.join(',')];
  for (const r of rows) {
    const line = [
      csvEscape(r.runId),
      csvEscape(r.systemName),
      csvEscape(r.questionId),
      csvEscape(r.category),
      csvEscape(r.split),
      csvEscape(r.expectedOutcome),
      csvEscape(r.llmClassification),
      csvEscape(r.outcome),
      csvEscape(r.escalationReason),
      csvEscape(r.correct),
      csvEscape(r.autoCorrect),
      csvEscape(r.wrongAnswer),
      csvEscape(r.needsManualReview),
      csvEscape(r.unnecessaryEscalation),
      csvEscape(r.routingCorrect),
      csvEscape(r.sourceRetrieved),
      csvEscape(r.classifyMs),
      csvEscape(r.retrievalMs),
      csvEscape(r.llmMs),
      csvEscape(r.latencyMs),
      csvEscape(r.tokens),
      csvEscape((r.citations || []).map(c => `[${c.type}:${c.id}]`).join(' ')),
      csvEscape((r.retrievedIds || []).map(item => item.id).join(' ')),
      csvEscape(r.answer || '')
    ];
    csvLines.push(line.join(','));
  }

  const csvPath = path.resolve(REPO_ROOT, `data/eval/results/${runId}-rows.csv`);
  fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');
  console.log(`Rows CSV written to ${csvPath}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Unhandled report error:', err);
  process.exit(1);
});
