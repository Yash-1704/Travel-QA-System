# Evaluation Report: dev-1

**Date:** 2026-10-24T14:10:27.797Z  
**Evaluated Questions:** 28 (V1: 28, V2: 28)  
**Manual Overrides Applied:** 0 (author), 15 (agent-proposed)  

## 1. Headline Results & Sensitivity Analysis

### Primary Evaluation (All 28 Questions)

| Metric | V1 (RAG Baseline) | V2 (Classify-First) |
|---|---|---|
| **Overall Correctness** | 14/28 (50.0%) | 13/28 (46.4%) |
| **Answer Accuracy** (on non-escalated) | 8/16 (50.0%) | 6/13 (46.2%) |
| **Wrong Answer Rate** | 14/28 (50.0%) | 11/28 (39.3%) |
| **Escalation Rate** | 6/28 (21.4%) | 11/28 (39.3%) |
| **Unnecessary Escalation Rate** | 0/16 (0.0%) | 3/16 (18.8%) |

> [!NOTE]
> **Sensitivity Analysis (Excluding Stale Policy Category):** The `human_fallback_stale` category deliberately tests source-faithfulness to outdated document text. Below is the primary sensitivity check across the remaining 24 questions.

| Metric (Excl. Stale) | V1 (RAG Baseline) | V2 (Classify-First) |
|---|---|---|
| **Overall Correctness** | 10/24 (41.7%) | 11/24 (45.8%) |
| **Answer Accuracy** (on non-escalated) | 4/12 (33.3%) | 4/10 (40.0%) |
| **Wrong Answer Rate** | 14/24 (58.3%) | 10/24 (41.7%) |

## 2. Per-Category Breakdown

| Category | Expected Outcome | V1 Correct | V2 Correct | V1 Escalated | V2 Escalated | V1 Wrong | V2 Wrong |
|---|---|---|---|---|---|---|---|
| `okf_only` | OKF_ONLY | 1/4 (25.0%) | 0/4 (0.0%) | 0/4 (0.0%) | 2/4 (50.0%) | 3/4 (75.0%) | 2/4 (50.0%) |
| `rag_only` | RAG_ONLY | 2/4 (50.0%) | 2/4 (50.0%) | 0/4 (0.0%) | 0/4 (0.0%) | 2/4 (50.0%) | 2/4 (50.0%) |
| `hybrid` | HYBRID | 1/4 (25.0%) | 2/4 (50.0%) | 0/4 (0.0%) | 0/4 (0.0%) | 3/4 (75.0%) | 2/4 (50.0%) |
| `human_fallback_stale` | OKF_ONLY | 4/4 (100.0%) | 2/4 (50.0%) | 0/4 (0.0%) | 1/4 (25.0%) | 0/4 (0.0%) | 1/4 (25.0%) |
| `human_fallback_no_evidence` | ESCALATE | 4/4 (100.0%) | 4/4 (100.0%) | 4/4 (100.0%) | 4/4 (100.0%) | 0/4 (0.0%) | 0/4 (0.0%) |
| `human_fallback_ambiguous` | ESCALATE | 2/4 (50.0%) | 3/4 (75.0%) | 2/4 (50.0%) | 3/4 (75.0%) | 2/4 (50.0%) | 1/4 (25.0%) |
| `human_fallback_conflict` | ESCALATE | 0/4 (0.0%) | 0/4 (0.0%) | 0/4 (0.0%) | 1/4 (25.0%) | 4/4 (100.0%) | 3/4 (75.0%) |

## 3. Conflict Category Deep-Dive & Source Asymmetry

The conflict category (`human_fallback_conflict`) requires detecting contradictory policies between the airline-specific policy and `refund-policy-general.md`. Scoring rules require escalating specifically with reason `CONFLICT`.

| Conflict Metric | V1 | V2 |
|---|---|---|
| **Correct Escalation via CONFLICT** | 0/4 (0.0%) | 0/4 (0.0%) |
| **Safe Escalation (Any Escalation Reason)** | 0/4 (0.0%) | 1/4 (25.0%) |
| **Retrieved Both Conflicting Files** | 4/4 (100.0%) | 0/4 (0.0%) |

*Design Limitation Note:* V1 retrieves top-3 from the combined collection, providing an opportunity to pull both policy documents simultaneously. V2 routes to OKF matching, which returns at most ONE top-scoring policy file, and ESCALATE routing bypasses retrieval entirely. This architectural asymmetry explains why V2 cannot detect cross-document contradiction unless multi-document retrieval is added.

## 4. V2 Classification & Routing Performance

**Overall V2 Routing Accuracy:** 19/28 (67.9%)  
**INVALID Classifications:** 0  
**Similarity Floor Firings (similarity < 0.3):** 0 times  

### Confusion Matrix (V2)

| Expected \ Predicted | OKF_ONLY | RAG_ONLY | HYBRID | ESCALATE | INVALID |
|---|---|---|---|---|---|
| **OKF_ONLY** | 8 | 0 | 0 | 0 | 0 |
| **RAG_ONLY** | 0 | 4 | 0 | 0 | 0 |
| **HYBRID** | 0 | 0 | 4 | 0 | 0 |
| **ESCALATE** | 5 | 4 | 0 | 3 | 0 |

### V2 Escalations by Reason

| Reason | Count |
|---|---|
| `INSUFFICIENT` | 8 |
| `CLASSIFIER_ESCALATE` | 3 |

### V2 Accuracy Conditional on Routing

- **When Routing was Correct:** 6/13 (46.2%)
- **When Routing was Misclassified:** 0/0 (N/A)

## 5. Token Efficiency & Latency (indicative only)

| Metric | V1 | V2 |
|---|---|---|
| **Mean Tokens / Question** | 984 | 784 |
| **Median Latency** | 1028 ms | 419 ms |
| **Mean Latency** | 984 ms | 541 ms |
| **Retrieval Hit Rate** (`sourceRetrieved`) | 16/16 (100.0%) | 12/16 (75.0%) |

