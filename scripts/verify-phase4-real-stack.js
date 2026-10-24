/**
 * scripts/verify-phase4-real-stack.js
 *
 * Real-stack check for Phase 4:
 * 1. Log in as seeded customer Arjun Sharma.
 * 2. Send "Why was my flight delayed?" without bookingId -> verify CLARIFY outcome.
 * 3. Choose booking BK-10002 (SN-303, 2026-01-19) -> inspect answer and citations.
 * 4. Choose booking BK-10003 for Priya Mehta (AJ-512, 2026-05-22) -> inspect answer and citations.
 */

import { config } from '../server/src/config.js';
import { COOKIE_NAME } from '../server/src/middleware/auth.js';

const BASE_URL = `http://127.0.0.1:${config.PORT || 3001}`;

function parseCookie(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return '';
  const match = setCookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? `${COOKIE_NAME}=${match[1]}` : '';
}

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.status} ${await res.text()}`);
  }
  return parseCookie(res);
}

async function main() {
  console.log('=== Phase 4: Real-Stack Context Check ===\n');

  // Step 1: Log in as Arjun Sharma (cust-001)
  console.log('1. Logging in as Arjun Sharma (arjun.sharma@email.com)...');
  const arjunCookie = await login('arjun.sharma@email.com', config.SEED_DEMO_PASSWORD);

  // Step 2: Ask "Why was my flight delayed?" without bookingId
  console.log('2. Asking "Why was my flight delayed?" without bookingId...');
  const clarifyRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: arjunCookie
    },
    body: JSON.stringify({ question: 'Why was my flight delayed?', system: 'v2' })
  });
  const clarifyData = await clarifyRes.json();
  console.log('Clarify response outcome:', clarifyData.outcome);
  console.log('Clarify options returned:', clarifyData.options?.map(o => `${o.bookingId}: ${o.flightNo} (${o.date})`));

  // Step 3: Choose booking BK-10002 (SN-303, BOM-DXB, 2026-01-19)
  console.log('\n3. Asking "Why was my flight delayed?" with bookingId BK-10002...');
  const chatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: arjunCookie
    },
    body: JSON.stringify({
      question: 'Why was my flight delayed?',
      bookingId: 'BK-10002',
      system: 'v2'
    })
  });
  const chatData = await chatRes.json();
  console.log('Outcome:', chatData.outcome);
  console.log('Classification:', chatData.classification);
  console.log('Answer:', chatData.answer);
  console.log('Citations:', chatData.citations);
  console.log('Retrieved:', chatData.retrieved);
  console.log('Applied booking:', chatData.appliedBooking);

  // Step 4: Log in as Priya Mehta (cust-002) and check BK-10003 (AJ-512, 2026-05-22)
  console.log('\n4. Logging in as Priya Mehta (priya.mehta@email.com)...');
  const priyaCookie = await login('priya.mehta@email.com', config.SEED_DEMO_PASSWORD);
  console.log('Asking "Why was my flight delayed?" with bookingId BK-10003...');
  const priyaRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: priyaCookie
    },
    body: JSON.stringify({
      question: 'Why was my flight delayed?',
      bookingId: 'BK-10003',
      system: 'v2'
    })
  });
  const priyaData = await priyaRes.json();
  console.log('Outcome:', priyaData.outcome);
  console.log('Classification:', priyaData.classification);
  console.log('Answer:', priyaData.answer);
  console.log('Citations:', priyaData.citations);
  console.log('Retrieved:', priyaData.retrieved);
  console.log('Applied booking:', priyaData.appliedBooking);
}

main().catch(err => {
  console.error('Error running real-stack check:', err);
  process.exit(1);
});
