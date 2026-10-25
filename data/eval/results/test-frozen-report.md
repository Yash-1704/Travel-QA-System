# Evaluation Report: test-frozen

**Date:** 2026-10-25T08:18:34.800Z  
**Evaluated Questions:** 56 (V1: 56, V2: 56)  
**Manual Overrides Applied:** 0 (author), 22 (agent-proposed)  

## 1. Headline Results & Sensitivity Analysis

### Primary Evaluation (All 56 Questions)

| Metric | V1 (RAG Baseline) | V2 (Classify-First) |
|---|---|---|
| **Overall Correctness** | 33/56 (58.9%) | 30/56 (53.6%) |
| **Answer Accuracy** (on non-escalated) | 18/30 (60.0%) | 15/25 (60.0%) |
| **Wrong Answer Rate** | 20/56 (35.7%) | 15/56 (26.8%) |
| **Escalation Rate** | 18/56 (32.1%) | 26/56 (46.4%) |
| **Unnecessary Escalation Rate** | 2/32 (6.3%) | 7/32 (21.9%) |

> [!NOTE]
> **Sensitivity Analysis (Excluding Stale Policy Category):** The `human_fallback_stale` category deliberately tests source-faithfulness to outdated document text. Below is the primary sensitivity check across the remaining 48 questions.

| Metric (Excl. Stale) | V1 (RAG Baseline) | V2 (Classify-First) |
|---|---|---|
| **Overall Correctness** | 26/48 (54.2%) | 26/48 (54.2%) |
| **Answer Accuracy** (on non-escalated) | 11/22 (50.0%) | 11/20 (55.0%) |
| **Wrong Answer Rate** | 19/48 (39.6%) | 14/48 (29.2%) |

## 2. Per-Category Breakdown

| Category | Expected Outcome | V1 Correct | V2 Correct | V1 Escalated | V2 Escalated | V1 Wrong | V2 Wrong |
|---|---|---|---|---|---|---|---|
| `okf_only` | OKF_ONLY | 4/8 (50.0%) | 3/8 (37.5%) | 0/8 (0.0%) | 2/8 (25.0%) | 4/8 (50.0%) | 3/8 (37.5%) |
| `rag_only` | RAG_ONLY | 4/8 (50.0%) | 4/8 (50.0%) | 0/8 (0.0%) | 0/8 (0.0%) | 4/8 (50.0%) | 4/8 (50.0%) |
| `hybrid` | HYBRID | 3/8 (37.5%) | 4/8 (50.0%) | 2/8 (25.0%) | 2/8 (25.0%) | 3/8 (37.5%) | 2/8 (25.0%) |
| `human_fallback_stale` | OKF_ONLY | 7/8 (87.5%) | 4/8 (50.0%) | 0/8 (0.0%) | 3/8 (37.5%) | 1/8 (12.5%) | 1/8 (12.5%) |
| `human_fallback_no_evidence` | ESCALATE | 7/8 (87.5%) | 7/8 (87.5%) | 7/8 (87.5%) | 7/8 (87.5%) | 1/8 (12.5%) | 1/8 (12.5%) |
| `human_fallback_ambiguous` | ESCALATE | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | 0/8 (0.0%) | 0/8 (0.0%) |
| `human_fallback_conflict` | ESCALATE | 0/8 (0.0%) | 0/8 (0.0%) | 1/8 (12.5%) | 4/8 (50.0%) | 7/8 (87.5%) | 4/8 (50.0%) |

## 3. Conflict Category Deep-Dive & Source Asymmetry

The conflict category (`human_fallback_conflict`) requires detecting contradictory policies between the airline-specific policy and `refund-policy-general.md`. Scoring rules require escalating specifically with reason `CONFLICT`.

| Conflict Metric | V1 | V2 |
|---|---|---|
| **Correct Escalation via CONFLICT** | 0/8 (0.0%) | 0/8 (0.0%) |
| **Safe Escalation (Any Escalation Reason)** | 1/8 (12.5%) | 4/8 (50.0%) |
| **Retrieved Both Conflicting Files** | 8/8 (100.0%) | 0/8 (0.0%) |

*Design Limitation Note:* V1 retrieves top-3 from the combined collection, providing an opportunity to pull both policy documents simultaneously. V2 routes to OKF matching, which returns at most ONE top-scoring policy file, and ESCALATE routing bypasses retrieval entirely. This architectural asymmetry explains why V2 cannot detect cross-document contradiction unless multi-document retrieval is added.

## 4. V2 Classification & Routing Performance

**Overall V2 Routing Accuracy:** 37/56 (66.1%)  
**INVALID Classifications:** 0  
**Similarity Floor Firings (similarity < 0.3):** 0 times  

### Confusion Matrix (V2)

| Expected \ Predicted | OKF_ONLY | RAG_ONLY | HYBRID | ESCALATE | INVALID |
|---|---|---|---|---|---|
| **OKF_ONLY** | 14 | 0 | 1 | 1 | 0 |
| **RAG_ONLY** | 0 | 8 | 0 | 0 | 0 |
| **HYBRID** | 0 | 0 | 8 | 0 | 0 |
| **ESCALATE** | 10 | 5 | 2 | 7 | 0 |

### V2 Escalations by Reason

| Reason | Count |
|---|---|
| `INSUFFICIENT` | 17 |
| `CLASSIFIER_ESCALATE` | 8 |
| `NO_OKF_MATCH` | 1 |

### V2 Accuracy Conditional on Routing

- **When Routing was Correct:** 14/24 (58.3%)
- **When Routing was Misclassified:** 1/1 (100.0%)

## 5. Token Efficiency & Latency (indicative only)

| Metric | V1 | V2 |
|---|---|---|
| **Mean Tokens / Question** | 947 | 740 |
| **Median Latency** | 1191 ms | 399 ms |
| **Mean Latency** | 36605 ms | 497 ms |
| **Retrieval Hit Rate** (`sourceRetrieved`) | 32/32 (100.0%) | 27/32 (84.4%) |

