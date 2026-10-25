#!/usr/bin/env node
/**
 * scripts/test-cases-flow.js
 *
 * Automated verification for Human Fallback & Dashboard flow (Phase 2B & Phase 3A).
 * Updated for Phase 3A:
 *  - Logs in as agent1@travelqa.demo for agent-only endpoints
 *  - Tests customer session attachment on POST /api/chat (ignoring bogus body customerId)
 *  - Cleans up created cases
 */

import http from 'http';
import app from '../server/src/index.js';
import { connect, close, getCollection } from '../server/src/services/db.js';
import { config } from '../server/src/config.js';
import { COOKIE_NAME } from '../server/src/middleware/auth.js';
import { ObjectId } from 'mongodb';

let server = null;
let baseUrl = '';

async function startServer() {
  await connect();
  const port = config.PORT || 3001;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Test server running at ${baseUrl}`);
      resolve();
    });
    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`Server already running on port ${port}, connecting directly.`);
        server = null;
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

async function stopServer() {
  if (server) {
    await new Promise(r => server.close(r));
  }
  await close();
}

function parseCookie(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return '';
  const match = setCookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? `${COOKIE_NAME}=${match[1]}` : '';
}

async function run() {
  console.log('=== Phase 3A / 2B: Testing Human Fallback Flow ===\n');
  await startServer();

  let passed = 0;
  let total = 11;
  let testCaseId = null;
  const createdCaseIds = [];

  // Log in as agent for agent-only calls
  let agentCookie = '';
  try {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'agent1@travelqa.demo',
        password: config.SEED_DEMO_PASSWORD
      })
    });
    if (loginRes.status === 200) {
      agentCookie = parseCookie(loginRes);
    } else {
      console.error('Agent login failed:', await loginRes.text());
    }
  } catch (err) {
    console.error('Failed to log in as agent:', err.message);
  }

  // ── Step 1: Create V2 Escalation (Guest) ──
  try {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Is it safe to travel to Zorovia right now?',
        system: 'v2'
      })
    });
    const data = await res.json();

    if (
      res.status === 200 &&
      data.outcome === 'ESCALATED' &&
      typeof data.caseId === 'string' &&
      data.caseId.length > 0 &&
      data.message === 'A team member will get back to you shortly.'
    ) {
      testCaseId = data.caseId;
      createdCaseIds.push(testCaseId);
      console.log(`[PASS] 1. V2 escalation created case with ID: ${testCaseId}`);
      passed++;
    } else {
      console.error('[FAIL] 1. V2 escalation failed to create case:', data);
    }
  } catch (err) {
    console.error('[FAIL] 1. V2 escalation request failed:', err.message);
  }

  if (!testCaseId) {
    console.error('Cannot proceed with further tests without a valid case ID.');
    await stopServer();
    process.exit(1);
  }

  // ── Step 2: List Pending Cases (as Agent) ──
  try {
    const res = await fetch(`${baseUrl}/api/cases?status=pending`, {
      headers: { Cookie: agentCookie }
    });
    const list = await res.json();
    const found = Array.isArray(list) && list.some(c => c._id === testCaseId && c.status === 'pending');

    if (res.status === 200 && found) {
      console.log(`[PASS] 2. Pending cases list includes case ${testCaseId}`);
      passed++;
    } else {
      console.error('[FAIL] 2. Case not found in pending list:', list);
    }
  } catch (err) {
    console.error('[FAIL] 2. List pending cases failed:', err.message);
  }

  // ── Step 3: Fetch Full Case & Verify Schema (as Agent) ──
  try {
    const res = await fetch(`${baseUrl}/api/cases/${testCaseId}`, {
      headers: { Cookie: agentCookie }
    });
    const doc = await res.json();

    const hasRequiredFields =
      doc &&
      doc._id === testCaseId &&
      typeof doc.question === 'string' &&
      doc.status === 'pending' &&
      typeof doc.llmClassification === 'string' &&
      typeof doc.reason === 'string' &&
      doc.finalAnswer === null &&
      doc.createdAt !== undefined &&
      doc.resolvedAt === null &&
      (doc.okfEvidence === null || typeof doc.okfEvidence === 'object') &&
      Array.isArray(doc.ragEvidence);

    if (res.status === 200 && hasRequiredFields) {
      console.log('[PASS] 3. Full case fetched and matches exact schema');
      passed++;
    } else {
      console.error('[FAIL] 3. Case schema mismatch:', doc);
    }
  } catch (err) {
    console.error('[FAIL] 3. Fetch full case failed:', err.message);
  }

  // ── Step 4: Check Public Reply Endpoint (Pending Guest Case) ──
  try {
    const res = await fetch(`${baseUrl}/api/cases/${testCaseId}/reply`);
    const replyData = await res.json();

    const keys = Object.keys(replyData).sort();
    const isExact = keys.length === 2 && keys[0] === 'finalAnswer' && keys[1] === 'status';

    if (res.status === 200 && isExact && replyData.status === 'pending' && replyData.finalAnswer === null) {
      console.log('[PASS] 4. /api/cases/:id/reply returns ONLY {status, finalAnswer}');
      passed++;
    } else {
      console.error('[FAIL] 4. Reply endpoint payload mismatch:', replyData);
    }
  } catch (err) {
    console.error('[FAIL] 4. Reply endpoint failed:', err.message);
  }

  // ── Step 5: Resolve Case (as Agent) ──
  const testAnswer = 'Travel to Zorovia is currently suspended due to local safety advisories.';
  try {
    const res = await fetch(`${baseUrl}/api/cases/${testCaseId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: agentCookie
      },
      body: JSON.stringify({ answer: testAnswer })
    });
    const updated = await res.json();

    if (res.status === 200 && updated.status === 'resolved' && updated.finalAnswer === testAnswer && updated.resolvedAt) {
      console.log('[PASS] 5. Case resolved successfully with employee answer');
      passed++;
    } else {
      console.error('[FAIL] 5. Resolve case failed:', updated);
    }
  } catch (err) {
    console.error('[FAIL] 5. Resolve case request failed:', err.message);
  }

  // ── Step 6: Check Public Reply Endpoint (Resolved Guest Case) ──
  try {
    const res = await fetch(`${baseUrl}/api/cases/${testCaseId}/reply`);
    const replyData = await res.json();

    if (res.status === 200 && replyData.status === 'resolved' && replyData.finalAnswer === testAnswer) {
      console.log('[PASS] 6. /api/cases/:id/reply returns resolved finalAnswer');
      passed++;
    } else {
      console.error('[FAIL] 6. Resolved reply check failed:', replyData);
    }
  } catch (err) {
    console.error('[FAIL] 6. Resolved reply endpoint failed:', err.message);
  }

  // ── Step 7: Second Resolve Should Return 409 ──
  try {
    const res = await fetch(`${baseUrl}/api/cases/${testCaseId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: agentCookie
      },
      body: JSON.stringify({ answer: 'Second attempt' })
    });
    if (res.status === 409) {
      console.log('[PASS] 7. Second resolve attempt returns HTTP 409 Conflict');
      passed++;
    } else {
      console.error(`[FAIL] 7. Expected 409, got ${res.status}`);
    }
  } catch (err) {
    console.error('[FAIL] 7. Second resolve request failed:', err.message);
  }

  // ── Step 8: Empty Answer Should Return 400 ──
  try {
    const res = await fetch(`${baseUrl}/api/cases/${testCaseId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: agentCookie
      },
      body: JSON.stringify({ answer: '   ' })
    });
    if (res.status === 400) {
      console.log('[PASS] 8. Empty answer returns HTTP 400 Bad Request');
      passed++;
    } else {
      console.error(`[FAIL] 8. Expected 400, got ${res.status}`);
    }
  } catch (err) {
    console.error('[FAIL] 8. Empty answer test failed:', err.message);
  }

  // ── Step 9: Bad ObjectId Should Return 400 ──
  try {
    const res = await fetch(`${baseUrl}/api/cases/invalid-case-id-12345`, {
      headers: { Cookie: agentCookie }
    });
    if (res.status === 400) {
      console.log('[PASS] 9. Malformed case ID returns HTTP 400 Bad Request');
      passed++;
    } else {
      console.error(`[FAIL] 9. Expected 400, got ${res.status}`);
    }
  } catch (err) {
    console.error('[FAIL] 9. Bad ID test failed:', err.message);
  }

  // ── Step 10: V1 Escalation Should NOT Create Any Case ──
  try {
    const casesCol = getCollection('cases');
    const countBefore = await casesCol.countDocuments();

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Is it safe to travel to Zorovia right now?',
        system: 'v1'
      })
    });
    const data = await res.json();
    const countAfter = await casesCol.countDocuments();

    if (
      res.status === 200 &&
      data.outcome === 'ESCALATED' &&
      data.caseId === undefined &&
      countBefore === countAfter
    ) {
      console.log('[PASS] 10. V1 escalation does not create a MongoDB case');
      passed++;
    } else {
      console.error('[FAIL] 10. V1 escalation incorrectly created case or missing fields:', { data, countBefore, countAfter });
    }
  } catch (err) {
    console.error('[FAIL] 10. V1 escalation test failed:', err.message);
  }

  // ── Step 11: Logged in Customer V2 Escalation Uses Session customerId ──
  try {
    // Log in as customer Arjun Sharma (cust-001)
    const custLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'arjun.sharma@email.com',
        password: config.SEED_DEMO_PASSWORD
      })
    });
    const customerCookie = parseCookie(custLoginRes);

    const chatRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie
      },
      body: JSON.stringify({
        question: 'Is it safe to travel to Zorovia right now?',
        system: 'v2',
        customerId: 'bogus-customer-999' // must be ignored
      })
    });
    const chatData = await chatRes.json();

    if (chatRes.status === 200 && chatData.caseId) {
      createdCaseIds.push(chatData.caseId);
      const casesCol = getCollection('cases');
      const savedCase = await casesCol.findOne({ _id: new ObjectId(chatData.caseId) });

      if (savedCase && savedCase.customerId === 'cust-001') {
        console.log('[PASS] 11. Logged-in customer case carries session customerId (ignored bogus body)');
        passed++;
      } else {
        console.error('[FAIL] 11. Saved case customerId mismatch:', savedCase?.customerId);
      }
    } else {
      console.error('[FAIL] 11. Customer chat escalation failed:', chatData);
    }
  } catch (err) {
    console.error('[FAIL] 11. Customer session check failed:', err.message);
  }

  // Cleanup created test cases
  try {
    const casesCol = getCollection('cases');
    const ids = createdCaseIds.map(id => new ObjectId(id));
    await casesCol.deleteMany({ _id: { $in: ids } });
  } catch (cleanupErr) {
    console.error('Warning: failed to clean up test cases:', cleanupErr);
  }

  console.log(`\n========================================`);
  console.log(`Cases Flow Test Results: ${passed}/${total} PASS`);
  console.log(`========================================\n`);

  await stopServer();

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run().catch(async err => {
  console.error('Fatal test error:', err);
  await stopServer();
  process.exit(1);
});
