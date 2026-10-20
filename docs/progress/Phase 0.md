# Phase 0: Setup, Data Intake, and Verification Progress

Date: 2026-10-20
Status: COMPLETE (ALL CHECKS PASS)

---

## 1. Summary of Resolution of Previous Blockers

| Blocker | Initial Blocked State | Follow-up Retest Result | Evidence / Resolution |
|---|---|---|---|
| **MongoDB Service** | Host port `27017` was occupied by native host `mongodb.service` (PID 882); Docker Compose container `travel-qa-mongo` could not bind port. | **RESOLVED - PASS** | Host port `27017` was verified free; `docker compose up -d mongo` started `travel-qa-mongo`; container is healthy, listening on `127.0.0.1:27017->27017/tcp`; MongoDB ping returns `{ ok: 1 }`. |
| **Groq Model & API** | Model `llama-3.3-70b-versatile` returned `404 model_not_found` for the account key. | **RESOLVED - PASS** | Switched model to `qwen/qwen3.8-27b` (supported and active on Groq account); set `GROQ_MIN_INTERVAL_MS=10000` and `GROQ_DAILY_TOKEN_CAP=90000`; verified test generation `OK` in 194ms (19 tokens) and zero-token cached recall; updated `AGENT_GUIDE.md`, `AGENTS.md`, and `.env.example`. |
| **Gemini Embeddings** | Key was placeholder `your_actual_gemini_key`. | **RESOLVED - PASS** | Valid key provided in `.env` (never logged); configured `GEMINI_EMBED_MODEL=gemini-embedding-001`; probed and verified with real requests for both `RETRIEVAL_QUERY` and `RETRIEVAL_DOCUMENT` task types; vector dimension confirmed as **3072**; cached queries verified. |
| **Smoke Test** | Failed due to database port conflict and missing API keys. | **RESOLVED - ALL PASS** | `scripts/smoke-test.js` executed with 100% PASS across Groq real call, Groq cache retrieval, Gemini embedding real & cached retrieval, Chroma heartbeat, and MongoDB ping. |

---

## 2. Done-When Verification Checklist

| Requirement | Target | Status | Verification Evidence |
|---|---|---|---|
| `node -v` | >= 20 | PASS | `v26.8.1` |
| `npm -v` | >= 9 | PASS | `12.0.2` |
| `git --version` | Available | PASS | `git version 2.55.0` |
| `docker --version` & compose | Available | PASS | Docker `29.8.2`, Docker Compose `v5.6.0` |
| Docker Desktop Engine | Active context `desktop-linux` | PASS | `desktop-linux * unix:///home/yash/.docker/desktop/docker.sock`, server `Docker Desktop 29.9.1` |
| Project git repository | Initialized | PASS | Initialized in project root `/home/yash/DevZone/Projects/Mini Project` |
| .gitignore | Ignore list verified | PASS | `.env`, `node_modules`, `chroma-data`, `mongo-data`, `client/dist`, `cache/usage.json` ignored; `git check-ignore -v .env` returns `.gitignore:1:.env` |
| Git Hygiene | No tracked secrets, no files > 50MB | PASS | `git ls-files \| grep -x .env` empty; non-ignored files free of key material; 0 files > 50MB |
| Express Health Endpoint | GET `/api/health` -> `{ ok: true }` | PASS | Verified on `http://localhost:3001/api/health` |
| Frontend Scaffolding | React (Vite) client in `client/` | PASS | `client/` scaffolded, dependencies installed, `/api` proxy configured, `npm run build` succeeds |
| OKF Files Inventory & Placement | 18 policy files in `data/okf/` | PASS | All 18 policy files verified and present in `data/okf/`; `files/` directory untouched |
| OKF Comment Stripping | `loadOkfFiles()` strips all `<!-- -->` | PASS | Verified on `visa-country-d-britannica.md` and `refund-policy-general.md`: no comments in body or text |
| Question Migration | Standardize labels & fix `q-029` text | PASS | `scripts/migrate-questions.js`: backed up `questions.backup.json`, mapped categories to outcomes, fixed `q-029` date from "4 November 2025" to "3 November 2025" |
| Stale Question Answers | `q-037..q-048` filled from file text | PASS | `scripts/fill-stale-answers.js`: verified 12 statements against comment-stripped text; wrote `data/eval/stale-answers-review.md` |
| Data Validation | `scripts/validate-data.js` 0 errors | PASS | 18 OKF files, 30 notices, 84 questions (28 dev / 56 test), 4 outcomes (`OKF_ONLY`: 24, `RAG_ONLY`: 12, `HYBRID`: 12, `ESCALATE`: 36), 0 errors, 0 warnings |
| Chroma Container | `chromadb/chroma:latest` on `127.0.0.1:8000` | PASS | Container `travel-qa-chroma` up, heartbeat verified (`1792470847653979100`), collection add/query/delete verified |
| Mongo Container | `mongo:7` on `127.0.0.1:27017` | PASS | Container `travel-qa-mongo` up, mongod startup complete, ping `{ ok: 1 }` |
| Embed Model Probed | `GEMINI_EMBED_MODEL` set & confirmed | PASS | `gemini-embedding-001`, vector dimension **3072** |
| Smoke Test | `scripts/smoke-test.js` all PASS | PASS | (a) Groq call PASS, (b) Groq cache hit PASS, (c) Gemini embed & cache PASS, (d) Chroma & Mongo pings PASS |

---

## 3. Timestamps Changed on Notices

Run with `node scripts/validate-data.js --fix-timestamps` (backup saved to `data/rag/notices.backup.json`). Exactly 15 notices were adjusted to align UTC timestamps with the ISO dates in text:

1. `notice-0001`: `1741910400` (2025-03-14) -> `1773446400` (2026-03-14)
2. `notice-0002`: `1748044800` (2025-05-24) -> `1779408000` (2026-05-22)
3. `notice-0003`: `1752019200` (2025-07-09) -> `1783468800` (2026-07-08)
4. `notice-0005`: `1757563200` (2025-09-11) -> `1788998400` (2026-09-10)
5. `notice-0006`: `1737331200` (2025-01-20) -> `1768780800` (2026-01-19)
6. `notice-0007`: `1744070400` (2025-04-08) -> `1775347200` (2026-04-05)
7. `notice-0009`: `1750204800` (2025-06-18) -> `1781654400` (2026-06-17)
8. `notice-0010`: `1756166400` (2025-08-26) -> `1787443200` (2026-08-23)
9. `notice-0011`: `1740744000` (2025-02-28) -> `1772236800` (2026-02-28)
10. `notice-0012`: `1748736000` (2025-06-01) -> `1780272000` (2026-06-01)
11. `notice-0013`: `1742342400` (2025-03-19) -> `1773878400` (2026-03-19)
12. `notice-0014`: `1746921600` (2025-05-11) -> `1778371200` (2026-05-10)
13. `notice-0016`: `1754380800` (2025-08-05) -> `1785888000` (2026-08-05)
14. `notice-0017`: `1756944000` (2025-09-04) -> `1788307200` (2026-09-02)
15. `notice-0018`: `1744704000` (2025-04-15) -> `1776124800` (2026-04-14)

---

## 4. Key Models & Operational Parameters

- **LLM Generation & Classification:** `qwen/qwen3.8-27b` via Groq
- **Groq Daily Token Cap:** 90,000 (`GROQ_DAILY_TOKEN_CAP=90000`)
- **Groq Min Call Interval:** 10,000 ms (`GROQ_MIN_INTERVAL_MS=10000`)
- **Embedding Model:** `gemini-embedding-001` via Gemini API (REST `batchEmbedContents`)
- **Embedding Dimension:** `3072`
- **Embedding Min Call Interval:** 1,000 ms (`GEMINI_EMBED_MIN_INTERVAL_MS=1000`)
- **Vector Database:** Chroma (`chromadb/chroma:latest` container on `127.0.0.1:8000`)
- **Document Database:** MongoDB (`mongo:7` container on `127.0.0.1:27017`)
