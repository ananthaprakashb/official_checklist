---
type: decision
id: decision-india-us-passport-processing-route
title: Indian Passport Regular vs Tatkaal Router - USA
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../sources/cgisf-tatkaal-passport-services.md
  - ../sources/vfs-passport-information-usa.md
---

# Regular vs Tatkaal Router — USA

Run only after applicant category, re-issue reason and all personal-particular changes are known.

## Regular

`requested_processing = regular` → `regular`, subject to ordinary service eligibility.

## Tatkaal blockers for all applicants

Current guidance excludes or restricts categories including lost/stolen passport, damaged beyond recognition, short-validity passport renewal, major name change, sex change, date-of-birth correction, place-of-birth correction and father/mother-name change.

## Adult-only effects

Current guidance also excludes adult change-of-appearance and adult change-of-signature cases from Tatkaal. Use [Adult Tatkaal eligibility](india-us-passport-tatkaal-eligibility.md) for the adult-specific result.

## Minor exceptions

Current VFS guidance explicitly notes that minors can apply under Tatkaal for change of appearance and change of signature. This exception must be evaluated only when the applicant is a minor and no other Tatkaal blocker applies.

## Outputs

- `regular`
- `tatkaal_eligible`
- `tatkaal_ineligible`
- `tatkaal_needs_authoritative_confirmation`

When facts fall outside the explicit rule set, return `tatkaal_needs_authoritative_confirmation`; never infer eligibility solely from urgency.
