---
type: decision
id: decision-india-us-passport-change-particulars
title: Indian Passport Change in Existing Personal Particulars - USA
generated: 2026-08-10
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/vfs-us-passport-aug-2026.md
  - ../sources/cgisf-passport-faq.md
  - ../sources/cgisf-tatkaal-passport-services.md
  - ../sources/vfs-adult-reissue-checklist-may-2026.md
---

# Change in Existing Personal Particulars

When any passport-printed detail is intentionally changed or corrected, the system must explicitly record the change and require the Government application to select `Change in Existing Personal Particulars` together with the applicable re-issue reason.

## Supported change flags

### Name
- `name_change_minor_spelling`
- `name_change_major`
- `name_change_marriage`
- `name_change_divorce`

### Spouse
- `spouse_name_add`
- `spouse_name_change`
- `spouse_name_delete`
- `foreign_spouse_endorsement`

### Address
- `indian_address_change`
- `usa_address_change`

### Biographic / biometric particulars
- `appearance_change`
- `signature_change`
- `date_of_birth_change_or_correction`
- `place_of_birth_change_or_correction`
- `father_name_change_or_correction`
- `mother_name_change_or_correction`
- `sex_or_gender_change`

## Classification notes

- CGI San Francisco distinguishes minor name change from major name change; do not collapse the two for Tatkaal evaluation.
- Spouse-name changes caused by divorce have a distinct supporting-document path.
- For a foreign spouse, the marriage-certificate evidence can differ from the ordinary domestic-document branch.
- A correction to data printed because the applicant entered the Government form incorrectly is not necessarily the same as a Consulate printing error. If the passport booklet does not match the submitted application, route to Consulate rectification review instead of automatically creating a new change-particulars application.

## Effects

Each selected change adds its condition-based documents from [Conditional re-issue documents](../requirements/india-us-passport-conditional-documents.md).

Current San Francisco Tatkaal guidance excludes several adult change categories including major name change, sex change, appearance change, DOB/POB correction, signature change and father/mother name change. Minor-specific exceptions must be resolved through the current Tatkaal rule node.

## Preflight rule

If the Government form intentionally differs from the current passport but the corresponding change flag/reason and supporting-document branch are not selected, return `NOT_READY`.
