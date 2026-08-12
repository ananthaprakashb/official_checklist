---
type: fee
id: fee-india-us-passport-fresh
title: Fresh Indian Passport Fee Matrix - USA
generated: 2026-08-12
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/vfs-passport-information-usa.md
---

# Fresh Indian Passport Fee Matrix — USA

Current VFS fee rows that are explicitly published for Fresh Passport service.

## Regular

| Applicant branch | Validity | Passport fee | ICWF | VFS fee | Published total |
|---|---:|---:|---:|---:|---:|
| Minor under 15 | 5 years | $90.00 | $2.00 | $19.00 | $111.00 |
| Minor age 8 or below | 5 years | $81.00 after 10% discount | $2.00 | $19.00 | $102.00 |
| Adult age 60 or above | 10 years | $112.50 after 10% discount | $2.00 | $19.00 | $133.50 |
| Adult below 60 | 10 years | $125.00 | $2.00 | $19.00 | $146.00 |

## Tatkaal rows currently exposed for Fresh Passport

| Applicant branch | Validity | Passport fee | Tatkaal fee | ICWF | VFS fee | Published total |
|---|---:|---:|---:|---:|---:|---:|
| Minor under 15 | 5 years | $90.00 | $125.00 | $2.00 | $19.00 | $236.00 |
| Minor age 8 or below | 5 years | $81.00 after 10% discount | $112.50 after 10% discount | $2.00 | $19.00 | $214.50 |
| Adult age 60 or above | 10 years | $112.50 after 10% discount | $112.50 after 10% discount | $2.00 | $19.00 | $246.00 |

## Guardrails

- Do not infer a Fresh Tatkaal total for an applicant category that is absent from the current published Fresh table.
- Do not infer a 15–17-year Fresh fee branch from the Re-issue table.
- When an exact row is not published for the resolved Fresh branch, return `NEEDS_AUTHORITATIVE_CONFIRMATION` for the fee while allowing the rest of the process classification to continue.
- Current VFS page states that online/card payments add a 3.75% convenience charge over the displayed total; do not bake that percentage into the base fee total because payment-method rules can change independently.
