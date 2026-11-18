# Canonical Numbers Reference for Research Paper

This file is the single source of truth for all quantitative claims and figures used in `paper/draft.md`.
All numbers are extracted directly from frozen evaluation artifacts in `data/eval/results/`.

---

## 1. Corpus and Evaluation Dataset Statistics

Source: `data/eval/results/test-frozen-meta.json` and `AGENTS.md` (Sections A4, A5)

| Metric | Value | Source Artifact |
|---|---|---|
| Total OKF Policy Files | 18 | `test-frozen-meta.json` (`counts.okfFiles`) |
| Total Operational Notices | 30 | `test-frozen-meta.json` (`counts.notices`) |
| Total Questions in Dataset | 84 | `test-frozen-meta.json` (`counts.questionsTotal`) |
| Dev Split Questions | 28 | `AGENTS.md` (7 categories × 4 questions) |
| Frozen Test Split Questions | 56 | `test-frozen-meta.json` (`counts.splitQuestions`) |
| Evaluated Categories | 7 | `data/eval/results/test-frozen-report.md` |
| Questions Per Category in Test Split | 8 | `data/eval/results/test-frozen-report.md` |
| V1 Combined Collection Chunks | 48 | `AGENTS.md` Section A5 (18 OKF files + 30 notices) |
| V2 Notices Collection Chunks | 30 | `AGENTS.md` Section A5 (30 notices) |
| Git Commit Hash at Freeze | `ee41f37997be108dfdc348b3d0348cfd3b5bc9e8` | `test-frozen-meta.json` |
| LLM Model (Classification & Generation) | `qwen/qwen3.8-27b` | `test-frozen-meta.json` |
| Embedding Model | `gemini-embedding-001` | `test-frozen-meta.json` |
| Similarity Floor (`RAG_SIM_FLOOR`) | 0.3 | `test-frozen-meta.json` |
| Top-k Retrieval Parameter (V1 and V2) | 3 | `AGENTS.md` Section A1, A5 |

---

## 2. Primary Headline Results (All 56 Frozen Test Questions)

Source: `data/eval/results/test-frozen-report.md` (Section 1)

| Metric | V1 (RAG Baseline) | V2 (Classify-First) |
|---|---|---|
| Overall Correctness | 33/56 (58.9%) | 30/56 (53.6%) |
| Answer Accuracy (on non-escalated questions) | 18/30 (60.0%) | 15/25 (60.0%) |
| Wrong Answer Rate | 20/56 (35.7%) | 15/56 (26.8%) |
| Overall Escalation Rate | 18/56 (32.1%) | 26/56 (46.4%) |
| Unnecessary Escalation Rate | 2/32 (6.3%) | 7/32 (21.9%) |
| Retrieval Hit Rate (`sourceRetrieved`) | 32/32 (100.0%) | 27/32 (84.4%) |
| Total Evaluated Rows per System | 56 | 56 |
| Total Experiment Logs (Dev + Test + Timing) | 288 | `data/eval/results/experiment_logs.json` |

---

## 3. Sensitivity Analysis (Excluding Stale Policy Category: 48 Questions)

Source: `data/eval/results/test-frozen-report.md` (Section 1)

| Metric | V1 (RAG Baseline) | V2 (Classify-First) |
|---|---|---|
| Overall Correctness (Excl. Stale) | 26/48 (54.2%) | 26/48 (54.2%) |
| Answer Accuracy (Excl. Stale, on non-escalated) | 11/22 (50.0%) | 11/20 (55.0%) |
| Wrong Answer Rate (Excl. Stale) | 19/48 (39.6%) | 14/48 (29.2%) |

---

## 4. Per-Category Breakdown (8 Questions Per Category)

Source: `data/eval/results/test-frozen-report.md` (Section 2)

| Category | Expected Outcome | V1 Correct | V2 Correct | V1 Escalated | V2 Escalated | V1 Wrong | V2 Wrong |
|---|---|---|---|---|---|---|---|
| `okf_only` | OKF_ONLY | 4/8 (50.0%) | 3/8 (37.5%) | 0/8 (0.0%) | 2/8 (25.0%) | 4/8 (50.0%) | 3/8 (37.5%) |
| `rag_only` | RAG_ONLY | 4/8 (50.0%) | 4/8 (50.0%) | 0/8 (0.0%) | 0/8 (0.0%) | 4/8 (50.0%) | 4/8 (50.0%) |
| `hybrid` | HYBRID | 3/8 (37.5%) | 4/8 (50.0%) | 2/8 (25.0%) | 2/8 (25.0%) | 3/8 (37.5%) | 2/8 (25.0%) |
| `human_fallback_stale` | OKF_ONLY | 7/8 (87.5%) | 4/8 (50.0%) | 0/8 (0.0%) | 3/8 (37.5%) | 1/8 (12.5%) | 1/8 (12.5%) |
| `human_fallback_no_evidence` | ESCALATE | 7/8 (87.5%) | 7/8 (87.5%) | 7/8 (87.5%) | 7/8 (87.5%) | 1/8 (12.5%) | 1/8 (12.5%) |
| `human_fallback_ambiguous` | ESCALATE | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | 0/8 (0.0%) | 0/8 (0.0%) |
| `human_fallback_conflict` | ESCALATE | 0/8 (0.0%) | 0/8 (0.0%) | 1/8 (12.5%) | 4/8 (50.0%) | 7/8 (87.5%) | 4/8 (50.0%) |

---

## 5. Conflict Category & Source Asymmetry (8 Questions)

Source: `data/eval/results/test-frozen-report.md` (Section 3)

| Conflict Metric | V1 | V2 |
|---|---|---|
| Correct Escalation via `CONFLICT` | 0/8 (0.0%) | 0/8 (0.0%) |
| Safe Escalation (Any Escalation Reason) | 1/8 (12.5%) | 4/8 (50.0%) |
| Retrieved Both Conflicting Files | 8/8 (100.0%) | 0/8 (0.0%) |

---

## 6. V2 Routing & Classification Performance

Source: `data/eval/results/test-frozen-report.md` (Section 4)

| Metric | Value |
|---|---|
| Overall V2 Routing Accuracy | 37/56 (66.1%) |
| INVALID Classifier Outputs | 0 |
| Similarity Floor Firings (< 0.3) in V2 Logs | 0 |
| Accuracy Conditional on Correct Routing | 14/24 (58.3%) |
| Accuracy Conditional on Misclassified Routing | 1/1 (100.0%) |

### Confusion Matrix (V2 Routing on 56 Questions)

| Expected \ Predicted | OKF_ONLY | RAG_ONLY | HYBRID | ESCALATE | INVALID |
|---|---|---|---|---|---|
| **OKF_ONLY** (16 questions) | 14 | 0 | 1 | 1 | 0 |
| **RAG_ONLY** (8 questions) | 0 | 8 | 0 | 0 | 0 |
| **HYBRID** (8 questions) | 0 | 0 | 8 | 0 | 0 |
| **ESCALATE** (24 questions) | 10 | 5 | 2 | 7 | 0 |

### V2 Escalations by Reason

| Reason | Count |
|---|---|
| `INSUFFICIENT` | 17 |
| `CLASSIFIER_ESCALATE` | 8 |
| `NO_OKF_MATCH` | 1 |
| Total V2 Escalations | 26 |

---

## 7. Latency and Token Efficiency

Source: `data/eval/results/timing-report.md` (Section 1-3) and `test-frozen-report.md` (Section 5)

| Metric | V1 (RAG Baseline) | V2 (Classify-First) | Source File |
|---|---|---|---|
| Timing Subset Questions | 20 | 20 | `timing-report.md` |
| Timing Completed Repetitions | 3 | 3 | `timing-report.md` |
| Total Timing Run Invocations | 60 | 60 | `timing-report.md` |
| Timing Median Latency | 1070 ms | 934 ms | `timing-report.md` |
| Timing p95 Latency (nearest rank) | 1614 ms | 1755 ms | `timing-report.md` |
| Paired Median Difference (V2 - V1) | -306 ms | -306 ms | `timing-report.md` |
| V2 Classification Stage Median Latency | - | 155 ms | `timing-report.md` |
| V2 Targeted Retrieval Stage Median Latency | - | 556 ms | `timing-report.md` |
| V2 Answer Generation Stage Median Latency | - | 250 ms | `timing-report.md` |
| Indicative Mean Tokens per Question | 947 | 740 | `test-frozen-report.md` |
| Indicative Median Latency (Full Run) | 1191 ms | 399 ms | `test-frozen-report.md` |
| Indicative Mean Latency (Full Run) | 36605 ms | 497 ms | `test-frozen-report.md` |

