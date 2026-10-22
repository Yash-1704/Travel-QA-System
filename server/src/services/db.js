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
 * @returns {Promise<import('mongodb').Db>}
 */
export async function connect() {
  if (db && client) {
    return db;
  }

  const uri = config.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = config.MONGODB_DB || 'travel_qa';

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  // Ensure indexes per AGENTS.md Phase 2B
  // 1. cases: { status: 1, createdAt: -1 }
  const casesCol = db.collection('cases');
  await casesCol.createIndex({ status: 1, createdAt: -1 });

  // 2. experiment_logs: unique on { runId: 1, rep: 1, systemName: 1, questionId: 1 }
  const expCol = db.collection('experiment_logs');
  await expCol.createIndex(
    { runId: 1, rep: 1, systemName: 1, questionId: 1 },
    { unique: true }
  );

  return db;
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
  close
};
