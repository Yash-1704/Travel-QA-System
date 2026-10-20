# Travel Agency QA System: Simplified Project Guide

**RAG-only baseline vs. OKF + RAG with LLM routing**

Last updated: October 20, 2026 (Simplified version, corrected; label, CONFLICT, stale-policy and token-budget fixes applied)

**How to use this file.** Read sections 1 to 5 to understand what you are building and why. Section 6 is the version-by-version build map you follow while coding. Sections 7 and 8 cover the evaluation and the paper. Sections 9 to 12 are reference (what to learn, tech stack, key terms, future work).

---

## 1. The project in one page

**What it is.** A web app where a customer asks a travel support question (cancellations, visas, baggage, delays, bookings) and gets an answer with its source cited. Two versions of the system are built and compared: one uses RAG only (a standard vector store baseline), the other combines curated policies (OKF) with RAG and uses the LLM to classify the question type before retrieving.

**How it works.**

**V1: RAG-only baseline**
- All documents (policy files and event notices) are chunked and uploaded to a single vector store.
- For each question, retrieve the top 3 most similar chunks and generate an answer.
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

| Version | What it does |
| --- | --- |
| V1 | RAG-only baseline: all documents in one vector store, retrieve and answer |
| V2 | LLM classifies question type first, then retrieves from OKF or RAG or both |
| V3 (optional) | Customer context: resolve "my flight" to actual bookings in MongoDB |

**One-sentence pitch for your mentor.** "We study whether asking an LLM to classify a question before retrieval — routing it to curated policies or event data — produces more accurate answers than a standard RAG-only system that retrieves from everything at once."

---

## 2. Background and constraints

- This is a college project titled "Question Answering System for Automated Customer Relationship Management." The title is a general direction, not a strict requirement.
- The mentor wants a technically strong project with a real research component, leading to a research paper.
- It must be primarily a web application, buildable by one student in the available time, and understandable by you end to end.
- Focus: build V1 and V2 fully and test them. V3 is optional if time allows.
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

| Question | LLM classifies | Why |
| --- | --- | --- |
| What is the cancellation fee? | OKF_ONLY | Asking for a policy rule |
| Do I need a visa for Japan? | OKF_ONLY | Asking for a rule |
| Why was flight AI-202 delayed on October 10? | RAG_ONLY | Asking about a specific event |
| Are there baggage problems on the Dubai route this week? | RAG_ONLY | Asking about recent incidents |
| Can I get compensation for my 4-hour delay? | HYBRID | Needs the compensation rule (OKF) AND the facts of the delay (RAG) |
| Can I bring my pet snake on board? | ESCALATE | Not covered by any source |

**Why RAG-only struggles:** A standard vector store mixes policies and notices together. Policy chunks can be cut off mid-condition, or a notice might accidentally rank higher than the official policy. This is what V1 will demonstrate.

**Why classify-then-retrieve helps:** By classifying first and retrieving from only the right source, you avoid retrieval noise. Policy questions get the full, uncut OKF file. Event questions get only event chunks without policy noise. This is the hypothesis V2 tests.

### What this project does NOT do

- It does **not** use past agent replies in support tickets as a source of policy. If a policy changes, the OKF file is updated.
- It does **not** use RAG for customer-specific data such as bookings. That is an exact lookup in a table (V3 optional), not a similarity search.
- It does **not** try to decide which of two contradicting sources is right. If the evidence contradicts itself, it escalates to a human.

---

## 4. What OKF provides and what we build

OKF is a file format with optional metadata. It stores curated policies but does not compute routing or confidence scores. **The LLM-based routing, escalation logic, and evaluation are this project's own design.**

Spec: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

| OKF provides | This project builds |
| --- | --- |
| Markdown files with YAML frontmatter; only `type` is required | Travel policy files in OKF format, and a parser to read them |
| Optional metadata fields (`sources`, `verified`, `stale_after`, `status`) | Used for citing sources in answers; not used for routing or scoring |
| Nothing for retrieval or routing | The LLM classifier (classify question type from the question alone), retrieval from the chosen source(s), the escalation decision, and the evaluation (V1 vs V2 comparison) |

Read the spec yourself before generating files.

---

## 5. System design

### 5.1 Architecture

```
Customer (React chat page)
        |
        v
Express  POST /api/chat
        |
        v
   [V1 path]                    [V2 path]
   Retrieve top 3 chunks        Ask LLM to classify question:
   from `combined` collection   "OKF_ONLY / RAG_ONLY / HYBRID / ESCALATE"
        |                               |
        |                    Based on classification:
        |                    - OKF_ONLY: keyword match OKF files
        |                    - RAG_ONLY: vector search `notices` collection
        |                    - HYBRID: both of the above
        |                    - ESCALATE: skip to human fallback
        |                               |
        +---------> LLM answer (Groq, Llama 3.3 70B)
                    answers ONLY from the retrieved evidence
                               |
                   +-----------+------------------+
                   |                              |
             answer + citations           INSUFFICIENT / CONFLICT / ESCALATE
             back to customer                     |
                                          Human fallback:
                                          -> MongoDB "cases"
                                          -> Employee dashboard
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
2. An employee opens the dashboard and sees pending cases in a list.
3. Clicking a case shows:
   - the customer's question
   - the LLM's classification (or "ESCALATE")
   - OKF file found (if any) with excerpt and metadata
   - RAG chunks found (if any) with timestamps
   - reason for escalation
4. The employee writes and submits an answer. The case becomes **resolved** and the answer is sent to the customer.

**Dashboard scope:** a simple page showing pending cases, each expandable to show evidence and an answer text box. Plain UI, functional only. Aim for about one week of work.

### 5.4 Customer context (V3, optional)

If time allows: when a customer asks "Why was my flight delayed?", the system needs to know which flight.

- The demo has a few synthetic customers who can "log in."
- The backend looks up that customer's bookings in MongoDB `bookings` collection (flight number, airline, date, etc.).
- The flight number is added to the question before classification, so the classification and retrieval use the full context.
- If the customer has multiple bookings, the bot asks which one.

### 5.5 Data you will create (mostly with AI help, always reviewed by you)

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

### 5.6 Project structure, API, and data model

```
travel-qa/
  client/
    src/pages/Chat.jsx         customer chat (works with V1 and V2)
    src/pages/Dashboard.jsx    employee dashboard for escalated cases
  server/
    src/index.js
    src/routes/chat.js         POST /api/chat
    src/routes/cases.js        GET/POST /api/cases for human fallback
    src/services/okf.js        load OKF files, keyword scoring (V2 only)
    src/services/rag.js        chunk, embed, Chroma query (V1 and V2)
    src/services/classifier.js LLM-based question classification (V2 only)
    src/services/llm.js        Groq calls; caches latency and token counts
    src/services/db.js         MongoDB for cases and bookings
  data/okf/*.md                OKF policy files (V2 only)
  data/rag/notices.json        Unstructured event notices
  data/eval/questions.json     Test question set with expected answers
  data/seed/bookings.json      Demo customer bookings (V3 optional)
  scripts/ingest-rag.js        Embed notices; build `combined` (V1) and `notices` (V2) Chroma collections
  scripts/seed-db.js           Load demo customers and bookings into MongoDB
  scripts/run-eval.js          Run V1 and V2 on test questions; measure accuracy, latency, tokens
  cache/llm-cache.json         Cache all LLM outputs keyed by exact prompt
```

| Endpoint | Purpose |
| --- | --- |
| `POST /api/chat` | Body: `{ question, customerId? }`. Returns `{ outcome, answer?, citations, caseId? }` |
| `GET /api/cases?status=pending` | Employee queue |
| `GET /api/cases/:id` | Evidence view for one case |
| `POST /api/cases/:id/resolve` | Employee's final answer |
| `GET /api/customers/:id/bookings` | V3 only |

**MongoDB collections:** `cases`, `customers`, `bookings`, `experiment_logs`.

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
  "createdAt": "2026-10-16T10:00:00Z",
  "resolvedAt": null
}
```

`experiment_logs` holds one document per (system, question, run): `systemName`, `questionId`, `llmClassification`, `outcome`, `answer`, `correct`, `latencyMs`, `classifyMs`, `retrievalMs`, `llmMs`, `tokens`, `runId`.

Note `classifyMs` — log classification time separately from retrieval and generation. This lets you report the latency cost of the classification step in the paper.

**Chroma collections:**
- `combined`: all documents (OKF policy files chunked + notices). Used by V1 only.
- `notices`: event notices only. Used by V2's RAG retrieval.

---

## 6. Progressive build map

### Step 0: Foundations and data (about 1 week)

1. Learn concepts 2 to 6 from section 9 (embeddings through RAG pipeline).
2. **Design the evaluation first** (section 7): fix the question categories and what a correct answer looks like.
3. Generate the data with AI: 15–18 OKF policy files, 30 synthetic event notices (with timestamps and source types), and 84 test questions with expected answers and key_facts. Review all of it before moving on. (You already have this data from a previous step — verify it is in place.)

### V1: RAG-only baseline (about 1 week)

- **Goal:** build the standard RAG-only system. Chunk all documents (OKF files as plain text + notices) into one Chroma collection called `combined`. Answer from whatever retrieves.
- **Build:** Express `/api/chat` endpoint; RAG pipeline: chunk the OKF files and notices, embed with Gemini, store in Chroma `combined` (cosine distance), retrieve top 3 by similarity; one Groq call that answers from that evidence; React chat page showing the answer and citations.
- **You learn:** embeddings, vector databases, similarity search, the full RAG pipeline end to end, Groq API calls with a constrained system prompt.
- **Done when:** 10 questions (mix of policy and event) return reasonable answers with chunk IDs cited.
- **This is your baseline.** Everything is compared against V1.
- **Limitation:** policy questions may retrieve a partial chunk that cuts off a condition; event questions may retrieve a policy chunk instead of the right notice. You will observe both of these during testing, and they motivate V2.

### V2: LLM classification + OKF + RAG routing (about 2 weeks)

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

### V3 (optional, if time allows): Customer context (about 3 to 5 days)

- **Goal:** resolve "my flight" to the actual flight in the customer's bookings.
- **Build:** demo customer login; MongoDB `bookings` collection seeded with sample data; when a customer's question mentions "my flight" or "my booking," look up their bookings and inject the flight number into the question before it reaches the classifier.
- **Done when:** "Why was my flight delayed?" resolves to the correct flight and returns the right delay notice without the customer having to name the flight.

### Step 5: Evaluation run (about 1 week)

1. Run V1 and V2 on the dev set (28 questions) first to catch bugs, then once on the frozen test set (56 questions). Cache all LLM outputs in `cache/llm-cache.json`. Spread runs over 2 or more days to respect Groq's daily token limit (section 7, practical rules).
2. For each question, log: systemName, questionId, llmClassification (V2 only), outcome, answer, whether it matched correct_answer, latencyMs broken into classifyMs + retrievalMs + llmMs, tokens.
3. Compute per-category accuracy, wrong answer rate, escalation rate, token cost. For V2 also compute routing accuracy (did the LLM classification match expected_outcome?).
4. Run a separate timing run: bypass the cache, run a 20-question subset 3 times for both systems in one session, report median and p95 latency.
5. **Error analysis:** for every wrong answer and every wrong classification, write one sentence explaining why it failed.

### Step 6: Write the paper (section 8)

---

## 7. Evaluation

### Test set

**84 questions: 7 categories with 12 each.** 4 per category (28 total) form the development set used only to verify the system works. 8 per category (56 total) are the final test set, run once after everything is built.

| Category | Expected V2 outcome | What it tests |
| --- | --- | --- |
| Policy question, strong OKF match | OKF_ONLY | Does the LLM correctly classify policy questions? Does OKF give a better answer than V1? |
| Event question, strong RAG match | RAG_ONLY | Does the LLM correctly classify event questions? |
| Hybrid (compensation = rule + event) | HYBRID | Can V2 use both sources together? Does V1 struggle here? |
| Policy question, OKF file is past its review date | OKF_ONLY | Neither system checks staleness (no metadata signals are used). Scored like a normal policy question; documented as a limitation |
| Event question with no matching records | ESCALATE | Both systems should admit insufficient evidence; does V1 hallucinate? |
| Ambiguous or out-of-scope question | ESCALATE | Does V2 classify correctly? Does V1 guess? |
| Sources give conflicting information | ESCALATE | Does the answer LLM reply CONFLICT? Counted as correct when the system escalates this way |

**Labels:** correct answers are known by design since you created the OKF files and notices. Use `key_facts` strings for auto-checking; only read by hand the answers that fail the substring match.

### Systems compared

| System | What it is |
| --- | --- |
| **V1: RAG-only** | One Chroma collection (`combined`) containing chunked OKF files and notices. Top-3 similarity retrieval. No classification. Always answers; escalates only if answer LLM says INSUFFICIENT or CONFLICT. |
| **V2: LLM-classified routing** | LLM classifies question type from the question text alone. Retrieves from OKF files or `notices` collection or both based on classification. Escalates when classified as ESCALATE, when retrieval returns nothing, or when answer LLM says INSUFFICIENT or CONFLICT. |

### Metrics

| Metric | Measured how |
| --- | --- |
| **Answer accuracy** | % of answered questions where the answer contains all key_facts |
| **Wrong answer rate** | % of all questions where the system answered with a factually wrong answer |
| **Routing accuracy (V2 only)** | % of questions where llmClassification matches expected_outcome |
| **Escalation rate** | % of questions escalated to human |
| **Unnecessary escalation rate** | % of escalations on questions that had a known correct answer available |
| **Latency** | Median and p95 wall-clock time. Report classifyMs, retrievalMs, llmMs separately for V2. |
| **Token cost** | Mean prompt + completion tokens per question. V2 uses one extra LLM call (classification); report total and breakdown. |
| **Per-category breakdown** | All metrics split by question category |

### Practical rules

- **Same LLM and embedding model for everything.** Llama 3.3 70B on Groq, Gemini embeddings.
- **Cache all LLM outputs** keyed by exact prompt. Store original `latencyMs` and token counts in each cache entry.
- **Accuracy comes from one frozen run.** Run V1 and V2 on the 56 test questions once, with caching. Do not retune or rerun.
- **Run latency separately:** after the main run, bypass the cache and run a 20-question subset (stratified across categories) 3 times for both systems, in one session. Report median and p95. The subset keeps the run inside Groq's daily token limit.
- **No thresholds to tune.** The only numeric value to set is the minimum RAG similarity floor (0.3). Set it once before building, document it in the paper, do not adjust it based on test results.
- **Report counts alongside percentages.** With 56 test questions, small percentage differences are noise. "V2 got 4 more policy questions right (34 vs 30 out of 40)" is more honest than "V2 improved accuracy by 10%."
- **Plan for about 150 LLM calls on the test set** (V1: 56 answer calls; V2: 56 classify calls + up to 56 answer calls), plus the 28 dev questions run first for bug checking.
- **The binding Groq limit is tokens per day, not requests per day.** On the free tier, `llama-3.3-70b-versatile` allows roughly 30 requests/min, 1,000 requests/day, 12,000 tokens/min, and 100,000 tokens/day (check console.groq.com/settings/limits for your account's real numbers). Limits apply per organization, so extra API keys do not help.
- **Rough budget (estimate, replace with measured numbers from the `usage` field once V1 works):** about 1,800 tokens per question across V1 and V2 together, so one pass over all 84 questions is about 150K tokens, which is about 2 days of quota. A 3-repetition timing run on a 20-question subset is about 100K tokens, roughly one more day.
- **Required handling in `llm.js`:** cache by exact prompt; throttle calls (about one call per 5 seconds keeps tokens/min safe); on HTTP 429 read the `retry-after` header and retry with exponential backoff (maximum 5 attempts); keep a persisted daily token counter and stop cleanly near 90K instead of failing mid-run. `run-eval.js` must be resumable (skip anything already cached).
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
- Evidence that routing policy questions to curated OKF files reduces the noise problem that RAG-only systems face when policies and events are stored together.
- A simple, no-tuning routing approach that is reproducible and easy to explain.

### What you must NOT claim

- That LLM-based question classification is a novel idea. It is not. Your contribution is applying and measuring it in this hybrid retrieval context with a specific knowledge format (OKF).
- That results on synthetic data generalize to real customer traffic.
- That an accuracy difference of a few percentage points on 56 questions is statistically significant.
- That OKF is necessary for this to work — the classification approach could be used with any structured policy store. OKF is the format you chose; it is not what makes the approach novel.

### Suggested outline

1. **Title:** "Classify-Then-Retrieve: LLM-Based Question Routing Between Curated Policies and Event Data for Travel Support QA"
2. **Abstract:** problem, approach, test set, headline numbers.
3. **Introduction:** why mixing policies and events in one vector store causes retrieval noise; why classifying before retrieving is cleaner; what this paper measures.
4. **Related work:** RAG, hallucination in LLM QA, customer support chatbots, structured knowledge formats.
5. **System design:** V1 (RAG-only), V2 (classify-then-retrieve), the two Chroma collections, OKF as the policy store.
6. **Experimental setup:** synthetic travel data, 7 categories, 84 questions, metrics.
7. **Results:** accuracy and latency tables, per-category breakdown, routing confusion matrix, error analysis.
8. **Discussion:** where classification helps most; where it fails; the latency and cost tradeoff.
9. **Limitations and conclusion.**

### Limitations to state honestly

- Synthetic data generated by LLM, single domain (travel), small test set (56 questions).
- One LLM (Llama 3.3 70B) and one embedding model (Gemini); results may not transfer.
- LLM classification is not perfect; misclassification directly causes wrong retrieval.
- Keyword matching for OKF is basic and misses synonyms (e.g. "reimbursement" vs "refund").
- The 0.3 minimum RAG similarity floor was set once without tuning; a different value might give different results.
- Latency measured on Groq free tier, which has variable load.
- Neither system checks whether a policy file is stale (`stale_after`, `status` are not used), so the stale-policy category tests only whether the answer matches the file's content. Handling staleness is future work.
- The free-tier token limits forced the evaluation to be spread over several days and the timing run to use a 20-question subset.

---

## 9. What to learn (in order, easy to hard)

1. **Web development fundamentals** (likely comfortable): React, Node and Express, MongoDB, REST APIs.
2. **LLM APIs:** prompts, system prompts, context window, instructing the model to answer only from evidence and to return a single label. Search "LLM API system prompt tutorial".
3. **Embeddings:** text as numbers; similar meanings give similar vectors. Core RAG concept. Search "embeddings explained simply".
4. **Vector databases and similarity search:** storing vectors, finding nearest neighbors. Search "vector database Chroma tutorial".
5. **The full RAG pipeline:** chunk, embed, store, retrieve, generate. Search "RAG from scratch".
6. **The OKF specification:** read v0.2 spec at GoogleCloudPlatform/knowledge-catalog. Understand the `type` field (required) and optional fields `sources`, `verified`, `stale_after`, `status`.
7. **Evaluation basics:** accuracy, per-category breakdowns, confusion matrices. Search "confusion matrix explained".
8. **LLM classification prompting:** how to write a classification prompt that reliably returns one of N labels and nothing else. Practice this before building V2 — test it with 10 questions manually before wiring it into the system.

---

## 10. Tech stack

| Part | Choice | Notes |
| --- | --- | --- |
| Frontend | React + React Router (+ Tailwind) | Two pages: customer chat and employee dashboard |
| Backend | Node.js + Express | One language across the project |
| LLM | Groq API, Llama 3.3 70B | Free tier: about 1,000 requests/day but only about 100K tokens/day on the 70B model, and 12K tokens/min. Tokens per day is the real limit. Check your account's limits page before evaluation. |
| Embeddings | Gemini embedding API (free tier) | Groq has no embeddings endpoint |
| Vector DB | Chroma (local, JS client) | Two collections: `combined` (V1) and `notices` (V2) |
| OKF files | Markdown + YAML, parsed with gray-matter | Per OKF v0.2 spec |
| Database | MongoDB | Collections: `cases`, `customers`, `bookings`, `experiment_logs` |
| Cache | `cache/llm-cache.json` | Key every LLM call by exact prompt; store latencyMs and tokens alongside the response |

---

## 11. Key terms in plain English

| Term | Meaning |
| --- | --- |
| LLM | A language model that generates text from a prompt |
| Embedding | A list of numbers representing the meaning of a piece of text |
| Chunk | A small piece of a document, stored and retrieved on its own |
| Vector database | A database that finds stored embeddings closest to a query embedding |
| Similarity | How close two embeddings are (cosine similarity from 0 to 1) |
| RAG | Retrieve relevant chunks, then give them to an LLM to answer |
| OKF | Google Cloud's markdown-plus-metadata format for curated knowledge |
| Frontmatter | The YAML block at the top of a markdown file that holds metadata |
| Classification | The LLM step that assigns a question to a source type before retrieval |
| Routing | Deciding which source(s) to retrieve from, based on the classification |
| Escalation | Sending a question to a human instead of answering it |
| Hallucination | The model stating something not supported by the retrieved evidence |
| Baseline | The simpler system you compare against (V1 is the baseline) |
| Latency / p95 | Time from question to answer / the time 95% of requests finish within |
| Token cost | Total tokens (prompt + completion) consumed per question |
| Confusion matrix | A table showing how many times each classification label was expected vs actual |
| Error analysis | Reading through failures to understand why the system got something wrong |

---

## 12. Future work (not part of this project)

- **Confidence scoring.** Add OKF metadata signals (verified, stale_after, status) and RAG signals (source type, recency) as weighted scores to decide when to escalate borderline cases, rather than relying solely on the LLM classification.
- **Conflict resolution.** When OKF and RAG both retrieve content that contradicts each other, extract specific fact slots and let the more trustworthy source win.
- **Learning from employees.** Use resolved escalation cases to propose OKF file updates.
- **Real data.** Test on real support logs from a partner agency.
- **More domains.** Banking, hotels, or shopping would test whether the approach transfers.
