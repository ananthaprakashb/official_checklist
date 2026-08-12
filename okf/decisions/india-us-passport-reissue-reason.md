---
type: decision
id: decision-india-us-passport-reissue-reason
title: Indian Passport Re-issue Reason Router - USA
generated: 2026-08-10
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/passport-seva-reissue-cases-2026.md
  - ../sources/cgisf-passport-faq.md
  - ../sources/vfs-passport-information-usa.md
  - ../sources/cgisf-tatkaal-passport-services.md
---

# Re-issue Reason Router — USA

Run only after the applicant is classified as `reissue_ordinary_passport`.

## Supported reason outputs

- `validity_due_to_expire`
- `validity_expired_within_3_years`
- `validity_expired_more_than_3_years`
- `pages_exhausted`
- `short_validity_passport_renewal`
- `lost`
- `stolen`
- `damaged_recognizable`
- `damaged_beyond_recognition`
- `change_existing_personal_particulars`
- `none_of_above_authoritative_review`
- `multiple_reasons`

## Routing rules

1. Current passport lost → include `lost`.
2. Current passport stolen → include `stolen` and require the lost/stolen evidence path.
3. Damaged passport → classify the extent as recognizable vs beyond recognition; this distinction affects Tatkaal eligibility.
4. Pages exhausted → include `pages_exhausted`; additional pages are not simply inserted into the existing booklet.
5. Current/previous Short Validity Passport being renewed/replaced → include `short_validity_passport_renewal`.
6. Existing passport validity due to expire or expired → preserve the applicable expiry bucket, including the more-than-three-years branch because fresh police verification may apply.
7. Any deliberate change to existing personal particulars → include `change_existing_personal_particulars` and run [Change in personal particulars](india-us-passport-change-particulars.md).
8. When multiple facts apply, preserve every applicable fact and return `multiple_reasons` with the full reason set.
9. If none of the Government-listed cases fits, use `none_of_above_authoritative_review` and return `NEEDS_AUTHORITATIVE_CONFIRMATION` rather than forcing a nearby category.

## Branch-specific consequences

- `lost` / `stolen` → lost/stolen checklist + lost/damaged fee tier + Annexure F + current Tatkaal block.
- `damaged_beyond_recognition` → damaged checklist + lost/damaged fee tier + Annexure F + current Tatkaal block.
- `damaged_recognizable` → damaged checklist and applicable fee tier; Tatkaal must still be evaluated against current mission rules.
- `short_validity_passport_renewal` → separate SVP branch; do not silently treat as ordinary expiry because current Tatkaal rules exclude renewal of SVP.
- expiry/pages/change branch → standard re-issue checklist plus condition-based documents.

A mismatch between resolved reason(s) and the Government/VFS selected reason is a hard preflight blocker.
