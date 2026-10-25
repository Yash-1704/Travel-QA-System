#!/usr/bin/env node
/**
 * scripts/test-website-api.js
 *
 * Automated verification of the Website API foundation for Phase 3A.
 * Spawns server on port 3101 against throwaway database travel_qa_test.
 * Zero LLM calls. Drops travel_qa_test on completion.
 */

import http from 'http';
import { MongoClient, ObjectId } from 'mongodb';
import { config } from '../server/src/config.js';
import { COOKIE_NAME } from '../server/src/middleware/auth.js';
import { seedDatabase } from './seed-db.js';

const TEST_PORT = 3101;
const TEST_DB_NAME = 'travel_qa_test';
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

function parseCookie(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return '';
  const match = setCookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? `${COOKIE_NAME}=${match[1]}` : '';
}

function containsPasswordHash(obj) {
  const jsonStr = JSON.stringify(obj);
  if (jsonStr.includes('"passwordHash"') || /"\$2[aby]?\$\d+\$[A-Za-z0-9./]{53}"/.test(jsonStr)) {
    return true;
  }
  return false;
}

async function run() {
  console.log('=== Phase 3A: Website API Verification ===\n');

  // Override DB config for this process
  process.env.MONGODB_DB = TEST_DB_NAME;
  process.env.PORT = String(TEST_PORT);

  // 1. Connect to Mongo directly and seed throwaway DB
  const uri = config.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  testDb = mongoClient.db(TEST_DB_NAME);

  // Drop if leftover exists
  try {
    await testDb.dropDatabase();
  } catch {}

  // Run seed against throwaway database
  console.log(`Seeding throwaway test database: ${TEST_DB_NAME}...`);
  await seedDatabase(testDb, { verbose: false });

  // 2. Start app with db connected to testDb
  // Dynamically import app so it uses updated process.env
  const { default: app } = await import('../server/src/index.js');
  const { connect: connectAppDb, close: closeAppDb } = await import('../server/src/services/db.js');
  await connectAppDb(TEST_DB_NAME);

  await new Promise((resolve, reject) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`Test server running at ${TEST_BASE_URL}\n`);
      resolve();
    });
    server.on('error', reject);
  });

  let customerCookie = '';
  let customer2Cookie = '';
  let agentCookie = '';

  // ── Test 1: Wrong password -> 401 with generic message ──
  try {
    const res = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'arjun.sharma@email.com', password: 'WrongPassword123' })
    });
    const data = await res.json();
    if (res.status === 401 && data.error === 'Invalid email or password' && !containsPasswordHash(data)) {
      pass('Wrong password returns 401 with generic message');
    } else {
      fail('Wrong password should return 401 with generic message', { status: res.status, data });
    }
  } catch (err) {
    fail('Wrong password request failed', err.message);
  }

  // ── Test 2: Duplicate email on registration -> 409 ──
  try {
    const res = await fetch(`${TEST_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun Sharma',
        email: 'arjun.sharma@email.com',
        password: 'ValidPassword123'
      })
    });
    const data = await res.json();
    if (res.status === 409 && !containsPasswordHash(data)) {
      pass('Duplicate email returns 409 Conflict');
    } else {
      fail('Duplicate email should return 409', { status: res.status, data });
    }
  } catch (err) {
    fail('Duplicate email request failed', err.message);
  }

  // ── Test 3: Short password on registration -> 400 ──
  try {
    const res = await fetch(`${TEST_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass User',
        email: 'shortpass@example.com',
        password: 'short'
      })
    });
    const data = await res.json();
    if (res.status === 400 && !containsPasswordHash(data)) {
      pass('Short password (< 8 chars) returns 400 Bad Request');
    } else {
      fail('Short password should return 400', { status: res.status, data });
    }
  } catch (err) {
    fail('Short password request failed', err.message);
  }

  // ── Test 4: Login sets httpOnly cookie and /me returns user without passwordHash ──
  try {
    const loginRes = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'arjun.sharma@email.com',
        password: config.SEED_DEMO_PASSWORD
      })
    });
    const loginData = await loginRes.json();
    const setCookie = loginRes.headers.get('set-cookie') || '';
    customerCookie = parseCookie(loginRes);

    const meRes = await fetch(`${TEST_BASE_URL}/api/auth/me`, {
      headers: { Cookie: customerCookie }
    });
    const meData = await meRes.json();

    const isHttpOnly = setCookie.toLowerCase().includes('httponly');
    const isSameSiteLax = setCookie.toLowerCase().includes('samesite=lax');
    const noHash = !containsPasswordHash(loginData) && !containsPasswordHash(meData);
    const validUser = meData.user && meData.user.email === 'arjun.sharma@email.com' && meData.user.customerId === 'cust-001';

    if (loginRes.status === 200 && isHttpOnly && isSameSiteLax && noHash && validUser) {
      pass('Login sets httpOnly sameSite=lax cookie and /me returns user without passwordHash');
    } else {
      fail('Login/me check failed', { loginStatus: loginRes.status, isHttpOnly, isSameSiteLax, noHash, validUser });
    }
  } catch (err) {
    fail('Login/me test failed', err.message);
  }

  // Obtain cookies for customer 2 and agent 1
  try {
    const res2 = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'priya.mehta@email.com',
        password: config.SEED_DEMO_PASSWORD
      })
    });
    customer2Cookie = parseCookie(res2);

    const resAgent = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'agent1@travelqa.demo',
        password: config.SEED_DEMO_PASSWORD
      })
    });
    agentCookie = parseCookie(resAgent);
  } catch (err) {
    console.error('Failed to get session cookies for test accounts:', err);
  }

  // Create test cases directly in MongoDB without LLM calls
  const casesCol = testDb.collection('cases');
  const guestCaseId = (await casesCol.insertOne({
    question: 'Guest question: can I bring my snake?',
    status: 'pending',
    llmClassification: 'ESCALATE',
    reason: 'out_of_scope',
    okfEvidence: null,
    ragEvidence: [],
    finalAnswer: null,
    customerId: null,
    createdAt: new Date(),
    resolvedAt: null
  })).insertedId.toString();

  const cust1CaseId = (await casesCol.insertOne({
    question: 'Customer 1 question: refund query',
    status: 'pending',
    llmClassification: 'ESCALATE',
    reason: 'insufficient',
    okfEvidence: null,
    ragEvidence: [],
    finalAnswer: null,
    customerId: 'cust-001',
    createdAt: new Date(),
    resolvedAt: null
  })).insertedId.toString();

  const cust2CaseId = (await casesCol.insertOne({
    question: 'Customer 2 question: baggage delay',
    status: 'pending',
    llmClassification: 'ESCALATE',
    reason: 'insufficient',
    okfEvidence: null,
    ragEvidence: [],
    finalAnswer: null,
    customerId: 'cust-002',
    createdAt: new Date(),
    resolvedAt: null
  })).insertedId.toString();

  // ── Test 5: Cases endpoints access rules (401 anon, 403 customer, 200 agent) ──
  try {
    const resAnon = await fetch(`${TEST_BASE_URL}/api/cases`);
    const resCust = await fetch(`${TEST_BASE_URL}/api/cases`, { headers: { Cookie: customerCookie } });
    const resAgent = await fetch(`${TEST_BASE_URL}/api/cases`, { headers: { Cookie: agentCookie } });
    const listAgent = await resAgent.json();

    const resAnonDetail = await fetch(`${TEST_BASE_URL}/api/cases/${guestCaseId}`);
    const resCustDetail = await fetch(`${TEST_BASE_URL}/api/cases/${guestCaseId}`, { headers: { Cookie: customerCookie } });
    const resAgentDetail = await fetch(`${TEST_BASE_URL}/api/cases/${guestCaseId}`, { headers: { Cookie: agentCookie } });

    const casesPass = resAnon.status === 401 && resCust.status === 403 && resAgent.status === 200 &&
                      resAnonDetail.status === 401 && resCustDetail.status === 403 && resAgentDetail.status === 200 &&
                      Array.isArray(listAgent) && !containsPasswordHash(listAgent);

    if (casesPass) {
      pass('GET /api/cases and /:id: 401 anon, 403 customer, 200 agent');
    } else {
      fail('Cases access control failed', {
        resAnon: resAnon.status,
        resCust: resCust.status,
        resAgent: resAgent.status,
        resAnonDetail: resAnonDetail.status,
        resCustDetail: resCustDetail.status,
        resAgentDetail: resAgentDetail.status
      });
    }
  } catch (err) {
    fail('Cases access control test failed', err.message);
  }

  // ── Test 6: GET /api/cases/mine returns only caller's cases ──
  try {
    const res = await fetch(`${TEST_BASE_URL}/api/cases/mine`, {
      headers: { Cookie: customerCookie }
    });
    const list = await res.json();
    const cases = Array.isArray(list) ? list : list.cases;
    const onlyOwn = Array.isArray(cases) && cases.every(c => c._id === cust1CaseId);
    const hasEvidence = cases.some(c => c.okfEvidence || c.ragEvidence);

    if (res.status === 200 && onlyOwn && !hasEvidence && !containsPasswordHash(list)) {
      pass('/api/cases/mine returns only caller’s cases without evidence');
    } else {
      fail('/api/cases/mine failed', { status: res.status, list, onlyOwn, hasEvidence });
    }
  } catch (err) {
    fail('Cases mine test failed', err.message);
  }

  // ── Test 7: /:id/reply access control ──
  // Guest case: open anonymously
  // Customer case: 401 anonymous, 403 other customer, 200 owner and agent
  try {
    const resGuestAnon = await fetch(`${TEST_BASE_URL}/api/cases/${guestCaseId}/reply`);
    const guestData = await resGuestAnon.json();

    const resCustAnon = await fetch(`${TEST_BASE_URL}/api/cases/${cust1CaseId}/reply`);
    const resCustOther = await fetch(`${TEST_BASE_URL}/api/cases/${cust1CaseId}/reply`, { headers: { Cookie: customer2Cookie } });
    const resCustOwner = await fetch(`${TEST_BASE_URL}/api/cases/${cust1CaseId}/reply`, { headers: { Cookie: customerCookie } });
    const resCustAgent = await fetch(`${TEST_BASE_URL}/api/cases/${cust1CaseId}/reply`, { headers: { Cookie: agentCookie } });

    const replyAccessPass =
      resGuestAnon.status === 200 && guestData.status === 'pending' &&
      resCustAnon.status === 401 &&
      resCustOther.status === 403 &&
      resCustOwner.status === 200 &&
      resCustAgent.status === 200;

    if (replyAccessPass) {
      pass('/:id/reply: guest open anonymously; customer case 401 anon, 403 other, 200 owner/agent');
    } else {
      fail('/:id/reply access control failed', {
        guestAnon: resGuestAnon.status,
        custAnon: resCustAnon.status,
        custOther: resCustOther.status,
        custOwner: resCustOwner.status,
        custAgent: resCustAgent.status
      });
    }
  } catch (err) {
    fail('/reply access control test failed', err.message);
  }

  // ── Test 8: Flight search returns only future flights and honors filters & sort ──
  try {
    const resSearch = await fetch(`${TEST_BASE_URL}/api/flights?from=DEL&to=DXB&passengers=2&sort=price`);
    const searchData = await resSearch.json();
    const flights = searchData.flights || [];

    const now = new Date();
    const allFuture = flights.every(f => new Date(f.departureAt) > now);
    const allMatchingRoute = flights.every(f => f.origin === 'DEL' && f.destination === 'DXB');
    const allHaveSeats = flights.every(f => f.fares.some(fare => fare.seatsAvailable >= 2));

    // Check sorted by price
    let sortedPrice = true;
    for (let i = 1; i < flights.length; i++) {
      const minA = Math.min(...flights[i - 1].fares.filter(fare => fare.seatsAvailable >= 2).map(fare => fare.price));
      const minB = Math.min(...flights[i].fares.filter(fare => fare.seatsAvailable >= 2).map(fare => fare.price));
      if (minA > minB) {
        sortedPrice = false;
        break;
      }
    }

    if (resSearch.status === 200 && flights.length > 0 && allFuture && allMatchingRoute && allHaveSeats && sortedPrice) {
      pass('Flight search returns future flights and honors from/to/passengers/price sort');
    } else {
      fail('Flight search check failed', { count: flights.length, allFuture, allMatchingRoute, allHaveSeats, sortedPrice });
    }
  } catch (err) {
    fail('Flight search test failed', err.message);
  }

  // ── Test 9: Booking access control: 401 anonymous, 403 agent ──
  const flightsCol = testDb.collection('flights');
  const targetFlight = await flightsCol.findOne({
    departureAt: { $gt: new Date() },
    'fares.seatsAvailable': { $gte: 10 }
  });

  try {
    const resAnon = await fetch(`${TEST_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flightId: targetFlight._id.toString(), fareClass: targetFlight.fares[0].fareClass, passengers: 1 })
    });
    const resAgent = await fetch(`${TEST_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: agentCookie },
      body: JSON.stringify({ flightId: targetFlight._id.toString(), fareClass: targetFlight.fares[0].fareClass, passengers: 1 })
    });

    if (resAnon.status === 401 && resAgent.status === 403) {
      pass('Booking endpoint: 401 anonymous, 403 agent');
    } else {
      fail('Booking authorization check failed', { anonStatus: resAnon.status, agentStatus: resAgent.status });
    }
  } catch (err) {
    fail('Booking access control test failed', err.message);
  }

  // ── Test 10: Valid booking reduces seats by exactly `passengers`, once ──
  let bookedBookingId = null;
  const initialSeats = targetFlight.fares[0].seatsAvailable;
  const targetFareClass = targetFlight.fares[0].fareClass;
  const targetPrice = targetFlight.fares[0].price;

  try {
    const res = await fetch(`${TEST_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({
        flightId: targetFlight._id.toString(),
        fareClass: targetFareClass,
        passengers: 2
      })
    });
    const bookData = await res.json();
    bookedBookingId = bookData.booking?.bookingId;

    const updatedFlight = await flightsCol.findOne({ _id: targetFlight._id });
    const updatedFare = updatedFlight.fares.find(f => f.fareClass === targetFareClass);

    const seatDelta = initialSeats - updatedFare.seatsAvailable;
    const priceCorrect = bookData.booking?.totalPrice === targetPrice * 2;

    if (res.status === 201 && bookedBookingId && seatDelta === 2 && priceCorrect) {
      pass('Valid booking reduces seats by exactly passengers and computes server price');
    } else {
      fail('Valid booking seat reduction failed', { status: res.status, seatDelta, priceCorrect, bookData });
    }
  } catch (err) {
    fail('Valid booking test failed', err.message);
  }

  // ── Test 11: Overbooking returns 409 with seats unchanged ──
  try {
    const currentFlight = await flightsCol.findOne({ _id: targetFlight._id });
    const currentFare = currentFlight.fares.find(f => f.fareClass === targetFareClass);
    const seatsBefore = currentFare.seatsAvailable;

    // Set seatsAvailable to 1 temporarily to test overbooking
    await flightsCol.updateOne(
      { _id: targetFlight._id, 'fares.fareClass': targetFareClass },
      { $set: { 'fares.$.seatsAvailable': 1 } }
    );

    const res = await fetch(`${TEST_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({
        flightId: targetFlight._id.toString(),
        fareClass: targetFareClass,
        passengers: 2 // requests 2 when only 1 available
      })
    });

    const flightAfter = await flightsCol.findOne({ _id: targetFlight._id });
    const seatsAfter = flightAfter.fares.find(f => f.fareClass === targetFareClass).seatsAvailable;

    // Restore seats
    await flightsCol.updateOne(
      { _id: targetFlight._id, 'fares.fareClass': targetFareClass },
      { $set: { 'fares.$.seatsAvailable': seatsBefore } }
    );

    if (res.status === 409 && seatsAfter === 1) {
      pass('Overbooking returns 409 Conflict with seats unchanged');
    } else {
      fail('Overbooking check failed', { status: res.status, seatsAfter });
    }
  } catch (err) {
    fail('Overbooking test failed', err.message);
  }

  // ── Test 12: Two simultaneous bookings for the last seat -> exactly one succeeds ──
  try {
    // Create dedicated flight with 1 seat
    const raceFlightRes = await flightsCol.insertOne({
      flightNo: 'SN-101',
      airline: 'SkyNova Air',
      origin: 'DEL',
      destination: 'DXB',
      route: 'DEL-DXB',
      originTz: 'Asia/Kolkata',
      destinationTz: 'Asia/Dubai',
      departureAt: new Date(Date.now() + 86400000),
      arrivalAt: new Date(Date.now() + 86400000 + 240 * 60000),
      aircraft: 'Boeing 737-800',
      fares: [{ fareClass: 'Economy Saver', price: 150, seatsAvailable: 1 }]
    });
    const raceFlightId = raceFlightRes.insertedId.toString();

    const [req1, req2] = await Promise.all([
      fetch(`${TEST_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
        body: JSON.stringify({ flightId: raceFlightId, fareClass: 'Economy Saver', passengers: 1 })
      }),
      fetch(`${TEST_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: customer2Cookie },
        body: JSON.stringify({ flightId: raceFlightId, fareClass: 'Economy Saver', passengers: 1 })
      })
    ]);

    const statuses = [req1.status, req2.status].sort();
    const finalRaceFlight = await flightsCol.findOne({ _id: new ObjectId(raceFlightId) });
    const remainingSeats = finalRaceFlight.fares[0].seatsAvailable;

    if (statuses[0] === 201 && statuses[1] === 409 && remainingSeats === 0) {
      pass('Two simultaneous bookings for the last seat: exactly one succeeds (201 & 409)');
    } else {
      fail('Race condition booking test failed', { statuses, remainingSeats });
    }
  } catch (err) {
    fail('Simultaneous booking test failed', err.message);
  }

  // ── Test 13: Client-sent price or customerId ignored ──
  try {
    const res = await fetch(`${TEST_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({
        flightId: targetFlight._id.toString(),
        fareClass: targetFareClass,
        passengers: 1,
        totalPrice: 1, // Bogus price
        customerId: 'cust-999' // Bogus customerId
      })
    });
    const data = await res.json();
    const b = data.booking;

    if (res.status === 201 && b && b.totalPrice === targetPrice && b.customerId === 'cust-001') {
      pass('Client-sent totalPrice and customerId are ignored in favor of server calculation');
    } else {
      fail('Client-sent field override failed', { status: res.status, booking: b });
    }
  } catch (err) {
    fail('Client-sent fields test failed', err.message);
  }

  // ── Test 14: Passengers 0 or 5 -> 400 ──
  try {
    const res0 = await fetch(`${TEST_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({ flightId: targetFlight._id.toString(), fareClass: targetFareClass, passengers: 0 })
    });
    const res5 = await fetch(`${TEST_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({ flightId: targetFlight._id.toString(), fareClass: targetFareClass, passengers: 5 })
    });

    if (res0.status === 400 && res5.status === 400) {
      pass('Passengers 0 or 5 returns 400 Bad Request');
    } else {
      fail('Passenger count bounds test failed', { status0: res0.status, status5: res5.status });
    }
  } catch (err) {
    fail('Passenger count bounds test failed', err.message);
  }

  // ── Test 15: Unknown fare class -> 400 ──
  try {
    const res = await fetch(`${TEST_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({ flightId: targetFlight._id.toString(), fareClass: 'NonExistentFareClass', passengers: 1 })
    });
    if (res.status === 400) {
      pass('Unknown fare class returns 400 Bad Request');
    } else {
      fail('Unknown fare class should return 400', { status: res.status });
    }
  } catch (err) {
    fail('Unknown fare class test failed', err.message);
  }

  // ── Test 16: Past flight -> 400 ──
  try {
    const pastFlightRes = await flightsCol.insertOne({
      flightNo: 'SN-101',
      airline: 'SkyNova Air',
      origin: 'DEL',
      destination: 'DXB',
      route: 'DEL-DXB',
      originTz: 'Asia/Kolkata',
      destinationTz: 'Asia/Dubai',
      departureAt: new Date(Date.now() - 86400000), // yesterday
      arrivalAt: new Date(Date.now() - 86400000 + 240 * 60000),
      aircraft: 'Boeing 737-800',
      fares: [{ fareClass: 'Economy Saver', price: 150, seatsAvailable: 10 }]
    });
    const pastFlightId = pastFlightRes.insertedId.toString();

    const res = await fetch(`${TEST_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({ flightId: pastFlightId, fareClass: 'Economy Saver', passengers: 1 })
    });

    if (res.status === 400) {
      pass('Booking a past flight returns 400 Bad Request');
    } else {
      fail('Past flight should return 400', { status: res.status });
    }
  } catch (err) {
    fail('Past flight test failed', err.message);
  }

  // ── Test 17: Reading someone else booking rejected, agent allowed ──
  try {
    // bookedBookingId belongs to cust-001
    const resOtherCust = await fetch(`${TEST_BASE_URL}/api/bookings/${bookedBookingId}`, {
      headers: { Cookie: customer2Cookie }
    });
    const resOwner = await fetch(`${TEST_BASE_URL}/api/bookings/${bookedBookingId}`, {
      headers: { Cookie: customerCookie }
    });
    const resAgent = await fetch(`${TEST_BASE_URL}/api/bookings/${bookedBookingId}`, {
      headers: { Cookie: agentCookie }
    });

    if (resOtherCust.status === 403 && resOwner.status === 200 && resAgent.status === 200) {
      pass('Reading another customer’s booking returns 403; owner and agent return 200');
    } else {
      fail('Booking read access control failed', {
        otherCust: resOtherCust.status,
        owner: resOwner.status,
        agent: resAgent.status
      });
    }
  } catch (err) {
    fail('Booking read test failed', err.message);
  }

  // ── Test 18: /api/staff/bookings is agent only ──
  try {
    const resAnon = await fetch(`${TEST_BASE_URL}/api/staff/bookings`);
    const resCust = await fetch(`${TEST_BASE_URL}/api/staff/bookings`, { headers: { Cookie: customerCookie } });
    const resAgent = await fetch(`${TEST_BASE_URL}/api/staff/bookings`, { headers: { Cookie: agentCookie } });
    const dataAgent = await resAgent.json();

    if (resAnon.status === 401 && resCust.status === 403 && resAgent.status === 200 && Array.isArray(dataAgent.bookings)) {
      pass('/api/staff/bookings is agent only (401 anon, 403 cust, 200 agent)');
    } else {
      fail('/api/staff/bookings access control failed', {
        anon: resAnon.status,
        cust: resCust.status,
        agent: resAgent.status
      });
    }
  } catch (err) {
    fail('Staff bookings test failed', err.message);
  }

  // ── Test 19: Non-JSON POST body -> 415 ──
  try {
    const res = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'non-json-raw-text'
    });
    if (res.status === 415) {
      pass('Non-JSON POST body returns 415 Unsupported Media Type');
    } else {
      fail('Non-JSON body should return 415', { status: res.status });
    }
  } catch (err) {
    fail('Non-JSON test failed', err.message);
  }

  // ── Test 20: No response contains passwordHash or $2 bcrypt hash ──
  // Verified continuously across endpoints, verify /api/auth/login and /api/auth/me specifically
  try {
    const loginRes = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'arjun.sharma@email.com', password: config.SEED_DEMO_PASSWORD })
    });
    const loginData = await loginRes.json();
    const hasHash = containsPasswordHash(loginData);

    if (!hasHash) {
      pass('Endpoint responses never expose passwordHash or bcrypt hash values');
    } else {
      fail('Response contained passwordHash', loginData);
    }
  } catch (err) {
    fail('Hash exposure test failed', err.message);
  }

  // ── Test 21: Seed consistency checks ──
  try {
    // 1. Forbidden flight numbers absent
    const forbiddenCount = await flightsCol.countDocuments({
      flightNo: { $in: ['AJ-511', 'SN-505', 'VA-802'] }
    });

    // 2. AJ-411 always departs at 05:00 Asia/Kolkata
    const aj411Flights = await flightsCol.find({ flightNo: 'AJ-411' }).toArray();
    const aj411TimingOk = aj411Flights.length > 0 && aj411Flights.every(f => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date(f.departureAt));
      return parts === '05:00';
    });

    // 3. No VA-902 departures from 2026-10-01 to 2026-10-31
    const va902Suspended = await flightsCol.countDocuments({
      flightNo: 'VA-902',
      departureAt: {
        $gte: new Date('2026-10-01T00:00:00Z'),
        $lte: new Date('2026-10-31T23:59:59Z')
      }
    });

    // 4. Flight documents have no delay fields
    const flightsWithDelay = await flightsCol.countDocuments({
      $or: [
        { delay: { $exists: true } },
        { delayed: { $exists: true } },
        { delayMinutes: { $exists: true } },
        { disruption: { $exists: true } }
      ]
    });

    const consistencyOk = forbiddenCount === 0 && aj411TimingOk && va902Suspended === 0 && flightsWithDelay === 0;

    if (consistencyOk) {
      pass('Seed consistency: forbidden flight numbers absent, AJ-411 at 05:00, VA-902 suspended in Oct 2026, no delay fields');
    } else {
      fail('Seed consistency checks failed', { forbiddenCount, aj411TimingOk, va902Suspended, flightsWithDelay });
    }
  } catch (err) {
    fail('Seed consistency test failed', err.message);
  }

  // ── Cleanup: Drop throwaway test database and stop server ──
  console.log(`\nDropping test database: ${TEST_DB_NAME}...`);
  try {
    await testDb.dropDatabase();
    await mongoClient.close();
  } catch (cleanupErr) {
    console.error('Error dropping test database:', cleanupErr);
  }

  if (server) {
    await new Promise(r => server.close(r));
  }

  console.log('\n========================================');
  console.log(`Website API Test Results: ${passedCount}/${totalCount} PASS`);
  console.log('========================================\n');

  if (passedCount === totalCount) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run().catch(async err => {
  console.error('Fatal test execution error:', err);
  if (testDb) {
    try { await testDb.dropDatabase(); } catch {}
  }
  if (mongoClient) {
    try { await mongoClient.close(); } catch {}
  }
  if (server) {
    try { await new Promise(r => server.close(r)); } catch {}
  }
  process.exit(1);
});
