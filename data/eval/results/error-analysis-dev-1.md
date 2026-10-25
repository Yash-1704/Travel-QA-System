# Error Analysis Template: dev-1

**Date:** 2026-10-24T14:05:26.791Z  
**Total Error & Misrouted Cases for Review:** 33  

> [!NOTE]
> Instructions for Author: For each failure case below, write a one-sentence factual diagnosis
> explaining why the error occurred, and select one failure type.

### [V1] q-001 (okf_only)

- **Question:** "What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "The cancellation fee is USD 45. The remaining balance of the base fare is refunded to your original payment method within 14 business days."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The cancellation fee for a SkyNova Air Economy Saver ticket cancelled more than 72 hours before the flight is USD 45. [OKF:cancellation-skynova-economy.md]"
- **Retrieved Items:** `cancellation-skynova-economy.md, no-show-policy.md, refund-policy-general.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-001 (okf_only)

- **Question:** "What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "The cancellation fee is USD 45. The remaining balance of the base fare is refunded to your original payment method within 14 business days."
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The cancellation fee for a SkyNova Air Economy Saver ticket if cancelled more than 72 hours before the flight is USD 45. [OKF:cancellation-skynova-economy.md]"
- **Retrieved Items:** `cancellation-skynova-economy.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-002 (okf_only)

- **Question:** "How many kilograms of checked baggage can I bring on ArcticJet Business class?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "ArcticJet Business class passengers are entitled to 2 checked bags, each with a maximum weight of 32 kg, giving a total free checked allowance of 64 kg."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "You can bring 2 checked bags, each with a maximum weight of 32 kg, on ArcticJet Business class. [OKF:baggage-arcticjet-all.md]"
- **Retrieved Items:** `baggage-arcticjet-all.md, notice-0015, cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-002 (okf_only)

- **Question:** "How many kilograms of checked baggage can I bring on ArcticJet Business class?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "ArcticJet Business class passengers are entitled to 2 checked bags, each with a maximum weight of 32 kg, giving a total free checked allowance of 64 kg."
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `baggage-vistaair-business.md`
- **Expected Source Retrieved:** `no`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-003 (okf_only)

- **Question:** "Do Indian passport holders need a visa to visit Thaloria?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "No. Indian passport holders do not require a visa to enter Thaloria. Entry is visa-free for up to 30 days. The passport must be valid for at least 6 months."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "No, Indian passport holders do not require a visa to enter Thaloria for tourism or short visits. Entry is visa-free, with a maximum stay of 30 days per visit. [OKF:visa-country-a-thaloria.md]"
- **Retrieved Items:** `visa-country-a-thaloria.md, visa-country-b-emiria.md, visa-country-e-zorovia.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-003 (okf_only)

- **Question:** "Do Indian passport holders need a visa to visit Thaloria?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "No. Indian passport holders do not require a visa to enter Thaloria. Entry is visa-free for up to 30 days. The passport must be valid for at least 6 months."
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "No, Indian passport holders do not require a visa to enter Thaloria for tourism or short visits. Entry is visa-free, with a maximum stay of 30 days per visit. [OKF:visa-country-a-thaloria.md]"
- **Retrieved Items:** `visa-country-a-thaloria.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-004 (okf_only)

- **Question:** "What happens to airport taxes if I cancel a SkyNova Economy Saver ticket within 24 hours of departure?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "Airport taxes and statutory fees are refunded within 14 business days, even though the base fare and fuel surcharge are fully forfeited when cancelling within 24 hours of departure."
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `baggage-skynova-economy.md`
- **Expected Source Retrieved:** `no`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-014 (rag_only)

- **Question:** "What caused the delay on AJ-512 on 22 May 2026?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Flight AJ-512 on 22 May 2026 arrived at Tokyo Narita 6 hours and 50 minutes behind schedule due to a technical fault in the aircraft's auxiliary power unit (APU) discovered during pre-flight checks at Delhi. A replacement aircraft had to be repositioned from Mumbai."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The delay on flight AJ-512 on 22 May 2026 was caused by a technical fault in the aircraft's auxiliary power unit (APU) discovered during pre-flight checks at Delhi. A replacement aircraft had to be repositioned from Mumbai, which contributed to the total delay duration. [RAG:notice-0002]"
- **Retrieved Items:** `notice-0002, notice-0008, notice-0018`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-014 (rag_only)

- **Question:** "What caused the delay on AJ-512 on 22 May 2026?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Flight AJ-512 on 22 May 2026 arrived at Tokyo Narita 6 hours and 50 minutes behind schedule due to a technical fault in the aircraft's auxiliary power unit (APU) discovered during pre-flight checks at Delhi. A replacement aircraft had to be repositioned from Mumbai."
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The delay on flight AJ-512 on 22 May 2026 was caused by a technical fault in the aircraft's auxiliary power unit (APU) discovered during pre-flight checks at Delhi. A replacement aircraft had to be repositioned from Mumbai, which contributed to the total delay duration. [RAG:notice-0002]"
- **Retrieved Items:** `notice-0002, notice-0008, notice-0018`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-016 (rag_only)

- **Question:** "Is the SkyNova Air Delhi to Bangkok flight running normally on Tuesdays?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "No. Effective 1 August 2026, SkyNova Air suspended the SN-202 Delhi–Bangkok service on Tuesdays and Thursdays for 8 weeks due to low seasonal demand. Passengers on affected bookings are being rerouted or offered a full refund."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, the SkyNova Air Delhi to Bangkok flight (SN-202) is **not** running normally on Tuesdays starting from **1 August 2026**.

According to the operational notice, effective 1 August 2026, SkyNova Air will suspend its SN-202 service on Tuesdays and Thursdays for a period "
- **Retrieved Items:** `notice-0019, notice-0011, notice-0001`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-016 (rag_only)

- **Question:** "Is the SkyNova Air Delhi to Bangkok flight running normally on Tuesdays?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "No. Effective 1 August 2026, SkyNova Air suspended the SN-202 Delhi–Bangkok service on Tuesdays and Thursdays for 8 weeks due to low seasonal demand. Passengers on affected bookings are being rerouted or offered a full refund."
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, the SkyNova Air Delhi to Bangkok flight (SN-202) is **not** running normally on Tuesdays starting from **1 August 2026**.

According to the operational notice, effective 1 August 2026, SkyNova Air will suspend its SN-202 service on Tuesdays and Thursdays for a period "
- **Retrieved Items:** `notice-0019, notice-0011, notice-0001`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-025 (hybrid)

- **Question:** "My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to any compensation from SkyNova Air?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Yes. Flight SN-101 on 17 June 2026 was delayed by 8 hours and 20 minutes due to an oil leak in the left engine — a technical issue within SkyNova Air's operational responsibility. Under SkyNova Air's delay compensation policy, delays of more than 6 hours caused by airline fault entitle passengers to USD 150 cash compensation plus a meal. You can submit a compensation claim within 90 days of the flight."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Yes, you are entitled to compensation.

According to the flight notice, Flight SN-101 on 2026-06-17 was delayed by 8 hours and 20 minutes due to an unscheduled engine maintenance requirement, which is an operational issue within SkyNova Air's control [RAG:notice-0009].

Under SkyNova Air's delay com"
- **Retrieved Items:** `notice-0009, notice-0001, delay-compensation.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-025 (hybrid)

- **Question:** "My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to any compensation from SkyNova Air?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Yes. Flight SN-101 on 17 June 2026 was delayed by 8 hours and 20 minutes due to an oil leak in the left engine — a technical issue within SkyNova Air's operational responsibility. Under SkyNova Air's delay compensation policy, delays of more than 6 hours caused by airline fault entitle passengers to USD 150 cash compensation plus a meal. You can submit a compensation claim within 90 days of the flight."
- **What Happened:** Classification=`HYBRID`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Yes, you are entitled to compensation.

According to the flight notice, Flight SN-101 on 2026-06-17 was delayed by 8 hours and 20 minutes due to an unscheduled engine maintenance requirement, which is classified as an operational issue within SkyNova Air's control [RAG:notice-0009].

Under SkyNova A"
- **Retrieved Items:** `delay-compensation.md, notice-0009, notice-0001, notice-0006`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-027 (hybrid)

- **Question:** "Was the delay on VA-801 on 8 July 2026 the airline's fault, and am I entitled to compensation?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight VA-801 on 8 July 2026 was delayed by 3 hours and 15 minutes due to air traffic control holding delays over European airspace for the inbound aircraft. This is classified as extraordinary circumstances beyond VistaAir's control. Because the delay was not caused by the airline, VistaAir's compensation policy does not apply and financial compensation is not payable. Meal and refreshments should have been provided at the airport as the delay exceeded 3 hours."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, the delay on flight VA-801 on 2026-07-08 was **not** the airline's fault. The delay was caused by a late inbound aircraft (VA-802) that experienced air traffic control holding delays over European airspace. This situation is explicitly classified as "extraordinary cir"
- **Retrieved Items:** `notice-0003, notice-0007, notice-0010`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-027 (hybrid)

- **Question:** "Was the delay on VA-801 on 8 July 2026 the airline's fault, and am I entitled to compensation?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight VA-801 on 8 July 2026 was delayed by 3 hours and 15 minutes due to air traffic control holding delays over European airspace for the inbound aircraft. This is classified as extraordinary circumstances beyond VistaAir's control. Because the delay was not caused by the airline, VistaAir's compensation policy does not apply and financial compensation is not payable. Meal and refreshments should have been provided at the airport as the delay exceeded 3 hours."
- **What Happened:** Classification=`HYBRID`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, the delay on flight VA-801 on 8 July 2026 was **not** the airline's fault. The delay was caused by air traffic control holding delays over European airspace, which are classified as extraordinary circumstances beyond VistaAir's control [RAG:notice-0003].

According to"
- **Retrieved Items:** `delay-compensation.md, notice-0003, notice-0007, notice-0010`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-028 (hybrid)

- **Question:** "SkyNova flight SN-303 was delayed 3 hours and 45 minutes on 19 January 2026 due to crew issues. What are my compensation options?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight SN-303 on 19 January 2026 was delayed by 3 hours and 45 minutes due to crew scheduling issues at Mumbai, which is classified as an airline operational issue within SkyNova Air's control. Under SkyNova Air's delay compensation policy, delays of 2 to 4 hours caused by airline fault entitle passengers to a USD 50 meal voucher. You can submit a claim within 90 days of the flight."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, here are your compensation options for SkyNova Air flight SN-303:

1.  **USD 50 Meal Voucher**: The delay was 3 hours and 45 minutes, which falls into the category of "2 hours or more, up to 4 hours." Since the delay was caused by crew scheduling issues (an airline op"
- **Retrieved Items:** `notice-0006, notice-0001, delay-compensation.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-038 (human_fallback_stale)

- **Question:** "How long does a refund from an airline-initiated cancellation take to process?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "airline-initiated cancellation refunds within 10 business days"
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "A refund from an airline-initiated cancellation is processed within 7 business days. [OKF:cancellation-arcticjet-economy.md]"
- **Retrieved Items:** `cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `no`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-040 (human_fallback_stale)

- **Question:** "How many business days does a standard fare refund take?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "standard refunds take 21 business days"
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `no`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-049 (human_fallback_no_evidence)

- **Question:** "Was there a delay on ArcticJet flight AJ-511 from Bangkok to Singapore last month?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0008, notice-0005, notice-0002`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-050 (human_fallback_no_evidence)

- **Question:** "Has there been any baggage incident on the VistaAir Mumbai to New York route in the past week?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0013, notice-0024, notice-0010`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-051 (human_fallback_no_evidence)

- **Question:** "What was the reason for the delay on SkyNova flight SN-505 on 3 September 2026?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0006, notice-0001, notice-0009`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-052 (human_fallback_no_evidence)

- **Question:** "Are there any current advisories about the VistaAir Delhi to Tokyo route?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0021, notice-0003, notice-0013`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-061 (human_fallback_ambiguous)

- **Question:** "Can I bring my pet snake on board?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "No, you cannot bring a pet snake on board under standard passenger procedures. The policy explicitly states that exotic, unusual, or non-standard animals, including reptiles, are not covered and cannot be transported. Passengers wishing to travel with such animals must contact the airline's special "
- **Retrieved Items:** `pets-policy.md, baggage-skynova-economy.md, baggage-vistaair-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-061 (human_fallback_ambiguous)

- **Question:** "Can I bring my pet snake on board?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "No, you cannot bring a pet snake on board under standard passenger procedures. The policy explicitly states that exotic, unusual, or non-standard animals, including reptiles, are not covered and cannot be transported. Passengers wishing to travel with such animals must contact the airline's special "
- **Retrieved Items:** `pets-policy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-063 (human_fallback_ambiguous)

- **Question:** "My flight was delayed. What should I do?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, here is what you should do:

1.  **Check the cause of the delay:** Compensation is only payable if the delay was caused by factors within the airline's control (such as crew unavailability, technical faults, or operational issues). Delays caused by extraordinary circu"
- **Retrieved Items:** `delay-compensation.md, notice-0005, notice-0001`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-073 (human_fallback_conflict)

- **Question:** "How long does a SkyNova Air refund take to process?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The processing time for a SkyNova Air refund depends on the reason for the cancellation:

*   **Passenger-initiated cancellation (Economy Saver or Flex):** The remaining balance is refunded within **14 business days** [OKF:cancellation-skynova-economy.md].
*   **Airline-initiated cancellation:** The"
- **Retrieved Items:** `refund-policy-general.md, cancellation-skynova-economy.md, delay-compensation.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-073 (human_fallback_conflict)

- **Question:** "How long does a SkyNova Air refund take to process?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The processing time for a SkyNova Air refund depends on the type of cancellation:

*   **Passenger-initiated cancellations:** The remaining balance (or taxes/fees, if applicable) is refunded within **14 business days** [OKF:cancellation-skynova-economy.md].
*   **Airline-initiated cancellations:** T"
- **Retrieved Items:** `cancellation-skynova-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-074 (human_fallback_conflict)

- **Question:** "How long does an ArcticJet refund take after an airline-initiated cancellation?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The refund is processed within 7 business days. [OKF:cancellation-arcticjet-economy.md]"
- **Retrieved Items:** `cancellation-arcticjet-economy.md, refund-policy-general.md, delay-compensation.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-074 (human_fallback_conflict)

- **Question:** "How long does an ArcticJet refund take after an airline-initiated cancellation?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The refund is processed within 7 business days. [OKF:cancellation-arcticjet-economy.md]"
- **Retrieved Items:** `cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-075 (human_fallback_conflict)

- **Question:** "What is the standard refund processing time after a passenger cancels a flight?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The standard refund processing time after a passenger cancels a flight is **21 business days** [OKF:refund-policy-general.md].

Note: Specific airline policies may differ. For example, ArcticJet and VistaAir economy fares specify a refund within **14 business days** for cancellations made more than "
- **Retrieved Items:** `refund-policy-general.md, cancellation-arcticjet-economy.md, cancellation-vistaair-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-075 (human_fallback_conflict)

- **Question:** "What is the standard refund processing time after a passenger cancels a flight?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The standard refund processing time after a passenger cancels a flight is **21 business days**.

[OKF:refund-policy-general.md]"
- **Retrieved Items:** `refund-policy-general.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-076 (human_fallback_conflict)

- **Question:** "How quickly will I get my money back if I cancel a VistaAir flight?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The refund timeline depends on whether the cancellation is initiated by you (the passenger) or by the airline, and the specific fare class.

**If you cancel your ticket:**
*   **VistaAir Economy:**
    *   If cancelled more than 24 hours before departure, the remaining balance is refunded within **1"
- **Retrieved Items:** `cancellation-vistaair-economy.md, refund-policy-general.md, cancellation-vistaair-business.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-076 (human_fallback_conflict)

- **Question:** "How quickly will I get my money back if I cancel a VistaAir flight?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `baggage-vistaair-business.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

