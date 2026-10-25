# Phase 5B: Frozen Test Run, Timing & Review Queue — Progress

Date: 2026-10-25
Status: COMPLETE (ALL CHECKS PASS)

---

## 1. Done-When Verification Checklist

| Requirement | Target | Status | Verification Evidence |
|---|---|---|---|
| Frozen State Verified | `git tag -l frozen-eval` & clean diff against HEAD | PASS | Tag `frozen-eval` confirmed at commit `ee41f37997be108dfdc348b3d0348cfd3b5bc9e8`. Diff on research files is strictly empty. |
| Complete Test Set Evaluation | 112 evaluation rows (56 test questions × 2 systems) | PASS | Exactly 112 documents logged in MongoDB collection `experiment_logs` for `runId: "test-frozen"`, `rep: 0`, `kind: "eval"` (56 for V1, 56 for V2). |
| Evaluation Idempotency | Re-running adds 0 rows and consumes 0 LLM tokens | PASS | `node scripts/run-eval.js --split test --run-id test-frozen --confirm-frozen` returned: `Items already completed: 112/112, Items remaining: 0, Estimated remaining token cost: ~0 tokens`. |
| Frozen Test Report Compiled | `data/eval/results/test-frozen-report.md` & `.csv` | PASS | Generated with counts next to every percentage, stale-policy sensitivity analysis, confusion matrix, and conflict asymmetry deep-dive. |
| 3-Repetition Timing Benchmark | `timing-report.md` with median & p95 over 3 reps | PASS | 120 timing runs (40 per repetition × 3 reps) across 20-question test subset with cache bypassed. Median latency: V1 1070 ms, V2 934 ms; p95: V1 1614 ms, V2 1755 ms. |
| Review Queue Generated | `review-queue.md` & `manual-grades.json` | PASS | 22 agent-proposed overrides for substring grader false-negatives, plus 5 seeded spot-check rows. |
| Author Error Analysis Template | `data/eval/results/error-analysis-test-frozen.md` | PASS | Blank diagnosis and failure-type selection lines for all incorrect or misrouted rows. |
| Complete Log Export | `data/eval/results/experiment_logs.json` | PASS | All 288 experiment log documents (56 dev + 112 test + 120 timing) dumped to formatted JSON. |
| Reproduction Guide Written | `data/eval/results/REPRODUCE.md` | PASS | Complete documentation of commit hash, tag, models, floor 0.3, prompt hashes, cache locations, and reproduction commands. |
| Git Hygiene & Secret Safety | Untracked secrets and large file checks | PASS | `.env` and `AGENTS.md` are git-ignored and untracked. No key material in tracked files. No files > 50MB. |

---

## 2. Test-Frozen Evaluation Summary

### Primary Results (All 56 Frozen Test Questions)
- **V1 (RAG Baseline):**
  - Overall Correctness: **33/56 (58.9%)**
  - Answer Accuracy (on non-escalated questions): **18/30 (60.0%)**
  - Wrong Answer Rate: **20/56 (35.7%)**
  - Escalation Rate: **18/56 (32.1%)**
  - Unnecessary Escalation Rate: **2/32 (6.3%)**
  - Retrieval Hit Rate (`sourceRetrieved`): **32/32 (100.0%)**
  - Mean Tokens / Question: **947**
  - Median Latency: **1191 ms**

- **V2 (Classify-First Architecture):**
  - Overall Correctness: **30/56 (53.6%)**
  - Answer Accuracy (on non-escalated questions): **15/25 (60.0%)**
  - Wrong Answer Rate: **15/56 (26.8%)**
  - Escalation Rate: **26/56 (46.4%)**
  - Unnecessary Escalation Rate: **7/32 (21.9%)**
  - Routing Accuracy: **37/56 (66.1%)**
  - INVALID Labels: **0**
  - Similarity Floor Firings (< 0.3): **0**
  - Retrieval Hit Rate (`sourceRetrieved`): **27/32 (84.4%)**
  - Mean Tokens / Question: **740**
  - Median Latency: **399 ms**

### Sensitivity Analysis (Excluding `human_fallback_stale` — 48 Questions)
- **V1 Overall Correctness:** 26/48 (54.2%)
- **V2 Overall Correctness:** 26/48 (54.2%)
- **V1 Answer Accuracy:** 11/22 (50.0%)
- **V2 Answer Accuracy:** 11/20 (55.0%)
- **V1 Wrong Answer Rate:** 19/48 (39.6%)
- **V2 Wrong Answer Rate:** 14/48 (29.2%)

### Per-Category Performance (V1 vs V2)
| Category | Expected Outcome | V1 Correct | V2 Correct | V1 Escalated | V2 Escalated | V1 Wrong | V2 Wrong |
|---|---|---|---|---|---|---|---|
| `okf_only` | OKF_ONLY | 4/8 (50.0%) | 3/8 (37.5%) | 0/8 (0.0%) | 2/8 (25.0%) | 4/8 (50.0%) | 3/8 (37.5%) |
| `rag_only` | RAG_ONLY | 4/8 (50.0%) | 4/8 (50.0%) | 0/8 (0.0%) | 0/8 (0.0%) | 4/8 (50.0%) | 4/8 (50.0%) |
| `hybrid` | HYBRID | 3/8 (37.5%) | 4/8 (50.0%) | 2/8 (25.0%) | 2/8 (25.0%) | 3/8 (37.5%) | 2/8 (25.0%) |
| `human_fallback_stale` | OKF_ONLY | 7/8 (87.5%) | 4/8 (50.0%) | 0/8 (0.0%) | 3/8 (37.5%) | 1/8 (12.5%) | 1/8 (12.5%) |
| `human_fallback_no_evidence` | ESCALATE | 7/8 (87.5%) | 7/8 (87.5%) | 7/8 (87.5%) | 7/8 (87.5%) | 1/8 (12.5%) | 1/8 (12.5%) |
| `human_fallback_ambiguous` | ESCALATE | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | 8/8 (100.0%) | 0/8 (0.0%) | 0/8 (0.0%) |
| `human_fallback_conflict` | ESCALATE | 0/8 (0.0%) | 0/8 (0.0%) | 1/8 (12.5%) | 4/8 (50.0%) | 7/8 (87.5%) | 4/8 (50.0%) |

### Conflict Category Asymmetry Deep-Dive
- V1 retrieved both conflicting policy documents in **8/8 (100.0%)** cases because of top-3 retrieval across the combined store.
- V2 retrieved both in **0/8 (0.0%)** cases because OKF matching returns at most one file and ESCALATE routing bypasses retrieval.
- Correct escalation via `CONFLICT`: V1 = 0/8 (0.0%), V2 = 0/8 (0.0%). Safe escalation (any reason): V1 = 1/8 (12.5%), V2 = 4/8 (50.0%).

### 3-Repetition Timing Benchmark (Cache Bypassed)
- **V1 Median Latency:** 1070 ms (p95: 1614 ms)
- **V2 Median Latency:** 934 ms (p95: 1755 ms)
- **V2 Stage Breakdown:**
  - Classification (LLM): 155 ms
  - Targeted Retrieval (OKF / RAG): 556 ms
  - Answer Generation (LLM): 250 ms
- **Paired Latency Difference (V2 - V1):** -306 ms across 60 paired observations.

---

## 3. Manual Items for the Author

1. **Review Queue ([review-queue.md](file:///d:/Projects/Travel-QA-System/data/eval/results/review-queue.md)):**
   - Skim the 22 agent-proposed overrides and 5 spot-check questions.
   - If you disagree with any verdict, edit `data/eval/manual-grades.json` (set `source: "author"`), then re-run:
     `node scripts/report.js --run-id test-frozen`
2. **Error Analysis ([error-analysis-test-frozen.md](file:///d:/Projects/Travel-QA-System/data/eval/results/error-analysis-test-frozen.md)):**
   - Fill in the one-sentence "Why it failed" diagnosis lines and select failure types for each incorrect/misrouted question.
