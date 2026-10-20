/**
 * scripts/ingest-rag.js
 *
 * Ingests documents into Chroma collections (idempotent — deletes & recreates).
 *
 * Usage:
 *   node scripts/ingest-rag.js                   # builds both collections (Phase 2+)
 *   node scripts/ingest-rag.js --collection combined
 *   node scripts/ingest-rag.js --collection notices
 *
 * In Phase 1 only `combined` is needed; run with --collection combined.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ChromaClient } from 'chromadb';
import { loadOkfFiles } from '../server/src/services/okfLoader.js';
import { embedTexts } from '../server/src/services/embed.js';
import { config } from '../server/src/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const collectionFlag = args.indexOf('--collection');
const requestedCollection = collectionFlag !== -1 ? args[collectionFlag + 1] : null;

if (requestedCollection && !['combined', 'notices'].includes(requestedCollection)) {
  console.error(`Unknown collection: ${requestedCollection}. Use 'combined' or 'notices'.`);
  process.exit(1);
}

// Stub embedding function — Chroma JS client requires one even when we pass embeddings explicitly.
// If this stub is ever called by the client itself, throw to surface the bug.
const stubEmbeddingFunction = {
  generate: async (texts) => {
    throw new Error('BUG: ChromaDB client called stub embedder instead of using pre-computed embeddings');
  }
};

async function getOrCreateCollection(client, name) {
  try {
    // Delete first to ensure idempotency
    try {
      await client.deleteCollection({ name });
      console.log(`  Deleted existing collection: ${name}`);
    } catch {
      // Doesn't exist yet — fine
    }

    const collection = await client.createCollection({
      name,
      metadata: { 'hnsw:space': 'cosine' },
      embeddingFunction: stubEmbeddingFunction
    });
    console.log(`  Created collection: ${name}`);
    return collection;
  } catch (err) {
    throw new Error(`Failed to create collection "${name}": ${err.message}`);
  }
}

async function ingestCombined(client) {
  console.log('\n=== Ingesting `combined` collection (OKF + Notices) ===');

  // 1. Load OKF files
  const okfDir = path.resolve(REPO_ROOT, 'data/okf');
  const okfFiles = loadOkfFiles(okfDir);
  console.log(`  Loaded ${okfFiles.length} OKF policy files`);

  // 2. Load notices
  const noticesPath = path.resolve(REPO_ROOT, 'data/rag/notices.json');
  const notices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));
  console.log(`  Loaded ${notices.length} notices`);

  // 3. Build documents for embedding
  const okfDocs = okfFiles.map(f => f.text);
  const noticeDocs = notices.map(n => n.text);
  const allDocs = [...okfDocs, ...noticeDocs];

  console.log(`  Embedding ${allDocs.length} documents (expect 48)...`);
  const embeddings = await embedTexts(allDocs, { taskType: 'RETRIEVAL_DOCUMENT' });
  console.log(`  Embedding dimension: ${embeddings[0]?.length ?? 'N/A'}`);

  // 4. Create/recreate collection
  const collection = await getOrCreateCollection(client, 'combined');

  // 5. Add OKF items
  const okfIds = okfFiles.map(f => `okf:${f.filename}`);
  const okfMeta = okfFiles.map(f => ({ kind: 'okf', filename: f.filename }));

  // 6. Add notice items
  const noticeIds = notices.map(n => n.id);
  const noticeMeta = notices.map(n => ({ kind: 'notice', noticeId: n.id }));

  const ids = [...okfIds, ...noticeIds];
  const metadatas = [...okfMeta, ...noticeMeta];

  await collection.add({
    ids,
    documents: allDocs,
    embeddings,
    metadatas
  });

  // Verify count
  const count = await collection.count();
  console.log(`  'combined' collection item count: ${count} (expected 48)`);
  if (count !== 48) {
    console.error(`  ERROR: expected 48 items, got ${count}`);
    process.exit(1);
  }
  console.log("  'combined' ingest complete ✓");
}

async function ingestNotices(client) {
  console.log('\n=== Ingesting `notices` collection (Phase 2+) ===');

  const noticesPath = path.resolve(REPO_ROOT, 'data/rag/notices.json');
  const notices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));
  console.log(`  Loaded ${notices.length} notices`);

  const noticeDocs = notices.map(n => n.text);

  console.log(`  Embedding ${noticeDocs.length} documents (from cache if available)...`);
  const embeddings = await embedTexts(noticeDocs, { taskType: 'RETRIEVAL_DOCUMENT' });
  console.log(`  Embedding dimension: ${embeddings[0]?.length ?? 'N/A'}`);

  const collection = await getOrCreateCollection(client, 'notices');

  const ids = notices.map(n => n.id);
  const metadatas = notices.map(n => ({ kind: 'notice', noticeId: n.id }));

  await collection.add({
    ids,
    documents: noticeDocs,
    embeddings,
    metadatas
  });

  const count = await collection.count();
  console.log(`  notices collection item count: ${count} (expected 30)`);
  if (count !== 30) {
    console.error(`  ERROR: expected 30 items, got ${count}`);
    process.exit(1);
  }
  console.log('  notices ingest complete');
}

async function main() {
  const client = new ChromaClient({ path: config.CHROMA_URL });

  // Test connectivity
  try {
    await client.heartbeat();
    console.log('Chroma connection OK');
  } catch (err) {
    console.error('Cannot reach Chroma at', config.CHROMA_URL, ':', err.message);
    process.exit(1);
  }

  const buildCombined = !requestedCollection || requestedCollection === 'combined';
  const buildNotices = !requestedCollection || requestedCollection === 'notices';

  if (buildCombined) {
    await ingestCombined(client);
  }

  if (buildNotices) {
    await ingestNotices(client);
  }

  console.log('\nIngest complete.');
}

main().catch(err => {
  console.error('Ingest failed:', err);
  process.exit(1);
});
