---
type: decision
id: decision-india-us-passport-service-classification
title: Indian Passport Service Classification - USA
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../sources/cgisf-passport-faq.md
  - ../sources/vfs-us-india-passport.md
---

# Indian Passport Service Classification — USA

This decision must run **before** document collection, payment, appointment booking, or submission.

## Required facts

- Does the applicant already hold or previously hold an Indian passport?
- Applicant age.
- Current U.S. residence/jurisdiction.
- Current passport validity/expiry.
- Reason for requesting another passport.
- Whether the current passport is lost, stolen, damaged, or out of pages.
- Whether any existing personal particulars are changing.

## Decision

### Fresh passport

Route to **Fresh Passport** only when the applicant is applying for an Indian passport for the first time and otherwise satisfies the applicable official eligibility flow.

### Re-issue of passport

When another passport is being requested in lieu of an existing passport, route to **Re-issue of Passport**. Current official examples include:

- validity expired or due to expire;
- validity expired more than three years ago;
- exhaustion of pages;
- damaged passport;
- lost passport;
- change in existing personal particulars.

## Blocking rule

If the applicant has an existing passport and the Government of India/VFS application is classified as **Fresh Passport**, mark the preflight **BLOCKED** until the application classification is corrected or authoritative evidence shows that a fresh-passport branch is actually required.

## Next

- [Preflight application-type validation](../validation/india-us-passport-preflight.md)
- [Adult re-issue — San Francisco](../processes/india/us/passport/reissue/san-francisco/adult.md)
