---
type: process
id: process-india-us-passport-reissue-sf-adult
title: Indian Passport Adult Re-issue - San Francisco
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../../../../../../sources/cgisf-passport-faq.md
  - ../../../../../../sources/cgisf-tatkaal-passport-services.md
  - ../../../../../../sources/cgisf-gpsp2-migration.md
  - ../../../../../../sources/vfs-passport-information-usa.md
  - ../../../../../../sources/vfs-adult-reissue-checklist-may-2026.md
---

# Indian Passport Adult Re-issue — San Francisco

End-to-end Phase 2 process for an adult applicant in the CGI San Francisco jurisdiction who needs another Indian passport in lieu of an existing passport.

## 1. Classify the applicant and service

1. Run [Applicant category](../../../../../../decisions/india-us-passport-applicant-category.md) → must resolve `adult`.
2. Run [Passport service classification](../../../../../../decisions/india-us-passport-service-classification.md) → must resolve `passport_reissue`.
3. Confirm [San Francisco jurisdiction](../../../../../../jurisdictions/india-us-san-francisco.md).

**STOP:** do not expose downstream documents or payment if any of these are unresolved or mismatched.

## 2. Resolve the exact re-issue branch

Run [Re-issue reason router](../../../../../../decisions/india-us-passport-reissue-reason.md).

For any changed passport field, also run [Change in existing personal particulars](../../../../../../decisions/india-us-passport-change-particulars.md).

Branch outputs include expiry/due-to-expire, expired over three years, pages exhausted, lost, damaged, personal-particular changes, or multiple simultaneous reasons.

## 3. Select booklet and processing route

Run [Booklet and validity router](../../../../../../decisions/india-us-passport-booklet-validity.md).

If Tatkaal is requested, run [Adult Tatkaal eligibility](../../../../../../decisions/india-us-passport-tatkaal-eligibility.md) **after all reason/change flags are known**.

## 4. Generate the personalized requirement set

Start with [Common re-issue documents](../../../../../../requirements/india-us-passport-common-documents.md), then add [Conditional documents](../../../../../../requirements/india-us-passport-conditional-documents.md) for every resolved reason/change.

Special branches:

- [Adult lost passport](lost.md)
- [Adult damaged passport](damaged.md)

## 5. Resolve fees

Use [Current re-issue fee matrix](../../../../../../fees/india-us-passport-reissue-fees.md) only after applicant category, booklet, lost/damaged status and Tatkaal eligibility are known.

## 6. Government application + VFS

The current workflow requires the Government online application, correct jurisdiction, `Passport Re-issue`, mandatory online photo/signature upload and the matching application reference in the VFS flow. Once submitted online, an erroneous Government form cannot simply be edited; the current checklist directs the applicant to complete a new online application.

## 7. Run preflight

Run [Passport preflight](../../../../../../validation/india-us-passport-preflight.md). The gate must compare:

```text
Applicant facts
  → Adult category
  → Re-issue service
  → San Francisco jurisdiction
  → Exact reason(s) + personal-particular changes
  → Booklet/validity
  → Regular/Tatkaal eligibility
  → Government application selections
  → Government/VFS reference alignment
  → Required online uploads
  → Personalized document set
  → Correct fee tier
  → Submission mode
```

Only `READY` may advance to [submission](../../../../../../submission/india-us-passport-submission.md).

## User-facing output

The generated result must include the chosen service/category/reasons, processing route, fee tier, mandatory and conditional documents, blockers/warnings, source verification date, and the exact next official step.
