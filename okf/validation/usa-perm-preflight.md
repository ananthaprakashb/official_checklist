---
type: validation-rule
id: validation-usa-perm-preflight
title: U.S. PERM Preflight Validation
generated: 2026-08-30
verified: 2026-08-30
stale_after: 2026-09-13
status: verified
sources:
  - ../sources/dol-perm-prevailing-wage-aug-2026.md
  - ../sources/ecfr-perm-recruitment-aug-2026.md
  - ../sources/dol-perm-notice-filing-aug-2026.md
  - ../sources/ecfr-perm-audit-aug-2026.md
  - ../sources/ecfr-perm-supervised-recruitment-aug-2026.md
  - ../sources/ecfr-perm-determination-review-aug-2026.md
  - ../sources/ecfr-perm-certification-validity-aug-2026.md
---

# U.S. PERM Preflight Validation

Return `NOT_READY` for objective mismatches such as:

- standard 20 CFR 656.17 checklist selected for a Schedule A, special-handling teacher, or professional-athlete branch;
- no valid PWD and neither recruitment nor ETA-9089 filing began within the PWD validity period;
- SWA job order shorter than 30 days;
- required newspaper/professional-journal recruitment incomplete;
- professional case has fewer than three additional recruitment methods;
- dated mandatory recruitment falls outside the 30-to-180-day prefiling window;
- posted Notice of Filing is shorter than 10 consecutive business days or ends fewer than 30 days before filing;
- audit response recorded as late without a valid granted extension;
- supervised-recruitment advertisement published before CO approval or a required response recorded as late;
- denial review deadline has passed without a timely request;
- certified PERM is more than 180 calendar days old and was not timely filed with Form I-140.

Return `NEEDS_AUTHORITATIVE_CONFIRMATION` when a controlling fact is unknown, the Certifying Officer's actual letter/order controls the deadline, the occupation route is unclear, or a case-specific lawful rejection/layoff/actual-minimum-requirement issue needs review.

A timeline check must not infer that DOL will certify the case merely because the date windows are satisfied.
