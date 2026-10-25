/**
 * services/db.js
 *
 * Shared MongoDB client and database access for Phase 2B.
 */

import { MongoClient } from 'mongodb';
import { config } from '../config.js';

let client = null;
let db = null;

/**
 * Connect to MongoDB and ensure required indexes.
 * @param {string} [customDbName] Optional database name
 * @returns {Promise<import('mongodb').Db>}
 */
export async function connect(customDbName) {
  const uri = process.env.MONGODB_URI || config.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = customDbName || process.env.MONGODB_DB || config.MONGODB_DB || 'travel_qa';

  if (db && client) {
    if (db.databaseName === dbName) {
      return db;
    }
    db = client.db(dbName);
  } else {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
  }

  // Ensure indexes per AGENTS.md Phase 2B & Phase 3A
  // 1. cases: { status: 1, createdAt: -1 }
  const casesCol = db.collection('cases');
  await casesCol.createIndex({ status: 1, createdAt: -1 });

  // 2. experiment_logs: unique on { runId: 1, rep: 1, systemName: 1, questionId: 1 }
  const expCol = db.collection('experiment_logs');
  await expCol.createIndex(
    { runId: 1, rep: 1, systemName: 1, questionId: 1 },
    { unique: true }
  );

  // 3. users: unique { email: 1 } and unique sparse { customerId: 1 }
  const usersCol = db.collection('users');
  await usersCol.createIndex({ email: 1 }, { unique: true });
  await usersCol.createIndex({ customerId: 1 }, { unique: true, sparse: true });

  // 4. flights: unique { flightNo: 1, departureAt: 1 } and { origin: 1, destination: 1, departureAt: 1 }
  const flightsCol = db.collection('flights');
  await flightsCol.createIndex({ flightNo: 1, departureAt: 1 }, { unique: true });
  await flightsCol.createIndex({ origin: 1, destination: 1, departureAt: 1 });

  // 5. bookings: unique on { bookingId: 1 } and NON-unique on { customerId: 1 }
  const bookingsCol = db.collection('bookings');
  await bookingsCol.createIndex({ bookingId: 1 }, { unique: true });
  await bookingsCol.createIndex({ customerId: 1 });

  return db;
}

/**
 * Atomically generates the next booking ID (e.g. "BK-10007").
 * On first use, initializes seq to the largest numeric suffix among existing BK-xxxxx ids.
 * @param {import('mongodb').Db} [customDb] Optional custom db instance
 * @returns {Promise<string>}
 */
export async function getNextBookingId(customDb) {
  const targetDb = customDb || getDb();
  const counters = targetDb.collection('counters');

  const counterDoc = await counters.findOne({ _id: 'bookingNumber' });
  if (!counterDoc) {
    const bookings = targetDb.collection('bookings');
    const allBookings = await bookings.find({ bookingId: /^BK-\d+$/ }, { projection: { bookingId: 1 } }).toArray();
    let maxSeq = 10000;
    for (const b of allBookings) {
      const num = parseInt(b.bookingId.replace('BK-', ''), 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
    await counters.updateOne(
      { _id: 'bookingNumber' },
      { $setOnInsert: { seq: maxSeq } },
      { upsert: true }
    );
  }

  const res = await counters.findOneAndUpdate(
    { _id: 'bookingNumber' },
    { $inc: { seq: 1 } },
    { returnDocument: 'after' }
  );
  const seqVal = typeof res.seq === 'number' ? res.seq : (res.value && res.value.seq);
  const numStr = String(seqVal).padStart(5, '0');
  return `BK-${numStr}`;
}

/**
 * Get current connected database instance.
 * @returns {import('mongodb').Db}
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return db;
}

/**
 * Get collection by name.
 * @param {string} name
 * @returns {import('mongodb').Collection}
 */
export function getCollection(name) {
  return getDb().collection(name);
}

/**
 * Close database connection.
 */
export async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export default {
  connect,
  getDb,
  getCollection,
  getNextBookingId,
  close
};
