# Reproducing the Verified Phase 1 Setup

This guide records the working Phase 0/Phase 1 environment as of 2026-10-20. Phase 2A and the formal evaluation have not been run as part of this verification.

## Environment

- Node.js 26.8.1 (Node.js 20 or newer), npm 12.0.2
- Docker Desktop Engine, Docker 29.8.2, Docker Compose 5.6.0
- Groq generation model: `qwen/qwen3.8-27b`
- Gemini embedding model: `gemini-embedding-001` (3072 dimensions)
- Chroma image: `chromadb/chroma@sha256:1e0b73a187a28757c572acba508c46f48c9e8b0acaf5c20e6d95cdedce1acdf6`
- MongoDB image: `mongo:7`

Versions above are the verified Phase 0 record; confirm the local tools and Docker Desktop context before reproducing on another machine.

## Configuration

Create the repository-root `.env` with the required values. Keep API keys local and never include them in logs or commits.

```dotenv
GROQ_API_KEY=<your Groq API key>
GROQ_MODEL=qwen/qwen3.8-27b
GROQ_MIN_INTERVAL_MS=10000
GROQ_DAILY_TOKEN_CAP=90000
GEMINI_API_KEY=<your Gemini API key>
GEMINI_EMBED_MODEL=gemini-embedding-001
GEMINI_EMBED_MIN_INTERVAL_MS=1000
CHROMA_URL=http://localhost:8000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=travel_qa
PORT=3001
```

Install root and client dependencies:

```bash
npm install
cd client && npm install
```

## Start Services and Ingest

Ensure Docker Desktop is running and the active Docker context points to it. Start the pinned Chroma image and MongoDB:

```bash
docker compose up -d
docker compose ps
```

Ingest the Phase 1 collection. This command recreates `combined`; it stores each complete policy file as one item and adds the 30 notices.

```bash
node scripts/ingest-rag.js --collection combined
```

Expected output includes `combined` item count 48 and embedding dimension 3072.

## Development Verification

Run the deterministic answer-response parsing regression test:

```bash
node scripts/test-answer-parsing.js
```

Start the API in one terminal and check health:

```bash
npm start
curl http://localhost:3001/api/health
```

Expected response: `{"ok":true}`. In a separate terminal, the Vite client can be run with `cd client && npm run dev`.

Run individual Phase 1 development questions through the CLI (these may make API calls on a cache miss):

```bash
node scripts/ask.js v1 --id q-001
node scripts/ask.js v1 --id q-064
```

The recorded Phase 1 observations are in `docs/notes/phase1-v1-observations.md`. Do not treat them as formal evaluation results. Phase 1 V1 has no similarity floor; no V2 floor-trigger rate can be inferred until V2 has run and its retrieval results are recorded.
