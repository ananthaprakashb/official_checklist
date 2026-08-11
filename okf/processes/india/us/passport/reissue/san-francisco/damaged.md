---
type: process
id: process-india-us-passport-reissue-sf-adult-damaged
title: Indian Passport Adult Damaged Passport Re-issue - San Francisco
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../../../../../../sources/vfs-adult-damaged-checklist-may-2026.md
  - ../../../../../../sources/vfs-passport-information-usa.md
  - ../../../../../../sources/cgisf-tatkaal-passport-services.md
---

# Adult Damaged Passport Re-issue — San Francisco

This is a **Re-issue**, not a Fresh Passport application.

## Branch consequences

- reason includes `damaged`;
- use the adult damaged-passport checklist;
- Annexure F is mandatory for the damaged branch;
- use the lost/damaged fee tier;
- separately capture `damaged_beyond_recognition` because current Tatkaal guidance explicitly excludes that category.

## Tatkaal guardrail

If the passport is damaged beyond recognition, return `tatkaal_ineligible`. If damage does not meet that condition and Tatkaal is requested, do not infer eligibility from this file alone; run the current Tatkaal decision against all applicant facts.

## Preflight blockers

Return `NOT_READY` when the selected reason, fee tier, checklist/Annexure branch, jurisdiction, ARN, upload or identity data do not match the resolved damaged-passport facts.

Return to [Adult re-issue](adult.md) for the shared workflow.
