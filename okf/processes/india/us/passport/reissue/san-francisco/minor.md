---
type: process
id: process-india-us-passport-reissue-sf-minor
title: Indian Passport Minor Re-issue - San Francisco
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../../../../../../sources/cgisf-passport-faq.md
  - ../../../../../../sources/cgisf-tatkaal-passport-services.md
  - ../../../../../../sources/vfs-passport-information-usa.md
  - ../../../../../../sources/vfs-minor-reissue-checklist-may-2026.md
---

# Indian Passport Minor Re-issue — San Francisco

End-to-end re-issue route for an applicant under 18 in the CGI San Francisco jurisdiction.

## Decision sequence

1. [Applicant category](../../../../../../decisions/india-us-passport-applicant-category.md) → `minor`.
2. [Passport service classification](../../../../../../decisions/india-us-passport-service-classification.md) → `passport_reissue`.
3. Verify [San Francisco jurisdiction](../../../../../../jurisdictions/india-us-san-francisco.md).
4. Resolve [Re-issue reason](../../../../../../decisions/india-us-passport-reissue-reason.md).
5. Capture any [personal-particular changes](../../../../../../decisions/india-us-passport-change-particulars.md).
6. Resolve [booklet/validity](../../../../../../decisions/india-us-passport-booklet-validity.md).
7. If Tatkaal is requested, apply current Tatkaal exclusions with the minor exceptions explicitly preserved; do not reuse adult appearance/signature exclusions blindly.

## Personalized documents

Combine:

- [Common documents](../../../../../../requirements/india-us-passport-common-documents.md)
- [Minor documents](../../../../../../requirements/india-us-passport-minor-documents.md)
- [Conditional documents](../../../../../../requirements/india-us-passport-conditional-documents.md)

For lost/damaged cases, also use the corresponding minor lost/damaged VFS source nodes and Annexure F branch.

## Fee and submission

Resolve [fees](../../../../../../fees/india-us-passport-reissue-fees.md) after age/booklet/reason/processing route are known. Then run [preflight](../../../../../../validation/india-us-passport-preflight.md). Only `READY` may advance to [submission](../../../../../../submission/india-us-passport-submission.md).

## Hard blockers

- adult checklist used for a minor;
- missing required parental signatures/Annexure branch;
- Fresh vs Re-issue mismatch;
- wrong jurisdiction;
- reason/change mismatch;
- unresolved Tatkaal eligibility;
- Government/VFS reference mismatch;
- missing mandatory online photo/signature upload.
