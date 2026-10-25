# Phase 3B: Website Front End — Progress

Date: 2026-10-24
Status: COMPLETE (ALL CHECKS PASS)

---

## 1. Done-When Verification Checklist

| Requirement | Target | Status | Verification Evidence |
|---|---|---|---|
| Client Build | `cd client && npm run build` succeeds | PASS | Vite built 57 modules in 2.07s without errors. |
| Website API Test Suite | `node scripts/test-website-api.js` (21 checks) | PASS | 21/21 checks PASS on throwaway database `travel_qa_test` with zero LLM calls. |
| Cases Flow Test Suite | `node scripts/test-cases-flow.js` (11 checks) | PASS | 11/11 checks PASS with agent login and session customerId checks. |
| Research Data & Parsing | `validate-data.js` & `test-answer-parsing.js` | PASS | `validate-data.js` PASS (0 errors). `test-answer-parsing.js` PASS. |
| Cached Query Smoke Test | `node scripts/ask.js v2 --id q-001` | PASS | Query returned cached answer with zero new token consumption. |
| Frozen Research Isolation | `git diff --stat HEAD -- <research-files>` | PASS | Diff against HEAD prints nothing. All research files strictly untouched. |
| Secret Hygiene | No tracked file contains secrets | PASS | No tracked files contain JWT secret or password values. `.env` and `AGENTS.md` git-ignored. |

---

## 2. Components & Pages Implemented

- **Tailwind Setup**: Configured `tailwind.config.js` and `postcss.config.js` for Vite client. Preserved existing legacy plain-CSS styles in `index.css`.
- **Global Config**: `client/src/config.js` defines `AGENCY_NAME` and `DEMO_DATA_NOTICE`.
- **Auth Context & Route Guards**:
  - `client/src/auth/AuthContext.jsx`: Loads `GET /api/auth/me` on mount; exposes `user`, `loading`, `login`, `register`, `logout`.
  - `client/src/auth/RequireRole.jsx`: Guards customer and agent pages with redirect to `/login` carrying flash messages.
- **Components**:
  - `client/src/components/NavBar.jsx`: Role-aware navbar (Guest, Customer, Agent).
  - `client/src/components/Footer.jsx`: Global footer displaying demo notice disclaimer.
  - `client/src/components/FlightCard.jsx`: Displays flight details, airport local times, duration, aircraft, and fare prices.
  - `client/src/components/ChatWidget.jsx`: Floating V2 assistant on public & customer pages (omitted on `/staff/*` and `/lab/chat`). Polls `GET /api/cases/:id/reply` every 5s on escalation and cleans up intervals on unmount.
- **Routes & Pages**:
  - `/`: `Home.jsx` with search bar, popular routes, and carrier network.
  - `/flights`: `FlightSearch.jsx` with sorting (cheapest price vs departure time) and search bar.
  - `/flights/:id`: `FlightDetails.jsx` with schedule in both origin and destination local airport timezones, duration, and fare selection.
  - `/login`: `Login.jsx` with Customer/Staff tabs and demo account quick-fill buttons.
  - `/register`: `Register.jsx` with client-side form validation (email format, password >= 8 chars).
  - `/book/:flightId`: `Book.jsx` (Customer only) with 1-4 passenger selector, server-computed total price, simulated payment disclaimer ("No payment is taken (demo)"), and 409 overbooking handling.
  - `/account/bookings`: `MyBookings.jsx` (Customer only) showing booking reference numbers (`BK-xxxxx`), routes, dates, and statuses.
  - `/account/support`: `MySupport.jsx` (Customer only) displaying escalated inquiries and team member replies from `GET /api/cases/mine`.
  - `/staff/support`: `SupportQueue.jsx` (Agent only) showing pending and resolved cases with OKF/RAG evidence and asker identity.
  - `/dashboard`: Redirects to `/staff/support`.
  - `/lab/chat`: `LabChat.jsx` preserving the original researcher comparison test bench with V1/V2 selector and token tracking.

---

## 3. Assumptions Made

1. The Vite proxy forwards `/api` requests to Express on `http://localhost:3001` so that the `tq_session` cookie operates as same-origin.
2. The ChatWidget operates strictly on V2 classify-then-retrieve and sends credentials to bind customer inquiries to their session.
3. Test-split evaluation questions (`split: "test"`) were not queried through the web UI to keep the evaluation set strictly unseen before Phase 5.

---

## 4. Manual Verification Walkthrough (Executed & Verified)

1. Start the backend: `npm start` (running on `http://localhost:3001`).
2. Start the frontend: `npm run dev` (running at `http://localhost:5173`).
3. **Customer Window (Arjun Sharma):**
   - Logged in at `/login` as `arjun.sharma@email.com`.
   - Searched flights from DEL to DXB, booked 2 passengers, and verified booking under "My Bookings" with departure date and local airport times.
   - Asked the out-of-scope question in the floating Chat Widget (`"Is it safe to travel to Zorovia right now?"`).
   - Verified the widget displayed the escalation notice: `"A team member will get back to you shortly."`.
4. **Agent Window (Private / Incognito Window - Agent One):**
   - Logged in at `/login` as `agent1@travelqa.demo`.
   - Navigated to the Support Queue (`/staff/support`).
   - Verified the pending case appeared with Asker: `Arjun Sharma (arjun.sharma@email.com) [ID: cust-001]` and reason `CLASSIFIER_ESCALATE`.
   - Inspected evidence, entered an authoritative resolution reply, and submitted.
   - Verified the queue transitioned to "No Pending Cases (All customer support tickets are currently resolved.)".
5. **Customer Window Verification:**
   - Case verified in the customer window and under "My Support Requests" (`/account/support`) showing status `resolved` with the agent resolution.

