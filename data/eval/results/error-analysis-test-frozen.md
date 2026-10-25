# Error Analysis Template: test-frozen

**Date:** 2026-10-25T08:18:39.310Z  
**Total Error & Misrouted Cases for Review:** 58  

> [!NOTE]
> Instructions for Author: For each failure case below, write a one-sentence factual diagnosis
> explaining why the error occurred, and select one failure type.

### [V1] q-005 (okf_only)

- **Question:** "What is the cancellation fee for an ArcticJet economy ticket cancelled between 12 and 48 hours before departure?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "The cancellation fee is USD 120. The remaining balance of the base fare and fuel surcharge is refunded to the original payment method within 14 business days."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The cancellation fee for an ArcticJet economy ticket cancelled between 12 and 48 hours before departure is USD 120. [OKF:cancellation-arcticjet-economy.md]"
- **Retrieved Items:** `cancellation-arcticjet-economy.md, no-show-policy.md, baggage-arcticjet-all.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-005 (okf_only)

- **Question:** "What is the cancellation fee for an ArcticJet economy ticket cancelled between 12 and 48 hours before departure?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "The cancellation fee is USD 120. The remaining balance of the base fare and fuel surcharge is refunded to the original payment method within 14 business days."
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The cancellation fee for an ArcticJet economy ticket cancelled between 12 and 48 hours before departure is USD 120. [OKF:cancellation-arcticjet-economy.md]"
- **Retrieved Items:** `cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-006 (okf_only)

- **Question:** "How much does it cost to cancel a VistaAir Business Sapphire ticket more than 48 hours before departure?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "Cancelling a VistaAir Business Sapphire ticket more than 48 hours before departure is fully refundable with no cancellation fee. The full amount paid, including base fare, fuel surcharge, and taxes, is refunded within 14 business days."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "It costs USD 0 to cancel a VistaAir Business Sapphire ticket more than 48 hours before departure, as the ticket is fully refundable with no cancellation fee. [OKF:cancellation-vistaair-business.md]"
- **Retrieved Items:** `cancellation-vistaair-business.md, cancellation-vistaair-economy.md, baggage-vistaair-business.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-006 (okf_only)

- **Question:** "How much does it cost to cancel a VistaAir Business Sapphire ticket more than 48 hours before departure?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "Cancelling a VistaAir Business Sapphire ticket more than 48 hours before departure is fully refundable with no cancellation fee. The full amount paid, including base fare, fuel surcharge, and taxes, is refunded within 14 business days."
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `baggage-vistaair-business.md`
- **Expected Source Retrieved:** `no`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-008 (okf_only)

- **Question:** "What visa do Indian passport holders need to visit Emiria?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "Indian passport holders can obtain a Visa on Arrival when entering Emiria. The fee is USD 35 for a 14-day visa. Passport validity of at least 6 months is required, along with a return ticket and proof of accommodation."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Indian passport holders can obtain a **Visa on Arrival (VoA)** when entering Emiria. This visa allows for a maximum stay of 14 days per visit and costs USD 35, payable at the immigration counter upon arrival [OKF:visa-country-b-emiria.md].

[OKF:visa-country-b-emiria.md]"
- **Retrieved Items:** `visa-country-b-emiria.md, visa-country-d-britannica.md, visa-country-a-thaloria.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-008 (okf_only)

- **Question:** "What visa do Indian passport holders need to visit Emiria?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "Indian passport holders can obtain a Visa on Arrival when entering Emiria. The fee is USD 35 for a 14-day visa. Passport validity of at least 6 months is required, along with a return ticket and proof of accommodation."
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Indian passport holders can obtain a **Visa on Arrival (VoA)** when entering Emiria. This visa allows for a maximum stay of 14 days per visit and requires a fee of USD 35, payable in local currency or USD cash at the immigration counter. [OKF:visa-country-b-emiria.md]"
- **Retrieved Items:** `visa-country-b-emiria.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-009 (okf_only)

- **Question:** "How do I earn SkyNova Miles on an Economy Flex ticket?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "SkyNova Economy Flex passengers earn 8 miles per USD spent on the base fare. Miles are credited to the account after the qualifying flight is completed."
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `baggage-skynova-economy.md`
- **Expected Source Retrieved:** `no`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-012 (okf_only)

- **Question:** "What is the minimum number of SkyNova Miles required to get a discount on a booking?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "The minimum redemption is 500 SkyNova Miles, which gives a USD 5 discount on the base fare."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The minimum number of SkyNova Miles required to get a discount on a booking is 500 miles. [OKF:loyalty-skynova.md]"
- **Retrieved Items:** `loyalty-skynova.md, baggage-skynova-economy.md, cancellation-skynova-economy.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-012 (okf_only)

- **Question:** "What is the minimum number of SkyNova Miles required to get a discount on a booking?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "The minimum redemption is 500 SkyNova Miles, which gives a USD 5 discount on the base fare."
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The minimum number of SkyNova Miles required to get a discount on a booking is 500 miles. [OKF:loyalty-skynova.md]"
- **Retrieved Items:** `loyalty-skynova.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-019 (rag_only)

- **Question:** "Did the ArcticJet flight from Mumbai to Singapore have any technical issues in December 2025?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Yes. Flight AJ-613 on 11 December 2025 arrived at Singapore Changi 4 hours and 5 minutes late due to a software fault in the aircraft's flight management system (FMS) discovered during final checks. The system had to be rebooted and recertified by the on-ground engineering team."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, there is no record of a technical issue for an ArcticJet flight from Mumbai to Singapore in December 2025.

The evidence mentions:
1.  Flight AJ-613 on **2025-12-11** had a technical issue (FMS software fault), but the destination was **Singapore Changi** and the orig"
- **Retrieved Items:** `notice-0008, notice-0015, notice-0002`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-019 (rag_only)

- **Question:** "Did the ArcticJet flight from Mumbai to Singapore have any technical issues in December 2025?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Yes. Flight AJ-613 on 11 December 2025 arrived at Singapore Changi 4 hours and 5 minutes late due to a software fault in the aircraft's flight management system (FMS) discovered during final checks. The system had to be rebooted and recertified by the on-ground engineering team."
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, there is no record of a technical issue for an ArcticJet flight from Mumbai to Singapore in December 2025.

The evidence mentions:
1.  Flight AJ-613 on **2025-12-11** had a technical issue (FMS software fault), but the destination was **Singapore Changi** and the orig"
- **Retrieved Items:** `notice-0008, notice-0015, notice-0002`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-021 (rag_only)

- **Question:** "Was there a theft reported from checked baggage on a VistaAir Delhi to Tokyo flight?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Yes. On flight VA-703 on 19 March 2026, a passenger reported that camera equipment worth approximately USD 2,400 was stolen from checked baggage. The bag showed signs of forced opening at the zip. The incident was reported to Delhi airport security and Tokyo Narita lost property, and VistaAir opened a formal investigation."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Yes, a theft was reported from checked baggage on a VistaAir Delhi to Tokyo flight. Specifically, on flight VA-703 on 2026-03-19, a passenger's camera equipment worth approximately USD 2,400 was reported stolen from checked baggage on the Delhi–Tokyo route [RAG:notice-0013].

[RAG:notice-0013]"
- **Retrieved Items:** `notice-0013, notice-0015, notice-0017`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-021 (rag_only)

- **Question:** "Was there a theft reported from checked baggage on a VistaAir Delhi to Tokyo flight?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Yes. On flight VA-703 on 19 March 2026, a passenger reported that camera equipment worth approximately USD 2,400 was stolen from checked baggage. The bag showed signs of forced opening at the zip. The incident was reported to Delhi airport security and Tokyo Narita lost property, and VistaAir opened a formal investigation."
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Yes, a theft was reported from checked baggage on a VistaAir Delhi to Tokyo flight. Specifically, on flight VA-703 on 2026-03-19, a passenger's camera equipment worth approximately USD 2,400 was reported stolen from checked baggage on the Delhi–Tokyo route [RAG:notice-0013].

[RAG:notice-0013]"
- **Retrieved Items:** `notice-0013, notice-0015, notice-0017`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-022 (rag_only)

- **Question:** "What caused the 8-hour delay on SkyNova flight SN-101 in June 2026?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Flight SN-101 on 17 June 2026 was delayed by 8 hours and 20 minutes due to an unscheduled engine maintenance requirement. The captain noticed an oil leak from the left engine during the pre-flight walk-around. The aircraft was grounded for a full engine inspection and seal replacement, and no substitute aircraft was available at Delhi."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The 8-hour delay on SkyNova flight SN-101 in June 2026 was caused by an unscheduled engine maintenance requirement. Specifically, the captain noticed an oil leak from the left engine during the pre-flight walk-around, which necessitated a full engine inspection and seal replacement. Additionally, a "
- **Retrieved Items:** `notice-0009, notice-0001, notice-0006`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-022 (rag_only)

- **Question:** "What caused the 8-hour delay on SkyNova flight SN-101 in June 2026?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Flight SN-101 on 17 June 2026 was delayed by 8 hours and 20 minutes due to an unscheduled engine maintenance requirement. The captain noticed an oil leak from the left engine during the pre-flight walk-around. The aircraft was grounded for a full engine inspection and seal replacement, and no substitute aircraft was available at Delhi."
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The 8-hour delay on SkyNova flight SN-101 in June 2026 was caused by an unscheduled engine maintenance requirement. Specifically, the captain noticed an oil leak from the left engine during the pre-flight walk-around, which necessitated a full engine inspection and seal replacement. Additionally, a "
- **Retrieved Items:** `notice-0009, notice-0001, notice-0006`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-024 (rag_only)

- **Question:** "Was SkyNova's Mumbai to Dubai flight ever delayed because of baggage handling problems?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Yes. On 10 May 2026, a baggage handling conveyor belt failure at Mumbai Terminal 2 during check-in for flight SN-303 caused an 85-minute departure delay. Seven bags missed the flight entirely and were sent on the next morning's SN-303 service."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Yes, SkyNova's Mumbai to Dubai flight was delayed due to baggage handling problems. On 2026-05-10, flight SN-303 (Mumbai–Dubai) experienced an 85-minute departure delay because a baggage handling conveyor belt at Terminal 2 in Mumbai suffered a mechanical failure, which delayed the loading of approx"
- **Retrieved Items:** `notice-0014, notice-0011, notice-0001`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-024 (rag_only)

- **Question:** "Was SkyNova's Mumbai to Dubai flight ever delayed because of baggage handling problems?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Yes. On 10 May 2026, a baggage handling conveyor belt failure at Mumbai Terminal 2 during check-in for flight SN-303 caused an 85-minute departure delay. Seven bags missed the flight entirely and were sent on the next morning's SN-303 service."
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Yes, SkyNova's Mumbai to Dubai flight was delayed due to baggage handling problems. On 2026-05-10, flight SN-303 (Mumbai–Dubai) experienced an 85-minute departure delay because a baggage handling conveyor belt at Terminal 2 in Mumbai suffered a mechanical failure, which delayed the loading of approx"
- **Retrieved Items:** `notice-0014, notice-0011, notice-0001`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-030 (hybrid)

- **Question:** "ArcticJet AJ-613 arrived 4 hours late in Singapore in December 2025 due to a software fault. What compensation is available?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight AJ-613 on 11 December 2025 was delayed by 4 hours and 5 minutes due to a software fault in the flight management system, which is within ArcticJet's maintenance responsibility. Under ArcticJet's delay compensation policy, delays of 3 to 6 hours caused by airline fault entitle passengers to a USD 75 travel voucher. You may submit a claim within 90 days."
- **What Happened:** Classification=`null`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0008, notice-0015, notice-0005`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-031 (hybrid)

- **Question:** "VistaAir VA-902 on 23 August 2026 left Mumbai 3.5 hours late because of a catering issue. Does that count as the airline's fault? What do I get?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight VA-902 on 23 August 2026 was delayed 3 hours and 30 minutes due to a catering supply delay, which VistaAir has classified as an operational issue within its vendor management responsibility — meaning it is the airline's fault. Under VistaAir's delay compensation policy, delays of 3 to 5 hours caused by airline fault entitle passengers to a USD 100 travel voucher. Meal and refreshments should have been provided at the airport."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Yes, the delay is classified as an operational issue within VistaAir's vendor management responsibility, which implies it is the airline's fault. However, the provided evidence does not specify what compensation or benefits you are entitled to receive.

[OKF:notice-0010]"
- **Retrieved Items:** `notice-0010, notice-0003, notice-0007`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-031 (hybrid)

- **Question:** "VistaAir VA-902 on 23 August 2026 left Mumbai 3.5 hours late because of a catering issue. Does that count as the airline's fault? What do I get?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight VA-902 on 23 August 2026 was delayed 3 hours and 30 minutes due to a catering supply delay, which VistaAir has classified as an operational issue within its vendor management responsibility — meaning it is the airline's fault. Under VistaAir's delay compensation policy, delays of 3 to 5 hours caused by airline fault entitle passengers to a USD 100 travel voucher. Meal and refreshments should have been provided at the airport."
- **What Happened:** Classification=`HYBRID`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, the delay for flight VA-902 on 2026-08-23 is classified as an **operational issue within VistaAir's vendor management responsibility** [RAG:notice-0010]. Therefore, it is considered the airline's fault (or at least within their operational control/responsibility), unl"
- **Retrieved Items:** `baggage-vistaair-business.md, notice-0010, notice-0003, notice-0007`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-032 (hybrid)

- **Question:** "ArcticJet AJ-411 was delayed 7.5 hours on 10 September 2026 after a bird strike inspection. Am I entitled to compensation?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight AJ-411 on 10 September 2026 arrived at London Heathrow 7 hours and 30 minutes late following a bird strike and mandatory airframe inspection. While the bird strike itself was outside ArcticJet's control, the extended duration of the inspection exceeded what was reasonably expected, and ArcticJet has accepted partial liability. Based on the airline's acceptance of responsibility and the delay exceeding 6 hours, passengers are entitled to USD 200 cash compensation under ArcticJet's delay compensation policy."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, you are **not** entitled to financial compensation for the delay, but you are entitled to care and assistance.

Here is the breakdown:

1.  **Cause of Delay:** The delay was caused by a bird strike, which is described as an event "outside ArcticJet's control" [RAG:not"
- **Retrieved Items:** `notice-0005, delay-compensation.md, notice-0002`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-033 (hybrid)

- **Question:** "What compensation does VistaAir owe me if my VA-703 flight was delayed nearly 3 hours due to weather on 5 April 2026?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight VA-703 on 5 April 2026 was delayed 2 hours and 50 minutes due to severe thunderstorm activity and an air traffic control ground stop at Delhi. This is classified as extraordinary circumstances beyond VistaAir's control. Because the delay did not reach 3 hours and was caused by weather outside the airline's control, no financial compensation is payable under VistaAir's delay compensation policy."
- **What Happened:** Classification=`HYBRID`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, VistaAir does not owe you financial compensation for this delay.

The delay for flight VA-703 on 2026-04-05 was caused by severe thunderstorm activity and air traffic control ground stops, which are classified as **extraordinary circumstances** beyond the airline's co"
- **Retrieved Items:** `delay-compensation.md, notice-0007, notice-0003, notice-0010`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-034 (hybrid)

- **Question:** "SkyNova flight SN-101 was delayed 8 hours on June 17 2026. Can I also get a refund instead of compensation?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Yes. Flight SN-101 on 17 June 2026 was delayed 8 hours and 20 minutes due to an engine fault within SkyNova Air's control. Because the delay exceeded 5 hours, SkyNova Air's policy gives you the option to cancel the flight and receive a full refund. Alternatively, you can keep the booking and claim USD 150 cash compensation for a delay over 6 hours caused by airline fault. You do not receive both the refund and the cash compensation."
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, the delay for flight SN-101 on June 17, 2026, was 8 hours and 20 minutes [RAG:notice-0009]. According to the SkyNova Air delay compensation policy, for any delay over 5 hours (regardless of the cause), passengers have the "Option to cancel with full refund" [OKF:delay"
- **Retrieved Items:** `notice-0001, delay-compensation.md, notice-0009`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-034 (hybrid)

- **Question:** "SkyNova flight SN-101 was delayed 8 hours on June 17 2026. Can I also get a refund instead of compensation?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Yes. Flight SN-101 on 17 June 2026 was delayed 8 hours and 20 minutes due to an engine fault within SkyNova Air's control. Because the delay exceeded 5 hours, SkyNova Air's policy gives you the option to cancel the flight and receive a full refund. Alternatively, you can keep the booking and claim USD 150 cash compensation for a delay over 6 hours caused by airline fault. You do not receive both the refund and the cash compensation."
- **What Happened:** Classification=`HYBRID`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `cancellation-skynova-economy.md, notice-0001, notice-0009, notice-0006`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-035 (hybrid)

- **Question:** "SkyNova SN-303 was delayed because of a baggage belt failure at Mumbai on May 10 2026. What should affected passengers receive?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight SN-303 on 10 May 2026 was delayed 85 minutes due to a conveyor belt failure at Mumbai Terminal 2, which is an operational issue within SkyNova Air's control. Since the delay was under 2 hours, SkyNova Air's delay compensation policy does not trigger a meal voucher or cash compensation at that duration. However, seven passengers whose bags missed the flight should receive their bags on the next SN-303 service."
- **What Happened:** Classification=`null`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0014, notice-0006, notice-0001`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-035 (hybrid)

- **Question:** "SkyNova SN-303 was delayed because of a baggage belt failure at Mumbai on May 10 2026. What should affected passengers receive?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight SN-303 on 10 May 2026 was delayed 85 minutes due to a conveyor belt failure at Mumbai Terminal 2, which is an operational issue within SkyNova Air's control. Since the delay was under 2 hours, SkyNova Air's delay compensation policy does not trigger a meal voucher or cash compensation at that duration. However, seven passengers whose bags missed the flight should receive their bags on the next SN-303 service."
- **What Happened:** Classification=`HYBRID`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `baggage-skynova-economy.md, notice-0014, notice-0006, notice-0001`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-042 (human_fallback_stale)

- **Question:** "Can I get priority visa processing for Britannica?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "yes, priority processing (8 business days) for an additional fee"
- **What Happened:** Classification=`ESCALATE`, Outcome=`ESCALATED`, Reason=`CLASSIFIER_ESCALATE`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `None`
- **Expected Source Retrieved:** `no`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-043 (human_fallback_stale)

- **Question:** "How do I request a refund for a flight that was cancelled by the airline?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "submit through the airline's official website or customer support line; requests via third-party agents must be forwarded by the agent"
- **What Happened:** Classification=`HYBRID`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "To request a refund for a flight cancelled by the airline, you must submit the request through the airline's official website or customer support line. If your booking was made through a third-party agent, the request must be forwarded by that agent to the airline. The refund to your original paymen"
- **Retrieved Items:** `refund-policy-general.md, notice-0019, notice-0005, notice-0004`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-044 (human_fallback_stale)

- **Question:** "Does Britannica allow multiple-entry Standard Visitor Visas?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "yes, multiple entry, valid up to 6 months"
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Yes, Britannica allows multiple-entry Standard Visitor Visas. The visa is valid for up to 6 months and permits multiple entries. [OKF:visa-country-d-britannica.md]"
- **Retrieved Items:** `visa-country-d-britannica.md, visa-country-b-emiria.md, visa-country-a-thaloria.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-044 (human_fallback_stale)

- **Question:** "Does Britannica allow multiple-entry Standard Visitor Visas?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "yes, multiple entry, valid up to 6 months"
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Yes, Britannica allows multiple-entry Standard Visitor Visas. The visa is valid for up to 6 months and permits multiple entries [OKF:visa-country-d-britannica.md]."
- **Retrieved Items:** `visa-country-d-britannica.md`
- **Expected Source Retrieved:** `yes`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-046 (human_fallback_stale)

- **Question:** "Does a refund to a credit card take longer than a bank transfer refund?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "no; card and bank-transfer refunds both take 21 business days"
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `no`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-048 (human_fallback_stale)

- **Question:** "How would I receive a refund from ArcticJet if I paid by cash at the airport?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "cash payments are refunded by cheque mailed to the address on file within 21 business days"
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `no`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-053 (human_fallback_no_evidence)

- **Question:** "Was there a strike at Mumbai airport affecting ArcticJet flights last week?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0020, notice-0005, notice-0012`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-054 (human_fallback_no_evidence)

- **Question:** "Why was flight VA-802 delayed on October 10 2026?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0003, notice-0010, notice-0017`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-055 (human_fallback_no_evidence)

- **Question:** "Has there been a recent ArcticJet announcement about new routes to South America?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0030, notice-0023, notice-0020`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-056 (human_fallback_no_evidence)

- **Question:** "Were there any incidents involving ArcticJet flights at Singapore Changi airport this year?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, there were two incidents involving ArcticJet flights at Singapore Changi airport in 2025:

1.  **Flight Delay:** Flight AJ-613 on 2025-12-11 arrived at Singapore Changi 4 hours and 5 minutes late due to a software fault in the aircraft's flight management system [RAG:"
- **Retrieved Items:** `notice-0008, notice-0015, notice-0030`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-056 (human_fallback_no_evidence)

- **Question:** "Were there any incidents involving ArcticJet flights at Singapore Changi airport this year?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, there were two incidents involving ArcticJet flights at Singapore Changi airport in 2025:

1.  **Flight Delay:** Flight AJ-613 on 2025-12-11 arrived at Singapore Changi 4 hours and 5 minutes late due to a software fault in the aircraft's flight management system [RAG:"
- **Retrieved Items:** `notice-0008, notice-0015, notice-0030`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-058 (human_fallback_no_evidence)

- **Question:** "Was there a runway closure at London Heathrow that affected ArcticJet this summer?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`RAG_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0020, notice-0005, notice-0012`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-060 (human_fallback_no_evidence)

- **Question:** "Did VistaAir introduce a new loyalty programme recently?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `baggage-vistaair-business.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-066 (human_fallback_ambiguous)

- **Question:** "Can I take my guitar on the flight?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`NO_OKF_MATCH`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `None`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-068 (human_fallback_ambiguous)

- **Question:** "My bag was delayed. How much will I be reimbursed?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`HYBRID`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `notice-0015, notice-0005, notice-0014`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-071 (human_fallback_ambiguous)

- **Question:** "Why does ArcticJet charge so much for baggage?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `baggage-arcticjet-all.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-077 (human_fallback_conflict)

- **Question:** "If SkyNova Air cancels my flight, how long before I receive my full refund?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "If SkyNova Air cancels your flight, you are entitled to a full refund, which is processed within **7 business days**.

[RAG:OKF:cancellation-skynova-economy.md]"
- **Retrieved Items:** `refund-policy-general.md, cancellation-skynova-economy.md, delay-compensation.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-077 (human_fallback_conflict)

- **Question:** "If SkyNova Air cancels my flight, how long before I receive my full refund?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "If SkyNova Air cancels your flight, you are entitled to a full refund of the total amount paid with no cancellation fee. The refund is processed within 7 business days. [OKF:cancellation-skynova-economy.md]"
- **Retrieved Items:** `cancellation-skynova-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-078 (human_fallback_conflict)

- **Question:** "What is the refund timeline for VistaAir if the airline cancels the flight?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The refund timeline for VistaAir when the airline cancels the flight depends on the fare class:

*   **Economy Class:** The full refund is processed within **7 business days** [OKF:cancellation-vistaair-economy.md].
*   **Business Sapphire Class:** The full refund is processed within **7 business da"
- **Retrieved Items:** `cancellation-vistaair-economy.md, refund-policy-general.md, cancellation-vistaair-business.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-078 (human_fallback_conflict)

- **Question:** "What is the refund timeline for VistaAir if the airline cancels the flight?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`HYBRID`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "If VistaAir cancels the flight, the refund is processed within 7 business days. [OKF:cancellation-vistaair-business.md]"
- **Retrieved Items:** `cancellation-vistaair-business.md, notice-0010, notice-0028, notice-0003`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-079 (human_fallback_conflict)

- **Question:** "What general refund timeline applies across all airlines for a standard passenger cancellation?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The general refund timeline that applies across all airlines (SkyNova Air, ArcticJet, and VistaAir) for a standard passenger cancellation is **21 business days** for the refund to appear on the original payment method [OKF:refund-policy-general.md].

[OKF:refund-policy-general.md]"
- **Retrieved Items:** `refund-policy-general.md, cancellation-vistaair-economy.md, cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-079 (human_fallback_conflict)

- **Question:** "What general refund timeline applies across all airlines for a standard passenger cancellation?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The general refund timeline that applies across all airlines for a standard passenger cancellation is **21 business days** from the cancellation request. This applies to credit/debit card payments, bank transfers, and cash payments (issued by cheque).

[OKF:refund-policy-general.md]"
- **Retrieved Items:** `refund-policy-general.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-080 (human_fallback_conflict)

- **Question:** "How long does it take to get a refund after cancelling an ArcticJet economy ticket?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The refund processing time depends on whether the cancellation was initiated by the passenger or the airline:

*   **Passenger-initiated cancellation:** The remaining balance is refunded to the original payment method within **14 business days** [OKF:cancellation-arcticjet-economy.md].
*   **Airline"
- **Retrieved Items:** `cancellation-arcticjet-economy.md, refund-policy-general.md, cancellation-vistaair-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-080 (human_fallback_conflict)

- **Question:** "How long does it take to get a refund after cancelling an ArcticJet economy ticket?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "The refund is processed within 14 business days for most cancellations, or within 7 business days if the flight was cancelled by the airline. [OKF:cancellation-arcticjet-economy.md]"
- **Retrieved Items:** `cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-081 (human_fallback_conflict)

- **Question:** "Does VistaAir offer a faster refund option if I cancelled a Business Sapphire ticket?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, there is no mention of a "faster refund option" for VistaAir Business Sapphire tickets. The policy specifies a standard refund timeline of **14 business days** for passenger-initiated cancellations [OKF:cancellation-vistaair-business.md]. While the general policy for "
- **Retrieved Items:** `cancellation-vistaair-business.md, cancellation-vistaair-economy.md, refund-policy-general.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-081 (human_fallback_conflict)

- **Question:** "Does VistaAir offer a faster refund option if I cancelled a Business Sapphire ticket?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `cancellation-vistaair-business.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-082 (human_fallback_conflict)

- **Question:** "Are refunds to credit cards handled differently from refunds to bank accounts?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "No, refunds to credit cards and bank accounts are not handled differently in terms of processing timelines. According to the general refund policy, both credit/debit card payments and bank transfer payments are processed to the original payment method within **21 business days** of the cancellation "
- **Retrieved Items:** `refund-policy-general.md, cancellation-vistaair-economy.md, cancellation-skynova-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-082 (human_fallback_conflict)

- **Question:** "Are refunds to credit cards handled differently from refunds to bank accounts?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-083 (human_fallback_conflict)

- **Question:** "What is the standard number of business days for any airline to refund a cancelled ticket?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `refund-policy-general.md, cancellation-vistaair-economy.md, cancellation-arcticjet-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-083 (human_fallback_conflict)

- **Question:** "What is the standard number of business days for any airline to refund a cancelled ticket?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `cancellation-vistaair-business.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V1] q-084 (human_fallback_conflict)

- **Question:** "If I paid by cash for a SkyNova Air ticket and cancel it, what is the refund process and how long does it take?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`null`, Outcome=`ANSWERED`, Reason=`null`
- **System Answer (first 300 chars):** "Based on the evidence provided, the refund process and timeline depend on the specific fare type (Economy Saver or Economy Flex) and the timing of the cancellation.

**Refund Process for Cash Payments:**
According to the general policy, cash payments at the airport are refunded by **cheque**, which "
- **Retrieved Items:** `refund-policy-general.md, cancellation-skynova-economy.md, no-show-policy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

### [V2] q-084 (human_fallback_conflict)

- **Question:** "If I paid by cash for a SkyNova Air ticket and cancel it, what is the refund process and how long does it take?"
- **Expected Outcome:** `ESCALATE`
- **What Happened:** Classification=`OKF_ONLY`, Outcome=`ESCALATED`, Reason=`INSUFFICIENT`
- **System Answer (first 300 chars):** "null"
- **Retrieved Items:** `cancellation-skynova-economy.md`
- **Expected Source Retrieved:** `n.a.`

Why it failed (one sentence, written by the author): ______  
Failure type: misrouted | retrieval miss | wrong source outranked | generation error | unnecessary escalation | answered when it should escalate | grader false negative | data issue  

---

