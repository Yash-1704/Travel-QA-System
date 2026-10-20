/**
 * services/rag.js
 *
 * Retrieval from a Chroma collection using cosine similarity.
 */

import { ChromaClient } from 'chromadb';
import { embedQuery } from './embed.js';
import { config } from '../config.js';

// Stub embedding function — we always pass embeddings explicitly.
const stubEmbeddingFunction = {
  generate: async () => {
    throw new Error('BUG: ChromaDB client called stub embedder instead of pre-computed embeddings');
  }
};

let chromaClient = null;
function getChromaClient() {
  if (!chromaClient) {
    chromaClient = new ChromaClient({ path: config.CHROMA_URL });
  }
  return chromaClient;
}

/**
 * Retrieve top-k items from a Chroma collection using cosine similarity.
 *
 * @param {string} collectionName  - 'combined' or 'notices'
 * @param {string} question        - the user's question text
 * @param {number} [k=3]           - number of results to retrieve
 * @param {object} [opts]
 * @param {boolean} [opts.bypassCache=false]  - passed through to embedQuery
 * @returns {Promise<{items: Array<{id, text, similarity, metadata}>, retrievalMs: number}>}
 */
export async function retrieve(collectionName, question, k = 3, opts = {}) {
  const start = Date.now();

  // Embed the query (includes embedding latency in retrievalMs)
  const queryVector = await embedQuery(question, { bypassCache: opts.bypassCache || false });

  const client = getChromaClient();
  const collection = await client.getCollection({
    name: collectionName,
    embeddingFunction: stubEmbeddingFunction
  });

  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: k,
    include: ['documents', 'distances', 'metadatas']
  });

  const retrievalMs = Date.now() - start;

  // results structure: { ids: [[...]], documents: [[...]], distances: [[...]], metadatas: [[...]] }
  const ids = results.ids?.[0] || [];
  const documents = results.documents?.[0] || [];
  const distances = results.distances?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];

  const items = ids.map((id, i) => {
    // Chroma cosine: distance = 1 - cosine_similarity => similarity = 1 - distance
    const similarity = Math.max(0, 1 - (distances[i] || 0));
    return {
      id,
      text: documents[i] || '',
      similarity,
      metadata: metadatas[i] || {}
    };
  });

  return { items, retrievalMs };
}

export default { retrieve };
