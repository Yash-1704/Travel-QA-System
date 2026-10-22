/**
 * routes/cases.js
 *
 * REST API for employee dashboard and case resolution (Phase 2B).
 * Base URL: /api/cases
 */

import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollection } from '../services/db.js';

const router = express.Router();

function isValidObjectId(id) {
  return typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

/**
 * GET /?status=pending|resolved
 * Lists cases with summary projection, sorted newest first.
 */
router.get('/', async (req, res) => {
  try {
    const statusParam = req.query.status || 'pending';
    const filter = ['pending', 'resolved'].includes(statusParam)
      ? { status: statusParam }
      : { status: 'pending' };

    const projection = {
      _id: 1,
      question: 1,
      status: 1,
      llmClassification: 1,
      reason: 1,
      createdAt: 1
    };

    const cases = await getCollection('cases')
      .find(filter, { projection })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json(cases);
  } catch (err) {
    console.error('Error fetching cases:', err);
    return res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

/**
 * GET /:id
 * Returns the full case document.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid case ID' });
    }

    const caseDoc = await getCollection('cases').findOne({ _id: new ObjectId(id) });
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    return res.json(caseDoc);
  } catch (err) {
    console.error('Error fetching case by ID:', err);
    return res.status(500).json({ error: 'Failed to fetch case' });
  }
});

/**
 * GET /:id/reply
 * Public polling endpoint. Returns ONLY { status, finalAnswer }.
 */
router.get('/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid case ID' });
    }

    const caseDoc = await getCollection('cases').findOne(
      { _id: new ObjectId(id) },
      { projection: { status: 1, finalAnswer: 1 } }
    );

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    return res.json({
      status: caseDoc.status,
      finalAnswer: caseDoc.finalAnswer || null
    });
  } catch (err) {
    console.error('Error fetching case reply:', err);
    return res.status(500).json({ error: 'Failed to fetch reply' });
  }
});

/**
 * POST /:id/resolve
 * Employee submits answer for a pending case.
 * Body: { answer: string }
 */
router.post('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid case ID' });
    }

    const rawAnswer = req.body?.answer;
    const answer = typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
    if (!answer) {
      return res.status(400).json({ error: 'Answer is required and cannot be empty' });
    }

    const casesCol = getCollection('cases');
    const existingCase = await casesCol.findOne({ _id: new ObjectId(id) });

    if (!existingCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (existingCase.status === 'resolved') {
      return res.status(409).json({ error: 'Case is already resolved' });
    }

    const resolvedAt = new Date();
    const updatedCase = await casesCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          finalAnswer: answer,
          status: 'resolved',
          resolvedAt
        }
      },
      { returnDocument: 'after' }
    );

    return res.json(updatedCase);
  } catch (err) {
    console.error('Error resolving case:', err);
    return res.status(500).json({ error: 'Failed to resolve case' });
  }
});

export default router;
