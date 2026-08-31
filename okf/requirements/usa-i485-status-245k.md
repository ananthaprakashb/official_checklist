---
type: requirement
id: requirement-usa-i485-status-245k
title: Employment-Based I-485 Admission, Status-History and INA 245(k) Requirements
generated: 2026-08-30
verified: 2026-08-30
stale_after: 2026-09-13
status: verified
sources:
  - ../sources/uscis-i485-instructions-aug-2026.md
  - ../sources/uscis-employment-adjustment-245k-aug-2026.md
---

# Admission / Status-History Gate

Before a READY filing result:

- applicant is physically present in the United States;
- inspection/admission/parole and adjustment jurisdiction are resolved;
- known INA 245(c) status/unauthorized-employment issues are reviewed;
- if relying on INA 245(k), the category is covered and the aggregate post-last-lawful-admission violations do not exceed the statutory 180-day threshold;
- other inadmissibility, removal, J-1 212(e), fraud/misrepresentation, criminal, immigration-history or similar individualized issues are not silently waived by the checklist.

An uncertain 245(k) calculation returns `NEEDS_AUTHORITATIVE_CONFIRMATION`. A recorded over-180-day covered violation blocks the standard 245(k) path rather than suggesting that filing alone cures the problem.
