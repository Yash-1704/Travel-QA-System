/**
 * routes/chat.js
 *
 * POST /api/chat  { question, system?: "v1"|"v2", customerId?: string }
 * Defaults system to "v2".
 *
 * For V2 with ESCALATED outcome, inserts a pending case into MongoDB `cases`
 * and responds with caseId and message.
 * For V1, never saves a case.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { answerV1, answerV2 } from '../services/answer.js';
import { DailyBudgetError } from '../services/llm.js';
import { getCollection } from '../services/db.js';
import { loadOkfFiles } from '../services/okfLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../');

const router = express.Router();

// Cached notices and okf files for metadata lookup in cases
let noticeMap = null;
function getNoticeMap() {
  if (!noticeMap) {
    const noticesPath = path.resolve(REPO_ROOT, 'data/rag/notices.json');
    const notices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));
    noticeMap = new Map(notices.map(n => [n.id, n]));
  }
  return noticeMap;
}

let okfFileMap = null;
function getOkfFileMap() {
  if (!okfFileMap) {
    const files = loadOkfFiles();
    okfFileMap = new Map(files.map(f => [f.filename, f]));
  }
  return okfFileMap;
}

/**
 * Build case document per AGENTS.md Phase 2B schema.
 */
function buildCaseDoc(question, result, customerId = null) {
  const okfRetrieved = (result.retrieved || []).find(r => r.type === 'OKF');
  let okfEvidence = null;

  if (okfRetrieved) {
    const file = getOkfFileMap().get(okfRetrieved.id);
    const fm = file?.frontmatter || {};

    const formatFmDate = val => {
      if (!val) return null;
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      return String(val).slice(0, 10);
    };

    okfEvidence = {
      filename: okfRetrieved.id,
      title: file?.title || fm.title || '',
      topic: file?.topic || fm.topic || '',
      status: file?.status || fm.status || '',
      verified: formatFmDate(fm.verified),
      stale_after: formatFmDate(fm.stale_after),
      score: okfRetrieved.score !== undefined ? okfRetrieved.score : 0,
      excerpt: (okfRetrieved.text || file?.text || '').slice(0, 600)
    };
  }

  const ragEvidence = [];
  const nMap = getNoticeMap();
  for (const r of (result.retrieved || [])) {
    if (r.type === 'RAG') {
      const notice = nMap.get(r.id);
      ragEvidence.push({
        id: r.id,
        similarity: r.similarity !== undefined ? r.similarity : null,
        text: r.text || notice?.text || '',
        timestamp: notice?.metadata?.timestamp ?? null,
        source_type: notice?.metadata?.source_type ?? '',
        flight_no: notice?.metadata?.flight_no ?? null,
        route: notice?.metadata?.route ?? null
      });
    }
  }

  return {
    question,
    status: 'pending',
    llmClassification: result.classification || 'ESCALATE',
    reason: result.escalationReason || 'ESCALATE',
    okfEvidence,
    ragEvidence,
    finalAnswer: null,
    customerId: customerId || null,
    createdAt: new Date(),
    resolvedAt: null
  };
}

router.post('/', async (req, res) => {
  const { question, system = 'v2', customerId } = req.body || {};

  // Validate question
  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'question is required and must be a non-empty string' });
  }
  if (question.length > 1000) {
    return res.status(400).json({ error: 'question must be at most 1000 characters' });
  }

  const systemLower = (system || 'v2').toLowerCase();

  try {
    let result;

    if (systemLower === 'v1') {
      result = await answerV1(question.trim());
    } else if (systemLower === 'v2') {
      result = await answerV2(question.trim());
    } else {
      return res.status(400).json({ error: 'system must be "v1" or "v2"' });
    }

    // Build response: strip text from retrieved, keep score/similarity
    const responseRetrieved = (result.retrieved || []).map(item => ({
      type: item.type,
      id: item.id,
      similarity: item.similarity !== undefined ? item.similarity : null,
      score: item.score !== undefined ? item.score : null
    }));

    // If V2 and ESCALATED, insert a pending case
    let caseId = undefined;
    if (systemLower === 'v2' && result.outcome === 'ESCALATED') {
      try {
        const caseDoc = buildCaseDoc(question.trim(), result, customerId);
        const casesCol = getCollection('cases');
        const insertRes = await casesCol.insertOne(caseDoc);
        caseId = insertRes.insertedId.toString();
      } catch (dbErr) {
        console.error('Failed to insert case into MongoDB:', dbErr);
        // Do not crash the entire request if DB insert fails
      }
    }

    const responseAnswer = result.outcome === 'ESCALATED'
      ? 'A team member will get back to you shortly.'
      : result.answer;

    return res.json({
      system: result.system,
      outcome: result.outcome,
      caseId,
      message: result.outcome === 'ESCALATED' ? 'A team member will get back to you shortly.' : undefined,
      classification: result.classification || null,
      escalationReason: result.escalationReason || null,
      answer: responseAnswer,
      citations: result.citations || [],
      tokens: result.tokens,
      retrieved: responseRetrieved,
      classifyMs: result.classifyMs,
      retrievalMs: result.retrievalMs,
      llmMs: result.llmMs
    });
  } catch (err) {
    if (err instanceof DailyBudgetError || err.name === 'DailyBudgetError') {
      return res.status(503).json({ error: err.message });
    }
    console.error('Chat route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
