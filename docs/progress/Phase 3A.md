# Phase 3A: Website Back End Foundation — Progress

Date: 2026-10-24
Status: COMPLETE (ALL CHECKS PASS) — STOP GATE AWAITING USER VERIFICATION

---

## 1. Done-When Verification Checklist

| Requirement | Target | Status | Verification Evidence |
|---|---|---|---|
| Idempotent Seed Script | `scripts/seed-db.js` run twice yields identical counts | PASS | Run 1: Users=5, Seeded Bookings=6, Flights=532. Run 2: Users=5, Seeded Bookings=6, Flights=532. Zero duplicates. |
| Website API Test Suite | `scripts/test-website-api.js` (21 verification checks) | PASS | 21/21 checks PASS on throwaway database `travel_qa_test` with zero LLM calls. |
| Human Fallback Flow | `scripts/test-cases-flow.js` (11 checks) | PASS | 11/11 checks PASS with agent login and customer session attachment verification. |
| Research Data & Parsing | `validate-data.js` & `test-answer-parsing.js` | PASS | `validate-data.js` PASS (0 errors). `test-answer-parsing.js` PASS. |
| Cached Query Smoke Test | `node scripts/ask.js v2 --id q-001` | PASS | Answer returned from cache with zero new tokens used. |
| Frozen Research Isolation | `git diff --stat HEAD -- <research-files>` | PASS | Diff is empty. Research core files are 100% untouched. |
| Config Key Integrity | `git diff server/src/config.js` | PASS | Only added `JWT_SECRET` and `SEED_DEMO_PASSWORD`; no existing keys modified. |
| Secret Hygiene | No tracked file contains secrets | PASS | No tracked files contain JWT secret or demo password values. `.env` and `AGENTS.md` git-ignored. |

---

## 2. Evidence of Test Executions

### A. Idempotent Seed Script (`node scripts/seed-db.js`)
```
=== Database Seed Complete ===
Users:           5
Seeded Bookings: 6
Total Flights:   532

Demo User Accounts:
  Customers:
    - Arjun Sharma (arjun.sharma@email.com) [ID: cust-001]
    - Priya Mehta (priya.mehta@email.com) [ID: cust-002]
    - Rahul Nair (rahul.nair@email.com) [ID: cust-003]
  Agents:
    - Agent One (agent1@travelqa.demo)
    - Agent Two (agent2@travelqa.demo)
```

### B. Website API Test (`node scripts/test-website-api.js`)
```
=== Phase 3A: Website API Verification ===

Seeding throwaway test database: travel_qa_test...
Test server running at http://127.0.0.1:3101

[PASS] 1. Wrong password returns 401 with generic message
[PASS] 2. Duplicate email returns 409 Conflict
[PASS] 3. Short password (< 8 chars) returns 400 Bad Request
[PASS] 4. Login sets httpOnly sameSite=lax cookie and /me returns user without passwordHash
[PASS] 5. GET /api/cases and /:id: 401 anon, 403 customer, 200 agent
[PASS] 6. /api/cases/mine returns only caller’s cases without evidence
[PASS] 7. /:id/reply: guest open anonymously; customer case 401 anon, 403 other, 200 owner/agent
[PASS] 8. Flight search returns future flights and honors from/to/passengers/price sort
[PASS] 9. Booking endpoint: 401 anonymous, 403 agent
[PASS] 10. Valid booking reduces seats by exactly passengers and computes server price
[PASS] 11. Overbooking returns 409 Conflict with seats unchanged
[PASS] 12. Two simultaneous bookings for the last seat: exactly one succeeds (201 & 409)
[PASS] 13. Client-sent totalPrice and customerId are ignored in favor of server calculation
[PASS] 14. Passengers 0 or 5 returns 400 Bad Request
[PASS] 15. Unknown fare class returns 400 Bad Request
[PASS] 16. Booking a past flight returns 400 Bad Request
[PASS] 17. Reading another customer’s booking returns 403; owner and agent return 200
[PASS] 18. /api/staff/bookings is agent only (401 anon, 403 cust, 200 agent)
[PASS] 19. Non-JSON POST body returns 415 Unsupported Media Type
[PASS] 20. Endpoint responses never expose passwordHash or bcrypt hash values
[PASS] 21. Seed consistency: forbidden flight numbers absent, AJ-411 at 05:00, VA-902 suspended in Oct 2026, no delay fields

Dropping test database: travel_qa_test...

========================================
Website API Test Results: 21/21 PASS
========================================
```

### C. Cases Flow Test (`node scripts/test-cases-flow.js`)
```
=== Phase 3A / 2B: Testing Human Fallback Flow ===

Test server running at http://127.0.0.1:3001
[PASS] 1. V2 escalation created case with ID: 6adc8fc4f6545d53373796a9
[PASS] 2. Pending cases list includes case 6adc8fc4f6545d53373796a9
[PASS] 3. Full case fetched and matches exact schema
[PASS] 4. /api/cases/:id/reply returns ONLY {status, finalAnswer}
[PASS] 5. Case resolved successfully with employee answer
[PASS] 6. /api/cases/:id/reply returns resolved finalAnswer
[PASS] 7. Second resolve attempt returns HTTP 409 Conflict
[PASS] 8. Empty answer returns HTTP 400 Bad Request
[PASS] 9. Malformed case ID returns HTTP 400 Bad Request
[PASS] 10. V1 escalation does not create a MongoDB case
[PASS] 11. Logged-in customer case carries session customerId (ignored bogus body)

========================================
Cases Flow Test Results: 11/11 PASS
========================================
```

---

## 3. Assumptions Made

1. Password generation: `SEED_DEMO_PASSWORD` in `.env` is used to seed demo customer and agent accounts with pure JS `bcryptjs`.
2. Session cookies: `tq_session` uses `httpOnly`, `sameSite: "lax"`, and `secure: false` in development mode (`secure: true` when `NODE_ENV === "production"`).
3. Sparse indexing: For user records with `role: "agent"`, `customerId` is omitted rather than stored as `null` so that MongoDB's unique sparse index permits multiple agent accounts.
4. Concurrency: Taking seats uses conditional atomic `$inc: { "fares.$.seatsAvailable": -passengers }` with rollback if booking document insertion fails.

---

## 4. Next Step & Stop Gate

Per AGENTS.md, Phase 3A is complete and no UI has been built. The user must verify the back end and reply:
`backend approved`
before Phase 3B (Website Front End) can begin.
