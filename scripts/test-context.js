#!/usr/bin/env node
/**
 * scripts/test-context.js
 *
 * Automated verification of Customer Context Resolution for Phase 4.
 * Uses a throwaway database (travel_qa_test) with ZERO LLM calls.
 * Drops the throwaway database on completion.
 */

import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import { config } from '../server/src/config.js';
import { connect, getCollection } from '../server/src/services/db.js';
import { resolveQuestion } from '../server/src/services/context.js';
import chatRouter from '../server/src/routes/chat.js';
import { COOKIE_NAME } from '../server/src/middleware/auth.js';

const TEST_DB_NAME = 'travel_qa_test';
const TEST_PORT = 3102;
const TEST_BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let server = null;
let mongoClient = null;
let testDb = null;
let passedCount = 0;
let totalCount = 0;

function pass(msg) {
  passedCount++;
  totalCount++;
  console.log(`[PASS] ${totalCount}. ${msg}`);
}

function fail(msg, details) {
  totalCount++;
  console.error(`[FAIL] ${totalCount}. ${msg}`, details !== undefined ? details : '');
}

async function run() {
  console.log('=== Phase 4: Customer Context Resolution Verification ===\n');

  const uri = config.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  testDb = mongoClient.db(TEST_DB_NAME);

  // Clear previous test collections
  await testDb.collection('bookings').deleteMany({});
  await testDb.collection('users').deleteMany({});
  await testDb.collection('cases').deleteMany({});

  // Connect app db service to test DB
  await connect(TEST_DB_NAME);

  // Seed sample customers and bookings for context tests
  const customerA = {
    _id: 'user_cust_a',
    customerId: 'cust-test-01',
    role: 'customer',
    name: 'Customer Multiple Bookings',
    email: 'cust.multi@test.demo'
  };

  const customerB = {
    _id: 'user_cust_b',
    customerId: 'cust-test-02',
    role: 'customer',
    name: 'Customer Single Booking',
    email: 'cust.single@test.demo'
  };

  const customerC = {
    _id: 'user_cust_c',
    customerId: 'cust-test-03',
    role: 'customer',
    name: 'Customer Zero Bookings',
    email: 'cust.zero@test.demo'
  };

  const agentUser = {
    _id: 'user_agent_1',
    role: 'agent',
    name: 'Agent Support',
    email: 'agent@test.demo'
  };

  await getCollection('users').insertMany([customerA, customerB, customerC, agentUser]);

  const bookingA1 = {
    bookingId: 'BK-90001',
    customerId: 'cust-test-01',
    flightNo: 'SN-101',
    route: 'DEL-DXB',
    airline: 'SkyNova Air',
    fareClass: 'Economy Saver',
    date: '2026-06-17',
    status: 'completed',
    createdAt: new Date('2026-01-01')
  };

  const bookingA2 = {
    bookingId: 'BK-90002',
    customerId: 'cust-test-01',
    flightNo: 'SN-303',
    route: 'BOM-DXB',
    airline: 'SkyNova Air',
    fareClass: 'Economy Flex',
    date: '2026-01-19',
    status: 'completed',
    createdAt: new Date('2026-01-02')
  };

  const bookingB1 = {
    bookingId: 'BK-90003',
    customerId: 'cust-test-02',
    flightNo: 'AJ-512',
    route: 'DEL-NRT',
    airline: 'ArcticJet',
    fareClass: 'Economy',
    date: '2026-05-22',
    status: 'completed',
    createdAt: new Date('2026-01-03')
  };

  await getCollection('bookings').insertMany([bookingA1, bookingA2, bookingB1]);

  // ----------------------------------------------------
  // Unit Tests: resolveQuestion directly
  // ----------------------------------------------------

  // Test 1: Customer with 2 bookings and no bookingId -> needsClarification with options
  try {
    const res = await resolveQuestion(customerA, 'Why was my flight delayed?');
    if (
      res.needsClarification === true &&
      Array.isArray(res.options) &&
      res.options.length === 2 &&
      res.options[0].bookingId &&
      res.options[0].flightNo &&
      res.options[0].route &&
      res.options[0].date &&
      res.options[0].airline
    ) {
      pass('Customer with 2 bookings and no bookingId returns needsClarification with options');
    } else {
      fail('Customer with 2 bookings failed clarification test', res);
    }
  } catch (err) {
    fail('Test 1 threw error', err.message);
  }

  // Test 2: Customer with 2 bookings supplying an owned bookingId -> augmented question
  try {
    const res = await resolveQuestion(customerA, 'Why was my flight delayed?', 'BK-90002');
    const expectedAugmentation =
      "Why was my flight delayed? (Context: customer's booking BK-90002, flight SN-303, SkyNova Air, route BOM-DXB, Economy Flex, travel date 2026-01-19)";
    if (
      res.needsClarification === false &&
      res.question === expectedAugmentation &&
      res.booking?.bookingId === 'BK-90002'
    ) {
      pass('Customer supplying owned bookingId gets correctly augmented question');
    } else {
      fail('Customer supplying owned bookingId mismatch', res);
    }
  } catch (err) {
    fail('Test 2 threw error', err.message);
  }

  // Test 3: Another customer's bookingId -> rejected with 400 error
  try {
    let threw = false;
    try {
      // customerA does NOT own BK-90003
      await resolveQuestion(customerA, 'Why was my flight delayed?', 'BK-90003');
    } catch (err) {
      threw = true;
      if (err.status === 400 && err.message.includes('does not belong')) {
        pass('Supplying unowned bookingId throws 400 error');
      } else {
        fail('Supplying unowned bookingId threw unexpected error', err);
      }
    }
    if (!threw) {
      fail('Supplying unowned bookingId did not throw');
    }
  } catch (err) {
    fail('Test 3 uncaught', err.message);
  }

  // Test 4: Customer with exactly 1 booking -> automatically augmented without needing bookingId
  try {
    const res = await resolveQuestion(customerB, 'Why was my flight delayed?');
    const expectedAugmentation =
      "Why was my flight delayed? (Context: customer's booking BK-90003, flight AJ-512, ArcticJet, route DEL-NRT, Economy, travel date 2026-05-22)";
    if (
      res.needsClarification === false &&
      res.question === expectedAugmentation &&
      res.booking?.bookingId === 'BK-90003'
    ) {
      pass('Customer with 1 booking automatically receives augmented context');
    } else {
      fail('Customer with 1 booking augmentation mismatch', res);
    }
  } catch (err) {
    fail('Test 4 threw error', err.message);
  }

  // Test 5: Guest (null) -> question unchanged, needsClarification false
  try {
    const res = await resolveQuestion(null, 'Why was my flight delayed?');
    if (res.needsClarification === false && res.question === 'Why was my flight delayed?') {
      pass('Guest caller receives unchanged question with needsClarification: false');
    } else {
      fail('Guest caller mismatch', res);
    }
  } catch (err) {
    fail('Test 5 threw error', err.message);
  }

  // Test 6: Agent -> question unchanged, needsClarification false
  try {
    const res = await resolveQuestion(agentUser, 'Why was my flight delayed?');
    if (res.needsClarification === false && res.question === 'Why was my flight delayed?') {
      pass('Agent caller receives unchanged question with needsClarification: false');
    } else {
      fail('Agent caller mismatch', res);
    }
  } catch (err) {
    fail('Test 6 threw error', err.message);
  }

  // Test 7: Question without trigger words -> question unchanged, needsClarification false
  try {
    const q = 'What is the standard cancellation fee for SkyNova Air?';
    const res = await resolveQuestion(customerA, q);
    if (res.needsClarification === false && res.question === q) {
      pass('Question without trigger words remains unchanged');
    } else {
      fail('Question without trigger words altered', res);
    }
  } catch (err) {
    fail('Test 7 threw error', err.message);
  }

  // Test 8: Customer with 0 bookings -> question unchanged, needsClarification false
  try {
    const q = 'Why was my flight delayed?';
    const res = await resolveQuestion(customerC, q);
    if (res.needsClarification === false && res.question === q) {
      pass('Customer with 0 bookings leaves question unchanged');
    } else {
      fail('Customer with 0 bookings altered', res);
    }
  } catch (err) {
    fail('Test 8 threw error', err.message);
  }

  // Test 9: Trigger variations: my flight, my booking, my trip, my ticket, my journey
  try {
    const phrases = [
      'Can you check my flight?',
      'What is the status of my booking?',
      'Help with my trip please',
      'Can I change my ticket?',
      'Any updates on my journey?'
    ];
    let allMatched = true;
    for (const phrase of phrases) {
      const res = await resolveQuestion(customerB, phrase);
      if (!res.question.includes('(Context: customer\'s booking BK-90003')) {
        allMatched = false;
        break;
      }
    }
    if (allMatched) {
      pass('All trigger phrase variants (flight, booking, trip, ticket, journey) augment context');
    } else {
      fail('Some trigger phrase variants failed to match');
    }
  } catch (err) {
    fail('Test 9 threw error', err.message);
  }

  // ----------------------------------------------------
  // HTTP Integration Tests: POST /api/chat with session
  // ----------------------------------------------------

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/chat', chatRouter);

  server = http.createServer(app);
  await new Promise(resolve => server.listen(TEST_PORT, resolve));

  function makeCustomerToken(user) {
    return jwt.sign({ sub: user._id, role: user.role }, config.JWT_SECRET, { expiresIn: '1h' });
  }

  // Test 10: HTTP POST /api/chat with customer session and 2 bookings -> 200 CLARIFY (0 LLM calls)
  try {
    const token = makeCustomerToken(customerA);
    const res = await fetch(`${TEST_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${COOKIE_NAME}=${token}`
      },
      body: JSON.stringify({
        question: 'Why was my flight delayed?',
        system: 'v2'
      })
    });
    const data = await res.json();
    if (
      res.status === 200 &&
      data.outcome === 'CLARIFY' &&
      data.message === 'Which booking do you mean?' &&
      Array.isArray(data.options) &&
      data.options.length === 2
    ) {
      pass('HTTP POST /api/chat with 2 bookings returns CLARIFY with 0 LLM calls');
    } else {
      fail('HTTP POST /api/chat clarify response mismatch', { status: res.status, data });
    }
  } catch (err) {
    fail('Test 10 threw error', err.message);
  }

  // Test 11: HTTP POST /api/chat with unowned bookingId -> 400 Bad Request
  try {
    const token = makeCustomerToken(customerA);
    const res = await fetch(`${TEST_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${COOKIE_NAME}=${token}`
      },
      body: JSON.stringify({
        question: 'Why was my flight delayed?',
        bookingId: 'BK-90003', // unowned
        system: 'v2'
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.error && data.error.includes('does not belong')) {
      pass('HTTP POST /api/chat with unowned bookingId returns 400 Bad Request');
    } else {
      fail('HTTP POST /api/chat unowned bookingId did not return 400', { status: res.status, data });
    }
  } catch (err) {
    fail('Test 11 threw error', err.message);
  }

  // Clean up
  console.log('\nCleaning up test database...');
  if (testDb) {
    try {
      await testDb.dropDatabase();
    } catch {}
  }
  if (server) {
    await new Promise(r => server.close(r));
  }
  if (mongoClient) {
    await mongoClient.close();
  }

  console.log('\n========================================');
  console.log(`Context Test Results: ${passedCount}/${totalCount} PASS`);
  console.log('========================================\n');

  setTimeout(() => {
    process.exit(passedCount === totalCount ? 0 : 1);
  }, 100);
}

run().catch(err => {
  console.error('Test runner fatal error:', err);
  if (mongoClient) mongoClient.close();
  if (server) server.close();
  process.exit(1);
});
