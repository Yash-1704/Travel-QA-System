# Manual Review Queue: test-frozen

**Date:** 2026-10-25T08:18:30.468Z  
**Total Rows Needing Review (Substring Grader Failed):** 22  

Review instructions: If you disagree with an agent-proposed verdict, edit `data/eval/manual-grades.json`, change `correct` to `true` or `false`, and set `source: "author"`. Then re-run `node scripts/report.js --run-id test-frozen`.

## 1. Questions Needing Manual Review (22)

### [V1] q-005 (okf_only)

- **Question:** "What is the cancellation fee for an ArcticJet economy ticket cancelled between 12 and 48 hours before departure?"
- **Expected Answer:** "The cancellation fee is USD 120. The remaining balance of the base fare and fuel surcharge is refunded to the original payment method within 14 business days."
- **Key Facts Required:** `USD 120`, `14 business days`
- **System Answer:** "The cancellation fee for an ArcticJet economy ticket cancelled between 12 and 48 hours before departure is USD 120. [OKF:cancellation-arcticjet-economy.md]"
- **Key Facts Matched by Substring:** `USD 120`
- **Key Facts Missing by Substring:** `14 business days`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "14 business days".*

---

### [V2] q-005 (okf_only)

- **Question:** "What is the cancellation fee for an ArcticJet economy ticket cancelled between 12 and 48 hours before departure?"
- **Expected Answer:** "The cancellation fee is USD 120. The remaining balance of the base fare and fuel surcharge is refunded to the original payment method within 14 business days."
- **Key Facts Required:** `USD 120`, `14 business days`
- **System Answer:** "The cancellation fee for an ArcticJet economy ticket cancelled between 12 and 48 hours before departure is USD 120. [OKF:cancellation-arcticjet-economy.md]"
- **Key Facts Matched by Substring:** `USD 120`
- **Key Facts Missing by Substring:** `14 business days`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "14 business days".*

---

### [V1] q-006 (okf_only)

- **Question:** "How much does it cost to cancel a VistaAir Business Sapphire ticket more than 48 hours before departure?"
- **Expected Answer:** "Cancelling a VistaAir Business Sapphire ticket more than 48 hours before departure is fully refundable with no cancellation fee. The full amount paid, including base fare, fuel surcharge, and taxes, is refunded within 14 business days."
- **Key Facts Required:** `no cancellation fee`, `fully refundable`, `14 business days`
- **System Answer:** "It costs USD 0 to cancel a VistaAir Business Sapphire ticket more than 48 hours before departure, as the ticket is fully refundable with no cancellation fee. [OKF:cancellation-vistaair-business.md]"
- **Key Facts Matched by Substring:** `no cancellation fee`, `fully refundable`
- **Key Facts Missing by Substring:** `14 business days`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "14 business days".*

---

### [V1] q-008 (okf_only)

- **Question:** "What visa do Indian passport holders need to visit Emiria?"
- **Expected Answer:** "Indian passport holders can obtain a Visa on Arrival when entering Emiria. The fee is USD 35 for a 14-day visa. Passport validity of at least 6 months is required, along with a return ticket and proof of accommodation."
- **Key Facts Required:** `Visa on Arrival`, `USD 35`, `14-day`
- **System Answer:** "Indian passport holders can obtain a **Visa on Arrival (VoA)** when entering Emiria. This visa allows for a maximum stay of 14 days per visit and costs USD 35, payable at the immigration counter upon arrival [OKF:visa-country-b-emiria.md].

[OKF:visa-country-b-emiria.md]"
- **Key Facts Matched by Substring:** `Visa on Arrival`, `USD 35`
- **Key Facts Missing by Substring:** `14-day`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "14-day".*

---

### [V2] q-008 (okf_only)

- **Question:** "What visa do Indian passport holders need to visit Emiria?"
- **Expected Answer:** "Indian passport holders can obtain a Visa on Arrival when entering Emiria. The fee is USD 35 for a 14-day visa. Passport validity of at least 6 months is required, along with a return ticket and proof of accommodation."
- **Key Facts Required:** `Visa on Arrival`, `USD 35`, `14-day`
- **System Answer:** "Indian passport holders can obtain a **Visa on Arrival (VoA)** when entering Emiria. This visa allows for a maximum stay of 14 days per visit and requires a fee of USD 35, payable in local currency or USD cash at the immigration counter. [OKF:visa-country-b-emiria.md]"
- **Key Facts Matched by Substring:** `Visa on Arrival`, `USD 35`
- **Key Facts Missing by Substring:** `14-day`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "14-day".*

---

### [V1] q-012 (okf_only)

- **Question:** "What is the minimum number of SkyNova Miles required to get a discount on a booking?"
- **Expected Answer:** "The minimum redemption is 500 SkyNova Miles, which gives a USD 5 discount on the base fare."
- **Key Facts Required:** `500 SkyNova Miles`, `USD 5`
- **System Answer:** "The minimum number of SkyNova Miles required to get a discount on a booking is 500 miles. [OKF:loyalty-skynova.md]"
- **Key Facts Matched by Substring:** None
- **Key Facts Missing by Substring:** `500 SkyNova Miles`, `USD 5`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "500 SkyNova Miles", "USD 5".*

---

### [V2] q-012 (okf_only)

- **Question:** "What is the minimum number of SkyNova Miles required to get a discount on a booking?"
- **Expected Answer:** "The minimum redemption is 500 SkyNova Miles, which gives a USD 5 discount on the base fare."
- **Key Facts Required:** `500 SkyNova Miles`, `USD 5`
- **System Answer:** "The minimum number of SkyNova Miles required to get a discount on a booking is 500 miles. [OKF:loyalty-skynova.md]"
- **Key Facts Matched by Substring:** None
- **Key Facts Missing by Substring:** `500 SkyNova Miles`, `USD 5`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "500 SkyNova Miles", "USD 5".*

---

### [V1] q-019 (rag_only)

- **Question:** "Did the ArcticJet flight from Mumbai to Singapore have any technical issues in December 2025?"
- **Expected Answer:** "Yes. Flight AJ-613 on 11 December 2025 arrived at Singapore Changi 4 hours and 5 minutes late due to a software fault in the aircraft's flight management system (FMS) discovered during final checks. The system had to be rebooted and recertified by the on-ground engineering team."
- **Key Facts Required:** `flight management system`, `FMS`, `4 hours and 5 minutes`
- **System Answer:** "Based on the evidence provided, there is no record of a technical issue for an ArcticJet flight from Mumbai to Singapore in December 2025.

The evidence mentions:
1.  Flight AJ-613 on **2025-12-11** had a technical issue (FMS software fault), but the destination was **Singapore Changi** and the origin is not explicitly stated as Mumbai in this specific notice (though it is the same flight number as the October incident). However, the question asks about a flight *from* Mumbai *to* Singapore in December 2025. Notice [RAG:notice-0008] confirms a delay for AJ-613 on 2025-12-11 arriving in Singapore, but does not explicitly confirm the origin was Mumbai in that specific instance, nor does it link the December flight to the Mumbai origin mentioned in the October incident.
2.  Flight AJ-613 on **2025-10-22** was a Mumbai–Singapore flight, but this was in October, not December.
3.  Flight AJ-512 on **2026-05-22** had a technical issue, but this was in 2026 and to Tokyo.

While [RAG:notice-0008] confirms a technical issue for flight AJ-613 arriving in Singapore in December 2025, it does not explicitly state that the origin was Mumbai. The only evidence linking AJ-613 to a Mumbai origin is from October 2025 [RAG:notice-0015]. Without explicit confirmation that the December 2025 flight originated in Mumbai, the evidence is insufficient to definitively answer "yes" to the specific route constraint. However, typically flight numbers maintain routes. Let's look closer."
- **Key Facts Matched by Substring:** `FMS`
- **Key Facts Missing by Substring:** `flight management system`, `4 hours and 5 minutes`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "flight management system", "4 hours and 5 minutes".*

---

### [V2] q-019 (rag_only)

- **Question:** "Did the ArcticJet flight from Mumbai to Singapore have any technical issues in December 2025?"
- **Expected Answer:** "Yes. Flight AJ-613 on 11 December 2025 arrived at Singapore Changi 4 hours and 5 minutes late due to a software fault in the aircraft's flight management system (FMS) discovered during final checks. The system had to be rebooted and recertified by the on-ground engineering team."
- **Key Facts Required:** `flight management system`, `FMS`, `4 hours and 5 minutes`
- **System Answer:** "Based on the evidence provided, there is no record of a technical issue for an ArcticJet flight from Mumbai to Singapore in December 2025.

The evidence mentions:
1.  Flight AJ-613 on **2025-12-11** had a technical issue (FMS software fault), but the destination was **Singapore Changi** and the origin is not explicitly stated as Mumbai in this specific notice (though it is the same flight number as the October incident). However, the question asks about a flight *from* Mumbai *to* Singapore in December 2025. Notice [RAG:notice-0008] confirms a delay for AJ-613 on 2025-12-11 arriving in Singapore, but does not explicitly confirm the origin was Mumbai in that specific instance, nor does it link the December flight to the Mumbai origin mentioned in the October incident.
2.  Flight AJ-613 on **2025-10-22** was a Mumbai–Singapore flight, but this was in October, not December.
3.  Flight AJ-512 on **2026-05-22** had a technical issue, but this was in 2026 and to Tokyo.

While [RAG:notice-0008] confirms a technical issue for flight AJ-613 arriving in Singapore in December 2025, it does not explicitly state that the origin was Mumbai. The only evidence linking AJ-613 to a Mumbai origin is from October 2025 [RAG:notice-0015]. Without explicit confirmation that the December 2025 flight originated in Mumbai, the evidence is insufficient to definitively answer "yes" to the specific route constraint. However, typically flight numbers maintain routes. Let's look closer."
- **Key Facts Matched by Substring:** `FMS`
- **Key Facts Missing by Substring:** `flight management system`, `4 hours and 5 minutes`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "flight management system", "4 hours and 5 minutes".*

---

### [V1] q-021 (rag_only)

- **Question:** "Was there a theft reported from checked baggage on a VistaAir Delhi to Tokyo flight?"
- **Expected Answer:** "Yes. On flight VA-703 on 19 March 2026, a passenger reported that camera equipment worth approximately USD 2,400 was stolen from checked baggage. The bag showed signs of forced opening at the zip. The incident was reported to Delhi airport security and Tokyo Narita lost property, and VistaAir opened a formal investigation."
- **Key Facts Required:** `USD 2,400`, `camera equipment`, `forced opening`
- **System Answer:** "Yes, a theft was reported from checked baggage on a VistaAir Delhi to Tokyo flight. Specifically, on flight VA-703 on 2026-03-19, a passenger's camera equipment worth approximately USD 2,400 was reported stolen from checked baggage on the Delhi–Tokyo route [RAG:notice-0013].

[RAG:notice-0013]"
- **Key Facts Matched by Substring:** `USD 2,400`, `camera equipment`
- **Key Facts Missing by Substring:** `forced opening`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "forced opening".*

---

### [V2] q-021 (rag_only)

- **Question:** "Was there a theft reported from checked baggage on a VistaAir Delhi to Tokyo flight?"
- **Expected Answer:** "Yes. On flight VA-703 on 19 March 2026, a passenger reported that camera equipment worth approximately USD 2,400 was stolen from checked baggage. The bag showed signs of forced opening at the zip. The incident was reported to Delhi airport security and Tokyo Narita lost property, and VistaAir opened a formal investigation."
- **Key Facts Required:** `USD 2,400`, `camera equipment`, `forced opening`
- **System Answer:** "Yes, a theft was reported from checked baggage on a VistaAir Delhi to Tokyo flight. Specifically, on flight VA-703 on 2026-03-19, a passenger's camera equipment worth approximately USD 2,400 was reported stolen from checked baggage on the Delhi–Tokyo route [RAG:notice-0013].

[RAG:notice-0013]"
- **Key Facts Matched by Substring:** `USD 2,400`, `camera equipment`
- **Key Facts Missing by Substring:** `forced opening`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "forced opening".*

---

### [V1] q-022 (rag_only)

- **Question:** "What caused the 8-hour delay on SkyNova flight SN-101 in June 2026?"
- **Expected Answer:** "Flight SN-101 on 17 June 2026 was delayed by 8 hours and 20 minutes due to an unscheduled engine maintenance requirement. The captain noticed an oil leak from the left engine during the pre-flight walk-around. The aircraft was grounded for a full engine inspection and seal replacement, and no substitute aircraft was available at Delhi."
- **Key Facts Required:** `oil leak`, `engine inspection`, `8 hours and 20 minutes`
- **System Answer:** "The 8-hour delay on SkyNova flight SN-101 in June 2026 was caused by an unscheduled engine maintenance requirement. Specifically, the captain noticed an oil leak from the left engine during the pre-flight walk-around, which necessitated a full engine inspection and seal replacement. Additionally, a substitute aircraft was not available at Delhi. [RAG:notice-0009]"
- **Key Facts Matched by Substring:** `oil leak`, `engine inspection`
- **Key Facts Missing by Substring:** `8 hours and 20 minutes`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "8 hours and 20 minutes".*

---

### [V2] q-022 (rag_only)

- **Question:** "What caused the 8-hour delay on SkyNova flight SN-101 in June 2026?"
- **Expected Answer:** "Flight SN-101 on 17 June 2026 was delayed by 8 hours and 20 minutes due to an unscheduled engine maintenance requirement. The captain noticed an oil leak from the left engine during the pre-flight walk-around. The aircraft was grounded for a full engine inspection and seal replacement, and no substitute aircraft was available at Delhi."
- **Key Facts Required:** `oil leak`, `engine inspection`, `8 hours and 20 minutes`
- **System Answer:** "The 8-hour delay on SkyNova flight SN-101 in June 2026 was caused by an unscheduled engine maintenance requirement. Specifically, the captain noticed an oil leak from the left engine during the pre-flight walk-around, which necessitated a full engine inspection and seal replacement. Additionally, a substitute aircraft was not available at Delhi. [RAG:notice-0009]"
- **Key Facts Matched by Substring:** `oil leak`, `engine inspection`
- **Key Facts Missing by Substring:** `8 hours and 20 minutes`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "8 hours and 20 minutes".*

---

### [V1] q-024 (rag_only)

- **Question:** "Was SkyNova's Mumbai to Dubai flight ever delayed because of baggage handling problems?"
- **Expected Answer:** "Yes. On 10 May 2026, a baggage handling conveyor belt failure at Mumbai Terminal 2 during check-in for flight SN-303 caused an 85-minute departure delay. Seven bags missed the flight entirely and were sent on the next morning's SN-303 service."
- **Key Facts Required:** `conveyor belt failure`, `85-minute`, `Seven bags missed`
- **System Answer:** "Yes, SkyNova's Mumbai to Dubai flight was delayed due to baggage handling problems. On 2026-05-10, flight SN-303 (Mumbai–Dubai) experienced an 85-minute departure delay because a baggage handling conveyor belt at Terminal 2 in Mumbai suffered a mechanical failure, which delayed the loading of approximately 40 bags [RAG:notice-0014].

[RAG:notice-0014]"
- **Key Facts Matched by Substring:** `85-minute`
- **Key Facts Missing by Substring:** `conveyor belt failure`, `Seven bags missed`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "conveyor belt failure", "Seven bags missed".*

---

### [V2] q-024 (rag_only)

- **Question:** "Was SkyNova's Mumbai to Dubai flight ever delayed because of baggage handling problems?"
- **Expected Answer:** "Yes. On 10 May 2026, a baggage handling conveyor belt failure at Mumbai Terminal 2 during check-in for flight SN-303 caused an 85-minute departure delay. Seven bags missed the flight entirely and were sent on the next morning's SN-303 service."
- **Key Facts Required:** `conveyor belt failure`, `85-minute`, `Seven bags missed`
- **System Answer:** "Yes, SkyNova's Mumbai to Dubai flight was delayed due to baggage handling problems. On 2026-05-10, flight SN-303 (Mumbai–Dubai) experienced an 85-minute departure delay because a baggage handling conveyor belt at Terminal 2 in Mumbai suffered a mechanical failure, which delayed the loading of approximately 40 bags [RAG:notice-0014].

[RAG:notice-0014]"
- **Key Facts Matched by Substring:** `85-minute`
- **Key Facts Missing by Substring:** `conveyor belt failure`, `Seven bags missed`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "conveyor belt failure", "Seven bags missed".*

---

### [V1] q-031 (hybrid)

- **Question:** "VistaAir VA-902 on 23 August 2026 left Mumbai 3.5 hours late because of a catering issue. Does that count as the airline's fault? What do I get?"
- **Expected Answer:** "Flight VA-902 on 23 August 2026 was delayed 3 hours and 30 minutes due to a catering supply delay, which VistaAir has classified as an operational issue within its vendor management responsibility — meaning it is the airline's fault. Under VistaAir's delay compensation policy, delays of 3 to 5 hours caused by airline fault entitle passengers to a USD 100 travel voucher. Meal and refreshments should have been provided at the airport."
- **Key Facts Required:** `USD 100 travel voucher`, `airline's fault`, `3 hours and 30 minutes`
- **System Answer:** "Yes, the delay is classified as an operational issue within VistaAir's vendor management responsibility, which implies it is the airline's fault. However, the provided evidence does not specify what compensation or benefits you are entitled to receive.

[OKF:notice-0010]"
- **Key Facts Matched by Substring:** `airline's fault`
- **Key Facts Missing by Substring:** `USD 100 travel voucher`, `3 hours and 30 minutes`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "USD 100 travel voucher", "3 hours and 30 minutes".*

---

### [V2] q-031 (hybrid)

- **Question:** "VistaAir VA-902 on 23 August 2026 left Mumbai 3.5 hours late because of a catering issue. Does that count as the airline's fault? What do I get?"
- **Expected Answer:** "Flight VA-902 on 23 August 2026 was delayed 3 hours and 30 minutes due to a catering supply delay, which VistaAir has classified as an operational issue within its vendor management responsibility — meaning it is the airline's fault. Under VistaAir's delay compensation policy, delays of 3 to 5 hours caused by airline fault entitle passengers to a USD 100 travel voucher. Meal and refreshments should have been provided at the airport."
- **Key Facts Required:** `USD 100 travel voucher`, `airline's fault`, `3 hours and 30 minutes`
- **System Answer:** "Based on the evidence provided, the delay for flight VA-902 on 2026-08-23 is classified as an **operational issue within VistaAir's vendor management responsibility** [RAG:notice-0010]. Therefore, it is considered the airline's fault (or at least within their operational control/responsibility), unlike delays caused by extraordinary circumstances such as weather or air traffic control [RAG:notice-0003, RAG:notice-0007].

However, the provided evidence **does not contain information** regarding specific compensation, refunds, or benefits ("What do I get?") for passengers affected by this specific delay. The evidence only confirms the cause and classification of the delay.

INSUFFICIENT"
- **Key Facts Matched by Substring:** `airline's fault`
- **Key Facts Missing by Substring:** `USD 100 travel voucher`, `3 hours and 30 minutes`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "USD 100 travel voucher", "3 hours and 30 minutes".*

---

### [V1] q-032 (hybrid)

- **Question:** "ArcticJet AJ-411 was delayed 7.5 hours on 10 September 2026 after a bird strike inspection. Am I entitled to compensation?"
- **Expected Answer:** "Flight AJ-411 on 10 September 2026 arrived at London Heathrow 7 hours and 30 minutes late following a bird strike and mandatory airframe inspection. While the bird strike itself was outside ArcticJet's control, the extended duration of the inspection exceeded what was reasonably expected, and ArcticJet has accepted partial liability. Based on the airline's acceptance of responsibility and the delay exceeding 6 hours, passengers are entitled to USD 200 cash compensation under ArcticJet's delay compensation policy."
- **Key Facts Required:** `USD 200 cash`, `7 hours and 30 minutes`, `partial liability`
- **System Answer:** "Based on the evidence provided, you are **not** entitled to financial compensation for the delay, but you are entitled to care and assistance.

Here is the breakdown:

1.  **Cause of Delay:** The delay was caused by a bird strike, which is described as an event "outside ArcticJet's control" [RAG:notice-0005]. Although the airline accepted "partial liability" for the extended inspection time, the primary cause (bird strike) falls under extraordinary circumstances.
2.  **Compensation Policy:** According to the ArcticJet delay compensation policy, financial compensation (such as the USD 200 cash compensation for delays over 6 hours) is payable **only** when the delay is caused by factors within the airline's control [OKF:delay-compensation.md]. Delays caused by extraordinary circumstances beyond airline control do not qualify for financial compensation [OKF:delay-compensation.md].
3.  **Entitlements for Any Cause:** Since the delay was 7.5 hours (more than 5 hours), you are entitled to:
    *   Hotel accommodation and meals provided [OKF:delay-compensation.md].
    *   The option to cancel with a full refund [OKF:delay-compensation.md].
    *   Meal and refreshments at the airport (for delays over 3 hours) [OKF:delay-compensation.md].

**Conclusion:** You are not entitled to cash compensation or travel vouchers because the root cause (bird strike) was outside the airline's control, but you are entitled to hotel accommodation, meals, and the option to cancel for a full refund.

Citations: [RAG:notice-0005], [OKF:delay-compensation.md]"
- **Key Facts Matched by Substring:** `USD 200 cash`, `partial liability`
- **Key Facts Missing by Substring:** `7 hours and 30 minutes`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "7 hours and 30 minutes".*

---

### [V2] q-033 (hybrid)

- **Question:** "What compensation does VistaAir owe me if my VA-703 flight was delayed nearly 3 hours due to weather on 5 April 2026?"
- **Expected Answer:** "Flight VA-703 on 5 April 2026 was delayed 2 hours and 50 minutes due to severe thunderstorm activity and an air traffic control ground stop at Delhi. This is classified as extraordinary circumstances beyond VistaAir's control. Because the delay did not reach 3 hours and was caused by weather outside the airline's control, no financial compensation is payable under VistaAir's delay compensation policy."
- **Key Facts Required:** `extraordinary circumstances`, `no financial compensation`, `2 hours and 50 minutes`
- **System Answer:** "Based on the evidence provided, VistaAir does not owe you financial compensation for this delay.

The delay for flight VA-703 on 2026-04-05 was caused by severe thunderstorm activity and air traffic control ground stops, which are classified as **extraordinary circumstances** beyond the airline's control [RAG:notice-0007]. According to the delay compensation policy, delays caused by extraordinary circumstances (such as severe weather and air traffic control restrictions) **do not qualify for financial compensation** [OKF:delay-compensation.md].

However, because the delay was nearly 3 hours (specifically 2 hours and 50 minutes), you are entitled to **care and assistance**, though the specific threshold for "Meal and refreshments at the airport" for VistaAir is listed as "Any delay over 3 hours" [OKF:delay-compensation.md]. Since the delay was 2 hours and 50 minutes, it does not strictly meet the "over 3 hours" threshold for the automatic meal/refreshment entitlement listed in the table, but the policy states that "care and assistance must still be provided" for extraordinary circumstances [OKF:delay-compensation.md].

**Summary:**
*   **Financial Compensation:** None (due to extraordinary circumstances) [OKF:delay-compensation.md], [RAG:notice-0007].
*   **Care/Assistance:** Must be provided, but specific meal/refreshment entitlements in the table apply to delays *over* 3 hours [OKF:delay-compensation.md].

[OKF:delay-compensation.md] [RAG:notice-0007]"
- **Key Facts Matched by Substring:** `extraordinary circumstances`, `2 hours and 50 minutes`
- **Key Facts Missing by Substring:** `no financial compensation`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "no financial compensation".*

---

### [V1] q-034 (hybrid)

- **Question:** "SkyNova flight SN-101 was delayed 8 hours on June 17 2026. Can I also get a refund instead of compensation?"
- **Expected Answer:** "Yes. Flight SN-101 on 17 June 2026 was delayed 8 hours and 20 minutes due to an engine fault within SkyNova Air's control. Because the delay exceeded 5 hours, SkyNova Air's policy gives you the option to cancel the flight and receive a full refund. Alternatively, you can keep the booking and claim USD 150 cash compensation for a delay over 6 hours caused by airline fault. You do not receive both the refund and the cash compensation."
- **Key Facts Required:** `full refund`, `USD 150 cash`, `cancel the flight`
- **System Answer:** "Based on the evidence provided, the delay for flight SN-101 on June 17, 2026, was 8 hours and 20 minutes [RAG:notice-0009]. According to the SkyNova Air delay compensation policy, for any delay over 5 hours (regardless of the cause), passengers have the "Option to cancel with full refund" [OKF:delay-compensation.md]. Therefore, yes, you can choose to cancel and receive a full refund instead of compensation.

[OKF:delay-compensation.md] [RAG:notice-0009]"
- **Key Facts Matched by Substring:** `full refund`
- **Key Facts Missing by Substring:** `USD 150 cash`, `cancel the flight`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "USD 150 cash", "cancel the flight".*

---

### [V1] q-044 (human_fallback_stale)

- **Question:** "Does Britannica allow multiple-entry Standard Visitor Visas?"
- **Expected Answer:** "yes, multiple entry, valid up to 6 months"
- **Key Facts Required:** `multiple entry`
- **System Answer:** "Yes, Britannica allows multiple-entry Standard Visitor Visas. The visa is valid for up to 6 months and permits multiple entries. [OKF:visa-country-d-britannica.md]"
- **Key Facts Matched by Substring:** None
- **Key Facts Missing by Substring:** `multiple entry`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "multiple entry".*

---

### [V2] q-044 (human_fallback_stale)

- **Question:** "Does Britannica allow multiple-entry Standard Visitor Visas?"
- **Expected Answer:** "yes, multiple entry, valid up to 6 months"
- **Key Facts Required:** `multiple entry`
- **System Answer:** "Yes, Britannica allows multiple-entry Standard Visitor Visas. The visa is valid for up to 6 months and permits multiple entries [OKF:visa-country-d-britannica.md]."
- **Key Facts Matched by Substring:** None
- **Key Facts Missing by Substring:** `multiple entry`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "multiple entry".*

---

## 2. Author Spot-Check Sample (5 Seeded Random Auto-Graded Rows)

These rows were automatically graded. Spot-check them to verify that automated key-fact substring grading and escalation rules operated reliably.

### Spot-Check: [V1] q-033 (hybrid)

- **Question:** "What compensation does VistaAir owe me if my VA-703 flight was delayed nearly 3 hours due to weather on 5 April 2026?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight VA-703 on 5 April 2026 was delayed 2 hours and 50 minutes due to severe thunderstorm activity and an air traffic control ground stop at Delhi. This is classified as extraordinary circumstances beyond VistaAir's control. Because the delay did not reach 3 hours and was caused by weather outside the airline's control, no financial compensation is payable under VistaAir's delay compensation policy."
- **Key Facts:** `extraordinary circumstances`, `no financial compensation`, `2 hours and 50 minutes`
- **System Outcome:** `ANSWERED` 
- **System Answer:** "Based on the evidence provided, here is the breakdown of your compensation entitlement:

1.  **Cause of Delay:** The delay was caused by severe thunderstorm activity and air traffic control ground stops, which are classified as **extraordinary circumstances** outside VistaAir's operational control [RAG:notice-0007].
2.  **Financial Compensation:** According to the policy, delays caused by extraordinary circumstances **do not qualify for financial compensation** (such as cash or travel vouchers) [OKF:delay-compensation.md].
3.  **Care and Assistance:**
    *   **Meals:** You are entitled to **meal and refreshments at the airport** because the delay was over 3 hours [OKF:delay-compensation.md].
    *   **Hotel Accommodation:** You are **not** entitled to hotel accommodation and meals, as this entitlement for "Any cause" requires a delay of **more than 4 hours** [OKF:delay-compensation.md]. Your delay was "nearly 3 hours" (specifically 2 hours and 50 minutes according to the notice), which is less than 4 hours.
    *   **Cancellation/Refund:** You are **not** entitled to the option to cancel with a full refund, as this requires a delay of **more than 5 hours** [OKF:delay-compensation.md].

**Conclusion:**
VistaAir owes you **no financial compensation** (cash or vouchers). You are only entitled to **meals and refreshments at the airport**.

Citations: [RAG:notice-0007], [OKF:delay-compensation.md]"
- **Automated Grade:** `PASS (Correct)`

---

### Spot-Check: [V2] q-023 (rag_only)

- **Question:** "Has ArcticJet changed the departure time of its Mumbai to London flight?"
- **Expected Outcome:** `RAG_ONLY`
- **Expected Answer:** "Yes. From 15 September 2026, ArcticJet adjusted the AJ-411 Mumbai–London Heathrow schedule. The departure time from Mumbai shifted from 02:30 to 05:00 local time to accommodate new slot allocations at London Heathrow. Affected passengers received updated e-tickets by email."
- **Key Facts:** `05:00`, `02:30`, `15 September 2026`
- **System Outcome:** `ANSWERED` 
- **System Answer:** "Yes, ArcticJet has changed the departure time of its Mumbai to London flight. Specifically, the departure time for flight AJ-411 from Mumbai will shift from 02:30 to 05:00 local time starting from 15 September 2026 [RAG:notice-0020]."
- **Automated Grade:** `PASS (Correct)`

---

### Spot-Check: [V2] q-079 (human_fallback_conflict)

- **Question:** "What general refund timeline applies across all airlines for a standard passenger cancellation?"
- **Expected Outcome:** `ESCALATE`
- **Expected Answer:** null (expected escalation)
- **Key Facts:** []
- **System Outcome:** `ANSWERED` 
- **System Answer:** "The general refund timeline that applies across all airlines for a standard passenger cancellation is **21 business days** from the cancellation request. This applies to credit/debit card payments, bank transfers, and cash payments (issued by cheque).

[OKF:refund-policy-general.md]"
- **Automated Grade:** `FAIL (Wrong / Misrouted)`

---

### Spot-Check: [V1] q-056 (human_fallback_no_evidence)

- **Question:** "Were there any incidents involving ArcticJet flights at Singapore Changi airport this year?"
- **Expected Outcome:** `ESCALATE`
- **Expected Answer:** null (expected escalation)
- **Key Facts:** []
- **System Outcome:** `ANSWERED` 
- **System Answer:** "Based on the evidence provided, there were two incidents involving ArcticJet flights at Singapore Changi airport in 2025:

1.  **Flight Delay:** Flight AJ-613 on 2025-12-11 arrived at Singapore Changi 4 hours and 5 minutes late due to a software fault in the aircraft's flight management system [RAG:notice-0008].
2.  **Lost Property:** On 2025-10-22, a passenger reported a laptop and two external hard drives missing from a checked bag after the Mumbai–Singapore flight. The bag arrived with a broken lock, and ArcticJet compensated the passenger USD 350 [RAG:notice-0015].

[RAG:notice-0008] [RAG:notice-0015]"
- **Automated Grade:** `FAIL (Wrong / Misrouted)`

---

### Spot-Check: [V2] q-055 (human_fallback_no_evidence)

- **Question:** "Has there been a recent ArcticJet announcement about new routes to South America?"
- **Expected Outcome:** `ESCALATE`
- **Expected Answer:** null (expected escalation)
- **Key Facts:** []
- **System Outcome:** `ESCALATED` (Reason: INSUFFICIENT)
- **System Answer:** null
- **Automated Grade:** `PASS (Correct)`

---

