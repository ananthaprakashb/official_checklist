---
type: decision
id: decision-india-us-passport-emergency-travel-route
title: Indian Passport Emergency Travel Route - USA
generated: 2026-08-12
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/cgisf-emergency-certificate-aug-2026.md
  - ../sources/cgisf-passport-faq.md
  - ../sources/cgisf-tatkaal-passport-services.md
---

# Indian Passport Emergency Travel Route — USA

Emergency need does not automatically mean Tatkaal. Resolve the required travel document first.

## Route A — `tatkaal_reissue`

Use only when the applicant still qualifies for passport re-issue under current Tatkaal rules and requires a passport usable for normal international travel. Run the normal Re-issue + Tatkaal eligibility graph.

## Route B — `short_validity_passport_review`

Where the applicant lacks ordinary valid U.S. immigration status but has evidence that status legalization is in process, current CGI San Francisco guidance indicates that a Short Validity Passport may be considered in some cases. Because this is fact-sensitive and mission-discretionary, return `NEEDS_AUTHORITATIVE_CONFIRMATION` until the exact mission rule is verified for the applicant.

## Route C — `emergency_certificate`

Use when the applicant needs one-way travel to India because no valid passport is available due to loss, damage or expiry and a new passport cannot be issued immediately.

Important consequences:

- EC is not a replacement passport for onward international travel.
- EC is for one-way travel to India.
- Existing passport is cancelled when EC is issued.
- The applicant will need to contact the passport issuing authority in India for a new passport after arrival.

## Blocking rule

Do not tell a lost-passport applicant to apply Tatkaal merely because travel is urgent. Lost/stolen passports are excluded from the current San Francisco Tatkaal re-issue route; evaluate EC or Regular re-issue instead.

## Next

- [Emergency Certificate requirements](../requirements/india-us-emergency-certificate-documents.md)
- [Emergency Certificate process](../processes/india/us/passport/emergency-certificate/san-francisco.md)
