/**
 * scripts/seed-db.js
 *
 * Idempotent seed script for demo users, bookings, and flights (Phase 3A).
 * Usage:
 *   node scripts/seed-db.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { config } from '../server/src/config.js';
import { connect, getDb, close } from '../server/src/services/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * Robust conversion from local date ("YYYY-MM-DD") and time ("HH:MM") in an IANA timeZone to UTC Date.
 */
export function localToUtc(dateStr, timeStr, timeZone) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const guessUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(guessUtc);
  const getPart = type => parseInt(parts.find(p => p.type === type).value, 10);
  let formattedHour = getPart('hour');
  if (formattedHour === 24) formattedHour = 0;
  const formattedUtc = Date.UTC(
    getPart('year'),
    getPart('month') - 1,
    getPart('day'),
    formattedHour,
    getPart('minute'),
    getPart('second')
  );
  const offset = formattedUtc - guessUtc.getTime();
  return new Date(guessUtc.getTime() - offset);
}

/**
 * Seed database with demo accounts, seeded bookings, and future flights.
 * @param {import('mongodb').Db} [targetDb] Optional target database
 * @param {object} [opts] Options
 * @returns {Promise<object>} Summary counts
 */
export async function seedDatabase(targetDb, opts = {}) {
  const db = targetDb || getDb();
  const verbose = opts.verbose !== false;

  // 1. Demo Users
  const bookingsPath = path.resolve(REPO_ROOT, 'data/seed/bookings.json');
  const bookingsSeedData = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));

  const demoUsers = [
    ...bookingsSeedData.customers.map(c => ({
      role: 'customer',
      name: c.name,
      email: c.email.toLowerCase(),
      customerId: c.customerId
    })),
    {
      role: 'agent',
      name: 'Agent One',
      email: 'agent1@travelqa.demo',
      customerId: null
    },
    {
      role: 'agent',
      name: 'Agent Two',
      email: 'agent2@travelqa.demo',
      customerId: null
    }
  ];

  const passwordHash = await bcrypt.hash(config.SEED_DEMO_PASSWORD, 10);
  const usersCol = db.collection('users');

  for (const user of demoUsers) {
    const setOnInsertDoc = {
      role: user.role,
      name: user.name,
      email: user.email,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    if (user.customerId) {
      setOnInsertDoc.customerId = user.customerId;
    }

    await usersCol.updateOne(
      { email: user.email },
      {
        $setOnInsert: setOnInsertDoc
      },
      { upsert: true }
    );
  }

  // 2. Seeded Bookings
  const bookingsCol = db.collection('bookings');
  for (const b of bookingsSeedData.bookings) {
    await bookingsCol.updateOne(
      { bookingId: b.bookingId },
      {
        $setOnInsert: {
          bookingId: b.bookingId,
          customerId: b.customerId,
          flightNo: b.flightNo,
          route: b.route,
          airline: b.airline,
          fareClass: b.fareClass,
          date: b.date,
          status: 'completed',
          passengers: 1,
          totalPrice: null,
          source: 'seed',
          createdAt: new Date(`${b.date}T10:00:00Z`).toISOString()
        }
      },
      { upsert: true }
    );
  }

  // Initialize bookingNumber counter if needed
  const countersCol = db.collection('counters');
  const counterDoc = await countersCol.findOne({ _id: 'bookingNumber' });
  if (!counterDoc) {
    let maxSeq = 10000;
    for (const b of bookingsSeedData.bookings) {
      const num = parseInt(b.bookingId.replace('BK-', ''), 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
    await countersCol.updateOne(
      { _id: 'bookingNumber' },
      { $setOnInsert: { seq: maxSeq } },
      { upsert: true }
    );
  }

  // 3. Flights for next 60 days
  const templatesPath = path.resolve(REPO_ROOT, 'data/seed/flight-templates.json');
  const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

  const flightsCol = db.collection('flights');
  const today = new Date();
  const startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  let insertedFlights = 0;
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const flightDate = new Date(startDate.getTime() + dayOffset * 86400000);
    const dateStr = flightDate.toISOString().slice(0, 10);

    for (const template of templates) {
      const departureAt = localToUtc(dateStr, template.localDepartureTime, template.originTz);

      // Suspension rule: VA-902 has NO departures from 2026-10-01 to 2026-10-31 (notice-0024)
      if (template.flightNo === 'VA-902') {
        const depTime = departureAt.getTime();
        const octStart = new Date('2026-10-01T00:00:00Z').getTime();
        const octEnd = new Date('2026-10-31T23:59:59.999Z').getTime();
        if ((dateStr >= '2026-10-01' && dateStr <= '2026-10-31') || (depTime >= octStart && depTime <= octEnd)) {
          continue;
        }
      }
      const arrivalAt = new Date(departureAt.getTime() + template.durationMinutes * 60000);

      const res = await flightsCol.updateOne(
        { flightNo: template.flightNo, departureAt },
        {
          $setOnInsert: {
            flightNo: template.flightNo,
            airline: template.airline,
            origin: template.origin,
            destination: template.destination,
            route: template.route,
            originTz: template.originTz,
            destinationTz: template.destinationTz,
            departureAt,
            arrivalAt,
            aircraft: template.aircraft,
            fares: template.fares.map(f => ({ ...f }))
          }
        },
        { upsert: true }
      );

      if (res.upsertedCount > 0) {
        insertedFlights++;
      }
    }
  }

  const usersCount = await usersCol.countDocuments();
  const seededBookingsCount = await bookingsCol.countDocuments({ source: 'seed' });
  const flightsCount = await flightsCol.countDocuments();

  if (verbose) {
    console.log('=== Database Seed Complete ===');
    console.log(`Users:           ${usersCount}`);
    console.log(`Seeded Bookings: ${seededBookingsCount}`);
    console.log(`Total Flights:   ${flightsCount}`);
    console.log('\nDemo User Accounts:');
    console.log('  Customers:');
    for (const c of bookingsSeedData.customers) {
      console.log(`    - ${c.name} (${c.email}) [ID: ${c.customerId}]`);
    }
    console.log('  Agents:');
    console.log('    - Agent One (agent1@travelqa.demo)');
    console.log('    - Agent Two (agent2@travelqa.demo)');
  }

  return {
    usersCount,
    seededBookingsCount,
    flightsCount,
    insertedFlights
  };
}

if (process.argv[1] && process.argv[1].endsWith('seed-db.js')) {
  try {
    await connect();
    await seedDatabase();
    await close();
  } catch (err) {
    console.error('Seed script error:', err);
    process.exit(1);
  }
}
