#!/usr/bin/env node
/**
 * scripts/export-experiment-logs.js
 *
 * Exports the complete MongoDB experiment_logs collection to data/eval/results/experiment_logs.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connect, getCollection, close } from '../server/src/services/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

async function main() {
  await connect();
  const expCol = getCollection('experiment_logs');
  const allLogs = await expCol.find({}).sort({ runId: 1, rep: 1, questionId: 1, systemName: 1 }).toArray();

  const outDir = path.resolve(REPO_ROOT, 'data/eval/results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'experiment_logs.json');
  fs.writeFileSync(outPath, JSON.stringify(allLogs, null, 2), 'utf8');

  console.log(`Successfully exported ${allLogs.length} experiment log entries to ${outPath}`);
  await close();
  process.exit(0);
}

main().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
