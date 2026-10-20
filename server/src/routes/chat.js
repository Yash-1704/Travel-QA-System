/**
 * routes/chat.js
 *
 * POST /api/chat  { question, system? }
 * Defaults system to "v1" in Phase 1.
 *
 * Response: { system, outcome, answer, citations, escalationReason, tokens, retrieved }
 * retrieved items: { type, id, similarity } — no text in the response
 */

import express from 'express';
import { answerV1 } from '../services/answer.js';
import { DailyBudgetError } from '../services/llm.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { question, system = 'v1' } = req.body || {};

  // Validate question
  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'question is required and must be a non-empty string' });
  }
  if (question.length > 1000) {
    return res.status(400).json({ error: 'question must be at most 1000 characters' });
  }

  const systemLower = (system || 'v1').toLowerCase();

  try {
    let result;

    if (systemLower === 'v1') {
      result = await answerV1(question.trim());
    } else if (systemLower === 'v2') {
      // answerV2 is not yet available in Phase 1
      const { answerV2 } = await import('../services/answer.js');
      result = await answerV2(question.trim());
    } else {
      return res.status(400).json({ error: 'system must be "v1" or "v2"' });
    }

    // Build response (strip text from retrieved)
    const responseRetrieved = (result.retrieved || []).map(({ type, id, similarity }) => ({
      type,
      id,
      similarity
    }));

    // Escalated message
    const responseAnswer = result.outcome === 'ESCALATED'
      ? 'A team member will get back to you shortly.'
      : result.answer;

    return res.json({
      system: result.system,
      outcome: result.outcome,
      answer: responseAnswer,
      citations: result.citations || [],
      escalationReason: result.escalationReason || null,
      tokens: result.tokens,
      retrieved: responseRetrieved
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
