# Phase 2A-1: Classifier 10-Question Self-Test Output

Date: 2026-10-22
Model: `qwen/qwen3.8-27b` via Groq
Parameters: `maxTokens: 10`, `temperature: 0`

---

## Raw Test Results

```
=== Testing Question Classifier (10 items) ===

[Groq] latency: 503ms, tokens: 217 (p:213, c:4), daily: 1640/90000
ID:       q-001
Question: What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight?
Raw:      "OKF_ONLY"
Valid:    true
Label:    OKF_ONLY
Expected: OKF_ONLY (MATCH)
Latency:  503 ms | Tokens: 217 (p:213, c:4)
--------------------------------------------------
[Groq] latency: 155ms, tokens: 202 (p:198, c:4), daily: 1842/90000
ID:       q-003
Question: Do Indian passport holders need a visa to visit Thaloria?
Raw:      "OKF_ONLY"
Valid:    true
Label:    OKF_ONLY
Expected: OKF_ONLY (MATCH)
Latency:  155 ms | Tokens: 202 (p:198, c:4)
--------------------------------------------------
[Groq] latency: 187ms, tokens: 210 (p:206, c:4), daily: 2052/90000
ID:       q-013
Question: Why was flight SN-101 on 14 March 2026 delayed?
Raw:      "RAG_ONLY"
Valid:    true
Label:    RAG_ONLY
Expected: RAG_ONLY (MATCH)
Latency:  187 ms | Tokens: 210 (p:206, c:4)
--------------------------------------------------
[Groq] latency: 444ms, tokens: 205 (p:201, c:4), daily: 2257/90000
ID:       q-016
Question: Is the SkyNova Air Delhi to Bangkok flight running normally on Tuesdays?
Raw:      "RAG_ONLY"
Valid:    true
Label:    RAG_ONLY
Expected: RAG_ONLY (MATCH)
Latency:  444 ms | Tokens: 205 (p:201, c:4)
--------------------------------------------------
[Groq] latency: 136ms, tokens: 232 (p:228, c:4), daily: 2489/90000
ID:       q-025
Question: My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to any compensation from SkyNova Air?
Raw:      "HYBRID"
Valid:    true
Label:    HYBRID
Expected: HYBRID (MATCH)
Latency:  136 ms | Tokens: 232 (p:228, c:4)
--------------------------------------------------
[Groq] latency: 239ms, tokens: 229 (p:225, c:4), daily: 2718/90000
ID:       q-028
Question: SkyNova flight SN-303 was delayed 3 hours and 45 minutes on 19 January 2026 due to crew issues. What are my compensation options?
Raw:      "HYBRID"
Valid:    true
Label:    HYBRID
Expected: HYBRID (MATCH)
Latency:  239 ms | Tokens: 229 (p:225, c:4)
--------------------------------------------------
[Groq] latency: 161ms, tokens: 210 (p:206, c:4), daily: 2928/90000
ID:       q-037
Question: How much does it cost to apply for a visa to visit Britannica as an Indian passport holder?
Raw:      "OKF_ONLY"
Valid:    true
Label:    OKF_ONLY
Expected: OKF_ONLY (MATCH)
Latency:  161 ms | Tokens: 210 (p:206, c:4)
--------------------------------------------------
[Groq] latency: 185ms, tokens: 199 (p:195, c:4), daily: 3127/90000
ID:       q-061
Question: Can I bring my pet snake on board?
Raw:      "OKF_ONLY"
Valid:    true
Label:    OKF_ONLY
Expected: ESCALATE (MISMATCH)
Latency:  185 ms | Tokens: 199 (p:195, c:4)
--------------------------------------------------
[Groq] latency: 154ms, tokens: 200 (p:196, c:4), daily: 3327/90000
ID:       q-063
Question: My flight was delayed. What should I do?
Raw:      "ESCALATE"
Valid:    true
Label:    ESCALATE
Expected: ESCALATE (MATCH)
Latency:  154 ms | Tokens: 200 (p:196, c:4)
--------------------------------------------------
[Groq] latency: 192ms, tokens: 202 (p:198, c:4), daily: 3529/90000
ID:       q-064
Question: Is it safe to travel to Zorovia right now?
Raw:      "ESCALATE"
Valid:    true
Label:    ESCALATE
Expected: ESCALATE (MATCH)
Latency:  192 ms | Tokens: 202 (p:198, c:4)
--------------------------------------------------

Summary:
Total questions: 10
Valid format:    10/10
Label matches:   9/10
```

---

## Summary Table

| ID | Category | Question | Raw Output | Valid | Label | Expected Outcome | Match |
|---|---|---|---|---|---|---|---|
| `q-001` | okf_only | What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight? | `"OKF_ONLY"` | `true` | `OKF_ONLY` | `OKF_ONLY` | MATCH |
| `q-003` | okf_only | Do Indian passport holders need a visa to visit Thaloria? | `"OKF_ONLY"` | `true` | `OKF_ONLY` | `OKF_ONLY` | MATCH |
| `q-013` | rag_only | Why was flight SN-101 on 14 March 2026 delayed? | `"RAG_ONLY"` | `true` | `RAG_ONLY` | `RAG_ONLY` | MATCH |
| `q-016` | rag_only | Is the SkyNova Air Delhi to Bangkok flight running normally on Tuesdays? | `"RAG_ONLY"` | `true` | `RAG_ONLY` | `RAG_ONLY` | MATCH |
| `q-025` | hybrid | My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to any compensation from SkyNova Air? | `"HYBRID"` | `true` | `HYBRID` | `HYBRID` | MATCH |
| `q-028` | hybrid | SkyNova flight SN-303 was delayed 3 hours and 45 minutes on 19 January 2026 due to crew issues. What are my compensation options? | `"HYBRID"` | `true` | `HYBRID` | `HYBRID` | MATCH |
| `q-037` | human_fallback_stale | How much does it cost to apply for a visa to visit Britannica as an Indian passport holder? | `"OKF_ONLY"` | `true` | `OKF_ONLY` | `OKF_ONLY` | MATCH |
| `q-061` | human_fallback_ambiguous | Can I bring my pet snake on board? | `"OKF_ONLY"` | `true` | `OKF_ONLY` | `ESCALATE` | MISMATCH |
| `q-063` | human_fallback_ambiguous | My flight was delayed. What should I do? | `"ESCALATE"` | `true` | `ESCALATE` | `ESCALATE` | MATCH |
| `q-064` | human_fallback_ambiguous | Is it safe to travel to Zorovia right now? | `"ESCALATE"` | `true` | `ESCALATE` | `ESCALATE` | MATCH |
