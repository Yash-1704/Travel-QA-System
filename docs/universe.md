# Fictional Universe Reference

**File:** data/universe.md  
**Purpose:** Single source of truth for all facts in the project. Every OKF file, RAG chunk, and evaluation question must be consistent with the numbers below. If a number changes here, update all referencing files.

---

## Airlines

### 1. SkyNova Air (SN)
- **Type:** Budget / low-cost carrier
- **Home country:** Fictonia (fictional)
- **IATA prefix:** SN
- **Routes operated:**
  - SN-101: Delhi (DEL) → Dubai (DXB)
  - SN-202: Delhi (DEL) → Bangkok (BKK)
  - SN-303: Mumbai (BOM) → Dubai (DXB)
- **Fare classes:**
  - **Economy (Saver):** Basic non-flexible ticket
  - **Economy (Flex):** Flexible economy ticket
- **Cancellation fees (Economy Saver):**
  - More than 72 hours before departure: USD 45 flat fee; remainder refunded
  - 24–72 hours before departure: USD 90 flat fee; remainder refunded
  - Within 24 hours of departure: No refund (fare forfeited)
- **Cancellation fees (Economy Flex):**
  - More than 24 hours before departure: USD 30 flat fee; remainder refunded
  - Within 24 hours of departure: USD 60 flat fee; remainder refunded
- **Baggage (Economy Saver):** 20 kg checked, 7 kg cabin
- **Baggage (Economy Flex):** 25 kg checked, 7 kg cabin
- **Delay compensation (internal policy):** USD 50 meal voucher for delays 2–4 hours; USD 100 meal + USD 50 travel voucher for delays over 4 hours; cash compensation of USD 150 for delays over 6 hours caused by airline fault
- **Loyalty program:** SkyNova Miles (see loyalty-skynova.md)

---

### 2. ArcticJet (AJ)
- **Type:** Mid-range / full-service regional
- **Home country:** Norravia (fictional)
- **IATA prefix:** AJ
- **Routes operated:**
  - AJ-411: Mumbai (BOM) → London Heathrow (LHR)
  - AJ-512: Delhi (DEL) → Tokyo Narita (NRT)
  - AJ-613: Mumbai (BOM) → Singapore (SIN)
- **Fare classes:**
  - **Economy:** Standard economy
  - **Business:** Full-service business class
- **Cancellation fees (Economy):**
  - More than 48 hours before departure: USD 60 flat fee; remainder refunded within 14 business days
  - 12–48 hours before departure: USD 120 flat fee; remainder refunded
  - Within 12 hours of departure: No refund (fare forfeited); taxes refunded
- **Cancellation fees (Business):**
  - More than 24 hours before departure: USD 100 flat fee; remainder refunded
  - Within 24 hours of departure: USD 200 flat fee; remainder refunded
- **Baggage (Economy):** 23 kg checked (1 bag), 7 kg cabin
- **Baggage (Business):** 32 kg checked (2 bags, 32 kg each), 14 kg cabin (2 bags)
- **Delay compensation (internal policy):** Complies with internal ArcticJet Passenger Charter: USD 75 voucher for delays 3–6 hours (airline fault); USD 200 cash for delays over 6 hours (airline fault); meal and hotel provided for delays over 5 hours

---

### 3. VistaAir (VA)
- **Type:** Premium / full-service international
- **Home country:** Solaria (fictional)
- **IATA prefix:** VA
- **Routes operated:**
  - VA-801: Delhi (DEL) → London Heathrow (LHR)
  - VA-902: Mumbai (BOM) → New York JFK (JFK)
  - VA-703: Delhi (DEL) → Tokyo Narita (NRT)
- **Fare classes:**
  - **Economy:** Standard economy
  - **Business (Sapphire):** Premium business class
- **Cancellation fees (Economy):**
  - More than 96 hours before departure: USD 40 flat fee; remainder refunded
  - 24–96 hours before departure: USD 100 flat fee; remainder refunded
  - Within 24 hours of departure: No refund; taxes refunded within 30 days
- **Cancellation fees (Business Sapphire):**
  - More than 48 hours before departure: Fully refundable (no fee)
  - 12–48 hours before departure: USD 150 flat fee; remainder refunded
  - Within 12 hours of departure: USD 300 flat fee; remainder refunded
- **Baggage (Economy):** 23 kg checked (1 bag), 8 kg cabin
- **Baggage (Business Sapphire):** 32 kg checked (2 bags), 16 kg cabin (2 bags), priority handling
- **Delay compensation (internal policy):** USD 100 voucher for delays 3–5 hours (airline fault); USD 300 cash for delays over 5 hours (airline fault); hotel and meal provided for delays over 4 hours

---

## Countries (visa rules for Indian passport holders — all FICTIONAL)

### Country A: Thaloria
- **Real-world inspiration:** Thailand (geography only; visa rules are fictional)
- **Visa rule for Indian passport holders:** VISA-FREE entry, up to 30 days
- **Passport validity required:** Minimum 6 months
- **Notes:** No visa application needed; entry stamp issued on arrival

### Country B: Emiria
- **Real-world inspiration:** UAE (geography only; visa rules are fictional)
- **Visa rule for Indian passport holders:** VISA ON ARRIVAL
- **Fee:** USD 35 for 14-day visa
- **Passport validity required:** Minimum 6 months
- **Notes:** Available at all major international airports; return ticket and hotel booking required

### Country C: Nipponara
- **Real-world inspiration:** Japan (geography only; visa rules are fictional)
- **Visa rule for Indian passport holders:** E-VISA required
- **Fee:** USD 25 application fee (non-refundable)
- **Processing time:** 5–7 business days
- **Validity:** Single entry, 30 days from issue date
- **Notes:** Apply at mygov-nipponara-evisa.gov (fictional); biometrics required in person at authorised centre

### Country D: Britannica
- **Real-world inspiration:** UK (geography only; visa rules are fictional)
- **Visa rule for Indian passport holders:** FULL VISA REQUIRED (Standard Visitor Visa)
- **Fee:** USD 180 application fee
- **Processing time:** 15–20 business days
- **Validity:** Up to 6 months, multiple entry
- **Notes:** In-person appointment at Britannica Visa Application Centre; bank statements for last 6 months required; biometrics required
- **STALE NOTE:** This file (visa-country4.md) was written when fee was USD 115; the fee has since increased to USD 180. The stale file still shows USD 115.

### Country E: Zorovia
- **Real-world inspiration:** Fictional country modelled on a restricted-access destination
- **Visa rule for Indian passport holders:** RESTRICTED — visa is not available for tourist travel; only business and diplomatic visas issued
- **Notes:** Applications require sponsorship letter from a registered Zorovian business entity; tourist entry is not permitted; applications take 30–60 days and are frequently refused

---

## Fare Class Naming Summary

| Airline | Economy (basic) | Economy (flex) | Business |
|---------|-----------------|----------------|----------|
| SkyNova | Economy Saver | Economy Flex | Not offered |
| ArcticJet | Economy | — | Business |
| VistaAir | Economy | — | Business (Sapphire) |

---

## Key Numbers At-a-Glance (for consistency checking)

| Fact | Value |
|------|-------|
| SkyNova Economy Saver cancellation (>72h) | USD 45 |
| SkyNova Economy Saver cancellation (24–72h) | USD 90 |
| SkyNova Economy Flex cancellation (>24h) | USD 30 |
| SkyNova Economy checked baggage | 20 kg (Saver), 25 kg (Flex) |
| ArcticJet Economy cancellation (>48h) | USD 60 |
| ArcticJet Economy cancellation (12–48h) | USD 120 |
| ArcticJet Business cancellation (>24h) | USD 100 |
| ArcticJet Economy checked baggage | 23 kg |
| ArcticJet Business checked baggage | 32 kg × 2 |
| VistaAir Economy cancellation (>96h) | USD 40 |
| VistaAir Economy cancellation (24–96h) | USD 100 |
| VistaAir Business Sapphire cancellation (>48h) | USD 0 (fully refundable) |
| VistaAir Economy checked baggage | 23 kg |
| VistaAir Business checked baggage | 32 kg × 2 |
| Thaloria (Country A) | Visa-free, 30 days |
| Emiria (Country B) | Visa on arrival, USD 35 / 14 days |
| Nipponara (Country C) | E-visa, USD 25, 5–7 days processing |
| Britannica (Country D) | Full visa, USD 180 (stale file: USD 115) |
| Zorovia (Country E) | Restricted — tourist visa not available |
| SkyNova delay comp (2–4h) | USD 50 meal voucher |
| SkyNova delay comp (>4h) | USD 100 meal + USD 50 travel voucher |
| SkyNova delay comp (>6h, airline fault) | USD 150 cash |
| ArcticJet delay comp (3–6h, airline fault) | USD 75 voucher |
| ArcticJet delay comp (>6h, airline fault) | USD 200 cash |
| VistaAir delay comp (3–5h, airline fault) | USD 100 voucher |
| VistaAir delay comp (>5h, airline fault) | USD 300 cash |
| Refund general rule (all airlines) | Refund to original payment within 14 business days |
| Refund general: taxes/fees | Always refunded regardless of fare type |
| General refund: airline-initiated cancellation | Full refund, no fee, within 7 business days |
| Pets: cats, dogs | Allowed in-cabin (under 8 kg with carrier) on all airlines |
| Pets: exotic/unusual animals | Not covered — requires human review |
| SkyNova Miles: earning | 5 miles per USD spent (Saver); 8 miles per USD spent (Flex) |
| SkyNova Miles: redemption | 500 miles = USD 5 discount; minimum redemption 500 miles |
| SkyNova Miles: expiry | Miles expire 24 months after last account activity |
