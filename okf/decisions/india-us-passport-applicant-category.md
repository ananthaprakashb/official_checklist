---
type: decision
id: decision-india-us-passport-applicant-category
title: Indian Passport Applicant Category - USA
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../sources/vfs-passport-information-usa.md
  - ../sources/vfs-minor-reissue-checklist-may-2026.md
---

# Applicant Category — Indian Passport USA

Determine applicant category before selecting a checklist or fee tier.

## Decision

- `age >= 18` → `adult`
- `age < 18` → `minor`
- `age < 15` → minor default 5-year validity fee tier
- `15 <= age < 18` → minor branch with age-specific 10-year validity option/fee tier when applicable under the current official flow

## Minor-specific controls

For the current minor re-issue workflow:

- the minor signs/writes their name in the prescribed space;
- a minor below 5 may use the left thumb impression;
- both parents sign where required by the official application/checklist;
- Annexure D is part of the standard minor branch;
- Annexure C is conditionally required where one parent has not given consent.

If age/category on the Government or VFS flow differs from this result, return `NOT_READY`.
