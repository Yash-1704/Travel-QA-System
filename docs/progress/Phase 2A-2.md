# Phase 2A-2: OKF Matching, `notices` Collection, answerV2, Routing — Progress

Date: 2026-10-22
Status: COMPLETE (ALL CHECKS PASS)

---

## 1. Done-When Verification Checklist

| Requirement | Target | Status | Verification Evidence |
|---|---|---|---|
| `RAG_SIM_FLOOR` Constant | Added to `server/src/config.js` with frozen comment | PASS | Exported as `0.3` with comment: `// Set ONCE before evaluation, never tuned. Do not change.` |
| Chroma `notices` Collection | Contains exactly 30 items | PASS | `node scripts/ingest-rag.js --collection notices` reports item count 30 (expected 30). |
| Default Ingest Updates Both | Ingest with no flags updates `combined` and `notices` | PASS | `node scripts/ingest-rag.js` creates and populates `combined` (48 items) and `notices` (30 items) with 0 errors. |
| OKF Keyword Matcher | `server/src/services/okf.js` matching spec | PASS | Implements exact stopword list, question keyword normalization (strip trailing "s" if len > 3), haystack from title+topic+tags (frontmatter only), distinct keyword overlap scoring, alphabetical tie-breaking, returns `{ match, retrievalMs }`. |
| `answerV2` Implementation | Classify-first pipeline per A6 contract | PASS | Implemented in `server/src/services/answer.js`: classifier check, pre-retrieval escalation on `INVALID`/`ESCALATE`, OKF single-match retrieval, RAG top-3 notices retrieval with 0.3 floor, hybrid combination, single answer LLM call with identical prompt, reply normalization for `INSUFFICIENT`/`CONFLICT`, token summation, no MongoDB access. |
| Chat Route Update | `server/src/routes/chat.js` defaults to `v2` | PASS | Defaults to `system: 'v2'`, includes `classification` and `escalationReason`, strips text from retrieved items while retaining `similarity`/`score`. |
| UI Updated | `client/src/pages/Chat.jsx` | PASS | Defaults system selector to `v2`, displays classification chip in answer bubbles, retains tokens debug line. Build succeeds in 4.25s (`npm run build`). |
| CLI Tool | `scripts/ask.js` | PASS | Fully supports `node scripts/ask.js v2 ...` and `--id`, displays classification, retrieval scores, and timings. |
| Self-Test Observations | 10 dev questions run & documented | PASS | `docs/notes/phase2a-v2-observations.md` written with factual observations across all 10 questions. |
| Cache Repeat Verification | Repeated call adds 0 tokens | PASS | Re-running `q-001` via V2 executed in 1 ms with token delta = 0 in `cache/usage.json`. |

---

## 2. Self-Test Summary (10 Questions V2)

| ID | Category | Expected | Classification | Actual Outcome | Citations | Tokens | Timings (classify / retrieve / llm) |
|---|---|---|---|---|---|---|---|
| `q-001` | `okf_only` | `OKF_ONLY` | `OKF_ONLY` | ANSWERED | `[OKF:cancellation-skynova-economy.md]` | 799 | 503ms / 63ms / 464ms |
| `q-003` | `okf_only` | `OKF_ONLY` | `OKF_ONLY` | ANSWERED | `[OKF:visa-country-a-thaloria.md]` | 626 | 155ms / 0ms / 263ms |
| `q-013` | `rag_only` | `RAG_ONLY` | `RAG_ONLY` | ANSWERED | `[RAG:notice-0001]` | 705 | 187ms / 172ms / 395ms |
| `q-016` | `rag_only` | `RAG_ONLY` | `RAG_ONLY` | ANSWERED | `[RAG:notice-0019]` | 787 | 444ms / 25ms / 433ms |
| `q-025` | `hybrid` | `HYBRID` | `HYBRID` | ANSWERED | `[RAG:notice-0009]`, `[OKF:delay-compensation.md]` | 1525 | 136ms / 34ms / 639ms |
| `q-037` | `human_fallback_stale` | `OKF_ONLY` | `OKF_ONLY` | ANSWERED | `[OKF:visa-country-d-britannica.md]` | 696 | 161ms / 0ms / 279ms |
| `q-061` | `human_fallback_ambiguous` | `ESCALATE` | `OKF_ONLY` | ANSWERED | `[OKF:pets-policy.md]` | 1024 | 185ms / 0ms / 368ms |
| `q-063` | `human_fallback_ambiguous` | `ESCALATE` | `ESCALATE` | ESCALATED (`CLASSIFIER_ESCALATE`) | (none) | 200 | 154ms / 0ms / 0ms |
| `q-064` | `human_fallback_ambiguous` | `ESCALATE` | `ESCALATE` | ESCALATED (`CLASSIFIER_ESCALATE`) | (none) | 202 | 192ms / 0ms / 0ms |
| `q-073` | `human_fallback_conflict` | `ESCALATE` | `OKF_ONLY` | ANSWERED | `[OKF:cancellation-skynova-economy.md]` | 836 | 282ms / 0ms / 425ms |

### Key Observations:
1. **Targeted Retrieval Efficiency:**
   - For `OKF_ONLY` questions (`q-001`, `q-003`, `q-037`), vector retrieval is completely bypassed (`retrievalMs` ≈ 0ms), querying only the curated policy file without vector database overhead.
   - For `RAG_ONLY` questions (`q-013`, `q-016`), only event notices from Chroma's `notices` collection are queried.
   - For `HYBRID` (`q-025`), both OKF and RAG sources were retrieved and cited (`[RAG:notice-0009]` and `[OKF:delay-compensation.md]`).
2. **Pre-Retrieval Escalation:**
   - Out-of-scope/vague questions (`q-063`, `q-064`) were classified as `ESCALATE` and escalated immediately (`CLASSIFIER_ESCALATE`) with 0 retrieval time and 0 generation tokens.
3. **Conflict & Ambiguity Handling:**
   - `q-061` was answered because the classifier identified the pets domain, matching `pets-policy.md`.
   - `q-073` was answered because the OKF matcher selected `cancellation-skynova-economy.md`, meaning the second conflicting file (`refund-policy-general.md`) was not retrieved. As documented in AGENTS.md Section A8, this reflects V2's single-file OKF matching design and is an expected baseline characteristic for the paper.

---

## 3. Assumptions Made

1. `RAG_SIM_FLOOR = 0.3` is set once and never tuned.
2. In V2, when `classification === 'ESCALATE'` or `'INVALID'`, no retrieval or generation call is made.
3. Neither `answerV1` nor `answerV2` touches MongoDB directly (case persistence belongs to the chat route in Phase 2B).

---

## 4. Next Phase

- **Next:** `Implement Phase 2B` (Employee Dashboard, cases schema/routes, human fallback resolution).
