#!/usr/bin/env node
/**
 * scripts/run-eval.js
 *
 * Evaluation runner for V1 and V2 across dev or test splits per AGENTS.md Phase 5A.
 * Evaluates questions, computes automated grades, logs to MongoDB experiment_logs,
 * enforces daily budget caps, and supports auto-resumption.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { config } from '../server/src/config.js';
import { connect, getCollection } from '../server/src/services/db.js';
import { answerV1, answerV2 } from '../server/src/services/answer.js';
import { DailyBudgetError } from '../server/src/services/llm.js';
import { gradeResult } from '../server/src/services/grade.js';
import { buildClassifyPrompt, buildAnswerPrompt } from '../server/src/services/prompts.js';
import { loadOkfFiles } from '../server/src/services/okfLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    split: null,
    runId: null,
    systems: ['V1', 'V2'],
    confirmFrozen: false,
    autoResume: false,
    report: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--split' && i + 1 < args.length) {
      options.split = args[++i].toLowerCase();
    } else if (arg === '--run-id' && i + 1 < args.length) {
      options.runId = args[++i];
    } else if (arg === '--systems' && i + 1 < args.length) {
      options.systems = args[++i]
        .split(',')
        .map(s => s.trim().toUpperCase());
    } else if (arg === '--confirm-frozen') {
      options.confirmFrozen = true;
    } else if (arg === '--auto-resume') {
      options.autoResume = true;
    } else if (arg === '--report') {
      options.report = true;
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

async function main() {
  const options = parseArgs();

  // Validate split
  if (!options.split || !['dev', 'test'].includes(options.split)) {
    console.error('Error: --split dev|test is required.');
    process.exit(1);
  }

  // Set default runId
  if (!options.runId) {
    options.runId = options.split === 'test' ? 'test-frozen' : 'dev-1';
  }

  // Confirm frozen check for test
  if (options.split === 'test' && !options.confirmFrozen) {
    console.error('CRITICAL WARNING: Running on the test split requires explicit --confirm-frozen.');
    console.error('The 56-question test set is run exactly once after freezing.');
    process.exit(1);
  }

  console.log(`=== Evaluation Run: ${options.runId} (${options.split.toUpperCase()} split) ===`);
  console.log(`Systems to evaluate: ${options.systems.join(', ')}`);
  console.log(`Auto-resume enabled: ${options.autoResume ? 'YES' : 'NO'}\n`);

  // Ensure results directory exists
  const resultsDir = path.resolve(REPO_ROOT, 'data/eval/results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Load questions
  const questionsPath = path.resolve(REPO_ROOT, 'data/eval/questions.json');
  const allQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  const splitQuestions = allQuestions
    .filter(q => q.split === options.split)
    .sort((a, b) => a.id.localeCompare(b.id));

  console.log(`Loaded ${splitQuestions.length} questions for split "${options.split}".`);

  // If test split, write metadata file once
  if (options.split === 'test') {
    const metaPath = path.resolve(resultsDir, `${options.runId}-meta.json`);
    if (!fs.existsSync(metaPath)) {
      let commitHash = 'unknown';
      try {
        commitHash = execSync('git rev-parse HEAD', { cwd: REPO_ROOT }).toString().trim();
      } catch (e) {
        console.warn('Could not read git commit hash:', e.message);
      }

      const classifyPromptTemplate = buildClassifyPrompt('{question}');
      const answerPromptTemplate = buildAnswerPrompt('{question}', '{evidence}');
      const classifyHash = crypto.createHash('sha256').update(classifyPromptTemplate).digest('hex');
      const answerHash = crypto.createHash('sha256').update(answerPromptTemplate).digest('hex');

      const okfFiles = loadOkfFiles();
      const noticesPath = path.resolve(REPO_ROOT, 'data/rag/notices.json');
      const notices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));

      const meta = {
        date: new Date().toISOString(),
        runId: options.runId,
        split: options.split,
        GROQ_MODEL: config.GROQ_MODEL,
        GEMINI_EMBED_MODEL: config.GEMINI_EMBED_MODEL,
        RAG_SIM_FLOOR: config.RAG_SIM_FLOOR,
        gitCommitHash: commitHash,
        promptHashes: {
          classifySha256: classifyHash,
          answerSha256: answerHash
        },
        counts: {
          okfFiles: okfFiles.length,
          notices: notices.length,
          questionsTotal: allQuestions.length,
          splitQuestions: splitQuestions.length
        }
      };

      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
      console.log(`Saved metadata to ${metaPath}`);
    }
  }

  // Connect to DB
  await connect();
  const expCol = getCollection('experiment_logs');

  // Planning estimate
  const existingDocs = await expCol.find({
    runId: options.runId,
    rep: 0,
    kind: 'eval'
  }).toArray();

  const loggedKeySet = new Set(existingDocs.map(d => `${d.systemName}:${d.questionId}`));
  const remainingTotal = splitQuestions.length * options.systems.length - loggedKeySet.size;

  let meanTokensPerItem = 850;
  if (existingDocs.length > 0) {
    const totalTokens = existingDocs.reduce((acc, d) => acc + (d.tokens || 0), 0);
    meanTokensPerItem = Math.round(totalTokens / existingDocs.length);
  }
  const estimatedRemainingTokens = remainingTotal * meanTokensPerItem;

  console.log(`Items already completed: ${loggedKeySet.size}/${splitQuestions.length * options.systems.length}`);
  console.log(`Items remaining: ${remainingTotal}`);
  console.log(`Estimated remaining token cost: ~${estimatedRemainingTokens.toLocaleString()} tokens (measured mean: ${meanTokensPerItem} tokens/item)\n`);

  // Evaluation Loop
  for (const q of splitQuestions) {
    for (const sys of options.systems) {
      let isDone = false;

      while (!isDone) {
        // Check if already completed
        const existing = await expCol.findOne({
          runId: options.runId,
          rep: 0,
          systemName: sys,
          questionId: q.id
        });

        if (existing) {
          isDone = true;
          continue;
        }

        try {
          process.stdout.write(`Evaluating [${options.runId}] ${sys} on ${q.id} (${q.category})... `);

          let result;
          if (sys === 'V1') {
            result = await answerV1(q.question);
          } else if (sys === 'V2') {
            result = await answerV2(q.question);
          } else {
            throw new Error(`Unknown system: ${sys}`);
          }

          // Grade result
          const grade = gradeResult(q, result);

          // Check sourceRetrieved
          let sourceRetrieved = null;
          if (q.source_file || q.source_chunk) {
            const retrievedIds = (result.retrieved || []).map(r => r.id);
            const foundFile = q.source_file && retrievedIds.includes(q.source_file);
            const foundChunk = q.source_chunk && retrievedIds.includes(q.source_chunk);
            sourceRetrieved = Boolean(foundFile || foundChunk);
          }

          // Build experiment_logs document
          const logDoc = {
            runId: options.runId,
            rep: 0,
            kind: 'eval',
            systemName: sys,
            questionId: q.id,
            category: q.category,
            split: q.split,
            expectedOutcome: q.expected_outcome,
            llmClassification: result.classification || null,
            classificationRaw: result.classification || null,
            outcome: result.outcome,
            escalationReason: result.escalationReason || null,
            answer: result.answer || null,
            citations: result.citations || [],
            retrievedIds: (result.retrieved || []).map(r => ({
              type: r.type,
              id: r.id,
              score: r.score !== undefined ? r.score : null,
              similarity: r.similarity !== undefined ? r.similarity : null
            })),
            sourceRetrieved,
            correct: grade.correct,
            wrongAnswer: grade.wrongAnswer,
            needsManualReview: grade.needsManualReview,
            unnecessaryEscalation: grade.unnecessaryEscalation,
            safeEscalation: grade.safeEscalation,
            routingCorrect: grade.routingCorrect,
            classifyMs: result.classifyMs || 0,
            retrievalMs: result.retrievalMs || 0,
            llmMs: result.llmMs || 0,
            latencyMs: (result.classifyMs || 0) + (result.retrievalMs || 0) + (result.llmMs || 0),
            tokens: result.tokens?.total || 0,
            tokenBreakdown: result.tokens || { prompt: 0, completion: 0, total: 0 },
            createdAt: new Date()
          };

          await expCol.insertOne(logDoc);
          console.log(`DONE (${result.outcome}, correct=${grade.correct}, tokens=${logDoc.tokens})`);
          isDone = true;
        } catch (err) {
          if (err instanceof DailyBudgetError || err.name === 'DailyBudgetError') {
            console.log('\n[DAILY BUDGET EXHAUSTED]');
            console.log(err.message);

            const completedNow = await expCol.countDocuments({
              runId: options.runId,
              rep: 0,
              kind: 'eval'
            });
            const remaining = (splitQuestions.length * options.systems.length) - completedNow;
            const remainingTokensEst = remaining * meanTokensPerItem;

            console.log(`Progress: ${completedNow}/${splitQuestions.length * options.systems.length} completed.`);
            console.log(`Remaining: ${remaining} items (~${remainingTokensEst.toLocaleString()} tokens).`);

            if (!options.autoResume) {
              console.log('\nExiting cleanly. Re-run the same command after your daily quota resets.');
              console.log('Cached results and completed rows are preserved.');
              process.exit(0);
            } else {
              const sleepMs = getNextUtcMidnightPlus5Min();
              const sleepMinutes = Math.round(sleepMs / 60000);
              const wakeTime = new Date(Date.now() + sleepMs).toISOString();
              console.log(`\n--auto-resume active: Sleeping for ${sleepMinutes} minutes until next UTC reset (${wakeTime})...`);

              await new Promise(resolve => setTimeout(resolve, sleepMs));
              console.log(`[WAKE UP] Daily quota reset window reached at ${new Date().toISOString()}. Resuming evaluation...`);
              // Loop will retry current item
            }
          } else {
            console.error(`\nFatal error evaluating ${sys} on ${q.id}:`, err);
            process.exit(1);
          }
        }
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`Evaluation Run "${options.runId}" COMPLETE!`);
  console.log(`========================================\n`);

  if (options.report) {
    console.log(`Generating report for run "${options.runId}"...`);
    try {
      execSync(`node scripts/report.js --run-id ${options.runId}`, {
        cwd: REPO_ROOT,
        stdio: 'inherit'
      });
    } catch (e) {
      console.error('Failed to automatically generate report:', e.message);
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Unhandled run-eval error:', err);
  process.exit(1);
});
