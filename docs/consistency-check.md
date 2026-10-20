# Consistency Check Report

**Date:** 2026-10-17  
**Checked by:** Data generation pass

---

## 1. Five-question trace (random sample)

### q-001 — okf_only, dev
**Question:** What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight?  
**Source file:** `cancellation-skynova-economy.md`  
**Relevant excerpt:** "More than 72 hours before scheduled departure: A flat cancellation fee of USD 45 applies. The remaining balance is refunded within 14 business days."  
**Correct answer:** USD 45; refund within 14 business days.  
**Match:** ✅ `correct_answer` and `key_facts` ["USD 45", "14 business days"] are verbatim derivable from the file.  
**Cross-check with universe.md:** universe.md key-numbers table: "SkyNova Economy Saver cancellation (>72h) = USD 45". ✅

---

### q-025 — hybrid, dev (the key hybrid test case)
**Question:** My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to compensation?  
**RAG source:** `notice-0009` — "Flight SN-101 on 2026-06-17 was delayed by 8 hours and 20 minutes due to an unscheduled engine maintenance requirement … The delay was entirely within SkyNova Air's operational responsibility."  
**OKF source:** `delay-compensation.md` — "More than 6 hours | Airline fault | USD 150 cash compensation + meal provided"  
**Correct answer:** USD 150 cash compensation + meal; claim within 90 days.  
**Match:** ✅ Both `key_facts` ["USD 150 cash", "8 hours and 20 minutes", "airline fault", "90 days"] are directly derivable from the two sources combined.

---

### q-037 — human_fallback_stale, dev
**Question:** How much does it cost to apply for a visa to visit Britannica?  
**Relevant OKF file:** `visa-country-d-britannica.md` — stale (stale_after: 2025-07-10, status: outdated). File states USD 115. Correct current answer is USD 180 (documented in universe.md Country D note).  
**Expected outcome:** Human fallback.  
**Match:** ✅ The file is correctly marked stale; answering from it would give wrong information. Escalation is correct.

---

### q-073 — human_fallback_conflict, dev
**Question:** How long does a SkyNova Air refund take to process?  
**Source 1:** `cancellation-skynova-economy.md` — states 14 business days.  
**Source 2:** `refund-policy-general.md` (stale) — states 21 business days.  
**Expected outcome:** Human fallback (CONFLICT).  
**Match:** ✅ The two sources directly contradict each other on the same factual question. No resolution is possible without a human. Correct escalation.

---

### q-019 — rag_only, test
**Question:** Did the ArcticJet flight from Mumbai to Singapore have any technical issues in December 2025?  
**RAG source:** `notice-0008` — "Flight AJ-613 on 2025-12-11 arrived at Singapore Changi 4 hours and 5 minutes late due to a software fault in the aircraft's flight management system (FMS)."  
**Correct answer:** Yes; FMS software fault; 4 hours 5 minutes late.  
**Match:** ✅ `key_facts` ["flight management system", "FMS", "4 hours and 5 minutes"] are verbatim from the chunk.

---

## 2. Cross-file contradiction check (OKF files, same airline and fare class)

| Checked pair | Fact checked | File A value | File B value | Result |
|---|---|---|---|---|
| cancellation-skynova-economy.md vs baggage-skynova-economy.md | Fare class names | Economy Saver / Economy Flex | Economy Saver / Economy Flex | ✅ Match |
| cancellation-arcticjet-economy.md vs baggage-arcticjet-all.md | Economy class label | Economy | Economy | ✅ Match |
| cancellation-vistaair-business.md vs baggage-vistaair-business.md | Business class name | Business Sapphire | Business Sapphire | ✅ Match |
| cancellation-vistaair-economy.md vs baggage-vistaair-economy.md | Checked bag allowance | 23 kg | 23 kg | ✅ Match |
| cancellation-skynova-economy.md vs loyalty-skynova.md | Economy Saver name | Economy Saver | Economy Saver | ✅ Match |
| delay-compensation.md vs universe.md | SkyNova delay 2–4h | USD 50 meal voucher | USD 50 meal voucher | ✅ Match |
| delay-compensation.md vs universe.md | ArcticJet delay 3–6h | USD 75 voucher | USD 75 voucher | ✅ Match |
| delay-compensation.md vs universe.md | VistaAir delay 3–5h | USD 100 voucher | USD 100 voucher | ✅ Match |
| cancellation-skynova-economy.md vs no-show-policy.md | Economy Saver name | Economy Saver | Economy Saver | ✅ Match |
| cancellation-vistaair-business.md vs no-show-policy.md | Refund timeline | 14 business days | 14 business days | ✅ Match |

**Intentional contradictions (documented):**

| Files | Conflicting fact | Intentional? |
|---|---|---|
| cancellation-*.md (all) vs refund-policy-general.md | Standard refund: 14 vs 21 business days | ✅ Deliberate — stale file drives conflict questions q-073 to q-084 |
| cancellation-*.md (all) vs refund-policy-general.md | Airline-initiated refund: 7 vs 10 business days | ✅ Deliberate — stale file |
| visa-country-d-britannica.md vs universe.md Country D note | Britannica visa fee: USD 115 vs USD 180 | ✅ Deliberate — stale file drives q-037 to q-048 |

No unintentional contradictions found between OKF files on the same airline and fare class combination.

---

## 3. Stale files not referenced as source for non-fallback questions

Stale files: `visa-country-d-britannica.md`, `refund-policy-general.md`

- **q-005 through q-036** (okf_only, rag_only, hybrid): checked all `source_file` and `source_chunk` fields. Neither stale file is cited as the source of a correct answer for any non-fallback question. ✅
- **q-037 through q-084** (human_fallback_*): stale files appear only as the `fallback_reason`, never as a `correct_answer` source. ✅

---

## 4. RAG chunk coverage for evaluation questions

| Category | Questions needing RAG chunks | Chunks used | All resolvable? |
|---|---|---|---|
| rag_only (q-013 to q-024) | 12 | notice-0001, 0002, 0003, 0004, 0006, 0007, 0008, 0009, 0011, 0012, 0013, 0014, 0019, 0020, 0021 | ✅ Each question maps to exactly one chunk |
| hybrid (q-025 to q-036) | 12 | notice-0002, 0003, 0004, 0005, 0006, 0007, 0008, 0009, 0010, 0014, 0015 + delay-compensation.md | ✅ |
| human_fallback_no_evidence (q-049 to q-060) | 12 | None (by design) | ✅ No chunk matches |

---

## 5. Deliberately unhelpful RAG chunks (used to test no-evidence routing)

Chunks notice-0026, notice-0027, notice-0028, notice-0029, notice-0030 are the 5 "vague or off-topic" entries:

| Chunk | Content | Why unhelpful |
|---|---|---|
| notice-0026 | Customer review summary for SN-101 | Opinion/satisfaction score; no policy or event fact |
| notice-0027 | Engineering maintenance log stub | Internal operations only; no passenger-facing content |
| notice-0028 | VistaAir in-flight menu update | Service update; no fare/baggage/delay relevance |
| notice-0029 | Staff scheduling memo | Internal; no passenger relevance |
| notice-0030 | ArcticJet expo attendance | No binding announcements; no operational content |

These chunks should not match well against any evaluation question via cosine similarity. ✅

---

## 6. Inconsistencies found and resolved

| Issue | Resolution |
|---|---|
| The `human_fallback_conflict` category requires both sources to be retrieved — but the stale refund file has status `outdated`. In V3 (no staleness check), both would be retrieved and the LLM sees conflicting values. In V4 the stale file would be excluded by confidence score, which would change some conflict questions to `human_fallback_stale` instead. | This is expected and correct behaviour. It tests V3 vs V4 ablation. The `fallback_reason` in each conflict question notes the conflict; V4's behaviour is a design outcome, not a data error. |
| Notice-0001 (SN-101 March 2026) and notice-0009 (SN-101 June 2026) both describe delays on the same flight number. This could confuse a naive keyword router. | By design: the RAG system uses semantic similarity and timestamps. A well-functioning RAG retrieval should distinguish them by date. This tests retrieval precision. |
| q-035 answer states no compensation was triggered for an 85-minute delay. This required checking the compensation table boundary (under 2 hours = no meal voucher). Confirmed: SkyNova delay comp starts at 2 hours. ✅ | No change needed. |
| The hybrid question q-036 (AJ-613 baggage theft) cites both baggage-arcticjet-all.md and notice-0015. The baggage file does not specify exact compensation amounts for theft — it only says fees and policies. The correct answer is sourced primarily from notice-0015 with the policy providing context. | The question was reclassified to hybrid (RAG provides the facts of the incident and compensation paid; OKF provides the baggage policy framework). Correct. |

---

## 7. Question split verification

| Category | Dev (4) | Test (8) | Total (12) |
|---|---|---|---|
| okf_only | q-001 to q-004 | q-005 to q-012 | 12 ✅ |
| rag_only | q-013 to q-016 | q-017 to q-024 | 12 ✅ |
| hybrid | q-025 to q-028 | q-029 to q-036 | 12 ✅ |
| human_fallback_stale | q-037 to q-040 | q-041 to q-048 | 12 ✅ |
| human_fallback_no_evidence | q-049 to q-052 | q-053 to q-060 | 12 ✅ |
| human_fallback_ambiguous | q-061 to q-064 | q-065 to q-072 | 12 ✅ |
| human_fallback_conflict | q-073 to q-076 | q-077 to q-084 | 12 ✅ |
| **Total** | **28** | **56** | **84** ✅ |

Dev and test questions within each category use different airlines, routes, or countries to prevent answer leakage across splits. Verified for okf_only, rag_only, and hybrid. Human fallback categories use structurally distinct sub-scenarios (stale: Britannica vs refund; conflict: different airlines; no_evidence: different routes/events).

---

**Overall status: PASS. No unresolved inconsistencies. All intentional conflicts documented.**
