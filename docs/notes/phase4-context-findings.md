# Phase 4 Customer Context Findings

Date: 2026-10-24
Real-Stack Test Environment: Live backend on `http://127.0.0.1:3001` with V2 classify-then-retrieve pipeline.

---

## 1. Test Summary

The customer context resolution mechanism was tested against the live server using real session authentication from seeded accounts in MongoDB.

### Scenario A: Multiple Bookings with No Booking ID (Clarification Flow)
- **User:** Arjun Sharma (`arjun.sharma@email.com`, `cust-001`)
- **Query:** `"Why was my flight delayed?"`
- **Session Bookings:** 3 bookings (`BK-10007`, `BK-10001`, `BK-10002`)
- **Outcome:** `CLARIFY` (HTTP 200, zero LLM calls, zero token consumption)
- **Clarification Message:** `"Which booking do you mean?"`
- **Returned Options:**
  1. `BK-10007: SN-101 (2026-10-28)` (Created via website booking in Phase 3B)
  2. `BK-10001: SN-101 (2026-06-17)` (Seeded)
  3. `BK-10002: SN-303 (2026-01-19)` (Seeded)

### Scenario B: Customer Selection of Booking BK-10002
- **User:** Arjun Sharma (`cust-001`)
- **Supplied Booking ID:** `BK-10002`
- **Original Question:** `"Why was my flight delayed?"`
- **Augmented Question:** `"Why was my flight delayed? (Context: customer's booking BK-10002, flight SN-303, SkyNova Air, route BOM-DXB, Economy Flex, travel date 2026-01-19)"`
- **V2 Classification:** `RAG_ONLY`
- **Retrieved Notices (Top 3 Cosine Similarity):**
  1. `notice-0006` (similarity: `0.8409`) — **Target Matching Notice**
  2. `notice-0001` (similarity: `0.8169`)
  3. `notice-0014` (similarity: `0.8024`)
- **Generated Answer:**
  > *"Your flight SN-303 on 2026-01-19 was delayed by 3 hours and 45 minutes due to crew scheduling issues at Mumbai. Specifically, a first officer originally rostered for the flight was reassigned to cover an emergency on another route, requiring a replacement first officer to be called in from standby. This delay is classified as an airline operational issue within SkyNova Air's control. [RAG:notice-0006]"*
- **Citations:** `[RAG:notice-0006]`
- **Matching Notice Hit:** **YES (Hit target `notice-0006` directly with 0.8409 similarity)**

### Scenario C: Customer Selection of Booking BK-10003
- **User:** Priya Mehta (`priya.mehta@email.com`, `cust-002`)
- **Supplied Booking ID:** `BK-10003`
- **Original Question:** `"Why was my flight delayed?"`
- **Augmented Question:** `"Why was my flight delayed? (Context: customer's booking BK-10003, flight AJ-512, ArcticJet, route DEL-NRT, Economy, travel date 2026-05-22)"`
- **V2 Classification:** `RAG_ONLY`
- **Retrieved Notices (Top 3 Cosine Similarity):**
  1. `notice-0002` (similarity: `0.8512`) — **Target Matching Notice**
  2. `notice-0005` (similarity: `0.7790`)
  3. `notice-0008` (similarity: `0.7755`)
- **Generated Answer:**
  > *"Your flight AJ-512 on 2026-05-22 was delayed due to a technical fault in the aircraft's auxiliary power unit (APU) discovered during pre-flight checks at Delhi. A replacement aircraft was sourced from Mumbai, which required repositioning and contributed to the total delay of 6 hours and 50 minutes. [RAG:notice-0002]"*
- **Citations:** `[RAG:notice-0002]`
- **Matching Notice Hit:** **YES (Hit target `notice-0002` directly with 0.8512 similarity)**

---

## 2. Findings & Observations

1. **Context Injection Effectiveness:** Appending ` (Context: customer's booking ${bookingId}, flight ${flightNo}, ${airline}, route ${route}, ${fareClass}, travel date ${date})` to ambiguous queries like `"Why was my flight delayed?"` allows the V2 classifier to correctly classify the query as `RAG_ONLY` (routing to event notices instead of general delay compensation policies in OKF).
2. **Dense Semantic Alignment:** The flight number and date in the context string strongly align with the embedding representations of the operational notices, giving cosine similarities > 0.84 directly to the exact delay record for that specific departure.
3. **Zero Token Clarification:** When customers possess multiple active or completed bookings, clarification options are generated purely server-side from MongoDB session data, completely eliminating unnecessary LLM generation calls.
