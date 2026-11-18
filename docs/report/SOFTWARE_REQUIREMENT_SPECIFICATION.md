# SOFTWARE REQUIREMENT SPECIFICATION (SRS)
## Intelligent Travel Support Question Answering & Booking System (Travel QA)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirement Specification (SRS) defines the functional and non-functional requirements for the **Travel Support QA System**. The system integrates an enterprise question-answering assistant (comparing undifferentiated RAG and classify-then-retrieve architectures) into an interactive travel agency web portal.

### 1.2 Document Conventions
- **MUST / SHALL**: Mandatory requirement for compliance.
- **SHOULD**: High-priority recommendation.
- **MAY**: Optional enhancement.

### 1.3 Intended Audience
- Development and QA Engineering teams.
- Academic Project Supervisors and Evaluators (ABESEC / AKTU).
- Enterprise Customer Support Staff and Travel Operations Managers.

---

## 2. Overall Description

### 2.1 Product Perspective
The application is a standalone, full-stack 3-tier enterprise solution consisting of:
1. **Frontend Presentation Tier:** React 18 Single Page Application (SPA) styled with Tailwind CSS.
2. **Backend Application Tier:** Node.js v20+ with Express.js REST APIs in native ES Modules.
3. **Data & Vector Storage Tier:** MongoDB 7.0 for relational document storage and ChromaDB for vector similarity search.
4. **AI Inference Services:** Groq Cloud API for `qwen/qwen3.8-27b` inference and Google Cloud Gemini API for `gemini-embedding-001` dense embeddings.

### 2.2 Product Functions
1. **User Authentication & Role-Based Access Control (RBAC):**
   - Secure customer registration, login, and session validation using JWT cookies.
   - Distinct authorization policies for `customer` and `agent` roles.
2. **Flight Search & Booking Workflows:**
   - Real-time catalog filtering by origin, destination, and departure date.
   - Passenger seat allocation and reservation generation.
3. **Dual-Architecture Support Chat:**
   - **V1 (RAG Baseline):** Single-index vector search across policy and event documents.
   - **V2 (Classify-Then-Retrieve):** Zero-shot query routing into `OKF_ONLY`, `RAG_ONLY`, `HYBRID`, or `ESCALATE` with multi-store retrieval.
   - Source citations (`[OKF:filename]`, `[RAG:notice-id]`).
   - Automated escalation on uncertainty (`INSUFFICIENT`, `CONFLICT`, `NO_EVIDENCE`).
4. **Staff Support Queue Management:**
   - Real-time dashboard for support agents to inspect escalated customer cases.
   - Context viewing (query, failure reason, retrieved context chunks).
   - Authoritative manual resolution dispatch.

### 2.3 User Characteristics
- **Customer:** End-user booking flights, checking flight updates, or inquiring about travel policies via the AI chat interface. Requires an intuitive, zero-training GUI.
- **Support Staff (Agent):** Operations professional reviewing unresolved customer inquiries, verifying policy rules, and submitting manual responses.

### 2.4 Constraints
- **AVX Support:** Host CPU must support AVX instructions for MongoDB 7.0 Docker execution.
- **Zero-Floor Tuning:** ChromaDB cosine similarity threshold is locked at `0.3` without empirical tuning.
- **Groq API Free-Tier Limits:** Enforce conservative daily rate limits (90,000 tokens/day; 10,000 ms spacing).
- **Evaluation Isolation:** Research evaluation scripts run strictly headlessly, bypassing UI and customer database dependencies.

---

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces
- **Home & Flight Search (`/`, `/flights`):** Modern responsive interface for origin/destination query inputs and flight cards with pricing and seat availability.
- **Booking Checkout (`/book/:flightId`):** Form capturing passenger details, passport numbers, and mock payment confirmation.
- **Support Chat (`/chat`):** Interactive messaging interface displaying streaming or formatted markdown responses with clickable citation pills.
- **Staff Support Queue (`/staff/support`):** Tabular case queue with filtering by status (`open`, `resolved`) and detail inspection drawer.

#### 3.1.2 Software Interfaces
- **ChromaDB REST API:** HTTP connection to `http://localhost:8000/api/v1` for vector collection management and query embedding cosine search.
- **MongoDB Node Driver:** Native connection string `mongodb://localhost:27017/travel_qa`.
- **Groq Cloud API:** Outbound HTTPS requests to `https://api.groq.com/openai/v1/chat/completions`.
- **Google Cloud Gemini API:** Outbound HTTPS requests to `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents`.

#### 3.1.3 Communications Interfaces
- All internal API calls execute over HTTP/1.1 REST using JSON format.
- Authentication utilizes HTTP-only, secure, SameSite cookies carrying signed JSON Web Tokens (JWT).

---

## 4. System Features & Functional Requirements

### 4.1 Feature 1: Intelligent Question Answering & Routing
- **FR-1.1:** System MUST classify incoming user questions into one of four labels: `OKF_ONLY`, `RAG_ONLY`, `HYBRID`, or `ESCALATE`.
- **FR-1.2:** If classified as `OKF_ONLY`, system MUST retrieve the single highest-scoring markdown policy file using lexical keyword scoring.
- **FR-1.3:** If classified as `RAG_ONLY`, system MUST query the `notices` ChromaDB collection for top-3 chunks with similarity $\ge 0.3$.
- **FR-1.4:** If classified as `HYBRID`, system MUST retrieve both top-1 policy file and top-3 operational notices.
- **FR-1.5:** If classified as `ESCALATE`, system MUST bypass retrieval and immediately log an open case in MongoDB `cases`.
- **FR-1.6:** Generator LLM MUST cite all used evidence using `[OKF:filename]` or `[RAG:notice-id]`.
- **FR-1.7:** Generator LLM MUST return `INSUFFICIENT` if context is inadequate, or `CONFLICT` if contradictory facts are present.

### 4.2 Feature 2: Automated Escalation & Case Management
- **FR-2.1:** Any query triggering `INSUFFICIENT`, `CONFLICT`, `CLASSIFIER_ESCALATE`, `NO_OKF_MATCH`, or `NO_RAG_MATCH` MUST automatically create a case in the `cases` collection.
- **FR-2.2:** Each case MUST record the customer ID, question, system variant (`V1` or `V2`), escalation reason, and retrieved context.
- **FR-2.3:** Support agents MUST be able to query all cases with `status: "open"`.
- **FR-2.4:** Support agents MUST be able to submit a manual resolution, updating `status` to `"resolved"` and setting `resolvedAt` timestamp.

### 4.3 Feature 3: Flight Booking & Reservations
- **FR-3.1:** System MUST seed and maintain a catalog of synthetic domestic and international flights.
- **FR-3.2:** Authenticated customers MUST be able to create reservations, generating a unique booking reference (e.g., `BK-XXXXXX`).
- **FR-3.3:** Booking records MUST decrement available seat counts atomically on the target flight.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **Interactive Chat Latency:** Median response time for V2 chat inquiries SHOULD remain below 1200 ms under normal network conditions.
- **Token Efficiency:** V2 classify-then-retrieve pipeline MUST consume fewer average prompt tokens than the V1 baseline on policy inquiries.

### 5.2 Safety & Security Requirements
- **Password Security:** User passwords MUST be salted and hashed using `bcryptjs` (salt rounds $\ge 10$) prior to persistence.
- **Token Tampering:** JWT sessions MUST be signed with a cryptographically secure server secret.
- **Comment Stripping:** All HTML comments (`<!-- ... -->`) MUST be stripped from policy files during loading to prevent information leakage.
- **Zero Key Leakage:** API keys MUST reside strictly in the server environment (`.env`) and never be emitted to the client bundle or git repository.

### 5.3 Reliability & Availability
- Docker Compose configuration MUST ensure containers automatically restart on unexpected process exits.
- Background evaluation scripts MUST support automated pause-and-resume upon hitting API rate limits.

