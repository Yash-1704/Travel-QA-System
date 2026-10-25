# Phase 5A: Evaluation Tooling & Dev Run — Progress

Date: 2026-10-24
Status: COMPLETE (ALL CHECKS PASS — STOP GATE REACHED)

---

## 1. Done-When Verification Checklist

| Requirement | Target | Status | Verification Evidence |
|---|---|---|---|
| Complete Dev Set Evaluation | 56 evaluation rows (28 dev questions × 2 systems) | PASS | 56 rows logged into MongoDB `experiment_logs` for `runId: "dev-1"`, `rep: 0`, `kind: "eval"`. |
| Evaluation Idempotency | Re-running adds 0 rows and consumes 0 LLM tokens | PASS | `node scripts/run-eval.js --split dev --run-id dev-1 --report` returned: `Items already completed: 56/56, Items remaining: 0, Estimated remaining token cost: ~0 tokens`. |
| Explicit Counts on Percentages | Report format includes counts on all percentages | PASS | Verified in `data/eval/results/dev-1-report.md`: all percentages have counts e.g., `14/28 (50.0%)`, `10/24 (41.7%)`, `19/28 (67.9%)`. |
| Pure Key-Fact & Escalation Grader | Unit tests verify substring & escalation rules | PASS | `node scripts/test-grade.js` ran 10 unit checks with 10/10 PASS (normalizing, substring matching, escalation rules, conflict-specific escalation, routing accuracy). |
| Sensitivity Analysis Reported | Exclude `human_fallback_stale` (24 dev questions) | PASS | Primary sensitivity analysis reported side-by-side in `dev-1-report.md` (V1: 10/24 [41.7%], V2: 11/24 [45.8%]). |
| Conflict Asymmetry Documented | Both sources retrieved vs single OKF limitation | PASS | V1 retrieved both conflicting files in 4/4 cases; V2 retrieved both in 0/4 cases due to single-file OKF matching and ESCALATE skipping retrieval. |
| Review Queue & Error Template | Scripts generate queue and author error templates | PASS | `make-review-queue.js` generated `review-queue.md` and populated `data/eval/manual-grades.json`. `make-error-template.js` generated `error-analysis-dev-1.md`. |
| Timing Harness Created | Deterministic 20-question test subset & 3-rep harness | PASS | `run-timing.js` generated `data/eval/timing-subset.json` (20 items across 7 categories) with interleaved alternating execution. |
| Evaluation Isolation Maintained | Zero changes to research files, prompts, or floor | PASS | `git diff --stat HEAD -- server/src/services/answer.js ...` is strictly empty. `RAG_SIM_FLOOR = 0.3` untouched. |
| Test Split Isolation Maintained | Test split (56 questions) unseen | PASS | Only `--split dev` executed; zero test questions evaluated or queried. |
| Secret Hygiene & File Safety | Untracked secrets and large file checks | PASS | `.env` and `AGENTS.md` are git-ignored and untracked. No key patterns in tracked files. No files > 50MB. |

---

## 2. Dev-1 Evaluation Summary

### Primary Results (All 28 Dev Questions)
- **V1 (RAG Baseline):**
  - Overall Correctness: **14/28 (50.0%)**
  - Answer Accuracy (on non-escalated questions): **8/16 (50.0%)**
  - Wrong Answer Rate: **14/28 (50.0%)**
  - Escalation Rate: **6/28 (21.4%)**
  - Unnecessary Escalation Rate: **0/16 (0.0%)**
  - Retrieval Hit Rate (`sourceRetrieved`): **16/16 (100.0%)**
  - Mean Tokens / Question: **984**
  - Median Latency: **1028 ms**

- **V2 (Classify-First Architecture):**
  - Overall Correctness: **13/28 (46.4%)**
  - Answer Accuracy (on non-escalated questions): **6/13 (46.2%)**
  - Wrong Answer Rate: **11/28 (39.3%)**
  - Escalation Rate: **11/28 (39.3%)**
  - Unnecessary Escalation Rate: **3/16 (18.8%)**
  - Routing Accuracy: **19/28 (67.9%)**
  - INVALID Labels: **0**
  - Similarity Floor Firings (< 0.3): **0**
  - Retrieval Hit Rate (`sourceRetrieved`): **12/16 (75.0%)**
  - Mean Tokens / Question: **784**
  - Median Latency: **419 ms**

### Sensitivity Analysis (Excluding `human_fallback_stale` — 24 Questions)
- **V1 Overall Correctness:** 10/24 (41.7%)
- **V2 Overall Correctness:** 11/24 (45.8%)
- **V1 Answer Accuracy:** 4/12 (33.3%)
- **V2 Answer Accuracy:** 4/10 (40.0%)

### V2 Routing Confusion Matrix
| Expected \ Predicted | OKF_ONLY | RAG_ONLY | HYBRID | ESCALATE | INVALID |
|---|---|---|---|---|---|
| **OKF_ONLY** | 8 | 0 | 0 | 0 | 0 |
| **RAG_ONLY** | 0 | 4 | 0 | 0 | 0 |
| **HYBRID** | 0 | 0 | 4 | 0 | 0 |
| **ESCALATE** | 5 | 4 | 0 | 3 | 0 |

---

## 3. Files Implemented & Built

1. **`server/src/services/grade.js`**:
   - `normalize(s)`: lowercase, collapse whitespace, strip `*` and `` ` ``, preserve commas.
   - `gradeResult(question, result)`: pure key-fact substring checking, safe escalation evaluation, and category-specific rules (`human_fallback_conflict` requires `escalationReason === "CONFLICT"`).
2. **`scripts/test-grade.js`**:
   - Automated unit test suite verifying grader logic across 10 scenarios.
3. **`scripts/run-eval.js`**:
   - Evaluation runner with `--split`, `--run-id`, `--systems`, `--confirm-frozen`, `--auto-resume`, and `--report` flags.
   - Enforces `--confirm-frozen` guard for test runs.
   - Tracks daily token usage against `GROQ_DAILY_TOKEN_CAP` (90,000) and handles auto-resume on quota boundaries.
   - Generates `<runId>-meta.json` before test evaluation runs.
4. **`scripts/report.js`**:
   - Compiles side-by-side comparative Markdown reports and CSV rows with explicit counts for every percentage.
   - Features headline metrics, stale-policy sensitivity analysis, conflict asymmetry analysis, V2 confusion matrix, routing-conditional accuracy, and token/latency benchmarks.
5. **`scripts/run-timing.js`**:
   - Generates deterministic 20-question test subset (`data/eval/timing-subset.json`).
   - Runs 3 repetitions with cache bypassed (`bypassCache: true`), alternating system execution order, and daily budget sanity checks per repetition.
6. **`scripts/make-review-queue.js`**:
   - Creates `review-queue.md` for manual inspection of grader false negatives (`needsManualReview === true`) and 5 seeded spot-checks.
   - Manages proposed overrides in `data/eval/manual-grades.json` with source `"agent-proposed"`.
7. **`scripts/make-error-template.js`**:
   - Prepares `error-analysis-<runId>.md` with unfilled author diagnosis lines for manual research review.

---

## 4. Freeze Gate Checklist

- [x] **Classify Prompt Hash (SHA256):** `c194271cf4dac4d5bd2cc70845e385d3ff040d8de589a8959ae24b184765806f`
- [x] **Answer Prompt Hash (SHA256):** `7f902295ed715704c2b9e86db67ba36d2a858200f19878bbac37278b84b8e319`
- [x] **Similarity Floor:** `RAG_SIM_FLOOR = 0.3` (set once, never tuned)
- [x] **Generation / Classification Model:** `qwen/qwen3.8-27b`
- [x] **Embedding Model:** `gemini-embedding-001`
- [x] **Cache Locations:** `cache/llm-cache.json`, `cache/embed-cache.json`, `cache/usage.json`
- [x] **Website & Customer Context Included:** All Phase 3A, 3B, and 4 code included in the freeze.
- [x] **Evaluation Isolation:** Evaluation scripts (`run-eval.js`, `run-timing.js`) call `answerV1`/`answerV2` directly via internal modules; never over HTTP, never using logins, never creating cases.
- [x] **Test Split Isolation:** The 56 test questions remain completely unseen.
