# Pre-Phase 2A Fixes

Date: 2026-10-20
Status: COMPLETE WITH ONE SPECIFICATION BLOCKER

## Authority and Existing Worktree

- `AGENTS.md` identifies itself as the single source of truth; it is authoritative. It also describes root `plan.md` as background only. The Phase 5 prompt in `AGENTS.md` was updated; the relevant background claims in `plan.md` were corrected as requested.
- `docs/plan_final.md` was already deleted in the worktree before this task began. It was not restored or recreated.
- `plan.md`, `.gitignore`, the cache files, and deletions under `files/` and `docs/` already had uncommitted changes before this task. Those changes were preserved; only the focused research wording in `plan.md` was edited.
- `.github/copilot-instructions.md` contains the Graphify navigation instruction and does not contradict the AGENTS.md source-of-truth rule.
- The existing `.gitignore` worktree edit already ignores `.agents/` and `graphify-out/`; both were confirmed with `git check-ignore` and were not changed here.

## Changes

| File                                  | Change                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                           | Added Phase 5 guardrails: cross-source ranking interference is a hypothesis; whole policy documents are not truncated; floor-trigger claims require V2 run logs; attribute insufficient-evidence escalations to the LLM only when the recorded reason is `INSUFFICIENT`. This file is locally ignored by the repository as configured.                   |
| `plan.md`                             | Replaced the unsupported mid-condition truncation mechanism with a cautious cross-source ranking-interference hypothesis; clarified complete-file ingestion and source-item terminology; revised the Phase 5 introduction and claim language so hypotheses are not presented as findings. Existing qwen model and rate-limit configuration was retained. |
| `docker-compose.yml`                  | Replaced the floating Chroma `latest` tag with the verified running image digest `chromadb/chroma@sha256:1e0b73a187a28757c572acba508c46f48c9e8b0acaf5c20e6d95cdedce1acdf6`.                                                                                                                                                                              |
| `server/src/services/answer.js`       | Extracted reply interpretation into `interpretAnswerReply`; behavior remains exact normalized equality for `INSUFFICIENT` and `CONFLICT`. Replies with additional text remain answers, per the frozen contract.                                                                                                                                          |
| `scripts/test-answer-parsing.js`      | Added regression coverage for exact sentinels, normalized quote/period handling, and each sentinel followed by extra text.                                                                                                                                                                                                                               |
| `REPRODUCE.md`                        | Added verified Phase 0/1 environment, key-free configuration template, service startup, ingest, and development verification instructions. It explicitly says Phase 2A and formal evaluation have not been run.                                                                                                                                          |
| `docs/progress/Pre-Phase-2A-Fixes.md` | Recorded this task's changes, checks, and unresolved issue.                                                                                                                                                                                                                                                                                              |

The unavailable `llama-3.3-70b-versatile` reference remains only in the Phase 0 historical record describing its 404 failure. The active configured model was verified as `qwen/qwen3.8-27b`; the active embedding model is `gemini-embedding-001`. No active configuration was changed.

## Review-Queue Specification Conflict

The requested behavior change was not applied. `AGENTS.md` Phase 4A explicitly requires that for expected-`ESCALATE` questions outside the conflict category, `wrongAnswer = !escalated` and `needsManualReview = false`. Flagging an answered expected-escalation row for manual review contradicts that mandatory `needsManualReview` rule. The grader is still a Phase 4A placeholder, so there is no implemented review queue to patch safely in this pre-Phase-2A task.

This matters for q-061: it remains an unchanged dev question in `human_fallback_ambiguous`, expected outcome `ESCALATE`; the Phase 1 observation records it as answered from the pets policy. Under the current future Phase 4A rubric that answer is an automatic wrong answer and is not manually queued. A review-queue addition could preserve the automatic grade and use review only to inspect it, but changing the mandated queue flag needs your decision on the AGENTS.md rubric first. No question, label, split, or answer was modified.

## Evidence and Checks

| Check                               | Result        | Evidence                                                                                                                                                                                              |
| ----------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused reply regression            | PASS          | `node scripts/test-answer-parsing.js` printed `PASS: only exact normalized sentinel replies escalate`.                                                                                                |
| Static diagnostics                  | PASS          | `get_errors` reported no errors in `server/src/services/answer.js` or `scripts/test-answer-parsing.js`.                                                                                               |
| Phase 1 V1 answered path            | PASS          | `node scripts/ask.js v1 --id q-001` answered and cited `[OKF:cancellation-skynova-economy.md]`.                                                                                                       |
| Phase 1 V1 escalation path          | PASS          | `node scripts/ask.js v1 --id q-064` returned `ESCALATED`, reason `INSUFFICIENT`, with no answer/citations. This supports attributing that observed escalation to the answer LLM.                      |
| Cached response edge case           | PASS          | Read-only scan of 13 cached response texts found no `INSUFFICIENT`/`CONFLICT` sentinel followed by extra text. The recorded Phase 1 output for q-064 is the exact `INSUFFICIENT` sentinel.            |
| Frozen question/config/prompt files | PASS          | `git diff --exit-code -- data/eval/questions.json server/src/services/prompts.js server/src/config.js` succeeded.                                                                                     |
| Question q-061                      | PASS          | Confirmed `human_fallback_ambiguous`, `ESCALATE`, `dev`; no question data was edited.                                                                                                                 |
| Chroma digest and services          | PASS          | Running container image ID is `sha256:1e0b73a187a28757c572acba508c46f48c9e8b0acaf5c20e6d95cdedce1acdf6`; `docker compose ps` showed Chroma and MongoDB up; `docker compose config --quiet` succeeded. |
| Local/generated ignore rules        | PASS          | `git check-ignore -v .agents graphify-out` confirmed both paths are ignored.                                                                                                                          |
| Diff hygiene                        | PASS          | `git diff --check` succeeded.                                                                                                                                                                         |
| Floor-trigger findings              | NOT AVAILABLE | Phase 1 V1 has no similarity floor. Phase 2A/V2 has not been implemented or run, and `data/eval/results/` is absent. Therefore no claim that the 0.3 floor never fired is supported.                  |
| Manual review-queue correction      | NOT APPLIED   | Blocked by the mandatory Phase 4A `needsManualReview = false` rule for expected escalations; see above.                                                                                               |
| Formal test evaluation              | NOT RUN       | Explicitly prohibited for this task.                                                                                                                                                                  |

## Methodological Reporting

The Phase 1 observations support one narrow statement: q-064 escalated because the answer LLM returned `INSUFFICIENT`. They do not establish V2 floor behavior. Report the 0.3 floor's trigger count only from V2 logs; keep it unreported or marked unverified until those logs exist. Cross-source ranking interference remains a hypothesis until observed results demonstrate it.

No application server and evaluation script were run concurrently. The application server was not started for this task; V1 was exercised through the CLI. No formal evaluation, commit, or push occurred.

## Unresolved Decision

Decide whether the Phase 4A grading rule may be amended to allow answered expected-escalation questions to enter manual review while keeping queue membership separate from correctness. Until that rule is clarified, the review-queue change remains unapplied.
