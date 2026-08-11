---
type: decision
id: decision-india-us-passport-tatkaal-eligibility
title: Indian Passport Adult Tatkaal Eligibility - San Francisco
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../sources/cgisf-tatkaal-passport-services.md
  - ../sources/vfs-us-india-passport.md
---

# Adult Tatkaal Eligibility — San Francisco

Run this decision only **after** service classification has established that the applicant belongs in a passport re-issue flow.

## Do not auto-route to Tatkaal when

The current CGI San Francisco guidance excludes categories including:

- lost, stolen, or damaged-beyond-recognition passport;
- renewal of a Short Validity Passport;
- major name change;
- change in sex;
- change of appearance for an adult applicant;
- date-of-birth correction/change;
- place-of-birth correction/change;
- change in signature;
- change in father/mother name.

## Conservative ambiguity rule

When official sources use different wording or scope for an exclusion, the system must **not infer eligibility**. Mark the Tatkaal decision `needs authoritative confirmation` and continue only through the Regular route unless the current official workflow clearly confirms Tatkaal eligibility for the applicant's exact facts.

## Output

One of:

- `tatkaal_eligible`
- `tatkaal_ineligible`
- `tatkaal_needs_authoritative_confirmation`

Never use speed/urgency alone as proof of Tatkaal eligibility.
