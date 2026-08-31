---
type: process
id: process-usa-employment-green-card
title: U.S. Employment-Based Green Card Path
generated: 2026-08-30
verified: 2026-08-30
stale_after: 2026-09-13
status: verified
sources:
  - ../../../sources/dol-perm-aug-2026.md
  - ../../../sources/uscis-i140-aug-2026.md
  - ../../../sources/uscis-i485-aug-2026.md
  - ../../../sources/uscis-visa-availability-priority-dates-aug-2026.md
  - ../../../sources/dos-visa-bulletin-aug-2026.md
  - ../../../sources/dos-visa-bulletin-sep-2026.md
  - ../../../sources/dos-nvc-ds260-aug-2026.md
  - ../../../sources/uscis-i485-supplement-j-aug-2026.md
  - ../../../sources/uscis-i693-i485-aug-2026.md
  - ../../../sources/uscis-eb4-aug-2026.md
  - ../../../sources/uscis-eb5-aug-2026.md
---

# Employment-Based Green Card

Run [employment-based category classification](../../../decisions/usa-employment-green-card-category.md) before collecting a stage-specific package.

## Stage router

1. `planning` — resolve EB-1/EB-2/EB-3/Schedule A/EB-4/EB-5 and the correct petition/labor-certification family.
2. `labor_certification` — only run ordinary DOL PERM when the selected category requires it. Use [PERM requirements](../../../requirements/usa-employment-green-card-perm.md).
3. `immigrant_petition` — use the category-correct petition and [petition requirements](../../../requirements/usa-employment-green-card-petition.md). For ordinary EB-1/2/3 paths this is Form I-140; EB-4 and EB-5 must not be mislabeled as I-140 cases.
4. `waiting_for_visa_number` — determine priority date, preference row and chargeability; compare against the selected month's Visa Bulletin.
5. `adjustment_of_status` — confirm physical presence/adjustment eligibility and the current USCIS filing-chart selection before a new I-485 is treated as fileable.
6. `consular_processing` — after petition approval/transfer, follow NVC/CEAC/DS-260 and immigrant-visa processing.
7. `pending_adjustment` — preserve the pending I-485 basis, monitor Final Action availability, and evaluate Supplement J/INA 204(j) portability only when applicable.

Use [adjustment / consular requirements](../../../requirements/usa-employment-green-card-adjustment-consular.md) for the final-processing branch.

## Visa Bulletin model

The runtime bundles August and September 2026 Department of State employment-based Final Action Dates and Dates for Filing. These tables are used only for their applicable month. For adjustment filings, USCIS monthly chart selection is an independent required input; the engine will not automatically choose Dates for Filing.

## Hard blockers

- category ↔ PERM/Schedule A/no-labor-certification mismatch;
- attempting downstream I-140 stages without required certified PERM;
- expired PERM used for a new I-140 filing;
- using I-140 for EB-4 or EB-5;
- adjustment selected for a beneficiary outside the United States;
- priority date not earlier than the USCIS-selected chart cutoff for a planned new I-485;
- missing required I-693 for a planned new I-485;
- treating an approved petition as automatic I-485/NVC eligibility.

Applicant-specific adjustment bars, admissibility/status-history issues, category-specific EB-4/EB-5 requirements, and unverified future monthly filing charts return `NEEDS_AUTHORITATIVE_CONFIRMATION` rather than guessed eligibility.
