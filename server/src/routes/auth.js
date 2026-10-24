/**
 * server/src/routes/auth.js
 *
 * Authentication routes for Phase 3A:
 * POST /register, POST /login, POST /logout, GET /me
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getCollection } from '../services/db.js';
import { COOKIE_NAME, COOKIE_OPTIONS, signToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// In-memory rate limiter for failed login attempts
// 10 failed attempts per 15 minutes per IP+email
const failedAttempts = new Map();
const ATTEMPT_LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

function cleanOldAttempts() {
  const now = Date.now();
  for (const [key, record] of failedAttempts.entries()) {
    if (now >= record.resetAt) {
      failedAttempts.delete(key);
    }
  }
}

function getAttemptKey(req, email) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `${ip}:${email.trim().toLowerCase()}`;
}

function checkRateLimit(key) {
  cleanOldAttempts();
  const record = failedAttempts.get(key);
  if (!record) return null;
  if (record.count >= ATTEMPT_LIMIT) {
    const remainingSec = Math.ceil((record.resetAt - Date.now()) / 1000);
    return remainingSec > 0 ? remainingSec : null;
  }
  return null;
}

function recordFailedAttempt(key) {
  const now = Date.now();
  let record = failedAttempts.get(key);
  if (!record || now >= record.resetAt) {
    record = { count: 1, resetAt: now + WINDOW_MS };
  } else {
    record.count += 1;
  }
  failedAttempts.set(key, record);
}

function clearFailedAttempts(key) {
  failedAttempts.delete(key);
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  if (safeUser._id && !safeUser.id) {
    safeUser.id = safeUser._id.toString();
  }
  return safeUser;
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const usersCol = getCollection('users');

    const existing = await usersCol.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customerId = 'cust-' + crypto.randomBytes(3).toString('hex');
    const createdAt = new Date().toISOString();

    const newUserDoc = {
      role: 'customer',
      name: name.trim(),
      email: trimmedEmail,
      passwordHash,
      customerId,
      createdAt
    };

    const insertResult = await usersCol.insertOne(newUserDoc);
    const createdUser = {
      id: insertResult.insertedId.toString(),
      role: 'customer',
      name: newUserDoc.name,
      email: newUserDoc.email,
      customerId,
      createdAt
    };

    const token = signToken(createdUser);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.status(201).json({ user: createdUser });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register account' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const key = getAttemptKey(req, email);
    const retryAfter = checkRateLimit(key);
    if (retryAfter !== null) {
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many failed login attempts. Please try again later.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const usersCol = getCollection('users');
    const user = await usersCol.findOne({ email: trimmedEmail });

    if (!user) {
      recordFailedAttempt(key);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = (await bcrypt.compare(password, user.passwordHash)) ||
                          (await bcrypt.compare(password.trim(), user.passwordHash));
    if (!passwordMatch) {
      recordFailedAttempt(key);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Success: clear rate limiter
    clearFailedAttempts(key);

    const safeUser = sanitizeUser(user);
    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.json({ user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  return res.json({ ok: true });
});

/**
 * GET /api/auth/me
 */
router.get('/me', optionalAuth, (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({ user: req.user });
});

export default router;
