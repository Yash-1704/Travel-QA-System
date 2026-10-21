# Phase 2A-1: Question Classifier — Progress

Date: 2026-10-22
Status: COMPLETE — STOPPED AT GATE (AWAITING USER APPROVAL)

---

## 1. Done-When Verification Checklist

| Requirement | Target | Status | Verification Evidence |
|---|---|---|---|
| Classification Prompt | `buildClassifyPrompt(question)` verbatim per A7 | PASS | Implemented in `server/src/services/prompts.js`, frozen exact text matching A7 specification. |
| Classifier Service | `classifyQuestion(question, opts)` | PASS | Implemented in `server/src/services/classifier.js`. Sees ONLY question text; `maxTokens: 10`, `temperature: 0`; raw output untouched; strict validation into `{OKF_ONLY, RAG_ONLY, HYBRID, ESCALATE, INVALID}` without substring guessing or retry. |
| Classifier Test Script | `scripts/test-classifier.js` | PASS | Supports question IDs and `--text`; prints raw output via `JSON.stringify`, valid flag, label, expected outcome; NEVER reads `correct_answer`. |
| 10 Dev Questions Tested | q-001, q-003, q-013, q-016, q-025, q-028, q-037, q-061, q-063, q-064 | PASS | Tested and recorded in `docs/notes/classifier-test-10.md`. 10/10 valid format (`true`), 9/10 label match. |
| Raw Output Visibility | Exact string reported for all 10 calls | PASS | All 10 returned exactly the single target label string: 4x `"OKF_ONLY"`, 2x `"RAG_ONLY"`, 2x `"HYBRID"`, 2x `"ESCALATE"`. No conversational filler or trailing punctuation. |
| Route Isolation | Classifier NOT referenced from any route | PASS | `grep -rn "classifier" server/src/routes` returned 0 matches. Classifier is not wired into the application. |

---

## 2. Test Results Summary (10 Questions)

| ID | Category | Question | Raw Output | Valid | Label | Expected Outcome | Match |
|---|---|---|---|---|---|---|---|
| `q-001` | `okf_only` | What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight? | `"OKF_ONLY"` | `true` | `OKF_ONLY` | `OKF_ONLY` | MATCH |
| `q-003` | `okf_only` | Do Indian passport holders need a visa to visit Thaloria? | `"OKF_ONLY"` | `true` | `OKF_ONLY` | `OKF_ONLY` | MATCH |
| `q-013` | `rag_only` | Why was flight SN-101 on 14 March 2026 delayed? | `"RAG_ONLY"` | `true` | `RAG_ONLY` | `RAG_ONLY` | MATCH |
| `q-016` | `rag_only` | Is the SkyNova Air Delhi to Bangkok flight running normally on Tuesdays? | `"RAG_ONLY"` | `true` | `RAG_ONLY` | `RAG_ONLY` | MATCH |
| `q-025` | `hybrid` | My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to any compensation from SkyNova Air? | `"HYBRID"` | `true` | `HYBRID` | `HYBRID` | MATCH |
| `q-028` | `hybrid` | SkyNova flight SN-303 was delayed 3 hours and 45 minutes on 19 January 2026 due to crew issues. What are my compensation options? | `"HYBRID"` | `true` | `HYBRID` | `HYBRID` | MATCH |
| `q-037` | `human_fallback_stale` | How much does it cost to apply for a visa to visit Britannica as an Indian passport holder? | `"OKF_ONLY"` | `true` | `OKF_ONLY` | `OKF_ONLY` | MATCH |
| `q-061` | `human_fallback_ambiguous` | Can I bring my pet snake on board? | `"OKF_ONLY"` | `true` | `OKF_ONLY` | `ESCALATE` | MISMATCH |
| `q-063` | `human_fallback_ambiguous` | My flight was delayed. What should I do? | `"ESCALATE"` | `true` | `ESCALATE` | `ESCALATE` | MATCH |
| `q-064` | `human_fallback_ambiguous` | Is it safe to travel to Zorovia right now? | `"ESCALATE"` | `true` | `ESCALATE` | `ESCALATE` | MATCH |

### Observation on q-061:
- The model classified `"Can I bring my pet snake on board?"` as `"OKF_ONLY"` (likely because it recognized the general concept of pet policies).
- The expected outcome is `ESCALATE` (because pet snakes are an exotic out-of-scope pet not covered by standard airline pet policies).
- Per AGENTS.md instructions: *"Format failures (extra words, punctuation, explanations) are a real problem; disagreements with expected_outcome are not (do not tune the frozen prompt)."* The frozen prompt and classification logic were not altered.

---

## 3. Assumptions Made

1. The classification call strictly runs with `maxTokens: 10`, `temperature: 0`, and no system prompt per prompt A7.
2. The classifier returns `{ label, raw, valid, latencyMs, tokens }` conforming to the required service structure.
3. As required by the Phase 2A-1 specification, the classifier is deliberately not wired into `/api/chat` or `answerV2`.

---

## 4. Gate Check for User

- **Gate Status:** User must review the 10 raw outputs in Section 2.
- Confirm all 10 outputs are exactly one label string with zero conversational wrapping.
- Reply `"approved"` to proceed with **Phase 2A-2**.
