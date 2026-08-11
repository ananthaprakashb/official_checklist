---
type: decision
id: decision-india-us-passport-reissue-reason
title: Indian Passport Re-issue Reason Router - USA
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../sources/cgisf-passport-faq.md
  - ../sources/vfs-passport-information-usa.md
  - ../sources/vfs-adult-reissue-checklist-may-2026.md
---

# Re-issue Reason Router — USA

Run only after the applicant is classified as `passport_reissue`.

## Supported reason outputs

- `expired_or_due_to_expire`
- `expired_more_than_3_years`
- `pages_exhausted`
- `lost`
- `damaged`
- `change_existing_personal_particulars`
- `multiple_reasons`

## Routing rules

1. `passport_lost = true` → include `lost`.
2. `passport_damaged = true` → include `damaged`; separately record whether it is damaged beyond recognition because Tatkaal eligibility changes.
3. `pages_exhausted = true` → include `pages_exhausted`.
4. Existing passport expired/due to expire → include the applicable expiry bucket.
5. Any deliberate change to existing personal particulars → include `change_existing_personal_particulars` and run [Change in personal particulars](india-us-passport-change-particulars.md).
6. When multiple facts apply, preserve all applicable facts and return `multiple_reasons` with the full reason set. Do not discard a change/loss/damage fact merely to simplify the workflow.

## Branch-specific consequences

- `lost` → lost checklist + lost/damaged fee tier + Annexure F + Tatkaal blocked.
- `damaged` → damaged checklist + lost/damaged fee tier + Annexure F; damaged beyond recognition blocks Tatkaal.
- ordinary expiry/pages/change branch → standard re-issue checklist plus condition-based documents.

A mismatch between resolved reason(s) and the Government/VFS selected reason is a hard preflight blocker.
