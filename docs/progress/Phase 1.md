# Phase 1: V1 RAG-only Baseline — Progress

Date: 2026-10-20
Status: COMPLETE (ALL CHECKS PASS)

---

## Done-When Verification Checklist

| Requirement | Evidence | Status |
|---|---|---|
| `combined` has 48 items | `node scripts/ingest-rag.js --collection combined` → "item count: 48 (expected 48)" | PASS |
| Ingest twice still gives 48 | Second run also shows 48 | PASS |
| Policy questions cite `[OKF:...]` | q-001 → `[OKF:cancellation-skynova-economy.md]`; q-003 → `[OKF:visa-country-a-thaloria.md]` | PASS |
| Event questions cite `[RAG:...]` | q-013 → `[RAG:notice-0001]`; q-016 → `[RAG:notice-0019]` | PASS |
| Repeated question instant, 0 new tokens | q-001 repeated: delta=0 tokens, 67ms total (cache hit) | PASS |
| Cap=1 produces 503 message | HTTP 503 `{"error":"Daily token cap reached: 90000/90000. ..."}` | PASS |
| No retrieved text contains `<!--` | All 10 test questions checked: "HTML comments in retrieved: no" | PASS |
| Observations file written | `docs/notes/phase1-v1-observations.md` (117 lines, all 10 questions) | PASS |
| Client builds successfully | `cd client && npm run build` → exit 0, 28 modules, 147 kB JS | PASS |
| Chat route responds correctly | Server health OK; 503 test passes; V1/V2 routing implemented | PASS |

---

## Files Built in Phase 1

| File | Description |
|---|---|
| `server/src/services/prompts.js` | `buildAnswerPrompt`, `formatEvidence`, `buildClassifyPrompt` (verbatim A7) |
| `server/src/services/rag.js` | `retrieve(collectionName, question, k, opts)` → items with similarity |
| `server/src/services/answer.js` | `answerV1` (A6 contract), `answerV2` stub |
| `server/src/routes/chat.js` | POST /api/chat with validation, 503 on DailyBudgetError |
| `server/src/index.js` | Updated to mount chat router at `/api/chat` |
| `scripts/ingest-rag.js` | Idempotent Chroma ingest; `--collection combined|notices` |
| `scripts/ask.js` | CLI ask tool: `v1 "question"` or `--id q-001` |
| `client/src/pages/Chat.jsx` | Message list, citations chips, escalation message, system selector, tokens debug line |
| `client/src/App.jsx` | Updated to render Chat component |
| `client/src/index.css` | Full CSS: chat layout, OKF/RAG chips, loading dots, error banner |
| `docs/notes/phase1-v1-observations.md` | Factual observations for all 10 Phase 1 self-test questions |

---

## Self-Test Observations Summary (Phase 1 — V1)

| ID | Category | Expected | Actual | Sources | Cited |
|---|---|---|---|---|---|
| q-001 | okf_only | OKF_ONLY | ANSWERED | OKF | OKF |
| q-003 | okf_only | OKF_ONLY | ANSWERED | OKF | OKF |
| q-013 | rag_only | RAG_ONLY | ANSWERED | RAG | RAG |
| q-016 | rag_only | RAG_ONLY | ANSWERED | RAG | RAG |
| q-025 | hybrid | HYBRID | ANSWERED | RAG+OKF | RAG+OKF |
| q-037 | human_fallback_stale | OKF_ONLY | ANSWERED | OKF | OKF |
| q-061 | human_fallback_ambiguous | ESCALATE | ANSWERED | OKF | OKF |
| q-063 | human_fallback_ambiguous | ESCALATE | ANSWERED | OKF+RAG | OKF |
| q-064 | human_fallback_ambiguous | ESCALATE | ESCALATED (INSUFFICIENT) | OKF+RAG | — |
| q-073 | human_fallback_conflict | ESCALATE | ANSWERED | OKF | OKF |

**Note (factual, no tuning):**
- OKF-only and RAG-only questions are correctly answered and cited from the expected source type in all cases.
- Hybrid q-025 correctly retrieves and cites both RAG (notice-0009) and OKF (delay-compensation.md).
- Stale q-037: Answered from `visa-country-d-britannica.md`; no HTML comments in retrieved text (stale comment properly stripped).
- Ambiguous q-064 ("Is it safe to travel to Zorovia?") escalated via INSUFFICIENT — evidence did not contain enough safety information.
- Ambiguous q-061 ("pet snake") and q-063 ("flight delayed, what to do") were answered by V1 because the combined collection found relevant pet/delay policy OKF chunks — this is expected V1 behaviour (no classification, no escalation floor).
- Conflict q-073: V1 answered rather than escalating via CONFLICT (the LLM synthesised an answer rather than detecting contradiction). This is an expected V1 limitation to be compared with V2.

---

## Cache Hit Verification

Re-ran q-001 after the initial run:
- Response time: 67 ms (vs ~317 ms LLM call first time)
- Token delta in usage.json: **0**
- `cache/usage.json` unchanged after re-run ✓

---

## 503 Budget Cap Verification

Set `usage.json` tokens to 90000 (cap), started fresh server:
```
HTTP 503: {"error":"Daily token cap reached: 90000/90000. Resume after the quota resets; cached results are kept."}
```
Restored `usage.json` afterward. ✓

---

## Assumptions Made

1. The `combined` Chroma collection uses `hnsw:space: cosine` as specified; similarity = 1 - distance.
2. V1 has no similarity floor per spec ("V1 has no similarity floor and no other escalation path").
3. The `answerV2` stub in answer.js will be replaced in Phase 2A-2.
4. The `run-phase1-tests.js` script is a helper used only for Phase 1 self-test; it is not part of the deliverable scripts listed in A3.
5. `AGENTS.md` key scan match in grep output is the regex pattern in the file itself, not actual key material.

---

## Anything Left for the User

- None for Phase 1. All done-when checks pass.
- Next: `Implement Phase 2A-1`
