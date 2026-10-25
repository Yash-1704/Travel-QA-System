/**
 * server/src/middleware/auth.js
 *
 * Authentication & role middleware for Phase 3A.
 */

import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { config } from '../config.js';
import { getCollection } from '../services/db.js';

export const COOKIE_NAME = 'tq_session';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
};

/**
 * Sign a 7-day JWT for a user.
 * @param {object} user
 * @returns {string}
 */
export function signToken(user) {
  const userId = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    { sub: userId, role: user.role },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Helper to fetch user from DB and format req.user.
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
async function loadUser(userId) {
  const usersCol = getCollection('users');
  let user = null;
  try {
    user = await usersCol.findOne({ _id: new ObjectId(userId) });
  } catch {
    user = await usersCol.findOne({ _id: userId });
  }
  if (!user) return null;
  return {
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
    customerId: user.customerId || null
  };
}

/**
 * Require valid session cookie tq_session.
 * Reloads user from MongoDB on EVERY request.
 */
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No session token provided' });
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    const user = await loadUser(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }
}

/**
 * Require specific role. If req.user is not yet attached, attempts auth verification first.
 * @param {string} role
 */
export function requireRole(role) {
  return async (req, res, next) => {
    if (!req.user) {
      const token = req.cookies?.[COOKIE_NAME];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No session token provided' });
      }
      try {
        const payload = jwt.verify(token, config.JWT_SECRET);
        const user = await loadUser(payload.sub);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized: User not found' });
        }
        req.user = user;
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
      }
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: Requires role "${role}"` });
    }

    next();
  };
}

/**
 * Optional authentication: attaches req.user if session valid, else req.user = null.
 */
export async function optionalAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    const user = await loadUser(payload.sub);
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
}

/**
 * JSON-only body guard:
 * POST/PUT/PATCH/DELETE requests carrying a body must have Content-Type application/json.
 */
export function jsonBodyGuard(req, res, next) {
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (mutatingMethods.includes(req.method)) {
    const contentLength = req.headers['content-length'];
    const hasLength = contentLength && parseInt(contentLength, 10) > 0;
    const isChunked = req.headers['transfer-encoding'] === 'chunked';
    
    if (hasLength || isChunked) {
      const contentType = req.headers['content-type'] || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        return res.status(415).json({ error: 'Unsupported Media Type: Content-Type must be application/json' });
      }
    }
  }
  next();
}
