/**
 * server/src/routes/cases.js
 *
 * REST API for employee dashboard and case resolution (Phase 2B & Phase 3A).
 * Base URL: /api/cases
 */

import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollection } from '../services/db.js';
import { requireRole, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

function isValidObjectId(id) {
  return typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

/**
 * Helper to fetch asker details for a given customerId.
 * @param {string|null} customerId
 * @returns {Promise<object|null>}
 */
async function getAsker(customerId) {
  if (!customerId) return null;
  const usersCol = getCollection('users');
  const user = await usersCol.findOne({ customerId });
  if (!user) return null;
  return {
    customerId: user.customerId,
    name: user.name,
    email: user.email
  };
}

/**
 * GET /api/cases?status=pending|resolved
 * Agent only. Lists cases with summary projection, sorted newest first, with asker.
 */
router.get('/', requireRole('agent'), async (req, res) => {
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
      customerId: 1,
      createdAt: 1
    };

    const cases = await getCollection('cases')
      .find(filter, { projection })
      .sort({ createdAt: -1 })
      .toArray();

    // Attach asker to each case
    const customerIds = [...new Set(cases.map(c => c.customerId).filter(Boolean))];
    let askerMap = new Map();
    if (customerIds.length > 0) {
      const usersCol = getCollection('users');
      const users = await usersCol.find({ customerId: { $in: customerIds } }).toArray();
      askerMap = new Map(users.map(u => [u.customerId, { customerId: u.customerId, name: u.name, email: u.email }]));
    }

    const casesWithAsker = cases.map(c => ({
      ...c,
      asker: c.customerId ? askerMap.get(c.customerId) || null : null
    }));

    return res.json(casesWithAsker);
  } catch (err) {
    console.error('Error fetching cases:', err);
    return res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

/**
 * GET /api/cases/mine
 * Customer only. Defined BEFORE /:id.
 * Returns the customer's own cases as {_id, question, status, finalAnswer, createdAt, resolvedAt}, newest first, no evidence.
 */
router.get('/mine', requireRole('customer'), async (req, res) => {
  try {
    const projection = {
      _id: 1,
      question: 1,
      status: 1,
      finalAnswer: 1,
      createdAt: 1,
      resolvedAt: 1
    };

    const cases = await getCollection('cases')
      .find({ customerId: req.user.customerId }, { projection })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json(cases);
  } catch (err) {
    console.error('Error fetching customer cases:', err);
    return res.status(500).json({ error: 'Failed to fetch customer cases' });
  }
});

/**
 * GET /api/cases/:id/reply
 * Polling endpoint for case resolution. Returns ONLY { status, finalAnswer }.
 * Open for guest cases (customerId is null).
 * For a customer case, only that customer or an agent may read it (401 anonymous, 403 other users).
 */
router.get('/:id/reply', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid case ID' });
    }

    const caseDoc = await getCollection('cases').findOne(
      { _id: new ObjectId(id) },
      { projection: { status: 1, finalAnswer: 1, customerId: 1 } }
    );

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Access control: if case belongs to a customer, verify caller
    if (caseDoc.customerId) {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Session required for customer case reply' });
      }
      if (req.user.role !== 'agent' && req.user.customerId !== caseDoc.customerId) {
        return res.status(403).json({ error: 'Forbidden: Cannot access this case reply' });
      }
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
 * GET /api/cases/:id
 * Agent only. Returns the full case document with asker.
 */
router.get('/:id', requireRole('agent'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid case ID' });
    }

    const caseDoc = await getCollection('cases').findOne({ _id: new ObjectId(id) });
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const asker = await getAsker(caseDoc.customerId);

    return res.json({
      ...caseDoc,
      asker
    });
  } catch (err) {
    console.error('Error fetching case by ID:', err);
    return res.status(500).json({ error: 'Failed to fetch case' });
  }
});

/**
 * POST /api/cases/:id/resolve
 * Agent only. Employee submits answer for a pending case.
 * Body: { answer: string }
 */
router.post('/:id/resolve', requireRole('agent'), async (req, res) => {
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

    const doc = updatedCase.value || updatedCase;
    const asker = await getAsker(doc?.customerId);

    return res.json({
      ...doc,
      asker
    });
  } catch (err) {
    console.error('Error resolving case:', err);
    return res.status(500).json({ error: 'Failed to resolve case' });
  }
});

export default router;
