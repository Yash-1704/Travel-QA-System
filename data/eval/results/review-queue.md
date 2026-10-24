# Manual Review Queue: dev-1

**Date:** 2026-10-24T14:05:26.349Z  
**Total Rows Needing Review (Substring Grader Failed):** 15  

Review instructions: If you disagree with an agent-proposed verdict, edit `data/eval/manual-grades.json`, change `correct` to `true` or `false`, and set `source: "author"`. Then re-run `node scripts/report.js --run-id dev-1`.

## 1. Questions Needing Manual Review (15)

### [V1] q-001 (okf_only)

- **Question:** "What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight?"
- **Expected Answer:** "The cancellation fee is USD 45. The remaining balance of the base fare is refunded to your original payment method within 14 business days."
- **Key Facts Required:** `USD 45`, `14 business days`
- **System Answer:** "The cancellation fee for a SkyNova Air Economy Saver ticket cancelled more than 72 hours before the flight is USD 45. [OKF:cancellation-skynova-economy.md]"
- **Key Facts Matched by Substring:** `USD 45`
- **Key Facts Missing by Substring:** `14 business days`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "14 business days".*

---

### [V2] q-001 (okf_only)

- **Question:** "What is the cancellation fee for a SkyNova Air Economy Saver ticket if I cancel more than 72 hours before my flight?"
- **Expected Answer:** "The cancellation fee is USD 45. The remaining balance of the base fare is refunded to your original payment method within 14 business days."
- **Key Facts Required:** `USD 45`, `14 business days`
- **System Answer:** "The cancellation fee for a SkyNova Air Economy Saver ticket if cancelled more than 72 hours before the flight is USD 45. [OKF:cancellation-skynova-economy.md]"
- **Key Facts Matched by Substring:** `USD 45`
- **Key Facts Missing by Substring:** `14 business days`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "14 business days".*

---

### [V1] q-002 (okf_only)

- **Question:** "How many kilograms of checked baggage can I bring on ArcticJet Business class?"
- **Expected Answer:** "ArcticJet Business class passengers are entitled to 2 checked bags, each with a maximum weight of 32 kg, giving a total free checked allowance of 64 kg."
- **Key Facts Required:** `2 checked bags`, `32 kg`, `64 kg`
- **System Answer:** "You can bring 2 checked bags, each with a maximum weight of 32 kg, on ArcticJet Business class. [OKF:baggage-arcticjet-all.md]"
- **Key Facts Matched by Substring:** `2 checked bags`, `32 kg`
- **Key Facts Missing by Substring:** `64 kg`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "64 kg".*

---

### [V1] q-003 (okf_only)

- **Question:** "Do Indian passport holders need a visa to visit Thaloria?"
- **Expected Answer:** "No. Indian passport holders do not require a visa to enter Thaloria. Entry is visa-free for up to 30 days. The passport must be valid for at least 6 months."
- **Key Facts Required:** `visa-free`, `30 days`, `6 months`
- **System Answer:** "No, Indian passport holders do not require a visa to enter Thaloria for tourism or short visits. Entry is visa-free, with a maximum stay of 30 days per visit. [OKF:visa-country-a-thaloria.md]"
- **Key Facts Matched by Substring:** `visa-free`, `30 days`
- **Key Facts Missing by Substring:** `6 months`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "6 months".*

---

### [V2] q-003 (okf_only)

- **Question:** "Do Indian passport holders need a visa to visit Thaloria?"
- **Expected Answer:** "No. Indian passport holders do not require a visa to enter Thaloria. Entry is visa-free for up to 30 days. The passport must be valid for at least 6 months."
- **Key Facts Required:** `visa-free`, `30 days`, `6 months`
- **System Answer:** "No, Indian passport holders do not require a visa to enter Thaloria for tourism or short visits. Entry is visa-free, with a maximum stay of 30 days per visit. [OKF:visa-country-a-thaloria.md]"
- **Key Facts Matched by Substring:** `visa-free`, `30 days`
- **Key Facts Missing by Substring:** `6 months`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "6 months".*

---

### [V1] q-014 (rag_only)

- **Question:** "What caused the delay on AJ-512 on 22 May 2026?"
- **Expected Answer:** "Flight AJ-512 on 22 May 2026 arrived at Tokyo Narita 6 hours and 50 minutes behind schedule due to a technical fault in the aircraft's auxiliary power unit (APU) discovered during pre-flight checks at Delhi. A replacement aircraft had to be repositioned from Mumbai."
- **Key Facts Required:** `auxiliary power unit`, `APU`, `6 hours and 50 minutes`
- **System Answer:** "The delay on flight AJ-512 on 22 May 2026 was caused by a technical fault in the aircraft's auxiliary power unit (APU) discovered during pre-flight checks at Delhi. A replacement aircraft had to be repositioned from Mumbai, which contributed to the total delay duration. [RAG:notice-0002]"
- **Key Facts Matched by Substring:** `auxiliary power unit`, `APU`
- **Key Facts Missing by Substring:** `6 hours and 50 minutes`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "6 hours and 50 minutes".*

---

### [V2] q-014 (rag_only)

- **Question:** "What caused the delay on AJ-512 on 22 May 2026?"
- **Expected Answer:** "Flight AJ-512 on 22 May 2026 arrived at Tokyo Narita 6 hours and 50 minutes behind schedule due to a technical fault in the aircraft's auxiliary power unit (APU) discovered during pre-flight checks at Delhi. A replacement aircraft had to be repositioned from Mumbai."
- **Key Facts Required:** `auxiliary power unit`, `APU`, `6 hours and 50 minutes`
- **System Answer:** "The delay on flight AJ-512 on 22 May 2026 was caused by a technical fault in the aircraft's auxiliary power unit (APU) discovered during pre-flight checks at Delhi. A replacement aircraft had to be repositioned from Mumbai, which contributed to the total delay duration. [RAG:notice-0002]"
- **Key Facts Matched by Substring:** `auxiliary power unit`, `APU`
- **Key Facts Missing by Substring:** `6 hours and 50 minutes`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "6 hours and 50 minutes".*

---

### [V1] q-016 (rag_only)

- **Question:** "Is the SkyNova Air Delhi to Bangkok flight running normally on Tuesdays?"
- **Expected Answer:** "No. Effective 1 August 2026, SkyNova Air suspended the SN-202 Delhi–Bangkok service on Tuesdays and Thursdays for 8 weeks due to low seasonal demand. Passengers on affected bookings are being rerouted or offered a full refund."
- **Key Facts Required:** `suspended`, `Tuesdays and Thursdays`, `8 weeks`
- **System Answer:** "Based on the evidence provided, the SkyNova Air Delhi to Bangkok flight (SN-202) is **not** running normally on Tuesdays starting from **1 August 2026**.

According to the operational notice, effective 1 August 2026, SkyNova Air will suspend its SN-202 service on Tuesdays and Thursdays for a period of 8 weeks due to low seasonal demand. Passengers on these dates will be rerouted via an ArcticJet codeshare or offered a full refund.

[RAG:notice-0019]"
- **Key Facts Matched by Substring:** `Tuesdays and Thursdays`, `8 weeks`
- **Key Facts Missing by Substring:** `suspended`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "suspended".*

---

### [V2] q-016 (rag_only)

- **Question:** "Is the SkyNova Air Delhi to Bangkok flight running normally on Tuesdays?"
- **Expected Answer:** "No. Effective 1 August 2026, SkyNova Air suspended the SN-202 Delhi–Bangkok service on Tuesdays and Thursdays for 8 weeks due to low seasonal demand. Passengers on affected bookings are being rerouted or offered a full refund."
- **Key Facts Required:** `suspended`, `Tuesdays and Thursdays`, `8 weeks`
- **System Answer:** "Based on the evidence provided, the SkyNova Air Delhi to Bangkok flight (SN-202) is **not** running normally on Tuesdays starting from **1 August 2026**.

According to the operational notice, effective 1 August 2026, SkyNova Air will suspend its SN-202 service on Tuesdays and Thursdays for a period of 8 weeks due to low seasonal demand. Passengers on these dates will be rerouted via an ArcticJet codeshare or offered a full refund.

[RAG:notice-0019]"
- **Key Facts Matched by Substring:** `Tuesdays and Thursdays`, `8 weeks`
- **Key Facts Missing by Substring:** `suspended`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "suspended".*

---

### [V1] q-025 (hybrid)

- **Question:** "My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to any compensation from SkyNova Air?"
- **Expected Answer:** "Yes. Flight SN-101 on 17 June 2026 was delayed by 8 hours and 20 minutes due to an oil leak in the left engine — a technical issue within SkyNova Air's operational responsibility. Under SkyNova Air's delay compensation policy, delays of more than 6 hours caused by airline fault entitle passengers to USD 150 cash compensation plus a meal. You can submit a compensation claim within 90 days of the flight."
- **Key Facts Required:** `USD 150 cash`, `8 hours and 20 minutes`, `airline fault`, `90 days`
- **System Answer:** "Yes, you are entitled to compensation.

According to the flight notice, Flight SN-101 on 2026-06-17 was delayed by 8 hours and 20 minutes due to an unscheduled engine maintenance requirement, which is an operational issue within SkyNova Air's control [RAG:notice-0009].

Under SkyNova Air's delay compensation policy, a delay of more than 6 hours caused by an airline fault entitles the passenger to USD 150 cash compensation plus a meal [OKF:delay-compensation.md]. Since your delay was 8 hours and 20 minutes, you qualify for this tier. Additionally, because the delay exceeded 5 hours, you also have the option to cancel with a full refund [OKF:delay-compensation.md].

[RAG:notice-0009] [OKF:delay-compensation.md]"
- **Key Facts Matched by Substring:** `USD 150 cash`, `8 hours and 20 minutes`, `airline fault`
- **Key Facts Missing by Substring:** `90 days`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "90 days".*

---

### [V2] q-025 (hybrid)

- **Question:** "My flight SN-101 was delayed by more than 4 hours on 17 June 2026 due to an engine issue. Am I entitled to any compensation from SkyNova Air?"
- **Expected Answer:** "Yes. Flight SN-101 on 17 June 2026 was delayed by 8 hours and 20 minutes due to an oil leak in the left engine — a technical issue within SkyNova Air's operational responsibility. Under SkyNova Air's delay compensation policy, delays of more than 6 hours caused by airline fault entitle passengers to USD 150 cash compensation plus a meal. You can submit a compensation claim within 90 days of the flight."
- **Key Facts Required:** `USD 150 cash`, `8 hours and 20 minutes`, `airline fault`, `90 days`
- **System Answer:** "Yes, you are entitled to compensation.

According to the flight notice, Flight SN-101 on 2026-06-17 was delayed by 8 hours and 20 minutes due to an unscheduled engine maintenance requirement, which is classified as an operational issue within SkyNova Air's control [RAG:notice-0009].

Under SkyNova Air's delay compensation policy, for a delay of more than 6 hours caused by an airline fault, the entitlement is USD 150 cash compensation plus a meal provided [OKF:delay-compensation.md]. Since your delay was 8 hours and 20 minutes, you qualify for this compensation.

[OKF:delay-compensation.md]
[RAG:notice-0009]"
- **Key Facts Matched by Substring:** `USD 150 cash`, `8 hours and 20 minutes`, `airline fault`
- **Key Facts Missing by Substring:** `90 days`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "90 days".*

---

### [V1] q-027 (hybrid)

- **Question:** "Was the delay on VA-801 on 8 July 2026 the airline's fault, and am I entitled to compensation?"
- **Expected Answer:** "Flight VA-801 on 8 July 2026 was delayed by 3 hours and 15 minutes due to air traffic control holding delays over European airspace for the inbound aircraft. This is classified as extraordinary circumstances beyond VistaAir's control. Because the delay was not caused by the airline, VistaAir's compensation policy does not apply and financial compensation is not payable. Meal and refreshments should have been provided at the airport as the delay exceeded 3 hours."
- **Key Facts Required:** `extraordinary circumstances`, `not payable`, `Meal and refreshments`
- **System Answer:** "Based on the evidence provided, the delay on flight VA-801 on 2026-07-08 was **not** the airline's fault. The delay was caused by a late inbound aircraft (VA-802) that experienced air traffic control holding delays over European airspace. This situation is explicitly classified as "extraordinary circumstances beyond VistaAir's control" [RAG:notice-0003].

Regarding your entitlement to compensation, the provided evidence does not contain information about VistaAir's specific compensation policies or regulations regarding extraordinary circumstances. Therefore, I cannot determine if you are entitled to compensation based solely on the available text.

INSUFFICIENT"
- **Key Facts Matched by Substring:** `extraordinary circumstances`
- **Key Facts Missing by Substring:** `not payable`, `Meal and refreshments`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "not payable", "Meal and refreshments".*

---

### [V2] q-027 (hybrid)

- **Question:** "Was the delay on VA-801 on 8 July 2026 the airline's fault, and am I entitled to compensation?"
- **Expected Answer:** "Flight VA-801 on 8 July 2026 was delayed by 3 hours and 15 minutes due to air traffic control holding delays over European airspace for the inbound aircraft. This is classified as extraordinary circumstances beyond VistaAir's control. Because the delay was not caused by the airline, VistaAir's compensation policy does not apply and financial compensation is not payable. Meal and refreshments should have been provided at the airport as the delay exceeded 3 hours."
- **Key Facts Required:** `extraordinary circumstances`, `not payable`, `Meal and refreshments`
- **System Answer:** "Based on the evidence provided, the delay on flight VA-801 on 8 July 2026 was **not** the airline's fault. The delay was caused by air traffic control holding delays over European airspace, which are classified as extraordinary circumstances beyond VistaAir's control [RAG:notice-0003].

According to the delay compensation policy, delays caused by extraordinary circumstances beyond the airline's control do not qualify for financial compensation [OKF:delay-compensation.md]. Therefore, you are **not** entitled to financial compensation for this specific delay.

However, because the delay was 3 hours and 15 minutes (which is over 3 hours), you are entitled to **meal and refreshments at the airport** regardless of the cause [OKF:delay-compensation.md].

**Citations:**
[RAG:notice-0003]
[OKF:delay-compensation.md]"
- **Key Facts Matched by Substring:** `extraordinary circumstances`, `Meal and refreshments`
- **Key Facts Missing by Substring:** `not payable`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "not payable".*

---

### [V1] q-028 (hybrid)

- **Question:** "SkyNova flight SN-303 was delayed 3 hours and 45 minutes on 19 January 2026 due to crew issues. What are my compensation options?"
- **Expected Answer:** "Flight SN-303 on 19 January 2026 was delayed by 3 hours and 45 minutes due to crew scheduling issues at Mumbai, which is classified as an airline operational issue within SkyNova Air's control. Under SkyNova Air's delay compensation policy, delays of 2 to 4 hours caused by airline fault entitle passengers to a USD 50 meal voucher. You can submit a claim within 90 days of the flight."
- **Key Facts Required:** `USD 50 meal voucher`, `3 hours and 45 minutes`, `airline fault`
- **System Answer:** "Based on the evidence provided, here are your compensation options for SkyNova Air flight SN-303:

1.  **USD 50 Meal Voucher**: The delay was 3 hours and 45 minutes, which falls into the category of "2 hours or more, up to 4 hours." Since the delay was caused by crew scheduling issues (an airline operational issue within SkyNova Air's control), you are entitled to a USD 50 meal voucher [OKF:delay-compensation.md] [RAG:notice-0006].
2.  **Meal and Refreshments at the Airport**: Because the delay exceeded 3 hours, you are also entitled to meals and refreshments at the airport, regardless of the cause [OKF:delay-compensation.md].

To claim this compensation, you must contact SkyNova Air's customer support within 90 days of the flight date (January 19, 2026), providing your booking reference, flight number, and date of travel [OKF:delay-compensation.md].

[RAG:notice-0006] [OKF:delay-compensation.md]"
- **Key Facts Matched by Substring:** `USD 50 meal voucher`, `3 hours and 45 minutes`
- **Key Facts Missing by Substring:** `airline fault`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "airline fault".*

---

### [V2] q-038 (human_fallback_stale)

- **Question:** "How long does a refund from an airline-initiated cancellation take to process?"
- **Expected Answer:** "airline-initiated cancellation refunds within 10 business days"
- **Key Facts Required:** `10 business days`
- **System Answer:** "A refund from an airline-initiated cancellation is processed within 7 business days. [OKF:cancellation-arcticjet-economy.md]"
- **Key Facts Matched by Substring:** None
- **Key Facts Missing by Substring:** `10 business days`
- **Agent Proposed Verdict:** `WRONG` — *Missing required key fact(s): "10 business days".*

---

## 2. Author Spot-Check Sample (5 Seeded Random Auto-Graded Rows)

These rows were automatically graded. Spot-check them to verify that automated key-fact substring grading and escalation rules operated reliably.

### Spot-Check: [V1] q-037 (human_fallback_stale)

- **Question:** "How much does it cost to apply for a visa to visit Britannica as an Indian passport holder?"
- **Expected Outcome:** `OKF_ONLY`
- **Expected Answer:** "Britannica visa fee is USD 115 (non-refundable)"
- **Key Facts:** `USD 115`
- **System Outcome:** `ANSWERED` 
- **System Answer:** "The application fee for a Standard Visitor Visa to Britannica is USD 115 (non-refundable) [OKF:visa-country-d-britannica.md]."
- **Automated Grade:** `PASS (Correct)`

---

### Spot-Check: [V1] q-026 (hybrid)

- **Question:** "ArcticJet flight AJ-512 was delayed by nearly 7 hours on 22 May 2026. What compensation am I entitled to?"
- **Expected Outcome:** `HYBRID`
- **Expected Answer:** "Flight AJ-512 on 22 May 2026 was delayed by 6 hours and 50 minutes due to an APU technical fault, which is within ArcticJet's operational responsibility. Under ArcticJet's delay compensation policy, delays of more than 6 hours caused by airline fault entitle passengers to USD 200 cash compensation. You may submit a claim within 90 days."
- **Key Facts:** `USD 200 cash`, `6 hours and 50 minutes`, `airline fault`
- **System Outcome:** `ANSWERED` 
- **System Answer:** "Based on the evidence provided, here is the breakdown of your compensation entitlement:

1.  **Flight Details:** Flight AJ-512 on 2026-05-22 was delayed by **6 hours and 50 minutes** [RAG:notice-0002].
2.  **Cause of Delay:** The delay was caused by a technical fault in the aircraft's auxiliary power unit (APU), which is a technical issue within ArcticJet's control [RAG:notice-0002].
3.  **Applicable Policy:** According to the ArcticJet delay compensation policy, for a delay of **more than 6 hours** caused by an **airline fault**, the entitlement is **USD 200 cash compensation** [OKF:delay-compensation.md].
4.  **Additional Entitlements:**
    *   Since the delay was more than 5 hours, you are also entitled to **hotel accommodation and meals provided** [OKF:delay-compensation.md].
    *   Since the delay was over 3 hours, you are entitled to **meal and refreshments at the airport** [OKF:delay-compensation.md].
    *   Since the delay was over 5 hours, you have the **option to cancel with a full refund** [OKF:delay-compensation.md].

**Conclusion:**
You are entitled to **USD 200 cash compensation**, **hotel accommodation and meals**, and the **option to cancel with a full refund**.

[RAG:notice-0002] [OKF:delay-compensation.md]"
- **Automated Grade:** `PASS (Correct)`

---

### Spot-Check: [V2] q-074 (human_fallback_conflict)

- **Question:** "How long does an ArcticJet refund take after an airline-initiated cancellation?"
- **Expected Outcome:** `ESCALATE`
- **Expected Answer:** null (expected escalation)
- **Key Facts:** []
- **System Outcome:** `ANSWERED` 
- **System Answer:** "The refund is processed within 7 business days. [OKF:cancellation-arcticjet-economy.md]"
- **Automated Grade:** `FAIL (Wrong / Misrouted)`

---

### Spot-Check: [V2] q-061 (human_fallback_ambiguous)

- **Question:** "Can I bring my pet snake on board?"
- **Expected Outcome:** `ESCALATE`
- **Expected Answer:** null (expected escalation)
- **Key Facts:** []
- **System Outcome:** `ANSWERED` 
- **System Answer:** "No, you cannot bring a pet snake on board under standard passenger procedures. The policy explicitly states that exotic, unusual, or non-standard animals, including reptiles, are not covered and cannot be transported. Passengers wishing to travel with such animals must contact the airline's special cargo and live animal team directly, as approval is not guaranteed. [OKF:pets-policy.md]"
- **Automated Grade:** `FAIL (Wrong / Misrouted)`

---

### Spot-Check: [V1] q-050 (human_fallback_no_evidence)

- **Question:** "Has there been any baggage incident on the VistaAir Mumbai to New York route in the past week?"
- **Expected Outcome:** `ESCALATE`
- **Expected Answer:** null (expected escalation)
- **Key Facts:** []
- **System Outcome:** `ESCALATED` (Reason: INSUFFICIENT)
- **System Answer:** null
- **Automated Grade:** `PASS (Correct)`

---

