# Travel QA System

A Question Answering system comparing a RAG-only baseline (V1) against an LLM-routed hybrid retrieval architecture with Curated Policies (OKF) and Event Notices (V2).

## Prerequisites

- Node.js >= 20
- Docker Desktop with running engine
- Valid Groq and Gemini API keys in `.env`

## Quick Start Commands

### 1. Start Background Services (Docker Desktop)
```bash
docker compose up -d
```
Starts Chroma (vector store) on port `8000` and MongoDB on port `27017`.

### 2. Verify Data
```bash
node scripts/validate-data.js
```

### 3. Run Smoke Test
```bash
node scripts/smoke-test.js
```

### 4. Start Server
```bash
npm run dev
# or
node server/src/index.js
```
Listens on `http://localhost:3001`. Health check: `GET http://localhost:3001/api/health`.

### 5. Start Client
```bash
cd client
npm run dev
```
Client runs at `http://localhost:5173` and proxies `/api` to the backend.
