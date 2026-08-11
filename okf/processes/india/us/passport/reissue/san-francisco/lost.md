---
type: process
id: process-india-us-passport-reissue-sf-adult-lost
title: Indian Passport Adult Lost Passport Re-issue - San Francisco
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../../../../../../sources/vfs-adult-lost-checklist-may-2026.md
  - ../../../../../../sources/vfs-passport-information-usa.md
  - ../../../../../../sources/cgisf-tatkaal-passport-services.md
---

# Adult Lost Passport Re-issue — San Francisco

This is a **Re-issue**, not a Fresh Passport application.

## Fixed branch consequences

- reason includes `lost`;
- Tatkaal is not available under current guidance;
- use the adult lost-passport checklist;
- Annexure F is mandatory for the loss branch;
- use the lost/damaged fee tier;
- generate all common requirements that remain applicable plus every loss-specific requirement in the current checklist.

## Preflight blockers

Return `NOT_READY` if:

- Government application is Fresh Passport;
- selected reason does not represent the lost passport;
- Tatkaal is selected;
- standard re-issue fee tier is used instead of lost/damaged fee tier;
- Annexure F/lost checklist branch is missing;
- jurisdiction, ARN, upload or identity checks fail.

Return to [Adult re-issue](adult.md) for the shared workflow.
