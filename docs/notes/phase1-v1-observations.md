# Phase 1: V1 Observations

Date: 2026-10-20
System: V1 (RAG-only baseline, combined collection, top-3 cosine)

---

## q-001 — okf_only
**Question:** What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight?
**Expected outcome:** OKF_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:cancellation-skynova-economy.md] sim=0.7839, [OKF:no-show-policy.md] sim=0.7136, [OKF:baggage-skynova-economy.md] sim=0.7008
**Citations:** [OKF:cancellation-skynova-economy.md]
**Tokens:** 1360
**HTML comments in retrieved:** no
**Observation:** Answered; sources retrieved: OKF; cited: OKF


## q-003 — okf_only
**Question:** Do Indian passport holders need a visa to visit Thaloria?
**Expected outcome:** OKF_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:visa-country-a-thaloria.md] sim=0.8235, [OKF:visa-country-b-emiria.md] sim=0.7403, [OKF:visa-country-e-zorovia.md] sim=0.7306
**Citations:** [OKF:visa-country-a-thaloria.md]
**Tokens:** 1094
**HTML comments in retrieved:** no
**Observation:** Answered; sources retrieved: OKF; cited: OKF


## q-013 — rag_only
**Question:** Why was flight SN-101 on 14 March 2026 delayed?
**Expected outcome:** RAG_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [RAG:notice-0001] sim=0.8189, [RAG:notice-0009] sim=0.7751, [RAG:notice-0004] sim=0.7687
**Citations:** [RAG:notice-0001]
**Tokens:** 495
**HTML comments in retrieved:** no
**Observation:** Answered; sources retrieved: RAG; cited: RAG


## q-016 — rag_only
**Question:** Is the SkyNova Air Delhi to Bangkok flight running normally on Tuesdays?
**Expected outcome:** RAG_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [RAG:notice-0019] sim=0.7680, [RAG:notice-0011] sim=0.7189, [RAG:notice-0001] sim=0.7173
**Citations:** [RAG:notice-0019]
**Tokens:** 582
**HTML comments in retrieved:** no
**Observation:** Answered; sources retrieved: RAG; cited: RAG


## q-025 — hybrid
**Question:** My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to any compensation from SkyNova Air?
**Expected outcome:** HYBRID
**Actual outcome:** ANSWERED
**Retrieved:** [RAG:notice-0009] sim=0.8014, [RAG:notice-0001] sim=0.7840, [OKF:delay-compensation.md] sim=0.7769
**Citations:** [RAG:notice-0009], [OKF:delay-compensation.md]
**Tokens:** 1249
**HTML comments in retrieved:** no
**Observation:** Answered; sources retrieved: RAG+OKF; cited: RAG+OKF


## q-037 — human_fallback_stale
**Question:** How much does it cost to apply for a visa to visit Britannica as an Indian passport holder?
**Expected outcome:** OKF_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:visa-country-d-britannica.md] sim=0.8089, [OKF:visa-country-c-nipponara.md] sim=0.7051, [OKF:visa-country-b-emiria.md] sim=0.7009
**Citations:** [OKF:visa-country-d-britannica.md]
**Tokens:** 1216
**HTML comments in retrieved:** no
**Observation:** Answered; sources retrieved: OKF; cited: OKF


## q-061 — human_fallback_ambiguous
**Question:** Can I bring my pet snake on board?
**Expected outcome:** ESCALATE
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:pets-policy.md] sim=0.7365, [OKF:baggage-skynova-economy.md] sim=0.6423, [OKF:baggage-vistaair-economy.md] sim=0.6315
**Citations:** [OKF:pets-policy.md]
**Tokens:** 1558
**HTML comments in retrieved:** no
**Observation:** Answered; sources retrieved: OKF; cited: OKF


## q-063 — human_fallback_ambiguous
**Question:** My flight was delayed. What should I do?
**Expected outcome:** ESCALATE
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:delay-compensation.md] sim=0.7400, [RAG:notice-0005] sim=0.7040, [RAG:notice-0001] sim=0.6990
**Citations:** [OKF:delay-compensation.md]
**Tokens:** 1416
**HTML comments in retrieved:** no
**Observation:** Answered; sources retrieved: OKF+RAG; cited: OKF


## q-064 — human_fallback_ambiguous
**Question:** Is it safe to travel to Zorovia right now?
**Expected outcome:** ESCALATE
**Actual outcome:** ESCALATED (INSUFFICIENT)
**Retrieved:** [OKF:visa-country-e-zorovia.md] sim=0.6914, [OKF:visa-country-a-thaloria.md] sim=0.6208, [RAG:notice-0027] sim=0.6143
**Citations:** (none)
**Tokens:** 778
**HTML comments in retrieved:** no
**Observation:** Escalated (INSUFFICIENT); source types retrieved: OKF, RAG


## q-073 — human_fallback_conflict
**Question:** How long does a SkyNova Air refund take to process?
**Expected outcome:** ESCALATE
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:refund-policy-general.md] sim=0.7943, [OKF:cancellation-skynova-economy.md] sim=0.7714, [OKF:delay-compensation.md] sim=0.7013
**Citations:** [OKF:cancellation-skynova-economy.md], [OKF:refund-policy-general.md]
**Tokens:** 1684
**HTML comments in retrieved:** no
**Observation:** Answered; sources retrieved: OKF; cited: OKF

