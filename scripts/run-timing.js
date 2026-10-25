#!/usr/bin/env node
/**
 * scripts/run-timing.js
 *
 * Latency and timing evaluation script per AGENTS.md Phase 5A / 5B.
 * Evaluates a deterministic 20-question test subset over 3 repetitions with cache bypassed.
 * Interleaves systems (alternate order by index parity) and enforces repetition budget rules.
 * Outputs data/eval/results/timing-report.md.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../server/src/config.js';
import { connect, getCollection } from '../server/src/services/db.js';
import { answerV1, answerV2 } from '../server/src/services/answer.js';
import { getDailyUsage, DailyBudgetError } from '../server/src/services/llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    reps: 3,
    autoResume: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--reps' && i + 1 < args.length) {
      options.reps = parseInt(args[++i], 10) || 3;
    } else if (arg === '--auto-resume') {
      options.autoResume = true;
    }
  }

  return options;
}

function getNextUtcMidnightPlus5Min() {
  const now = new Date();
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 5, 0, 0
  ));
  return next.getTime() - now.getTime();
}

function nearestRankP95(arr) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil(0.95 * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function median(arr) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function loadOrCreateTimingSubset(allQuestions) {
  const subsetPath = path.resolve(REPO_ROOT, 'data/eval/timing-subset.json');
  if (fs.existsSync(subsetPath)) {
    return JSON.parse(fs.readFileSync(subsetPath, 'utf8'));
  }

  const testQuestions = allQuestions.filter(q => q.split === 'test');
  const categories = [
    'okf_only',
    'rag_only',
    'hybrid',
    'human_fallback_stale',
    'human_fallback_no_evidence',
    'human_fallback_ambiguous',
    'human_fallback_conflict'
  ];

  const subsetIds = [];
  for (const cat of categories) {
    const inCat = testQuestions
      .filter(q => q.category === cat)
      .sort((a, b) => a.id.localeCompare(b.id));

    const count = cat === 'human_fallback_conflict' ? 2 : 3;
    for (let i = 0; i < count && i < inCat.length; i++) {
      subsetIds.push(inCat[i].id);
    }
  }

  fs.writeFileSync(subsetPath, JSON.stringify(subsetIds, null, 2), 'utf8');
  console.log(`Created deterministic timing subset with ${subsetIds.length} questions: ${subsetPath}`);
  return subsetIds;
}

async function writeTimingReport(expCol, timingIds) {
  const logs = await expCol.find({ runId: 'timing', kind: 'timing' }).toArray();
  if (logs.length === 0) return;

  const v1Logs = logs.filter(r => r.systemName === 'V1');
  const v2Logs = logs.filter(r => r.systemName === 'V2');

  const v1Latencies = v1Logs.map(r => r.latencyMs || 0);
  const v2Latencies = v2Logs.map(r => r.latencyMs || 0);

  const v2ClassifyMs = v2Logs.map(r => r.classifyMs || 0);
  const v2RetrievalMs = v2Logs.map(r => r.retrievalMs || 0);
  const v2LlmMs = v2Logs.map(r => r.llmMs || 0);

  // Paired difference V2 - V1 per (rep, questionId)
  const pairDiffs = [];
  const logMap = new Map();
  for (const log of logs) {
    logMap.set(`${log.rep}:${log.questionId}:${log.systemName}`, log);
  }

  const distinctReps = [...new Set(logs.map(r => r.rep))].sort();
  for (const rep of distinctReps) {
    for (const qId of timingIds) {
      const v1 = logMap.get(`${rep}:${qId}:V1`);
      const v2 = logMap.get(`${rep}:${qId}:V2`);
      if (v1 && v2 && v1.latencyMs !== undefined && v2.latencyMs !== undefined) {
        pairDiffs.push(v2.latencyMs - v1.latencyMs);
      }
    }
  }

  // Dates per repetition
  const repDates = {};
  for (const rep of distinctReps) {
    const repLogs = logs.filter(r => r.rep === rep);
    if (repLogs.length > 0) {
      const minDate = new Date(Math.min(...repLogs.map(r => new Date(r.createdAt).getTime())));
      repDates[rep] = minDate.toISOString().slice(0, 10);
    }
  }

  let md = '';
  md += `# Timing Evaluation Report\n\n`;
  md += `**Date:** ${new Date().toISOString()}  \n`;
  md += `**Completed Repetitions:** ${distinctReps.length} (${distinctReps.map(r => `Rep ${r} on ${repDates[r] || 'unknown'}`).join(', ')})  \n`;
  md += `**Questions in Timing Subset:** ${timingIds.length} test questions (cache bypassed)  \n\n`;

  md += `## 1. System Latency Summary (ms)\n\n`;
  md += `| System | Median Latency (ms) | p95 Latency (ms) (nearest rank) |\n`;
  md += `|---|---|---|\n`;
  md += `| **V1 (RAG Baseline)** | ${median(v1Latencies)} ms | ${nearestRankP95(v1Latencies)} ms |\n`;
  md += `| **V2 (Classify-First)** | ${median(v2Latencies)} ms | ${nearestRankP95(v2Latencies)} ms |\n\n`;

  md += `## 2. V2 Stage Latency Breakdown (Median)\n\n`;
  md += `| Stage | Median Latency (ms) |\n`;
  md += `|---|---|\n`;
  md += `| **Classification (LLM)** | ${median(v2ClassifyMs)} ms |\n`;
  md += `| **Targeted Retrieval (OKF / RAG)** | ${median(v2RetrievalMs)} ms |\n`;
  md += `| **Answer Generation (LLM)** | ${median(v2LlmMs)} ms |\n\n`;

  md += `## 3. Paired System Latency Difference (V2 - V1)\n\n`;
  md += `- **Median Difference (V2 - V1):** ${median(pairDiffs)} ms\n`;
  md += `- **Number of Paired Observations:** ${pairDiffs.length}\n\n`;

  const reportPath = path.resolve(REPO_ROOT, 'data/eval/results/timing-report.md');
  const resultsDir = path.dirname(reportPath);
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`Timing report written to ${reportPath}`);
}

async function main() {
  const options = parseArgs();

  console.log('=== Timing Evaluation Runner ===');
  console.log(`Requested Repetitions: ${options.reps}`);
  console.log(`Auto-resume enabled: ${options.autoResume ? 'YES' : 'NO'}\n`);

  const questionsPath = path.resolve(REPO_ROOT, 'data/eval/questions.json');
  const allQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  const timingIds = loadOrCreateTimingSubset(allQuestions);
  const timingQuestionMap = new Map(allQuestions.map(q => [q.id, q]));
  const timingQuestions = timingIds.map(id => timingQuestionMap.get(id)).filter(Boolean);

  await connect();
  const expCol = getCollection('experiment_logs');

  for (let rep = 1; rep <= options.reps; rep++) {
    console.log(`\n--- Starting Timing Repetition ${rep}/${options.reps} ---`);

    // Check how many items remain in this repetition
    const existingInRep = await expCol.find({
      runId: 'timing',
      rep,
      kind: 'timing'
    }).toArray();

    const loggedKeySet = new Set(existingInRep.map(d => `${d.systemName}:${d.questionId}`));
    const remainingInRep = (timingQuestions.length * 2) - loggedKeySet.size;

    if (remainingInRep === 0) {
      console.log(`Repetition ${rep} is already fully complete (${existingInRep.length} rows). Skipping.`);
      continue;
    }

    // Estimate tokens for this repetition
    // Read average tokens from frozen test run if available, or fallback ~1800 tokens/question
    const frozenDocs = await expCol.find({
      runId: 'test-frozen',
      rep: 0,
      questionId: { $in: timingIds }
    }).toArray();

    let tokensPerQuestionPair = 1800;
    if (frozenDocs.length > 0) {
      const sum = frozenDocs.reduce((a, d) => a + (d.tokens || 0), 0);
      tokensPerQuestionPair = Math.round((sum / (frozenDocs.length / 2)) * 1.1);
    }
    const repEstimatedTokens = Math.round((remainingInRep / 2) * tokensPerQuestionPair);

    // Check remaining daily token budget
    const usage = getDailyUsage();
    const remainingBudget = config.GROQ_DAILY_TOKEN_CAP - usage.tokens;
    console.log(`Daily token usage: ${usage.tokens}/${config.GROQ_DAILY_TOKEN_CAP} (Remaining budget: ${remainingBudget})`);
    console.log(`Estimated tokens needed for Repetition ${rep}: ~${repEstimatedTokens.toLocaleString()} tokens`);

    if (remainingBudget < repEstimatedTokens) {
      console.log(`\nNot enough daily budget to finish repetition ${rep} in one session.`);
      if (!options.autoResume) {
        console.log('Exiting cleanly. Re-run after daily quota resets.');
        await writeTimingReport(expCol, timingIds);
        process.exit(0);
      } else {
        const sleepMs = getNextUtcMidnightPlus5Min();
        const sleepMinutes = Math.round(sleepMs / 60000);
        console.log(`--auto-resume: Sleeping for ${sleepMinutes} minutes until next UTC reset...`);
        await new Promise(r => setTimeout(r, sleepMs));
        console.log(`[WAKE UP] Daily quota reset window reached. Resuming Repetition ${rep}...`);
      }
    }

    // Execute repetition items with alternating index parity
    for (let i = 0; i < timingQuestions.length; i++) {
      const q = timingQuestions[i];
      const systems = i % 2 === 0 ? ['V1', 'V2'] : ['V2', 'V1'];

      for (const sys of systems) {
        let isDone = false;
        while (!isDone) {
          const exists = await expCol.findOne({
            runId: 'timing',
            rep,
            systemName: sys,
            questionId: q.id
          });

          if (exists) {
            isDone = true;
            continue;
          }

          try {
            process.stdout.write(`Rep ${rep} [${sys}] on ${q.id}... `);

            let result;
            if (sys === 'V1') {
              result = await answerV1(q.question, { bypassCache: true });
            } else {
              result = await answerV2(q.question, { bypassCache: true });
            }

            const logDoc = {
              runId: 'timing',
              rep,
              kind: 'timing',
              systemName: sys,
              questionId: q.id,
              category: q.category,
              split: q.split,
              expectedOutcome: q.expected_outcome,
              llmClassification: result.classification || null,
              outcome: result.outcome,
              escalationReason: result.escalationReason || null,
              answer: result.answer || null,
              citations: result.citations || [],
              classifyMs: result.classifyMs || 0,
              retrievalMs: result.retrievalMs || 0,
              llmMs: result.llmMs || 0,
              latencyMs: (result.classifyMs || 0) + (result.retrievalMs || 0) + (result.llmMs || 0),
              tokens: result.tokens?.total || 0,
              tokenBreakdown: result.tokens || { prompt: 0, completion: 0, total: 0 },
              createdAt: new Date()
            };

            await expCol.insertOne(logDoc);
            console.log(`DONE (${logDoc.latencyMs} ms, ${logDoc.tokens} tokens)`);
            isDone = true;
          } catch (err) {
            if (err instanceof DailyBudgetError || err.name === 'DailyBudgetError') {
              console.log('\n[DAILY BUDGET EXHAUSTED DURING TIMING RUN]');
              if (!options.autoResume) {
                console.log('Exiting cleanly. Re-run after quota resets.');
                await writeTimingReport(expCol, timingIds);
                process.exit(0);
              } else {
                const sleepMs = getNextUtcMidnightPlus5Min();
                console.log(`Sleeping until reset...`);
                await new Promise(r => setTimeout(r, sleepMs));
              }
            } else {
              console.error(`\nFatal error during timing evaluation of ${sys} on ${q.id}:`, err);
              process.exit(1);
            }
          }
        }
      }
    }

    console.log(`Repetition ${rep} completed.`);
  }

  console.log('\nAll timing repetitions finished! Generating timing report...');
  await writeTimingReport(expCol, timingIds);
  process.exit(0);
}

main().catch(err => {
  console.error('Unhandled timing runner error:', err);
  process.exit(1);
});
