# Classify-Then-Retrieve: LLM-Based Question Routing Between Curated Policies and Event Data for Travel Support QA

## Abstract

Automated customer support in travel operations requires answering questions that span two distinct knowledge types: static, authoritative policy documentation (e.g., baggage allowances, visa rules, refund policies) and dynamic, time-sensitive operational notices (e.g., flight delays, gate changes, baggage incident logs). Standard Retrieval-Augmented Generation (RAG) systems index both knowledge modalities into a single vector database, risking cross-source ranking interference and irrelevant context injection. In this work, we investigate a "classify-then-retrieve" architecture (V2) compared against an undifferentiated single-index RAG baseline (V1). V2 uses a single large language model (LLM) zero-shot prompt to classify customer inquiries into policy-only, operational-only, hybrid, or escalation routes before executing targeted retrieval from dedicated stores. Evaluated on a frozen synthetic benchmark of 56 [VERIFY] travel support inquiries across 7 [VERIFY] categories using Qwen 2.5 27B (`qwen/qwen3.8-27b`) and `gemini-embedding-001`, V1 achieved an overall correctness of 33/56 (58.9%) [VERIFY] while V2 achieved 30/56 (53.6%) [VERIFY]. When excluding an intentionally outdated policy category, both architectures achieved identical overall correctness of 26/48 (54.2%) [VERIFY], while V2 reduced the wrong-answer rate from 19/48 (39.6%) [VERIFY] down to 14/48 (29.2%) [VERIFY] by safely escalating unanswerable inquiries. Targeted routing reduced token consumption (mean 740 [VERIFY] tokens/question for V2 vs. 947 [VERIFY] for V1) with competitive median latency (934 ms [VERIFY] for V2 vs. 1070 ms [VERIFY] for V1 across 3 repetitions on 20 test questions [VERIFY]).

---

## 1. Introduction

Automated question-answering systems deployed in travel customer support face heterogeneous information sources. On one hand, travel agencies maintain curated, highly structured operational knowledge files (OKF) detailing contract terms, cancellation fees, luggage limits, and international visa advisories. On the other hand, real-time operations generate unstructured, high-velocity operational notices (RAG) such as specific aircraft delays, gate reassignments, and baggage delivery statuses.

In conventional RAG implementations [CITE: standard RAG], both curated organizational policies and dynamic operational bulletins are embedded and merged into a single vector index. However, embedding disparate document types into a shared vector space introduces a key operational hypothesis: cross-source ranking interference. In queries asking about operational disruptions, embedding similarity may retrieve policy text that dilutes the prompt context; conversely, general policy questions may surface spurious mentions of specific disrupted flights. Furthermore, when questions fall outside the knowledge corpus or exhibit mutual ambiguity, unguided vector retrieval often retrieves weakly related chunks that induce LLM hallucination rather than safe escalation.

To evaluate whether separating knowledge modalities improves answer reliability, we design and compare two architectural patterns:
1. **V1 (Undifferentiated RAG Baseline):** All curated policy files and operational notices are indexed into a single Chroma collection. Top-3 cosine similarity retrieval fetches context without classification. Escalation occurs only if the generator LLM explicitly emits `INSUFFICIENT` or `CONFLICT`.
2. **V2 (Classify-Then-Retrieve Architecture):** A single LLM call classifies the incoming query based on question text alone into one of four routing decisions: `OKF_ONLY`, `RAG_ONLY`, `HYBRID`, or `ESCALATE`. Targeted retrieval then queries dedicated stores (an in-memory OKF policy matcher or a dedicated operational notice vector collection). V2 escalates to human staff if the classifier flags `ESCALATE`, if the classifier output is invalid, if retrieval returns no matching evidence above a similarity floor (0.3 [VERIFY]), or if the generator LLM emits `INSUFFICIENT` or `CONFLICT`.

We evaluate both architectures on this synthetic test set across three core research questions:
- **RQ1:** How reliably does the LLM classify question types from the question text alone, and which types does it misclassify?
- **RQ2:** On correctly classified questions, does targeted retrieval give more accurate answers than V1's undifferentiated retrieval?
- **RQ3:** What extra latency and token cost does classification add, and is any accuracy change worth it?

---

## 2. Related Work

*(Subtopics and suggested search queries)*

- **Retrieval-Augmented Generation (RAG):** Modern QA architectures combining dense vector retrieval with autoregressive language models. [NEED: search query "retrieval augmented generation dense passage retrieval survey"] [CITE: Lewis et al. RAG].
- **Hallucination and Safe Escalation in LLM QA:** Mechanisms for detecting when evidence is insufficient, prompting models to abstain, and routing unanswerable queries to human agents. [NEED: search query "llm hallucination mitigation abstention unanswerable questions qa"] [CITE: LLM abstention and calibration studies].
- **Customer Support Chatbots & Hybrid Architectures:** Industrial question-answering systems integrating structured business rules, knowledge graphs, or policy documents with vector search. [NEED: search query "customer support conversational agents hybrid retrieval rule-based vector search"] [CITE: enterprise support bot architectures].
- **Structured Knowledge Formats & Policy Retrieval:** Curated documentation schemas (Markdown frontmatter, canonical rule tables) used alongside unstructured text. [NEED: search query "structured knowledge retrieval policy document question answering"] [CITE: policy QA benchmarks].

---

## 3. System Design

The system is implemented as a full-stack application (Node.js/Express, React, Chroma vector store, MongoDB). Around the core QA engine sits a travel agency product shell featuring user authentication (customer and agent roles), synthetic flight schedules, demo flight search, booking workflows, and an employee support queue. The web application shell is strictly a demonstration vehicle and is not part of the research evaluation.

### 3.1 Architectural Variants: V1 vs. V2

- **V1 (Combined RAG Baseline):** Combines 18 [VERIFY] OKF markdown files (each loaded as a complete chunk with frontmatter metadata and stripped HTML comments) and 30 [VERIFY] operational notices into a single Chroma collection (`combined`, 48 [VERIFY] total items). For any input question, dense vector retrieval queries `combined` using embeddings from `gemini-embedding-001` with cosine similarity, retrieving top-3 [VERIFY] chunks. The retrieved evidence is concatenated into the prompt and submitted to `qwen/qwen3.8-27b`.
- **V2 (Classify-First Pipeline):** 
  1. *Classification:* The raw query is passed to `qwen/qwen3.8-27b` using the frozen classification prompt.
  2. *Routing:* 
     - If `OKF_ONLY`: The question is matched against the 18 [VERIFY] OKF files using keyword scoring. If no file matches, the query escalates (`NO_OKF_MATCH`).
     - If `RAG_ONLY`: The question queries a dedicated Chroma collection containing only the 30 [VERIFY] operational notices (top-3 [VERIFY] cosine retrieval). If all retrieved items fall below the fixed similarity floor of 0.3 [VERIFY], the query escalates (`NO_RAG_MATCH`).
     - If `HYBRID`: The pipeline executes both OKF keyword matching (top-1 file) and notice retrieval from Chroma (top-3 [VERIFY] notices with the 0.3 [VERIFY] floor).
     - If `ESCALATE`: Retrieval is bypassed, and the question is directly escalated to MongoDB (`CLASSIFIER_ESCALATE`).
  3. *Answer Generation:* When retrieval succeeds, evidence is formatted into the shared answer prompt and answered by `qwen/qwen3.8-27b`.

### 3.2 Knowledge Stores and Comment Stripping

- **OKF Store:** 18 [VERIFY] markdown policy files containing YAML frontmatter (`type`, `topic`, `sources`, `verified`, `stale_after`, `status`) and markdown text. Crucially, two files contain HTML comments indicating revised policy facts. In both V1 and V2, the markdown loader strictly strips all HTML comments (`<!-- ... -->`) before embedding or prompting. The systems never observe commented corrections.
- **RAG Notice Store:** 30 [VERIFY] operational notices containing operational event descriptions (flight delays, baggage records, maintenance updates) stored in JSON format with metadata (timestamps, flight numbers, airline identifiers).

### 3.3 OKF Keyword Matching and Similarity Floor

In V2, OKF selection operates via a deterministic keyword scoring algorithm:
1. Normalizes query text (removing punctuation, lowercasing, splitting into tokens excluding common stop words).
2. Scores each policy file by the count of distinct query tokens present in the document title and body text.
3. Selects the single highest-scoring policy file. If multiple files tie, ties are broken alphabetically by filename. If the maximum score is zero, retrieval fails.

For Chroma vector retrieval in V2, a fixed similarity floor (`RAG_SIM_FLOOR = 0.3` [VERIFY]) is enforced. Vector distance is computed via cosine space, where similarity is defined as $1 - \text{distance}$. Any retrieved notice with similarity $< 0.3$ is discarded.

### 3.4 Frozen Prompts

Both systems use the exact prompts specified in the experimental protocol:

**Classification Prompt (`buildClassifyPrompt`):**
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

**Shared Answer Prompt (`buildAnswerPrompt`):**
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

Evidence blocks are formatted as `[OKF:<filename>]\n<text>` or `[RAG:<notice id>]\n<text>`.

### 3.5 Escalation Paths

- **V1:** Escalates only if the answer LLM outputs `INSUFFICIENT` or `CONFLICT`.
- **V2:** Escalates if the classifier predicts `ESCALATE` (`CLASSIFIER_ESCALATE`), if the classifier output is unparseable (`CLASSIFIER_INVALID`), if OKF keyword matching returns 0 hits (`NO_OKF_MATCH`), if notice retrieval returns no chunks with similarity $\ge 0.3$ (`NO_RAG_MATCH`), or if the answer LLM outputs `INSUFFICIENT` or `CONFLICT`.

Escalated inquiries in the application are recorded as cases in MongoDB, where staff operators can review retrieved context and provide human answers.

---

## 4. Experimental Setup

### 4.1 Evaluation Dataset and Split Protocol

The evaluation dataset comprises 84 [VERIFY] travel support inquiries across 7 [VERIFY] balanced categories (12 questions per category):
1. `okf_only`: Inquiries addressable entirely by static policy files.
2. `rag_only`: Inquiries addressable entirely by operational notices.
3. `hybrid`: Inquiries requiring synthesis of a policy rule and an operational event.
4. `human_fallback_stale`: Inquiries regarding policies documented in outdated policy files (testing source-faithfulness).
5. `human_fallback_no_evidence`: Inquiries regarding events or rules absent from the corpus.
6. `human_fallback_ambiguous`: Underspecified inquiries lacking necessary identifying details.
7. `human_fallback_conflict`: Inquiries spanning conflicting cancellation/refund policies.

Each category is partitioned into a 4-question development split (28 [VERIFY] questions total) and an 8-question frozen test split (56 [VERIFY] questions total). The dev split was utilized solely for integration testing and pipeline validation. The test split remained completely unseen until the final evaluation run.

### 4.2 Freeze Protocol & Execution

Prior to running the test evaluation, the entire codebase, prompts, retrieval parameters, and knowledge files were frozen at Git commit `ee41f37997be108dfdc348b3d0348cfd3b5bc9e8` [VERIFY] under Git tag `frozen-eval` [VERIFY]. All LLM generations were performed at temperature 0 with response caching enabled. Due to Groq free-tier daily token caps (enforced conservatively at 90,000 tokens/day), the benchmark execution was designed to support multi-day paused runs. In total, 288 [VERIFY] experiment log documents (56 dev, 112 frozen test, and 120 timing runs) were recorded in MongoDB.

### 4.3 Metrics and Grading Protocol

Evaluation metrics follow strict definitions:
- **Overall Correctness:** Fraction of all questions in the split that were handled correctly according to ground-truth expectations. For answerable categories (`okf_only`, `rag_only`, `hybrid`, `human_fallback_stale`), an outcome is correct if the system generated an answer containing all ground-truth `key_facts`. For unanswerable categories (`human_fallback_no_evidence`, `human_fallback_ambiguous`, `human_fallback_conflict`), an outcome is correct if the system escalated (for conflict, escalating specifically with `CONFLICT`).
- **Answer Accuracy:** Correct answers divided by the total number of non-escalated questions answered by that system.
- **Wrong Answer Rate:** Fraction of all questions where the system provided an incorrect answer (failed to provide required key facts, fabricated information, or answered an unanswerable question).
- **Escalation Rate:** Fraction of all questions routed to human escalation.
- **Unnecessary Escalation Rate:** Fraction of answerable questions (32 [VERIFY] in the test set) that were escalated instead of answered.
- **Routing Accuracy (V2 only):** Fraction of queries where the classifier's predicted label matched `expected_outcome`.

Grading was conducted via an automated key-fact substring matcher followed by human-in-the-loop review. In the frozen test run, 22 [VERIFY] agent-proposed manual grade overrides (correcting substring false negatives where the LLM rephrased facts correctly) were logged in `manual-grades.json`, with 0 [VERIFY] author overrides applied.

---

## 5. Results

### 5.1 Primary Headline Performance

Table 1 summarizes overall performance across all 56 [VERIFY] test questions.

**Table 1: Primary Evaluation Results (All 56 Frozen Test Questions)**
| Metric | V1 (RAG Baseline) | V2 (Classify-First) |
|---|---|---|
| **Overall Correctness** | 33/56 (58.9%) [VERIFY] | 30/56 (53.6%) [VERIFY] |
| **Answer Accuracy** (on non-escalated) | 18/30 (60.0%) [VERIFY] | 15/25 (60.0%) [VERIFY] |
| **Wrong Answer Rate** | 20/56 (35.7%) [VERIFY] | 15/56 (26.8%) [VERIFY] |
| **Escalation Rate** | 18/56 (32.1%) [VERIFY] | 26/56 (46.4%) [VERIFY] |
| **Unnecessary Escalation Rate** | 2/32 (6.3%) [VERIFY] | 7/32 (21.9%) [VERIFY] |
| **Retrieval Hit Rate** (`sourceRetrieved`) | 32/32 (100.0%) [VERIFY] | 27/32 (84.4%) [VERIFY] |

On this synthetic test set, V1 achieved an overall correctness of 33/56 (58.9%) [VERIFY] compared to 30/56 (53.6%) [VERIFY] for V2. Answer accuracy on questions the systems elected to answer was identical at 18/30 (60.0%) [VERIFY] for V1 and 15/25 (60.0%) [VERIFY] for V2. However, V2 produced fewer wrong answers (15/56 or 26.8% [VERIFY] vs. 20/56 or 35.7% [VERIFY] for V1), trading answer attempts for a higher escalation rate (26/56 or 46.4% [VERIFY] vs. 18/56 or 32.1% [VERIFY]).

### 5.2 Sensitivity Analysis: Excluding Stale Policy Questions

The `human_fallback_stale` category assesses whether the systems adhere faithfully to provided text even when that text is deliberately outdated. Table 2 provides a sensitivity analysis excluding these 8 [VERIFY] questions (evaluating the remaining 48 [VERIFY] questions).

**Table 2: Sensitivity Analysis Excluding Stale Policy Category (48 Questions)**
| Metric | V1 (RAG Baseline) | V2 (Classify-First) |
|---|---|---|
| **Overall Correctness** | 26/48 (54.2%) [VERIFY] | 26/48 (54.2%) [VERIFY] |
| **Answer Accuracy** (on non-escalated) | 11/22 (50.0%) [VERIFY] | 11/20 (55.0%) [VERIFY] |
| **Wrong Answer Rate** | 19/48 (39.6%) [VERIFY] | 14/48 (29.2%) [VERIFY] |

When excluding the stale policy category, both systems achieve identical overall correctness of 26/48 (54.2%) [VERIFY]. V2 achieved an answer accuracy of 11/20 (55.0%) [VERIFY] versus 11/22 (50.0%) [VERIFY] for V1, while maintaining a lower wrong answer rate (14/48 or 29.2% [VERIFY] vs. 19/48 or 39.6% [VERIFY] for V1).

### 5.3 Per-Category Breakdown

Table 3 presents performance broken down across the 7 [VERIFY] evaluation categories (8 questions per category).

**Table 3: Category-by-Category Results (8 Questions Each)**
| Category | Expected Outcome | V1 Correct | V2 Correct | V1 Escalated | V2 Escalated | V1 Wrong | V2 Wrong |
|---|---|---|---|---|---|---|---|
| `okf_only` | OKF_ONLY | 4/8 (50.0%) [VERIFY] | 3/8 (37.5%) [VERIFY] | 0/8 (0.0%) [VERIFY] | 2/8 (25.0%) [VERIFY] | 4/8 (50.0%) [VERIFY] | 3/8 (37.5%) [VERIFY] |
| `rag_only` | RAG_ONLY | 4/8 (50.0%) [VERIFY] | 4/8 (50.0%) [VERIFY] | 0/8 (0.0%) [VERIFY] | 0/8 (0.0%) [VERIFY] | 4/8 (50.0%) [VERIFY] | 4/8 (50.0%) [VERIFY] |
| `hybrid` | HYBRID | 3/8 (37.5%) [VERIFY] | 4/8 (50.0%) [VERIFY] | 2/8 (25.0%) [VERIFY] | 2/8 (25.0%) [VERIFY] | 3/8 (37.5%) [VERIFY] | 2/8 (25.0%) [VERIFY] |
| `human_fallback_stale` | OKF_ONLY | 7/8 (87.5%) [VERIFY] | 4/8 (50.0%) [VERIFY] | 0/8 (0.0%) [VERIFY] | 3/8 (37.5%) [VERIFY] | 1/8 (12.5%) [VERIFY] | 1/8 (12.5%) [VERIFY] |
| `human_fallback_no_evidence` | ESCALATE | 7/8 (87.5%) [VERIFY] | 7/8 (87.5%) [VERIFY] | 7/8 (87.5%) [VERIFY] | 7/8 (87.5%) [VERIFY] | 1/8 (12.5%) [VERIFY] | 1/8 (12.5%) [VERIFY] |
| `human_fallback_ambiguous` | ESCALATE | 8/8 (100.0%) [VERIFY] | 8/8 (100.0%) [VERIFY] | 8/8 (100.0%) [VERIFY] | 8/8 (100.0%) [VERIFY] | 0/8 (0.0%) [VERIFY] | 0/8 (0.0%) [VERIFY] |
| `human_fallback_conflict` | ESCALATE | 0/8 (0.0%) [VERIFY] | 0/8 (0.0%) [VERIFY] | 1/8 (12.5%) [VERIFY] | 4/8 (50.0%) [VERIFY] | 7/8 (87.5%) [VERIFY] | 4/8 (50.0%) [VERIFY] |

### 5.4 V2 Classification Routing and Confusion Matrix

Overall V2 question classification routing accuracy was 37/56 (66.1%) [VERIFY]. The classifier emitted 0 [VERIFY] invalid labels. The fixed similarity floor of 0.3 [VERIFY] was triggered 0 [VERIFY] times in the observed V2 logs.

**Table 4: V2 Classification Confusion Matrix (56 Test Questions)**
| Expected \ Predicted | OKF_ONLY | RAG_ONLY | HYBRID | ESCALATE | INVALID |
|---|---|---|---|---|---|
| **OKF_ONLY** (16 questions) | 14 [VERIFY] | 0 [VERIFY] | 1 [VERIFY] | 1 [VERIFY] | 0 [VERIFY] |
| **RAG_ONLY** (8 questions) | 0 [VERIFY] | 8 [VERIFY] | 0 [VERIFY] | 0 [VERIFY] | 0 [VERIFY] |
| **HYBRID** (8 questions) | 0 [VERIFY] | 0 [VERIFY] | 8 [VERIFY] | 0 [VERIFY] | 0 [VERIFY] |
| **ESCALATE** (24 questions) | 10 [VERIFY] | 5 [VERIFY] | 2 [VERIFY] | 7 [VERIFY] | 0 [VERIFY] |

The classifier showed 8/8 (100.0%) accuracy on `RAG_ONLY` and `HYBRID` inquiries, and 14/16 (87.5%) on `OKF_ONLY` (including stale policy questions). However, on unanswerable inquiries expected to escalate, the classifier predicted `ESCALATE` on only 7/24 (29.2%) questions, misclassifying 10 as `OKF_ONLY`, 5 as `RAG_ONLY`, and 2 as `HYBRID`.

Across all 26 [VERIFY] V2 escalations, 17 [VERIFY] were triggered by the answer generator returning `INSUFFICIENT`, 8 [VERIFY] by the classifier predicting `ESCALATE`, and 1 [VERIFY] by the OKF keyword matcher finding no matching file (`NO_OKF_MATCH`). When routing was correct, V2 achieved an answer correctness of 14/24 (58.3%) [VERIFY]; on the single answered inquiry where routing was misclassified, correctness was 1/1 (100.0%) [VERIFY].

### 5.5 Conflict Category Deep-Dive and Source Asymmetry

The `human_fallback_conflict` category requires detecting contradictory rules between an airline-specific cancellation policy and a general refund policy (`refund-policy-general.md`), demanding escalation specifically with reason `CONFLICT`.

**Table 5: Conflict Category Performance (8 Questions)**
| Conflict Metric | V1 | V2 |
|---|---|---|
| **Correct Escalation via CONFLICT** | 0/8 (0.0%) [VERIFY] | 0/8 (0.0%) [VERIFY] |
| **Safe Escalation (Any Reason)** | 1/8 (12.5%) [VERIFY] | 4/8 (50.0%) [VERIFY] |
| **Retrieved Both Conflicting Files** | 8/8 (100.0%) [VERIFY] | 0/8 (0.0%) [VERIFY] |

Neither system achieved the strict benchmark criterion of escalating with reason `CONFLICT` (0/8 or 0.0% [VERIFY] for both). However, V1 retrieved both conflicting policy documents in 8/8 (100.0%) [VERIFY] cases, because its top-3 retrieval from the combined collection pulled both files. In contrast, V2 retrieved both documents in 0/8 (0.0%) [VERIFY] cases, because V2's OKF matcher returns at most one top-scoring policy file, and ESCALATE classifications bypass retrieval entirely.

### 5.6 Latency and Token Cost

Table 6 details latency benchmarks measured across 3 [VERIFY] repetitions on a 20-question [VERIFY] test subset (60 [VERIFY] total observations per system) with cache bypassed, alongside full-run token usage.

**Table 6: Latency and Token Usage Benchmark**
| Metric | V1 (RAG Baseline) | V2 (Classify-First) |
|---|---|---|
| **Timing Subset Median Latency** | 1070 ms [VERIFY] | 934 ms [VERIFY] |
| **Timing Subset p95 Latency** | 1614 ms [VERIFY] | 1755 ms [VERIFY] |
| **Paired Median Latency Difference (V2 - V1)** | -306 ms [VERIFY] | -306 ms [VERIFY] |
| **V2 Stage: Classification Median Latency** | — | 155 ms [VERIFY] |
| **V2 Stage: Targeted Retrieval Median Latency** | — | 556 ms [VERIFY] |
| **V2 Stage: Generation Median Latency** | — | 250 ms [VERIFY] |
| **Indicative Mean Tokens / Question** | 947 [VERIFY] | 740 [VERIFY] |
| **Indicative Median Latency (Full Run)** | 1191 ms [VERIFY] | 399 ms [VERIFY] |

---

## 6. Discussion

We address the three research questions directly from the empirical results:

### RQ1: Classification Reliability
On this synthetic test set, zero-shot LLM classification from question text alone achieved an overall accuracy of 37/56 (66.1%) [VERIFY]. The classifier proved highly accurate when identifying inquiries that require operational event data (8/8 [VERIFY] for `RAG_ONLY` and 8/8 [VERIFY] for `HYBRID`) and policy inquiries (14/16 [VERIFY] for `OKF_ONLY`). 

However, the classifier struggled significantly on unanswerable inquiries (`ESCALATE`), correctly identifying only 7/24 (29.2%) [VERIFY]. 10 unanswerable queries were routed to `OKF_ONLY` and 5 to `RAG_ONLY`.
[AUTHOR: interpretation of why unanswerable inquiries were misclassified by the LLM from question text alone].

### RQ2: Impact of Targeted Retrieval on Accuracy
When routing succeeded, targeted retrieval did not yield higher answer accuracy than undifferentiated retrieval on answerable queries. On non-escalated questions, both systems achieved 60.0% answer accuracy (18/30 [VERIFY] for V1 vs. 15/25 [VERIFY] for V2). On the 8 [VERIFY] `rag_only` questions, both systems scored identically at 4/8 (50.0%) [VERIFY]. In the `hybrid` category, V2 achieved 4/8 (50.0%) [VERIFY] compared to 3/8 (37.5%) [VERIFY] for V1.

Crucially, V2's primary impact was error reduction rather than increased raw correctness: V2 achieved a lower wrong-answer rate (15/56 or 26.8% [VERIFY] vs. 20/56 or 35.7% [VERIFY] for V1 overall; 14/48 or 29.2% [VERIFY] vs. 19/48 or 39.6% [VERIFY] when excluding stale policies).
[AUTHOR: interpretation of why targeted retrieval reduced wrong answers primarily through safe downstream escalation rather than higher answer accuracy].

### RQ3: Cost and Latency Trade-Offs
Contrary to the intuitive expectation that introducing an upfront LLM classification step would increase latency and token consumption, V2 proved more token-efficient and exhibited comparable latency on average. V2 consumed an average of 740 [VERIFY] tokens per question compared to 947 [VERIFY] for V1. In the 3-repetition timing benchmark, V2 showed a median latency of 934 ms [VERIFY] versus 1070 ms [VERIFY] for V1 (a paired median difference of -306 ms [VERIFY]).

This efficiency stems from pipeline short-circuiting: when V2 classifies an inquiry as `ESCALATE` (8 cases [VERIFY]) or when the OKF matcher yields no hit (1 case [VERIFY]), answer generation is bypassed entirely. Furthermore, when answering `OKF_ONLY` questions, V2 injects a single matched policy file rather than top-3 chunks, reducing prompt token overhead.
[AUTHOR: interpretation of latency trade-offs between classification overhead and generation prompt size].

---

## 7. Limitations

1. **Synthetic Single-Domain Corpus and Sample Size:** The evaluation was conducted on a synthetic dataset of 56 [VERIFY] frozen test questions across travel scenarios. While designed to cover key operational modalities, results cannot be assumed to generalize to organic, high-volume production support traffic.
2. **Single Model Pair:** Experiments were conducted exclusively with Qwen 2.5 27B (`qwen/qwen3.8-27b`) and `gemini-embedding-001`. Performance may vary across different parameter scales or embedding architectures.
3. **Misclassification Propagation:** In V2, classification acts as a hard filter. Misclassifying an inquiry (e.g., routing an event inquiry to `OKF_ONLY`) inherently prevents the retrieval stage from accessing relevant documents, bounding V2's retrieval hit rate at 27/32 (84.4%) [VERIFY] compared to 32/32 (100.0%) [VERIFY] for V1.
4. **Basic Keyword OKF Matching:** The OKF retrieval stage relies on lexical token overlap without synonym expansion, semantic tags, or learned reranking. Ties are resolved alphabetically, and only the single top-scoring file is returned.
5. **Untuned Similarity Floor:** The similarity floor (`RAG_SIM_FLOOR = 0.3` [VERIFY]) was chosen a priori and was never tuned. In the observed V2 test logs, this floor fired 0 [VERIFY] times; hence, its efficacy in preventing out-of-domain hallucination remains unverified in this run.
6. **Free-Tier Infrastructure and Multi-Day Execution:** Multi-day runs necessitated by free-tier rate limits introduce potential external latency variance. While temperature 0 and response caching ensure deterministic generation, no statistical variance over multiple independent generation runs is estimated.
7. **Stale Policy Category Interpretation:** Neither system utilizes document metadata (such as `stale_after`) or external temporal verification. The stale-policy category evaluates strict adherence to provided source text (source-faithfulness) rather than real-world factual truth. Headline results are therefore reported both across all 56 [VERIFY] test questions and across 48 [VERIFY] questions excluding this category.
8. **Architectural Asymmetry in Conflict Detection:** Correct handling of contradictory policies requires the system to emit `CONFLICT`. However, V1 retrieved both conflicting documents in 8/8 (100.0%) [VERIFY] cases due to top-3 vector retrieval, whereas V2 retrieved both documents in 0/8 (0.0%) [VERIFY] cases because OKF matching is restricted to top-1 file and ESCALATE classifications bypass retrieval. Neither system successfully emitted `CONFLICT` (0/8 [VERIFY]).
9. **Stripped HTML Comments:** Policy documents in the test corpus contained HTML comments stating current ground-truth values. These comments were stripped programmatically prior to embedding and retrieval, ensuring neither system had access to commented corrections.
10. **Product Shell Separation:** The travel agency web application (user authentication, flight browsing, demo booking, staff dashboard) serves solely as an operational interface. It was not evaluated for usability or user satisfaction, and customer booking data was not exposed to the core research evaluation pipeline.

---

## 8. Conclusion

This study evaluated an LLM-based classify-then-retrieve architecture (V2) against a combined-index RAG baseline (V1) for travel customer support. On a frozen test set of 56 [VERIFY] questions, V2 did not achieve higher overall correctness (30/56 or 53.6% [VERIFY] vs. 33/56 or 58.9% [VERIFY] for V1). However, when excluding an intentionally stale policy category, both systems achieved identical overall correctness (26/48 or 54.2% [VERIFY]). V2 demonstrated a lower wrong-answer rate (14/48 or 29.2% [VERIFY] vs. 19/48 or 39.6% [VERIFY] for V1) by routing uncertain or unanswerable queries to human escalation, while lowering average token consumption and maintaining competitive latency.

Future work includes exploring multi-label and confidence-calibrated classification, multi-document policy retrieval to resolve cross-source contradictions, automated trust-weighting based on document freshness metadata, and evaluating on organic customer support logs across diverse industrial domains.

---

## 9. Verification & Action Checklist

### [VERIFY] Items (Checked against `paper/numbers.md`)
- [ ] 56 frozen test questions across 7 categories (8 questions per category)
- [ ] V1 overall correctness: 33/56 (58.9%)
- [ ] V2 overall correctness: 30/56 (53.6%)
- [ ] Sensitivity analysis overall correctness (excl. stale): 26/48 (54.2%) for both V1 and V2
- [ ] V1 wrong answer rate: 20/56 (35.7%) overall; 19/48 (39.6%) excl. stale
- [ ] V2 wrong answer rate: 15/56 (26.8%) overall; 14/48 (29.2%) excl. stale
- [ ] V1 escalation rate: 18/56 (32.1%)
- [ ] V2 escalation rate: 26/56 (46.4%)
- [ ] V1 unnecessary escalation rate: 2/32 (6.3%)
- [ ] V2 unnecessary escalation rate: 7/32 (21.9%)
- [ ] Answer accuracy on non-escalated questions: V1 18/30 (60.0%), V2 15/25 (60.0%)
- [ ] Answer accuracy excl. stale: V1 11/22 (50.0%), V2 11/20 (55.0%)
- [ ] Retrieval hit rate (`sourceRetrieved`): V1 32/32 (100.0%), V2 27/32 (84.4%)
- [ ] 18 OKF files, 30 notices, 48 combined collection chunks, 30 notices collection chunks
- [ ] Top-3 retrieval parameter for vector search; 0.3 similarity floor
- [ ] Git commit hash: `ee41f37997be108dfdc348b3d0348cfd3b5bc9e8`, tag `frozen-eval`
- [ ] 288 total experiment logs (56 dev, 112 test, 120 timing)
- [ ] Manual grade overrides applied: 0 author, 22 agent-proposed
- [ ] V2 routing accuracy: 37/56 (66.1%)
- [ ] V2 invalid labels: 0
- [ ] V2 similarity floor firings (< 0.3): 0
- [ ] Confusion matrix counts: OKF_ONLY (14, 0, 1, 1), RAG_ONLY (0, 8, 0, 0), HYBRID (0, 0, 8, 0), ESCALATE (10, 5, 2, 7)
- [ ] V2 escalations by reason: 17 INSUFFICIENT, 8 CLASSIFIER_ESCALATE, 1 NO_OKF_MATCH
- [ ] V2 accuracy conditional on routing: 14/24 (58.3%) correct routing, 1/1 (100.0%) misclassified
- [ ] Conflict category CONFLICT escalation: 0/8 (0.0%) for both V1 and V2
- [ ] Conflict safe escalation: V1 1/8 (12.5%), V2 4/8 (50.0%)
- [ ] Conflict retrieved both files: V1 8/8 (100.0%), V2 0/8 (0.0%)
- [ ] Timing subset median latency: V1 1070 ms, V2 934 ms; p95: V1 1614 ms, V2 1755 ms
- [ ] Timing paired median difference: -306 ms
- [ ] Timing V2 stages median: classification 155 ms, retrieval 556 ms, generation 250 ms
- [ ] Indicative mean tokens/question: V1 947, V2 740
- [ ] Indicative median latency: V1 1191 ms, V2 399 ms

### [NEED] Items
- [ ] `[NEED: search query "retrieval augmented generation dense passage retrieval survey"]`
- [ ] `[NEED: search query "llm hallucination mitigation abstention unanswerable questions qa"]`
- [ ] `[NEED: search query "customer support conversational agents hybrid retrieval rule-based vector search"]`
- [ ] `[NEED: search query "structured knowledge retrieval policy document question answering"]`

### [CITE] Items
- [ ] `[CITE: standard RAG]`
- [ ] `[CITE: Lewis et al. RAG]`
- [ ] `[CITE: LLM abstention and calibration studies]`
- [ ] `[CITE: enterprise support bot architectures]`
- [ ] `[CITE: policy QA benchmarks]`

### [AUTHOR] Items
- [ ] `[AUTHOR: interpretation of why unanswerable inquiries were misclassified by the LLM from question text alone]`
- [ ] `[AUTHOR: interpretation of why targeted retrieval reduced wrong answers primarily through safe downstream escalation rather than higher answer accuracy]`
- [ ] `[AUTHOR: interpretation of latency trade-offs between classification overhead and generation prompt size]`

