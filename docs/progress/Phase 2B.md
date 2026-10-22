# Phase 2B: Human Fallback and Employee Dashboard — Progress

Date: 2026-10-22
Status: COMPLETE (ALL CHECKS PASS)

---

## 1. Done-When Verification Checklist

| Requirement | Target | Status | Verification Evidence |
|---|---|---|---|
| Shared DB Service | `server/src/services/db.js` with indexes | PASS | Implemented with `connect()`, `getDb()`, `getCollection(name)`, `close()`. Indexes created: `cases` `{ status: 1, createdAt: -1 }` and `experiment_logs` `{ runId: 1, rep: 1, systemName: 1, questionId: 1 }` (unique). |
| Exact `cases` Schema | Matches A5 & Phase 2B specification | PASS | Schema verified in `test-cases-flow.js` (step 3 PASS): contains `_id`, `question`, `status`, `llmClassification`, `reason`, `okfEvidence` (metadata, score, 600-char excerpt), `ragEvidence` (notices metadata lookup, similarity, text), `finalAnswer`, `customerId`, `createdAt`, `resolvedAt`. |
| Chat Escalation Hook | Only V2 escalations insert cases | PASS | `POST /api/chat` with V2 escalation returns `{ outcome: "ESCALATED", caseId, message }`. V1 escalation creates 0 cases in MongoDB (`test-cases-flow.js` step 10 PASS). |
| Cases API Endpoints | `/api/cases` routes implemented | PASS | Mounted in `server/src/index.js`. Endpoints: `GET /?status=pending|resolved`, `GET /:id`, `POST /:id/resolve`, and public `GET /:id/reply`. |
| Public Reply Endpoint Isolation | `/:id/reply` returns only `status` & `finalAnswer` | PASS | `test-cases-flow.js` steps 4 & 6 confirm payload keys are exactly `['finalAnswer', 'status']`. |
| Resolve Validation & Idempotency | `400` on empty, `409` on second resolve, `400` on bad ID | PASS | Steps 7, 8, 9 in `test-cases-flow.js` all PASS. |
| Client Routing & Navigation | `react-router-dom` with `/` and `/dashboard` | PASS | Installed `react-router-dom`, configured `App.jsx` with global navigation bar, `Chat.jsx` at `/`, `Dashboard.jsx` at `/dashboard`. `npm run build` succeeds in 1.93s. |
| Chat Polling Resolution | `Chat.jsx` polls `/api/cases/:id/reply` every 5s | PASS | Polls while pending; on resolution, appends answer labeled "Team member" and clears interval (with unmount cleanup). |
| Dashboard Functionality | `Dashboard.jsx` pending/resolved view | PASS | Pending/Resolved toggle, auto-refresh every 10s + manual refresh, collapsible case cards with OKF/RAG evidence inspect, and staff answer submission. |
| Automated Flow Test | `scripts/test-cases-flow.js` all PASS | PASS | `10/10 PASS` across end-to-end flow. |

---

## 2. Test Execution Output (`scripts/test-cases-flow.js`)

```
=== Phase 2B: Testing Human Fallback Flow ===

Test server running at http://127.0.0.1:3001
[PASS] 1. V2 escalation created case with ID: 6ad91bfd27590cc22d8a6a8a
[PASS] 2. Pending cases list includes case 6ad91bfd27590cc22d8a6a8a
[PASS] 3. Full case fetched and matches exact schema
[PASS] 4. /api/cases/:id/reply returns ONLY {status, finalAnswer}
[PASS] 5. Case resolved successfully with employee answer
[PASS] 6. /api/cases/:id/reply returns resolved finalAnswer
[PASS] 7. Second resolve attempt returns HTTP 409 Conflict
[PASS] 8. Empty answer returns HTTP 400 Bad Request
[PASS] 9. Malformed case ID returns HTTP 400 Bad Request
[PASS] 10. V1 escalation does not create a MongoDB case

========================================
Cases Flow Test Results: 10/10 PASS
========================================
```

---

## 3. Assumptions Made

1. MongoDB instance is available at `mongodb://127.0.0.1:27017` database `travel_qa`.
2. As required by the contract, `services/answer.js` never touches MongoDB; case insertion is strictly isolated to `routes/chat.js` for V2 escalations.
3. Employee view of OKF metadata (`status`, `verified`, `stale_after`) and excerpt is informational for human operators only; the answer LLM never saw or used them.

---

## 4. Next Phase

- **Phase 3 (Optional):** Customer context (`"my flight"`, bookings lookup). If skipped per instructions, the next phase is **Phase 4A: Evaluation Tooling and Dev Run**.
