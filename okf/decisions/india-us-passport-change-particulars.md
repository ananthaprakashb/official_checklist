---
type: decision
id: decision-india-us-passport-change-particulars
title: Indian Passport Change in Existing Personal Particulars - USA
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../sources/vfs-us-india-passport.md
  - ../sources/vfs-adult-reissue-checklist-may-2026.md
  - ../sources/cgisf-tatkaal-passport-services.md
---

# Change in Existing Personal Particulars

When any detail differs from the current passport, the system must explicitly record the change and require the Government application to select `Change in Existing Personal Particulars` together with the appropriate Re-issue reason.

## Supported change flags

- `name_change`
- `spouse_name_add_remove_change`
- `indian_address_change`
- `usa_address_change`
- `appearance_change`
- `signature_change`
- `date_of_birth_change_or_correction`
- `place_of_birth_change_or_correction`
- `father_name_change`
- `mother_name_change`
- `sex_change`

## Effects

Each selected change adds its condition-based documents from [Conditional re-issue documents](../requirements/india-us-passport-conditional-documents.md).

Current Tatkaal guidance blocks or restricts several change categories, including major name change, sex change, adult appearance change, date/place-of-birth correction, adult signature change, and father/mother name change. Run the Tatkaal decision after collecting all change flags.

## Preflight rule

If the Government form differs from the current passport but the corresponding change flag/reason and supporting-document branch are not selected, return `NOT_READY`.
