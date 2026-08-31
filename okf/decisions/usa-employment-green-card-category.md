---
type: decision
id: decision-usa-employment-green-card-category
title: U.S. Employment-Based Green Card Category Router
generated: 2026-08-30
verified: 2026-08-30
stale_after: 2026-09-13
status: verified
sources:
  - ../sources/uscis-i140-aug-2026.md
  - ../sources/dol-perm-aug-2026.md
  - ../sources/uscis-eb4-aug-2026.md
  - ../sources/uscis-eb5-aug-2026.md
---

# Employment-Based Green Card Category Router

Classify the preference/petition path **before** starting labor certification or assembling an immigrant petition.

## I-140 families

- `eb1a_extraordinary_ability` — EB-1; Form I-140; ordinary PERM not required; self-petition route available under the category rules.
- `eb1b_outstanding_professor_researcher` — EB-1; Form I-140; employer/job-offer based; ordinary PERM not required.
- `eb1c_multinational_manager_executive` — EB-1; Form I-140; employer based; ordinary PERM not required.
- `eb2_advanced_degree_exceptional_ability` — EB-2; Form I-140; normally requires certified DOL labor certification unless another authoritative exception applies.
- `eb2_national_interest_waiver` — EB-2; Form I-140; ordinary job-offer/labor-certification requirement is waived when NIW eligibility is established.
- `eb3_professional` — EB-3; Form I-140; DOL labor certification required absent a specific exception.
- `eb3_skilled_worker` — EB-3; Form I-140; DOL labor certification required absent a specific exception.
- `eb3_other_worker` — EB-3 Other Workers; Form I-140; DOL labor certification required absent a specific exception.
- `schedule_a` — Form I-140 but special Schedule A labor-certification handling; do not run the ordinary DOL PERM workflow. Resolve whether the visa preference row is EB-2 or EB-3.

## Non-I-140 employment-based families

- `eb4_special_immigrant` — category-specific special-immigrant petition path, commonly Form I-360; do not force into I-140/PERM.
- `eb5_unreserved` / EB-5 set-asides — investor petition path using Form I-526 or I-526E as applicable; do not force into I-140/PERM.

## Blocking rule

A mismatch between the selected category and the selected labor-certification/petition route is `NOT_READY`. Correct the category/agency/form family before document collection or fees.
