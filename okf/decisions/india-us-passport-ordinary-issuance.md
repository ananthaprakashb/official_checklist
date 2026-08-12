---
type: decision
id: decision-india-us-passport-ordinary-issuance
title: Ordinary Indian Passport Fresh vs Re-issue - USA
generated: 2026-08-12
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/passport-seva-service-taxonomy-2026.md
  - ../sources/passport-seva-abroad-services-2026.md
  - ../sources/cgisf-passport-faq.md
---

# Ordinary Indian Passport — Fresh vs Re-issue

Run only after the top-level service family is `ordinary_passport`.

## `fresh_ordinary_passport`

Choose Fresh only when the applicant has **never held an Ordinary Indian Passport** in the past. A person who has held Diplomatic or Official passport but never an Ordinary Passport can still be Fresh for the Ordinary category.

For a child born in the United States to Indian parent(s), confirm Indian citizenship by descent / required consular birth-registration prerequisite before treating the child as READY for a Fresh Ordinary Passport.

## `reissue_ordinary_passport`

Choose Re-issue when another Ordinary Passport is requested in lieu of a current or previously held Ordinary Passport, including when:

- validity is due to expire;
- validity has expired, including more than three years ago;
- pages are exhausted;
- the passport is lost or stolen;
- the passport is damaged;
- a Short Validity Passport is being renewed/replaced;
- existing personal particulars are changing.

Then run [Re-issue reason router](india-us-passport-reissue-reason.md).

## Hard mismatch rule

If the Government application says Fresh while the applicant has previously held an Ordinary Passport, or says Re-issue when the applicant has never held an Ordinary Passport, return `NOT_READY` unless an authoritative exception applies.

## Next

- Fresh → [Fresh Ordinary Passport requirements](../requirements/india-us-passport-fresh-documents.md)
- Re-issue → [Re-issue reason router](india-us-passport-reissue-reason.md)
