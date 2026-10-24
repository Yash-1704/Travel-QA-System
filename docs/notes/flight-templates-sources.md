# Flight Templates Source Mapping

This document maps each flight template in `data/seed/flight-templates.json` to its defining source in `docs/universe.md` and `data/rag/notices.json`.

| Flight No | Airline | Route | Local Dep Time | Source Reference |
|---|---|---|---|---|
| **SN-101** | SkyNova Air | DEL–DXB | 08:30 | `docs/universe.md` line 15 ("SN-101: Delhi (DEL) → Dubai (DXB)"), fares lines 18-20, `data/rag/notices.json` notice-0001 |
| **SN-202** | SkyNova Air | DEL–BKK | 11:15 | `docs/universe.md` line 16 ("SN-202: Delhi (DEL) → Bangkok (BKK)"), fares lines 18-20, `data/rag/notices.json` notice-0007 |
| **SN-303** | SkyNova Air | BOM–DXB | 14:00 | `docs/universe.md` line 17 ("SN-303: Mumbai (BOM) → Dubai (DXB)"), fares lines 18-20, `data/rag/notices.json` notice-0012 |
| **AJ-411** | ArcticJet | BOM–LHR | 05:00 | `docs/universe.md` line 40 ("AJ-411: Mumbai (BOM) → London Heathrow (LHR)"), fares lines 43-45; schedule departure fixed at 05:00 local time per `data/rag/notices.json` notice-0020 |
| **AJ-512** | ArcticJet | DEL–NRT | 22:45 | `docs/universe.md` line 41 ("AJ-512: Delhi (DEL) → Tokyo Narita (NRT)"), fares lines 43-45, `data/rag/notices.json` notice-0002 |
| **AJ-613** | ArcticJet | BOM–SIN | 09:30 | `docs/universe.md` line 42 ("AJ-613: Mumbai (BOM) → Singapore (SIN)"), fares lines 43-45, `data/rag/notices.json` notice-0016 |
| **VA-703** | VistaAir | DEL–NRT | 19:30 | `docs/universe.md` line 66 ("VA-703: Delhi (DEL) → Tokyo Narita (NRT)"), fares lines 67-69, `data/rag/notices.json` notice-0014 |
| **VA-801** | VistaAir | DEL–LHR | 07:15 | `docs/universe.md` line 64 ("VA-801: Delhi (DEL) → London Heathrow (LHR)"), fares lines 67-69, `data/rag/notices.json` notice-0004 |
| **VA-902** | VistaAir | BOM–JFK | 01:30 | `docs/universe.md` line 65 ("VA-902: Mumbai (BOM) → New York JFK (JFK)"), fares lines 67-69; suspension window 2026-10-01 to 2026-10-31 per `data/rag/notices.json` notice-0024 |

## Constraints Followed
- **No forbidden flight numbers**: AJ-511, SN-505, and VA-802 are completely omitted as evaluation treats them as nonexistent.
- **No fictitious return legs**: Only the 9 exact routes defined in `docs/universe.md` are modeled.
- **Accurate time zones**: Real IANA time zones used for each airport (`Asia/Kolkata` for DEL/BOM, `Asia/Dubai` for DXB, `Asia/Bangkok` for BKK, `Europe/London` for LHR, `Asia/Tokyo` for NRT, `Asia/Singapore` for SIN, `America/New_York` for JFK).
- **Notice compliance**: AJ-411 departs at 05:00 local time (notice-0020); VA-902 has zero generated departures between 2026-10-01 and 2026-10-31 (notice-0024).
- **No disruption data**: Flight documents contain zero delay or incident fields; operational disruption is isolated to RAG notices.
