# Phase 2A-2: V2 Observations

Date: 2026-10-21
System: V2 (Classify-first routing, OKF keyword matcher, RAG notices top-3 with 0.3 floor)

---

## q-001 — okf_only
**Question:** What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight?
**Expected outcome:** OKF_ONLY
**Classification:** OKF_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:cancellation-skynova-economy.md] (score=0.3077)
**Citations:** [OKF:cancellation-skynova-economy.md]
**Tokens:** 799
**Timings:** classifyMs=503, retrievalMs=63, llmMs=464
**HTML comments in retrieved:** no
**Observation:** Answered; classified as OKF_ONLY; retrieved OKF; cited OKF


## q-003 — okf_only
**Question:** Do Indian passport holders need a visa to visit Thaloria?
**Expected outcome:** OKF_ONLY
**Classification:** OKF_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:visa-country-a-thaloria.md] (score=0.7143)
**Citations:** [OKF:visa-country-a-thaloria.md]
**Tokens:** 626
**Timings:** classifyMs=155, retrievalMs=0, llmMs=263
**HTML comments in retrieved:** no
**Observation:** Answered; classified as OKF_ONLY; retrieved OKF; cited OKF


## q-013 — rag_only
**Question:** Why was flight SN-101 on 14 March 2026 delayed?
**Expected outcome:** RAG_ONLY
**Classification:** RAG_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [RAG:notice-0001] (sim=0.8189), [RAG:notice-0009] (sim=0.7751), [RAG:notice-0004] (sim=0.7687)
**Citations:** [RAG:notice-0001]
**Tokens:** 705
**Timings:** classifyMs=187, retrievalMs=172, llmMs=395
**HTML comments in retrieved:** no
**Observation:** Answered; classified as RAG_ONLY; retrieved RAG; cited RAG


## q-016 — rag_only
**Question:** Is the SkyNova Air Delhi to Bangkok flight running normally on Tuesdays?
**Expected outcome:** RAG_ONLY
**Classification:** RAG_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [RAG:notice-0019] (sim=0.7680), [RAG:notice-0011] (sim=0.7189), [RAG:notice-0001] (sim=0.7173)
**Citations:** [RAG:notice-0019]
**Tokens:** 787
**Timings:** classifyMs=444, retrievalMs=25, llmMs=433
**HTML comments in retrieved:** no
**Observation:** Answered; classified as RAG_ONLY; retrieved RAG; cited RAG


## q-025 — hybrid
**Question:** My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to any compensation from SkyNova Air?
**Expected outcome:** HYBRID
**Classification:** HYBRID
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:delay-compensation.md] (score=0.1875), [RAG:notice-0009] (sim=0.8014), [RAG:notice-0001] (sim=0.7840), [RAG:notice-0006] (sim=0.7418)
**Citations:** [RAG:notice-0009], [OKF:delay-compensation.md]
**Tokens:** 1525
**Timings:** classifyMs=136, retrievalMs=34, llmMs=639
**HTML comments in retrieved:** no
**Observation:** Answered; classified as HYBRID; retrieved OKF+RAG; cited RAG+OKF


## q-037 — human_fallback_stale
**Question:** How much does it cost to apply for a visa to visit Britannica as an Indian passport holder?
**Expected outcome:** OKF_ONLY
**Classification:** OKF_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:visa-country-d-britannica.md] (score=0.6250)
**Citations:** [OKF:visa-country-d-britannica.md]
**Tokens:** 696
**Timings:** classifyMs=161, retrievalMs=0, llmMs=279
**HTML comments in retrieved:** no
**Observation:** Answered; classified as OKF_ONLY; retrieved OKF; cited OKF


## q-061 — human_fallback_ambiguous
**Question:** Can I bring my pet snake on board?
**Expected outcome:** ESCALATE
**Classification:** OKF_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:pets-policy.md] (score=0.2500)
**Citations:** [OKF:pets-policy.md]
**Tokens:** 1024
**Timings:** classifyMs=185, retrievalMs=0, llmMs=368
**HTML comments in retrieved:** no
**Observation:** Answered; classified as OKF_ONLY; retrieved OKF; cited OKF


## q-063 — human_fallback_ambiguous
**Question:** My flight was delayed. What should I do?
**Expected outcome:** ESCALATE
**Classification:** ESCALATE
**Actual outcome:** ESCALATED (CLASSIFIER_ESCALATE)
**Retrieved:** (none)
**Citations:** (none)
**Tokens:** 200
**Timings:** classifyMs=154, retrievalMs=0, llmMs=0
**HTML comments in retrieved:** no
**Observation:** Escalated (CLASSIFIER_ESCALATE); classified as ESCALATE


## q-064 — human_fallback_ambiguous
**Question:** Is it safe to travel to Zorovia right now?
**Expected outcome:** ESCALATE
**Classification:** ESCALATE
**Actual outcome:** ESCALATED (CLASSIFIER_ESCALATE)
**Retrieved:** (none)
**Citations:** (none)
**Tokens:** 202
**Timings:** classifyMs=192, retrievalMs=0, llmMs=0
**HTML comments in retrieved:** no
**Observation:** Escalated (CLASSIFIER_ESCALATE); classified as ESCALATE


## q-073 — human_fallback_conflict
**Question:** How long does a SkyNova Air refund take to process?
**Expected outcome:** ESCALATE
**Classification:** OKF_ONLY
**Actual outcome:** ANSWERED
**Retrieved:** [OKF:cancellation-skynova-economy.md] (score=0.5000)
**Citations:** [OKF:cancellation-skynova-economy.md]
**Tokens:** 836
**Timings:** classifyMs=282, retrievalMs=0, llmMs=425
**HTML comments in retrieved:** no
**Observation:** Answered; classified as OKF_ONLY; retrieved OKF; cited OKF


## Cache Hit Verification

Re-ran q-001 through V2:
- Wall-clock time: 1 ms
- Token delta in usage.json: 0 (0 new tokens counted against budget) ✓
