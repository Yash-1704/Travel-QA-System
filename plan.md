# Travel Agency QA System: Simplified Project Guide

**RAG-only baseline vs. OKF + RAG with LLM routing**

Last updated: October 24, 2026 (added Phase 3, the travel agency website with authentication; later phases renumbered to 4, 5A, 5B and 6; earlier reconciliation with AGENTS.md covered the active Groq model and limits, 10-second call spacing, and explicit stale/conflict evaluation caveats)

**How to use this file.** Read sections 1 to 5 to understand what you are building and why. Section 6 is the phase-by-phase build map you follow while coding. Sections 7 and 8 cover the evaluation and the paper. Sections 9 to 12 are reference (what to learn, tech stack, key terms, future work).

---

## 1. The project in one page

**What it is.** A web app where a customer asks a travel support question (cancellations, visas, baggage, delays, bookings) and gets an answer with its source cited. Two versions of the system are built and compared: one uses RAG only (a standard vector store baseline), the other combines curated policies (OKF) with RAG and uses the LLM to classify the question type before retrieving.

**The product around it.** The question answering system lives inside a small travel agency website (Phase 3). Customers and agency staff log in with different roles; customers search flights, view flight details and make demo bookings; staff work the queue of questions the system escalates to a human. The website is the product shell around the research system. The research contribution is only the V1 versus V2 comparison described below, and the website itself is not evaluated.

**How it works.**

**V1: RAG-only baseline**

- Each complete policy file and each event notice is stored as one item in a single vector store.
- For each question, retrieve the top 3 most similar items and generate an answer.
- No routing logic; the LLM answers from whatever retrieves.

**V2: OKF + RAG with LLM-first routing**

- Two knowledge sources: OKF files (curated policies on visa, baggage, cancellations) and a RAG vector store (event notices, delays, incident reports).
- The LLM classifies the question type first — before any retrieval — based only on the question text.
- Based on the classification, the system retrieves from the appropriate source(s) only, then generates an answer.
- If neither source has relevant information, escalate to a human.

**The research contribution (the paper):**
Compare V1 (RAG-only) vs V2 (LLM-classified routing + OKF + RAG) on:

- Answer accuracy (does routing to the right source lead to better answers?)
- Routing reliability (does the LLM correctly classify question types?)
- Latency and token cost (does routing to a smaller, targeted source save time and tokens?)

**Built in versions.** Each version is complete on its own:

| Version       | What it does                                                               |
| ------------- | -------------------------------------------------------------------------- |
| V1            | RAG-only baseline: all documents in one vector store, retrieve and answer  |
| V2            | LLM classifies question type first, then retrieves from OKF or RAG or both |
| Website (Phase 3) | Travel agency website: customer and agent login, flight search, flight details, demo bookings, staff support queue (product shell, not evaluated) |
| Customer context (Phase 4, optional) | Resolve "my flight" to the logged-in customer's actual bookings in MongoDB |

**One-sentence pitch for your mentor.** "We study whether asking an LLM to classify a question before retrieval — routing it to curated policies or event data — produces more accurate answers than a standard RAG-only system that retrieves from everything at once."

---

## 2. Background and constraints

- This is a college project titled "Question Answering System for Automated Customer Relationship Management." The title is a general direction, not a strict requirement.
- The mentor wants a technically strong project with a real research component, leading to a research paper.
- It must be primarily a web application, buildable by one student in the available time, and understandable by you end to end.
- Focus: build V1 and V2 fully and test them. The website around them (Phase 3) is time-boxed, and customer context (Phase 4) is optional if time allows.
- Because the project must be primarily a web application, Phase 3 wraps the system in a travel agency website with login for two roles (customer and agent). The evaluation never goes through the website: the scripts call `answerV1` and `answerV2` directly.
- Avoid complex weight tuning and threshold tweaking; the LLM classification handles routing.
- AI may generate the data (policy files, synthetic notices, test questions) and help with code.

---

## 3. The two knowledge sources and why both are needed

### OKF: "What is the rule?"

OKF is Google Cloud's open specification (announced in 2026, now at v0.2) for storing curated knowledge as markdown files with YAML frontmatter. In this project it holds facts that are true for every customer:

- visa requirements by country
- baggage allowance by airline and fare class
- cancellation and refund policies
- loyalty program terms

These facts are written down and verified by someone. **When a policy changes, you edit the OKF file.** That is the whole maintenance story.

### RAG: "What happened?"

RAG is the standard pipeline: split text into chunks, turn each chunk into a vector (an embedding), store the vectors in a vector database, and at question time retrieve the most similar chunks and give them to an LLM. In this project it holds unstructured event text that nobody curates into a policy file:

- flight delay notices ("Flight AI-202 was delayed 3 hours on Oct 10 due to crew unavailability")
- incident reports (baggage irregularities on a route)
- advisories and operational notices

### How the LLM classifies and routes (V2 approach)

The LLM classifies the question type based on the question text alone — before any retrieval happens. This is a single, fast LLM call that returns one of four labels. Then the system retrieves only from the appropriate source(s).

**Why classify first, retrieve second:** If you retrieve first and then ask the LLM to pick the better-looking evidence, you are not really routing — you are just letting the LLM pick whichever retrieved result looks more relevant. That is not meaningfully different from V1. Classifying first makes the routing decision independent of retrieval quality, which means you can measure routing accuracy separately from answer accuracy. It also means OKF-only questions skip the vector search entirely, which is faster and cheaper.

Example routing:

| Question                                                 | LLM classifies | Why                                                                |
| -------------------------------------------------------- | -------------- | ------------------------------------------------------------------ |
| What is the cancellation fee?                            | OKF_ONLY       | Asking for a policy rule                                           |
| Do I need a visa for Japan?                              | OKF_ONLY       | Asking for a rule                                                  |
| Why was flight AI-202 delayed on October 10?             | RAG_ONLY       | Asking about a specific event                                      |
| Are there baggage problems on the Dubai route this week? | RAG_ONLY       | Asking about recent incidents                                      |
| Can I get compensation for my 4-hour delay?              | HYBRID         | Needs the compensation rule (OKF) AND the facts of the delay (RAG) |
| Can I bring my pet snake on board?                       | ESCALATE       | Not covered by any source                                          |

**V1 hypothesis:** A mixed collection may create cross-source ranking interference: an event notice could occupy a top-three result for a policy question, or a policy document could rank above a relevant notice. Each policy is stored as one complete document, so truncation of a policy condition is not part of this design. Treat ranking interference as a hypothesis to evaluate, not a demonstrated V1 result.

**Why classify-then-retrieve may help:** Retrieving from the source selected by the question type may reduce cross-source ranking interference. This is the hypothesis V2 tests; results must establish whether it occurred.

### What this project does NOT do

- It does **not** use past agent replies in support tickets as a source of policy. If a policy changes, the OKF file is updated.
- It does **not** use RAG for customer-specific data such as bookings. That is an exact lookup in a table (Phase 4, optional), not a similarity search.
- It does **not** put website data (users, flights, bookings) into the OKF files, `notices.json` or either Chroma collection. Website data lives only in MongoDB, so website activity cannot change the evaluation corpus.
- It does **not** try to decide which of two contradicting sources is right. If the evidence contradicts itself, it escalates to a human.

---

## 4. What OKF provides and what we build

OKF is a file format with optional metadata. It stores curated policies but does not compute routing or confidence scores. **The LLM-based routing, escalation logic, and evaluation are this project's own design.**

Spec: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

| OKF provides                                                              | This project builds                                                                                                                                                         |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Markdown files with YAML frontmatter; only `type` is required             | Travel policy files in OKF format, and a parser to read them                                                                                                                |
| Optional metadata fields (`sources`, `verified`, `stale_after`, `status`) | Used for citing sources in answers; not used for routing or scoring                                                                                                         |
| Nothing for retrieval or routing                                          | The LLM classifier (classify question type from the question alone), retrieval from the chosen source(s), the escalation decision, and the evaluation (V1 vs V2 comparison) |

Read the spec yourself before generating files.

---

## 5. System design

### 5.1 Architecture

```
Browser: React website (public pages, customer area, staff area)
        |   customers and agents log in; session cookie
        |   chat widget on the site
        v
Express  POST /api/chat   (login optional; adds the customer id when logged in)
        |
        v
   [V1 path]                    [V2 path]
  Retrieve top 3 items         Ask LLM to classify question:
   from `combined` collection   "OKF_ONLY / RAG_ONLY / HYBRID / ESCALATE"
        |                               |
        |                    Based on classification:
        |                    - OKF_ONLY: keyword match OKF files
        |                    - RAG_ONLY: vector search `notices` collection
        |                    - HYBRID: both of the above
        |                    - ESCALATE: skip to human fallback
        |                               |
        +---------> LLM answer (Groq, `qwen/qwen3.8-27b`)
                    answers ONLY from the retrieved evidence
                               |
                   +-----------+------------------+
                   |                              |
             answer + citations           INSUFFICIENT / CONFLICT / ESCALATE
             back to customer                     |
                                          Human fallback:
                                          -> MongoDB "cases"
                                          -> Staff support queue (agent login)
                                          -> employee writes answer
                                          -> answer sent to customer
```

### 5.2 The LLM-based router (V2)

**Critical design principle: classify first, retrieve second.**

The classification call uses only the question text. It does not see any retrieved evidence. This makes the routing decision clean, testable, and independent of retrieval quality — you can measure routing accuracy separately from answer accuracy.

**Step 1: Classify the question (one LLM call, question text only)**

```
You are a question classifier for a travel support system.
Given the customer's question, classify it as exactly one of:

- OKF_ONLY   — the question asks about a policy or rule (cancellation fees,
               visa requirements, baggage limits, loyalty terms)
- RAG_ONLY   — the question asks about a specific event or incident
               (a flight delay, a baggage report, an operational notice)
- HYBRID     — the question needs both a policy rule AND event facts
               (e.g. compensation for a specific delay: needs the rule
               AND the delay record)
- ESCALATE   — the question is out of scope, too vague to route, or
               not covered by any travel policy or event record

Reply with exactly one of the four labels above and nothing else.

Question: {question}
```

**Step 2: Retrieve from the appropriate source(s) only**

- **OKF_ONLY:** keyword match against all OKF files. Score each file as (keywords from question found in file title + topic + tags) / (total question keywords). Keep the top-scoring file. If score is 0 (nothing matched), go to ESCALATE.
- **RAG_ONLY:** vector search over the `notices` Chroma collection. Retrieve top 3 chunks by cosine similarity. If the best similarity is below 0.3, go to ESCALATE.
- **HYBRID:** do both of the above. If either returns nothing, use whichever worked. If neither works, go to ESCALATE.
- **ESCALATE:** skip retrieval entirely. Save case to MongoDB and go to human fallback.

**Step 3: Generate the answer (one LLM call)**

```
You are a travel agency support assistant.
Answer the customer's question using ONLY the evidence below.
Cite the evidence you used: [OKF:filename] or [RAG:chunk-id].
If the evidence does not contain enough information to answer,
reply with exactly: INSUFFICIENT
If pieces of evidence contradict each other on the facts needed to answer,
reply with exactly: CONFLICT
Do not use outside knowledge.

Evidence:
{evidence}

Question: {question}
```

If the model replies `INSUFFICIENT` or `CONFLICT`, treat it as ESCALATE. V1 and V2 use this identical answer prompt, so the comparison stays fair. The system never picks a winner between contradicting sources; a human decides.

**Why this order matters for the paper:** You can now report two separate accuracy numbers — routing accuracy (did the LLM pick the right source type?) and answer accuracy (given the right source, did the answer match the correct answer?). This lets you distinguish between "the routing failed" and "the retrieval or generation failed," which makes the error analysis in the paper much richer.

### 5.3 Human fallback workflow

**When it triggers:** LLM classifies as ESCALATE; retrieval returns nothing above threshold; the answer LLM replies INSUFFICIENT or CONFLICT.

1. The customer sees "A team member will get back to you shortly." The case is saved to MongoDB with status **pending**.
2. An employee (a user with the agent role) logs in, opens the support queue, and sees pending cases in a list.
3. Clicking a case shows:
   - the customer's question
   - the LLM's classification (or "ESCALATE")
   - OKF file found (if any) with excerpt and metadata
   - RAG chunks found (if any) with timestamps
   - reason for escalation
4. The employee writes and submits an answer. The case becomes **resolved** and the answer is sent to the customer (it appears in the open chat and, if the customer was logged in, under My support requests).

**Dashboard scope:** the support queue already exists from Phase 2B (pending and resolved lists, expandable evidence, answer box). Phase 3 moves it into the staff area behind the agent login and shows who asked when the customer was logged in; it is not redesigned. Plain UI, functional only.

### 5.4 Travel agency website and authentication (Phase 3)

The question answering system sits inside a small travel agency website, so the project is a usable web application and not only a chat box. The website is a product shell: it is built after V2 works and before the evaluation freezes, and it does not change how questions are answered.

**Roles.** There are two roles. Guests (not logged in) can still browse and use the chat.

| Role | How the account is created | What it can do |
| --- | --- | --- |
| Guest | none | Browse and search flights, view flight details, use the chat widget. Escalated questions are saved as cases, but a guest has no inbox, so the answer appears only in the open chat |
| Customer | Registers on the site, or one of the seeded demo accounts | Everything a guest can, plus book flights, see their own bookings, and see their own escalated questions with the staff reply |
| Agent | Seeded only; there is no public sign-up for agents | Work the support queue (read the evidence, write the reply) and view all bookings read-only. Agents cannot book |

**Pages (React Router).**

| Route | Who | What it shows |
| --- | --- | --- |
| `/` | everyone | Landing page: flight search form, popular routes, the airlines, a note that all data is demo data |
| `/flights` | everyone | Search results for origin, destination, date and passengers, sortable by price and departure time |
| `/flights/:id` | everyone | Flight details: airline, flight number, route, departure and arrival in each airport's local time, duration, fare classes with price and seats left, a Book button |
| `/login`, `/register` | guests | Log in as customer or staff (a role tab changes the wording; the server decides the role from the account); customer sign-up |
| `/book/:flightId` | customer | Choose fare class and 1 to 4 passengers, review, confirm (no payment is taken) |
| `/account/bookings` | customer | Own bookings, upcoming and past, with booking reference and status |
| `/account/support` | customer | Own escalated questions with status and the staff reply |
| `/staff/support` | agent | The support queue from Phase 2B (pending and resolved, evidence, reply box), now behind the agent login and showing who asked |
| `/staff/bookings` | agent | All bookings, read-only (nice to have) |
| `/lab/chat` | everyone | The original chat page with the V1/V2 selector and token line, kept for demos and paper screenshots |

A floating chat widget (V2 only, no selector) appears on every public and customer page and uses the same `POST /api/chat`.

**Data.** Website data lives only in MongoDB.

| Collection | Main fields |
| --- | --- |
| `users` | `role` (`customer` or `agent`), `name`, `email` (unique, lower case), `passwordHash`, `customerId` (customers only, for example `cust-001`), `createdAt` |
| `flights` | `flightNo`, `airline`, `origin`, `destination`, `route` (for example `DEL-DXB`), `departureAt` and `arrivalAt` (UTC), `aircraft`, `fares`: a list of `{ fareClass, price, seatsAvailable }` |
| `bookings` | `bookingId` (`BK-xxxxx`), `customerId`, `flightNo`, `route`, `airline`, `fareClass`, `date`, `status` (`confirmed` or `completed`), `passengers`, `totalPrice`, `source` (`seed` or `website`), `createdAt`. The first eight fields keep the names used in `data/seed/bookings.json`, so Phase 4 works the same on seeded and new bookings |
| `counters` | One document that hands out booking numbers atomically |

**Authentication design (kept small enough to explain).**

- Passwords are hashed with bcrypt (`bcryptjs`, pure JavaScript, so it installs without native builds). Plain passwords are never stored, logged or returned.
- Login sets a signed token (JWT, `jsonwebtoken`) in an httpOnly, sameSite=lax cookie. The token holds only the user id and role, and the server reloads the user on each request, so a deleted user or a changed role takes effect immediately. The secret is `JWT_SECRET` in `.env`.
- Middleware `requireAuth`, `requireRole("agent")` and `optionalAuth` guard the routes. The React route guards only hide pages from the wrong role; the server check is the real protection.
- `POST /api/chat` uses `optionalAuth`: when a customer is logged in, the saved case gets their `customerId` from the session. A `customerId` sent in the request body is ignored.
- Login attempts are limited with a small in-memory limiter (no extra service). State-changing routes accept JSON only.
- Booking prices are always computed on the server from the flight record. The client never sends a price.

**Booking rules.** The flight must depart in the future, there must be 1 to 4 passengers, and the fare class must exist on that flight. Taking seats is one conditional atomic update, so two customers cannot take the last seat. MongoDB runs standalone here (no transactions), so if the booking insert fails the code gives the seats back. Payment is simulated: the confirm button states that no payment is taken.

**Case access rules.** `GET /api/cases`, `GET /api/cases/:id` and `POST /api/cases/:id/resolve` are agent-only. A customer reads their own cases through `GET /api/cases/mine`. `GET /api/cases/:id/reply` stays open for guest cases (the chat widget polls it), but for a case that belongs to a customer only that customer or an agent can read it.

**Seed data and consistency rules (the website must not contradict the evaluation data).** `scripts/seed-db.js` is idempotent. It creates the demo accounts (the three customers from `data/seed/bookings.json` plus two agents; the password comes from `SEED_DEMO_PASSWORD` in `.env`, never from the code), the six seed bookings (status `completed`), and flights for the next 60 days generated from a new file, `data/seed/flight-templates.json`. Re-running it extends the flight window without resetting seat counts or removing bookings made on the site. Rules for the flight templates:

- Use only the airlines, routes, flight numbers and fare class names in `docs/universe.md` and the delay notices. Do not invent return legs that the universe does not define.
- Never create a flight number that the evaluation treats as nonexistent: `AJ-511`, `SN-505`, `VA-802`.
- `AJ-411` departs Mumbai at 05:00 local time (notice-0020). `VA-902` has no departures from 1 to 31 October 2026 (notice-0024).
- Flight records contain no delay or disruption information. That lives only in the notices.
- Fares are demo prices in USD and are labelled as such on the site. They are never added to the OKF files.

**Known and accepted gaps.** The chatbot does not know about fares, seats left, or the customer's own bookings (until Phase 4), so a question like "how much is a ticket to Dubai?" escalates. This matches the evaluation's no-evidence category and is deliberately left as it is. Not in scope: payments, cancellations and changes, seat selection, e-mail, password reset, agents creating flights.

**Evaluation isolation.** Phase 3 must not change the research code: `answer.js`, `classifier.js`, `prompts.js`, `rag.js`, `okf.js`, `okfLoader.js`, `llm.js`, `embed.js`, the existing values in `config.js` (new keys such as `JWT_SECRET` may be added), the OKF files, `notices.json` or `questions.json`. `run-eval.js` calls `answerV1` and `answerV2` directly, never through HTTP, so logins never touch it.

### 5.5 Customer context (Phase 4, optional)

If time allows: when a customer asks "Why was my flight delayed?", the system needs to know which flight.

- Customers already log in through the website (Phase 3). The customer id comes from the session cookie, never from the request body.
- The backend looks up that customer's bookings in the `bookings` collection from Phase 3 (seeded history plus bookings made on the site: flight number, airline, date, etc.).
- The flight number is added to the question before classification, so the classification and retrieval use the full context.
- If the customer has multiple bookings, the bot asks which one.

### 5.6 Data you will create (mostly with AI help, always reviewed by you)

**OKF policy file (check exact field formats against the v0.2 spec):**

```markdown
---
type: policy
title: Cancellation and refund policy, ExampleAir economy fares
topic: cancellation
sources: ExampleAir fare rules, internal policy document
verified: 2026-09-01
stale_after: 2027-03-01
status: current
---

Economy fares can be cancelled up to 24 hours before departure for a full refund
minus a fee of 50 USD. Within 24 hours of departure, the fare is not refundable.
```

**RAG chunk (stored in Chroma with metadata):**

```json
{
  "id": "notice-0412",
  "text": "Flight AI-202 on 2026-10-10 was delayed by 3 hours due to crew unavailability.",
  "metadata": {
    "source_type": "delay_log",
    "timestamp": 1760054400,
    "flight_no": "AI-202",
    "route": "DEL-DXB"
  }
}
```

**Test question (evaluation file):**

```json
{
  "id": "q-031",
  "category": "hybrid",
  "question": "Can I get compensation for my 4-hour delay on AI-202?",
  "expected_outcome": "HYBRID",
  "correct_answer": "Yes, under the delay compensation rule for delays over 3 hours...",
  "key_facts": ["3 hours", "compensation"],
  "split": "test"
}
```

`expected_outcome` must be exactly one of the four classifier labels: `OKF_ONLY`, `RAG_ONLY`, `HYBRID`, `ESCALATE`. This is what makes routing accuracy computable by direct string comparison.

**Website seed data (Phase 3, separate from the evaluation data).** `data/seed/flight-templates.json` is a new file with one template per route: airline, flight number, origin, destination, local departure time, duration, aircraft, and fare classes with demo prices and seat counts. `scripts/seed-db.js` expands it into dated flights. The rules that keep it consistent with the evaluation data are in section 5.4. The existing `bookings.json` is unchanged.

### 5.7 Project structure, API, and data model

```
travel-qa/
  client/
    src/config.js                 agency name and demo-data notice (one place to change)
    src/auth/                     AuthContext and route guards (RequireRole)
    src/components/               NavBar, Footer, ChatWidget, FlightCard, ...
    src/pages/                    Home, FlightSearch, FlightDetails, Login, Register, Book,
                                  MyBookings, MySupport, LabChat (the original chat page),
                                  staff/SupportQueue, staff/Bookings
  server/
    src/index.js
    src/middleware/auth.js     requireAuth, requireRole, optionalAuth
    src/routes/auth.js         register, login, logout, me
    src/routes/flights.js      flight search and details (public)
    src/routes/bookings.js     create and read bookings
    src/routes/chat.js         POST /api/chat (login optional)
    src/routes/cases.js        human fallback (agents; customers read their own)
    src/services/okf.js        load OKF files, keyword scoring (V2 only)
    src/services/rag.js        chunk, embed, Chroma query (V1 and V2)
    src/services/classifier.js LLM-based question classification (V2 only)
    src/services/llm.js        Groq calls; caches latency and token counts
    src/services/db.js         MongoDB for users, flights, bookings and cases
  data/okf/*.md                OKF policy files (V2 only)
  data/rag/notices.json        Unstructured event notices
  data/eval/questions.json     Test question set with expected answers
  data/seed/bookings.json      Demo customers and their six past bookings
  data/seed/flight-templates.json  Route templates used to generate demo flights (Phase 3)
  scripts/ingest-rag.js        Embed notices; build `combined` (V1) and `notices` (V2) Chroma collections
  scripts/seed-db.js           Seed demo users, bookings and flights into MongoDB
  scripts/test-website-api.js  Checks login, roles, booking and case access rules
  scripts/run-eval.js          Run V1 and V2 on test questions; measure accuracy, latency, tokens
  cache/llm-cache.json         Cache all LLM outputs keyed by exact prompt
```

| Endpoint | Who | Purpose |
| --- | --- | --- |
| `POST /api/auth/register` | guest | Create a customer account |
| `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | any | Start and end a session; read the current user |
| `GET /api/flights?from=&to=&date=&passengers=` | everyone | Search flights |
| `GET /api/flights/:id` | everyone | Flight details with fares and seats left |
| `POST /api/bookings` | customer | Body: `{ flightId, fareClass, passengers }`. Returns the booking |
| `GET /api/bookings/mine` | customer | Own bookings |
| `GET /api/bookings/:bookingId` | owner or agent | One booking |
| `GET /api/staff/bookings` | agent | All bookings, read-only |
| `POST /api/chat` | everyone | Body: `{ question, system? }`. Returns `{ outcome, answer?, citations, caseId? }`. The customer id comes from the session |
| `GET /api/cases?status=pending` | agent | Support queue |
| `GET /api/cases/mine` | customer | Own escalated questions and replies |
| `GET /api/cases/:id` | agent | Evidence view for one case |
| `POST /api/cases/:id/resolve` | agent | Employee's final answer |
| `GET /api/cases/:id/reply` | guest cases: anyone with the id; customer cases: owner or agent | Status and final answer only |

**MongoDB collections:** `users`, `flights`, `bookings`, `counters` (booking numbers), `cases`, `experiment_logs`. The earlier `customers` collection is replaced by `users`: a customer account carries the `customerId` (for example `cust-001`) that links it to the seeded bookings.

Example `cases` document:

```json
{
  "_id": "...",
  "question": "Can I bring my pet snake on board?",
  "status": "pending",
  "llmClassification": "ESCALATE",
  "reason": "out_of_scope",
  "okfEvidence": null,
  "ragEvidence": [],
  "finalAnswer": null,
  "customerId": null,
  "createdAt": "2026-10-16T10:00:00Z",
  "resolvedAt": null
}
```

`experiment_logs` holds one document per (system, question, run): `systemName`, `questionId`, `llmClassification`, `outcome`, `answer`, `correct`, `latencyMs`, `classifyMs`, `retrievalMs`, `llmMs`, `tokens`, `runId`.

Note `classifyMs` — log classification time separately from retrieval and generation. This lets you report the latency cost of the classification step in the paper.

**Chroma collections:**

- `combined`: all 18 complete OKF policy files (one item per file) plus 30 notices. Used by V1 only.
- `notices`: event notices only. Used by V2's RAG retrieval.

---

## 6. Progressive build map

Phases are what you type to the coding agent. V1 and V2 are the two systems that get compared; the website is the product around them and is not one of the compared systems.

| Phase | Version | What gets built |
| --- | --- | --- |
| Phase 0 | | Setup, data intake, verification |
| Phase 1 | V1 | RAG-only baseline |
| Phases 2A-1, 2A-2, 2B | V2 | Classifier (then your approval), classify-first routing, human fallback and support queue |
| Phase 3 (3A, 3B) | | Travel agency website with authentication |
| Phase 4 (optional) | | Customer context from the logged-in customer's bookings |
| Phases 5A, 5B | | Evaluation tooling and dev run (then the freeze), frozen test run and timing |
| Phase 6 | | Paper draft |

### Phase 0: Foundations and data (about 1 week)

1. Learn concepts 2 to 6 from section 9 (embeddings through RAG pipeline).
2. **Design the evaluation first** (section 7): fix the question categories and what a correct answer looks like.
3. Generate the data with AI: 15–18 OKF policy files, 30 synthetic event notices (with timestamps and source types), and 84 test questions with expected answers and key_facts. Review all of it before moving on. (You already have this data from a previous step — verify it is in place.)

### Phase 1 (V1): RAG-only baseline (about 1 week)

- **Goal:** build the RAG-only system. Store each complete OKF file and each notice as one item in a Chroma collection called `combined`. Answer from whatever retrieves.
- **Build:** Express `/api/chat` endpoint; embed the complete OKF files and notices with Gemini, store them in Chroma `combined` (cosine distance), retrieve the top 3 items by similarity; one Groq call that answers from that evidence; React chat page showing the answer and citations.
- **You learn:** embeddings, vector databases, similarity search, the full RAG pipeline end to end, Groq API calls with a constrained system prompt.
- **Done when:** 10 questions (mix of policy and event) return reasonable answers with source item IDs cited.
- **This is your baseline.** Everything is compared against V1.
- **Hypothesis to evaluate:** top-three retrieval from the mixed collection may rank a different source type above relevant evidence. Policy-condition truncation is not applicable because each complete policy file is stored as one item. Do not claim cross-source interference occurred unless the observed results support it.

### Phases 2A-1, 2A-2 and 2B (V2): LLM classification + OKF + RAG routing (about 2 weeks)

- **Goal:** classify the question type first, then retrieve from only the appropriate source.
- **Build:**
  - `classifier.js`: one Groq call with the classification prompt from section 5.2 step 1. Returns one of four labels.
  - `okf.js`: load and parse all OKF `.md` files with gray-matter; keyword score each file against the question; return the best match.
  - Second Chroma collection `notices`: just the event notices (already have `combined` for V1; create `notices` separately).
  - Router logic in `chat.js`: call classifier → retrieve from chosen source(s) → call answer LLM.
  - Human fallback: if classification is ESCALATE, or retrieval returns nothing, or answer LLM says INSUFFICIENT or CONFLICT → save case to MongoDB → show in employee dashboard.
  - Employee dashboard: list of pending cases, each showing the question, evidence, classification, and an answer text box.
- **You learn:** LLM-based classification, structured prompting, gray-matter OKF parsing, MongoDB case storage, a simple React dashboard.
- **Done when:** policy questions are classified as OKF_ONLY and answered from OKF files; event questions are classified as RAG_ONLY and answered from notices; hybrid questions use both; out-of-scope questions appear in the employee dashboard; the employee's answer reaches the customer.
- **No threshold tuning:** the only numeric threshold is the 0.3 minimum similarity for RAG — set it once and leave it.

### Phase 3: Travel agency website with authentication (about 1.5 to 2 weeks, time-boxed)

- **Goal:** turn the chat demo into a believable travel agency product. Customers and staff log in, customers search flights and make demo bookings, and staff work the escalation queue. The answering system itself is unchanged. Design details are in section 5.4.
- **Why here:** V2 and the case flow already work (Phase 2B), and the evaluation freeze (Phase 5A) locks all code under `server/`. Every back end change the website needs must be finished and committed before that freeze.
- **Split in two, so you verify the back end before building screens on it:**
  - **Phase 3A: back end foundation (about 3 to 4 days).** The `users`, `flights`, `bookings` and `counters` collections; password hashing and the login, logout and `me` routes; the auth middleware; flight search and details; the booking route with the atomic seat update; protecting the cases routes and adding `GET /api/cases/mine`; `scripts/seed-db.js` and the flight templates; `scripts/test-website-api.js`; and updating `scripts/test-cases-flow.js` so it logs in as an agent. Then STOP and verify.
  - **Phase 3B: front end (about 1 to 1.5 weeks).** Tailwind setup (the existing chat styles must keep working), the auth context and route guards, nav bar and footer, the pages in section 5.4, the chat widget, the customer support inbox, and the staff area.
    - Must have: home with search, results, flight details, login and sign-up, booking, my bookings, chat widget, my support requests, staff support queue, `/lab/chat`.
    - Nice to have: staff bookings table, sorting and filters, a read-only "recent notices" panel on the flight page (from `notices.json`).
- **You learn:** password hashing, cookie sessions, role-based authorization on the server and in React, protected routes, form validation, an atomic MongoDB update, responsive layout with Tailwind.
- **Done when:**
  1. `node scripts/seed-db.js` run twice gives the same counts (5 users, 6 seeded bookings, no duplicate flights) and prints the demo logins once.
  2. `node scripts/test-website-api.js` is all PASS: wrong password gives 401; duplicate email gives 409; anonymous and customer calls to `/api/cases` are rejected and an agent is allowed; a booking reduces seats exactly once; overbooking is rejected; reading someone else's booking or case is rejected; no response contains a password hash.
  3. `node scripts/test-cases-flow.js` is still all PASS (now with the agent login).
  4. `cd client && npm run build` succeeds.
  5. Manual walkthrough. As a customer: search DEL to DXB, open a flight, book two passengers, see the booking with correct local times, then ask the widget "Can I bring my pet snake on board?" and see the escalation message. In a second browser as an agent: the case appears with the customer's name; resolve it. Back as the customer, the reply shows in the widget and under My support requests.
  6. The research code is untouched: `git diff --stat` shows no change to the frozen files listed in section 5.4; `node scripts/test-answer-parsing.js` and `node scripts/validate-data.js` still pass; `node scripts/ask.js v2 --id q-001` returns the cached answer with no new tokens.
- **Rules while you build and demo:** do not type test-split questions (`"split": "test"` in `questions.json`) into the site before the freeze, because looking at their outputs invites tuning. The chat draws on the same free Groq daily token cap as the evaluation, so keep demos off the quota days reserved for evaluation runs.
- **Time box:** if the deadline slips, cut the nice-to-have items first. Never cut Phases 5A to 6, because the paper depends on them.

### Phase 4 (optional, if time allows): Customer context (about 2 to 4 days)

- **Goal:** resolve "my flight" to the logged-in customer's actual booking.
- **Build:** `services/context.js` with `resolveQuestion`, applied in `routes/chat.js` before `answerV2` (the evaluation scripts never use it). For a logged-in customer whose question mentions "my flight", "my booking", "my trip", "my ticket" or "my journey": no bookings leaves the question unchanged; one booking, or a supplied `bookingId` that belongs to them, appends that booking's details; two or more bookings with no `bookingId` returns "Which booking do you mean?" with buttons and makes no LLM call. The chat widget shows the buttons, and My bookings gets an "Ask about this booking" link.
- **Uses what Phase 3 built:** the bookings, the login session and the seed script. There is no separate login dropdown, and the customer id never comes from the request body.
- **Done when:** a seeded customer with one matching booking asks "Why was my flight delayed?" and gets the matching delay notice, or the gap is recorded as a finding without tuning anything; a customer with several bookings gets the "which booking" buttons with no token use; guests behave exactly as before.

### Phases 5A and 5B (Step 5): Evaluation run (about 1 week)

Phase 5A builds the evaluation tooling and runs the dev split, then stops so you can make the freeze commit and tag. Phase 5B runs the frozen test split once, then the timing study and the review queue. Everything under `server/`, including the website and customer context work of Phases 3 and 4, must be committed before the freeze, because Phase 5B stops if `server/` has changed since the tag.

1. Run V1 and V2 on the dev set (28 questions) first to catch bugs, then once on the frozen test set (56 questions). Cache all LLM outputs in `cache/llm-cache.json`. Spread runs over 2 or more days to respect Groq's daily token limit (section 7, practical rules).
2. For each question, log: systemName, questionId, llmClassification (V2 only), outcome, answer, whether it matched correct_answer, latencyMs broken into classifyMs + retrievalMs + llmMs, tokens.
3. Compute per-category accuracy, wrong answer rate, escalation rate, token cost. For V2 also compute routing accuracy (did the LLM classification match expected_outcome?).
4. Run a separate timing run: bypass the cache, run a 20-question subset 3 times for both systems in one session, report median and p95 latency.
5. **Error analysis:** for every wrong answer and every wrong classification, write one sentence explaining why it failed.

### Phase 6 (Step 6): Write the paper (section 8)

---

## 7. Evaluation

### Test set

**84 questions: 7 categories with 12 each.** 4 per category (28 total) form the development set used only to verify the system works. 8 per category (56 total) are the final test set, run once after everything is built.

| Category                                          | Expected V2 outcome | What it tests                                                                                                                    |
| ------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Policy question, strong OKF match                 | OKF_ONLY            | Does the LLM correctly classify policy questions? Does OKF give a better answer than V1?                                         |
| Event question, strong RAG match                  | RAG_ONLY            | Does the LLM correctly classify event questions?                                                                                 |
| Hybrid (compensation = rule + event)              | HYBRID              | Can V2 use both sources together? Does V1 struggle here?                                                                         |
| Policy question, OKF file is past its review date | OKF_ONLY            | Neither system checks staleness (no metadata signals are used). Scored like a normal policy question; documented as a limitation |
| Event question with no matching records           | ESCALATE            | Both systems should admit insufficient evidence; does V1 hallucinate?                                                            |
| Ambiguous or out-of-scope question                | ESCALATE            | Does V2 classify correctly? Does V1 guess?                                                                                       |
| Sources give conflicting information              | ESCALATE            | Does the answer LLM reply CONFLICT? Counted as correct when the system escalates this way                                        |

**Scoring caveat for the stale-policy category:** the 12 questions in `human_fallback_stale` are deliberately tied to outdated values in the stale policy file body, and the system is explicitly not allowed to use staleness metadata. The frozen test set contains 8 questions from this category (the other 4 are dev). A match in this category means the answer matched the provided stale source; it does **not** mean the answer is current real-world policy. Preserve the category and its prescribed scoring, but report headline overall correctness, answer accuracy, and wrong-answer rate both across all 56 frozen-test questions and separately excluding this category (48 questions). Label the latter as a sensitivity analysis; keep all 56 as the primary result.

**Conflict-category caveat:** the category is scored correct only when the answer system escalates with `CONFLICT`, not merely when it escalates for any reason. The retrieval opportunities are asymmetric by design: V1 can return three items from the combined collection, while V2's OKF matcher returns at most one OKF file and the classifier may route directly to `ESCALATE` without retrieving evidence. Report whether each system actually retrieved both the airline-specific cancellation file and `refund-policy-general.md`. Do not interpret an apparent advantage in this category as general system superiority; discuss the retrieval asymmetry as a limitation.

**Labels:** expected answers are defined from the synthetic corpus. Use `key_facts` strings for auto-checking; manually review answers that fail the substring match. The stale-policy qualification above must be kept visible when reporting results.

### Systems compared

| System                         | What it is                                                                                                                                                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V1: RAG-only**               | One Chroma collection (`combined`) containing each complete OKF file as one item plus notices. Top-3 similarity retrieval. No classification. Always answers; escalates only if answer LLM says INSUFFICIENT or CONFLICT.                                             |
| **V2: LLM-classified routing** | LLM classifies question type from the question text alone. Retrieves from OKF files or `notices` collection or both based on classification. Escalates when classified as ESCALATE, when retrieval returns nothing, or when answer LLM says INSUFFICIENT or CONFLICT. |

### Metrics

| Metric                          | Measured how                                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Answer accuracy**             | % of answered questions where the answer contains all key_facts                                                        |
| **Wrong answer rate**           | % of all questions where the system answered with a factually wrong answer                                             |
| **Routing accuracy (V2 only)**  | % of questions where llmClassification matches expected_outcome                                                        |
| **Escalation rate**             | % of questions escalated to human                                                                                      |
| **Unnecessary escalation rate** | % of escalations on questions that had a known correct answer available                                                |
| **Latency**                     | Median and p95 wall-clock time. Report classifyMs, retrievalMs, llmMs separately for V2.                               |
| **Token cost**                  | Mean prompt + completion tokens per question. V2 uses one extra LLM call (classification); report total and breakdown. |
| **Per-category breakdown**      | All metrics split by question category                                                                                 |

### Practical rules

- **Same LLM and embedding model for everything.** Use Groq model ID `qwen/qwen3.8-27b` for both answer generation and classification; use Gemini embeddings for ingest and query embeddings.
- **Cache all LLM outputs** keyed by exact prompt. Store original `latencyMs` and token counts in each cache entry.
- **Accuracy comes from one frozen run.** Run V1 and V2 on the 56 test questions once, with caching. Do not retune or rerun.
- **The website is outside the evaluation.** `run-eval.js` and `run-timing.js` call `answerV1` and `answerV2` directly and never use logins, bookings or the chat route. All website and customer context work (Phases 3 and 4) must be committed before the freeze tag.
- **Keep the test set unseen.** Do not run test-split questions through the website, `ask.js` or any other path before the frozen run.
- **Run latency separately:** after the main run, bypass the cache and run the fixed 20-question subset 3 times for both systems, respecting the daily token cap. Follow the implementation guide's repetition boundary rules; do not split a repetition across quota days. Report median and p95 and record each repetition's date. Because the calls bypass cache, do not assume the timing subset automatically fits in one daily quota.
- **No thresholds to tune.** The only numeric value to set is the minimum RAG similarity floor (0.3). Set it once before building, document it in the paper, do not adjust it based on test results.
- **Report counts alongside percentages.** With 56 test questions, small percentage differences are noise. "V2 got 4 more policy questions right (34 vs 30 out of 40)" is more honest than "V2 improved accuracy by 10%."
- **Plan for about 150 LLM calls on the test set** (V1: 56 answer calls; V2: 56 classify calls + up to 56 answer calls), plus the 28 dev questions run first for bug checking.
- **Groq model and rate limits:** use model ID `qwen/qwen3.8-27b` for both V1/V2 answer generation and V2 classification. The Groq model/plan reference limits checked on 2026-10-20 were 30 requests/min, 1,000 requests/day, 8,000 tokens/min, and 200,000 tokens/day (official references: https://console.groq.com/docs/rate-limits and https://console.groq.com/docs/model/qwen/qwen3.8-27b). The selected project/account can have lower limits; verify the live console before bulk runs. Limits can change over time. These values are a dated reference, not a guarantee.
- **Project safety settings:** `GROQ_DAILY_TOKEN_CAP=90000` and `GROQ_MIN_INTERVAL_MS=10000`. The throttle spaces real call starts by at least 10 seconds (about 6 calls/min), below the reference 30 RPM rate.
- **Rough budget only; use actual `usage` measurements for estimates:** at about 1,800 tokens per question across V1 and V2, the 28-question dev run is roughly 50K tokens, the 56-question frozen test run roughly 100K, and three timing repetitions on 20 questions roughly 100K. Total planning estimate: about 250K tokens, meaning at least 3 days under the 90K/day application cap and realistically 4-5 quota days once the timing repetition boundaries and actual usage are considered. Before each bulk run, print an estimate using measured usage; never present this rough figure as an observed result.
- **Required handling in `llm.js`:** cache by exact prompt; space real calls by at least 10 seconds; on HTTP 429 read the `retry-after` header and retry with exponential backoff (maximum 5 attempts); keep a persisted daily token counter and stop cleanly at the 90K application cap instead of failing mid-run. `run-eval.js` must be resumable and skip already logged question/system rows. Cached results should not increase token usage.
- **Gemini embeddings** are also free-tier limited. Embed in batches at ingest, cache every embedding (including query embeddings) on disk, and retry on 429.

---

## 8. The paper

### Research questions

1. **Classification accuracy.** How reliably does the LLM classify question types (policy vs. event vs. hybrid vs. out-of-scope) based on question text alone? What types of questions does it misclassify?

2. **Does routing improve answers?** On questions where V2 classifies correctly, does retrieving from the targeted source produce more accurate answers than V1's undifferentiated retrieval?

3. **What does classification cost?** How much extra latency and token cost does the classification step add? Is the accuracy improvement worth it?

### What you can claim

- A direct comparison of a standard RAG-only system against a classify-then-retrieve hybrid system, measured on accuracy, latency, and token cost.
- An analysis of LLM classification reliability across question types, including failure modes.
- An evaluation of whether routing questions to curated OKF files reduces possible cross-source ranking interference in a collection that mixes policies and events.
- A simple, no-tuning routing approach that is reproducible and easy to explain.

### What you must NOT claim

- That LLM-based question classification is a novel idea. It is not. Your contribution is applying and measuring it in this hybrid retrieval context with a specific knowledge format (OKF).
- That results on synthetic data generalize to real customer traffic.
- That an accuracy difference of a few percentage points on 56 questions is statistically significant.
- That OKF is necessary for this to work — the classification approach could be used with any structured policy store. OKF is the format you chose; it is not what makes the approach novel.
- That the website's login, booking or staff features are part of the research contribution, or that the website was evaluated for usability.

### Suggested outline

1. **Title:** "Classify-Then-Retrieve: LLM-Based Question Routing Between Curated Policies and Event Data for Travel Support QA"
2. **Abstract:** problem, approach, test set, headline numbers.
3. **Introduction:** the hypothesis that mixing policies and events in one vector store may cause cross-source ranking interference; why classifying before retrieval may reduce it; what this paper measures.
4. **Related work:** RAG, hallucination in LLM QA, customer support chatbots, structured knowledge formats.
5. **System design:** V1 (RAG-only), V2 (classify-then-retrieve), the two Chroma collections, OKF as the policy store, and a short description of the web application around them (roles and the escalation inbox).
6. **Experimental setup:** synthetic travel data, 7 categories, 84 questions, metrics.
7. **Results:** accuracy and latency tables, per-category breakdown, routing confusion matrix, error analysis, primary headline metrics over all 56 frozen-test questions plus a clearly labeled sensitivity analysis excluding the 8 stale-category test questions (48 questions), and conflict-category evidence availability for both conflicting files.
8. **Discussion:** where classification helps most; where it fails; the latency and cost tradeoff.
9. **Limitations and conclusion.**

### Limitations to state honestly

- Synthetic data generated by LLM, single domain (travel), small test set (56 questions).
- One LLM (`qwen/qwen3.8-27b` on Groq) and one embedding model (Gemini); results may not transfer.
- LLM classification is not perfect; misclassification directly causes wrong retrieval.
- Keyword matching for OKF is basic and misses synonyms (e.g. "reimbursement" vs "refund").
- The 0.3 minimum RAG similarity floor was set once without tuning; a different value might give different results.
- Latency measured on Groq free tier, which has variable load.
- Neither system checks whether a policy file is stale (`stale_after`, `status` are not used), so the stale-policy category tests only whether the answer matches the intentionally outdated file content, not whether it is current real-world policy. Report the primary results over all 56 frozen-test questions and a clearly labeled sensitivity analysis excluding the 8 stale-category test questions (48 questions); preserve and disclose both.
- The conflict category is scored correct only when the system escalates with `CONFLICT`, and this requires both conflicting source files in the evidence. V1 top-3 combined retrieval and V2 single-file OKF matching / classifier-first skipping create an asymmetric opportunity to see both files; report the per-system retrieval counts and do not overinterpret a category difference.
- The free-tier token limits may require evaluation to be spread over several quota days; run the timing study on the specified 20-question subset and record dates and measured usage.
- The travel agency website (authentication, flight search, demo bookings, staff queue) is a product shell with synthetic flights and prices and simulated payment. It was not evaluated, and no usability or user-study claims are made. The chatbot does not know about the website's fares or seat counts, so such questions escalate.

---

## 9. What to learn (in order, easy to hard)

1. **Web development fundamentals** (likely comfortable): React, Node and Express, MongoDB, REST APIs.
2. **LLM APIs:** prompts, system prompts, context window, instructing the model to answer only from evidence and to return a single label. Search "LLM API system prompt tutorial".
3. **Embeddings:** text as numbers; similar meanings give similar vectors. Core RAG concept. Search "embeddings explained simply".
4. **Vector databases and similarity search:** storing vectors, finding nearest neighbors. Search "vector database Chroma tutorial".
5. **The full RAG pipeline:** chunk, embed, store, retrieve, generate. Search "RAG from scratch".
6. **The OKF specification:** read v0.2 spec at GoogleCloudPlatform/knowledge-catalog. Understand the `type` field (required) and optional fields `sources`, `verified`, `stale_after`, `status`.
7. **Evaluation basics:** accuracy, per-category breakdowns, confusion matrices. Search "confusion matrix explained".
8. **LLM classification prompting:** how to assess whether the model returns exactly one of N labels and nothing else. The Phase 2A-1 gate runs the frozen classifier prompt on 10 dev questions before it is wired into V2. The earlier Phase 0 `OK` smoke test checks connectivity/cache behavior only; it does not establish classifier-format reliability. Record any malformed outputs at the gate without changing the frozen prompt or adding retries.
9. **Authentication and roles (learn before Phase 3):** how passwords are hashed (bcrypt), how a login session works (a signed token in an httpOnly cookie), how the server protects routes by role, how React hides pages from the wrong role (the server check is the real protection), and one MongoDB atomic update (`$inc` with a condition) for seat counts. Search "JWT httpOnly cookie authentication Express" and "React Router protected routes".

---

## 10. Tech stack

| Part       | Choice                                   | Notes                                                                                                                                                                                                                                                                                           |
| ---------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | React (Vite) + React Router + Tailwind CSS | Public site, customer area, staff area and a chat widget; the original chat page stays at `/lab/chat` |
| Backend    | Node.js + Express                        | One language across the project                                                                                                                                                                                                                                                                 |
| LLM        | Groq API, `qwen/qwen3.8-27b`             | Groq's model/plan reference limits checked 2026-10-20: 30 requests/min, 1,000 requests/day, 8,000 tokens/min, 200,000 tokens/day. Project/account limits may be lower. This project sets `GROQ_DAILY_TOKEN_CAP=90000` and `GROQ_MIN_INTERVAL_MS=10000`; verify current limits before bulk runs. |
| Embeddings | Gemini embedding API (free tier)         | Groq has no embeddings endpoint                                                                                                                                                                                                                                                                 |
| Vector DB  | Chroma (local, JS client)                | Two collections: `combined` (V1) and `notices` (V2)                                                                                                                                                                                                                                             |
| OKF files  | Markdown + YAML, parsed with gray-matter | Per OKF v0.2 spec                                                                                                                                                                                                                                                                               |
| Database | MongoDB | Collections: `users`, `flights`, `bookings`, `counters`, `cases`, `experiment_logs` |
| Auth | `bcryptjs`, `jsonwebtoken`, `cookie-parser` | Hashed passwords; signed token in an httpOnly cookie; roles `customer` and `agent` |
| Cache      | `cache/llm-cache.json`                   | Key every LLM call by exact prompt; store latencyMs and tokens alongside the response                                                                                                                                                                                                           |

---

## 11. Key terms in plain English

| Term             | Meaning                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| LLM              | A language model that generates text from a prompt                              |
| Embedding        | A list of numbers representing the meaning of a piece of text                   |
| Chunk            | A small piece of a document, stored and retrieved on its own                    |
| Vector database  | A database that finds stored embeddings closest to a query embedding            |
| Similarity       | How close two embeddings are (cosine similarity from 0 to 1)                    |
| RAG              | Retrieve relevant chunks, then give them to an LLM to answer                    |
| OKF              | Google Cloud's markdown-plus-metadata format for curated knowledge              |
| Frontmatter      | The YAML block at the top of a markdown file that holds metadata                |
| Classification   | The LLM step that assigns a question to a source type before retrieval          |
| Routing          | Deciding which source(s) to retrieve from, based on the classification          |
| Escalation       | Sending a question to a human instead of answering it                           |
| Hallucination    | The model stating something not supported by the retrieved evidence             |
| Baseline         | The simpler system you compare against (V1 is the baseline)                     |
| Latency / p95    | Time from question to answer / the time 95% of requests finish within           |
| Token cost       | Total tokens (prompt + completion) consumed per question                        |
| Confusion matrix | A table showing how many times each classification label was expected vs actual |
| Error analysis   | Reading through failures to understand why the system got something wrong       |
| Authentication   | Proving who a user is (here: email and password, then a signed token in a cookie) |
| Role             | What an account is allowed to do (here: `customer` or `agent`)                  |
| Password hash    | A one-way scramble of a password, so the real password is never stored          |
| Protected route  | A page or API route that only logged-in users of the right role can use         |

---

## 12. Future work (not part of this project)

- **Confidence scoring.** Add OKF metadata signals (verified, stale_after, status) and RAG signals (source type, recency) as weighted scores to decide when to escalate borderline cases, rather than relying solely on the LLM classification.
- **Conflict resolution.** When OKF and RAG both retrieve content that contradicts each other, extract specific fact slots and let the more trustworthy source win.
- **Learning from employees.** Use resolved escalation cases to propose OKF file updates.
- **Real data.** Test on real support logs from a partner agency.
- **More domains.** Banking, hotels, or shopping would test whether the approach transfers.
- **Real booking features.** Payments, cancellations and changes, seat selection, e-mail notifications, and live flight inventory.
- **Usability study.** A user study of the website and the escalation flow with real customers and staff.
- **Operational feed into RAG.** Letting staff publish delay notices from the website into the RAG store. This would need re-ingestion and a new evaluation run, so it is deliberately excluded.
