# Reproduction Guide — Travel QA Evaluation

This document outlines the exact environment, model configurations, commit references, and commands required to reproduce all evaluation results for the Travel QA System research project.

---

## 1. Environment & Freeze Metadata

- **Git Commit Hash:** `ee41f37997be108dfdc348b3d0348cfd3b5bc9e8`
- **Git Tag:** `frozen-eval`
- **Primary LLM (Classification & Generation):** `qwen/qwen3.8-27b` (via Groq API)
- **Embedding Model:** `gemini-embedding-001` (via Google Gemini API)
- **Cosine Similarity Floor:** `RAG_SIM_FLOOR = 0.3` (fixed parameter, never tuned)
- **Prompt SHA256 Hashes:**
  - Classification Prompt: `c194271cf4dac4d5bd2cc70845e385d3ff040d8de589a8959ae24b184765806f`
  - Answer Prompt: `7f902295ed715704c2b9e86db67ba36d2a858200f19878bbac37278b84b8e319`
- **Dataset Counts:**
  - OKF Policy Documents: 18 markdown files (`data/okf/*.md`)
  - Operational Notices: 30 JSON entries (`data/rag/notices.json`)
  - Evaluation Questions: 84 questions total (`data/eval/questions.json`)
    - Dev Split: 28 questions
    - Test Split: 56 questions

---

## 2. Cache Directories & Persistence

All API responses are deterministically cached to ensure reproducible evaluations:
- **LLM Completions Cache:** `cache/llm-cache.json` (keyed by SHA256 of model, system, prompt, maxTokens, temp 0)
- **Embedding Cache:** `cache/embed-cache.json` (keyed by SHA256 of model and input text)
- **Daily Quota Tracker:** `cache/usage.json` (tracks tokens per UTC date against `GROQ_DAILY_TOKEN_CAP`)

---

## 3. Reproduction Commands

### Step A: Prerequisites & Ingestion
```bash
# Verify active environment
git checkout frozen-eval
npm install

# Start Chroma and MongoDB containers via Docker Desktop
docker compose up -d

# Seed website data (idempotent)
node scripts/seed-db.js

# Ingest OKF policies and operational notices into Chroma
node scripts/ingest-okf.js
node scripts/ingest-rag.js
```

### Step B: Dev Split Benchmark
```bash
# Run dev evaluation (28 questions x 2 systems = 56 evaluations)
node scripts/run-eval.js --split dev --run-id dev-1 --auto-resume --report

# Generate dev review queue and error template
node scripts/make-review-queue.js --run-id dev-1
node scripts/make-error-template.js --run-id dev-1
```

### Step C: Frozen Test Set Benchmark
```bash
# Run frozen test evaluation (56 questions x 2 systems = 112 evaluations)
node scripts/run-eval.js --split test --run-id test-frozen --confirm-frozen --auto-resume --report

# Generate review queue (agent proposed overrides + spot checks)
node scripts/make-review-queue.js --run-id test-frozen

# Compile final Markdown and CSV reports
node scripts/report.js --run-id test-frozen

# Generate blank error analysis template for author diagnosis
node scripts/make-error-template.js --run-id test-frozen
```

### Step D: End-to-End Latency Benchmark (Cache Bypassed)
```bash
# Run 3 repetitions across the deterministic 20-question test subset
node scripts/run-timing.js --reps 3 --auto-resume
```

### Step E: Export Full Experiment Dataset
```bash
# Dump complete MongoDB experiment_logs to JSON
node scripts/export-experiment-logs.js
```
The output file `data/eval/results/experiment_logs.json` contains all raw evaluation and timing log entries (288 rows).
