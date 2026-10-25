# Phase 4: Customer Context — Progress

Date: 2026-10-24
Status: COMPLETE (ALL CHECKS PASS)

---

## 1. Done-When Verification Checklist

| Requirement | Target | Status | Verification Evidence |
|---|---|---|---|
| Single/Selected Booking Context Resolution | Customer asking "Why was my flight delayed?" gets matching delay notice | PASS | Arjun Sharma (`cust-001`) with `BK-10002` (`SN-303`) retrieved `notice-0006` (similarity: 0.8409) and cited `[RAG:notice-0006]`. Priya Mehta (`cust-002`) with `BK-10003` (`AJ-512`) retrieved `notice-0002` (similarity: 0.8512) and cited `[RAG:notice-0002]`. |
| Multi-Booking Clarification (Zero Tokens) | Customer with multiple bookings gets options buttons with no token use | PASS | Arjun Sharma (`cust-001`, 3 bookings) asking "Why was my flight delayed?" received HTTP 200 `{ outcome: "CLARIFY", message: "Which booking do you mean?", options: [...] }` with 0 LLM calls and 0 token usage. |
| Guest / Unaffected Behavior | Guests, agents, and non-trigger questions behave exactly as before | PASS | Tested in `test-context.js`: guest callers, agent callers, questions without trigger phrases, and customers with 0 bookings leave question unchanged with `needsClarification: false`. |
| Automated Context Test Suite | `node scripts/test-context.js` (11 checks) | PASS | 11/11 checks PASS on throwaway database `travel_qa_test` covering unit tests and HTTP API integration with zero LLM calls. |
| Website API Regression Test Suite | `node scripts/test-website-api.js` (21 checks) | PASS | 21/21 checks PASS on throwaway database `travel_qa_test`. |
| Cases Flow Regression Test Suite | `node scripts/test-cases-flow.js` (11 checks) | PASS | 11/11 checks PASS with agent login and case schema checks. |
| Research Data & Parsing | `validate-data.js` & cached `ask.js v2 --id q-001` | PASS | `validate-data.js` PASS (0 errors). `ask.js v2 --id q-001` PASS from cache with 0 new token consumption. |
| Frozen Research Isolation | `git diff --stat HEAD -- <research-files>` | PASS | Diff against HEAD is strictly empty. No research files touched. |
| Secret Hygiene | No tracked file contains secrets | PASS | `.env` and `AGENTS.md` are git-ignored and untracked. No key material in tracked files. No files > 50MB. |

---

## 2. Components & Files Implemented / Modified

1. **`server/src/services/context.js`**:
   - Implemented `resolveQuestion(customer, question, bookingId)`.
   - Recognizes customer context trigger regex: `/\bmy (flight|booking|trip|ticket|journey)\b/i`.
   - Checks customer role and `customerId` from session.
   - Loads customer's bookings from MongoDB collection `bookings`.
   - If 0 bookings: leaves question unchanged (`needsClarification: false`).
   - If 1 booking or supplied matching `bookingId`: appends ` (Context: customer's booking ${bookingId}, flight ${flightNo}, ${airline}, route ${route}, ${fareClass}, travel date ${date})` and returns `{ question: augmented, booking, needsClarification: false }`.
   - If supplied `bookingId` does not belong to customer: throws error with status 400.
   - If 2+ bookings and no `bookingId`: returns `{ needsClarification: true, options: [...] }`.

2. **`server/src/routes/chat.js`**:
   - Integrates `resolveQuestion` before invoking the answer function.
   - Returns `{ outcome: "CLARIFY", message: "Which booking do you mean?", options }` with 0 LLM calls and 0 case saves when clarification is required.
   - Passes augmented question to V1/V2 engine.
   - Updates `buildCaseDoc` to store original `question`, augmented `resolvedQuestion`, and session `customerId`.
   - Returns `appliedBooking: bookingId` in chat JSON response.

3. **`client/src/components/ChatWidget.jsx`**:
   - Renders interactive selection buttons for `outcome === "CLARIFY"` and re-submits the original question with the chosen `bookingId`.
   - Displays muted `Using booking BK-xxxxx` notice when context is applied.
   - Supports preselecting a booking via `tq-open-chat-booking` event with active booking reference banner and cancel button.

4. **`client/src/pages/MyBookings.jsx`**:
   - Added an `"Ask about this booking"` button on each booking card that dispatches the `tq-open-chat-booking` event to open the ChatWidget with that booking preselected.

5. **`scripts/test-context.js`**:
   - Comprehensive automated unit and HTTP integration test suite running on a throwaway database (`travel_qa_test`) with 0 LLM calls.

6. **`scripts/verify-phase4-real-stack.js` & `docs/notes/phase4-context-findings.md`**:
   - Real-stack end-to-end verification script testing Arjun Sharma (`cust-001`) and Priya Mehta (`cust-002`) sessions.
   - Documented exact findings and notice retrieval hits.

---

## 3. Assumptions Made

1. The customer context resolution applies strictly in `routes/chat.js` for web users and is completely isolated from the research evaluation scripts (`run-eval.js`, `run-timing.js`).
2. When multiple bookings exist, options are sorted by travel date descending and created date descending.
3. The Vite proxy seamlessly handles session cookies across client and server.

---

## 4. Verification Instructions for User

1. In your browser with Arjun Sharma logged in:
   - Navigate to **"My Bookings"** (`http://localhost:5173/account/bookings`).
   - Click **"Ask about this booking"** on `BK-10002` (`SN-303`, `BOM-DXB`, `2026-01-19`).
   - The floating Chat Widget will open with the question pre-filled: `"Why was my flight SN-303 delayed?"` and a banner indicating booking `BK-10002`.
   - Click **Send**.
   - Verify the assistant returns the delay reason citing `[RAG:notice-0006]` with the tag `Using booking BK-10002`.
2. Clear the input and ask simply: `"Why was my flight delayed?"` (without preselecting a booking).
   - Verify the assistant responds with: `"Which booking do you mean?"` and shows selectable booking buttons.
   - Click one of the booking buttons and verify the answer is returned directly for that flight.
