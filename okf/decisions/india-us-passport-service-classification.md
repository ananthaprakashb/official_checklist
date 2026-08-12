---
type: decision
id: decision-india-us-passport-service-classification
title: Indian Passport and Related Service Classification - USA
generated: 2026-08-10
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/passport-seva-abroad-services-2026.md
  - ../sources/passport-seva-service-taxonomy-2026.md
  - ../sources/passport-seva-travel-document-types-2026.md
  - ../sources/vfs-us-passport-aug-2026.md
---

# Indian Passport and Related Service Classification — USA

This decision runs **before** document collection, payment, appointment booking or submission. The first job of the system is to determine which Government of India service family the applicant actually needs.

## Required facts

- Is the person currently an Indian citizen?
- Is the person a former Indian citizen who has acquired foreign nationality?
- Which category of Indian passport/travel document has the person ever held: Ordinary, Diplomatic, Official, Identity Certificate, none?
- Does the person need a passport booklet, a one-way emergency travel document, a clearance/background-verification service, surrender/renunciation, or an appeal?
- Applicant age and current U.S. residence/jurisdiction.
- Current/previous passport status: valid, expiring, expired, short-validity, lost/stolen, damaged, pages exhausted.
- Whether personal particulars are changing.

## Service-family outputs

### `ordinary_passport`

Use for an Ordinary Indian Passport. Then run [Ordinary passport issuance classification](india-us-passport-ordinary-issuance.md) to choose Fresh vs Re-issue.

### `emergency_certificate`

Use when an Indian national needs **one-way travel to India** because a valid passport is unavailable and a new passport cannot be issued immediately. Run [Emergency travel routing](india-us-passport-emergency-travel-route.md).

### `police_clearance_certificate`

Use for PCC rather than a passport issuance application. Run [Passport-related services router](india-us-passport-related-services.md).

### `global_entry_background_verification`

Use for the Government of India background-verification portion of U.S. CBP Global Entry. This is not a passport re-issue.

### `surrender_indian_passport`

Use when a former Indian citizen has acquired foreign nationality and must surrender the Indian passport / obtain the applicable surrender or renunciation certificate. Do not route this person to passport re-issue.

### `diplomatic_passport` / `official_passport`

Use only for applicants who meet the Government of India diplomatic/official-duty category. Run [Special passport and travel-document routing](india-us-passport-special-document-route.md).

### `identity_certificate`

Use for the special Certificate of Identity category, not as a substitute for an Ordinary Passport. Mission eligibility/handling must be authoritatively confirmed for a U.S.-based case.

### `passport_appeal`

Use when the applicant is challenging an adverse passport action such as rejection/refusal or impounding/revocation. Run [Adverse-action and appeal routing](india-us-passport-adverse-action-route.md).

## Blocking rules

1. Never provide an Ordinary Passport document checklist until Fresh vs Re-issue has been resolved.
2. A current/former Ordinary Passport holder applying for another Ordinary Passport normally belongs in Re-issue, even if the old passport expired years ago.
3. Holding a Diplomatic/Official Passport does **not** by itself make a first-ever Ordinary Passport application a Re-issue; passport category history matters.
4. A former Indian citizen who has acquired foreign nationality must not be routed to Ordinary Passport issuance.
5. EC, PCC, GEP, surrender and appeal are separate service families; do not reuse the re-issue fee/checklist merely because a passport number is involved.
6. If the service family cannot be established from authoritative rules, return `NEEDS_AUTHORITATIVE_CONFIRMATION` rather than guessing.

## Next

- [Ordinary passport issuance classification](india-us-passport-ordinary-issuance.md)
- [Emergency travel routing](india-us-passport-emergency-travel-route.md)
- [Passport-related services router](india-us-passport-related-services.md)
- [Special passport and travel-document routing](india-us-passport-special-document-route.md)
- [Adverse-action and appeal routing](india-us-passport-adverse-action-route.md)
- [Preflight application-type validation](../validation/india-us-passport-preflight.md)
