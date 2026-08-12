---
type: decision
id: decision-india-us-passport-special-document-route
title: Indian Special Passport and Travel Document Route - USA
generated: 2026-08-12
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/passport-seva-travel-document-types-2026.md
  - ../sources/passport-seva-diplomatic-official-2026.md
  - ../sources/passport-seva-abroad-services-2026.md
---

# Indian Special Passport and Travel Document Route — USA

## `diplomatic_passport`

Diplomatic passports are restricted to the Government-defined diplomatic category. Do not use the Ordinary Passport VFS checklist. Require mission/official-channel confirmation of U.S.-based handling before returning READY.

## `official_passport`

Official passports are for persons deputed by the Government of India for official duty abroad. Core Government documents include official identity, Head of Office certificate, forwarding-officer request and applicable clearance. U.S. mission handling must be confirmed.

## `identity_certificate`

Certificate of Identity is a special travel-document category for stateless persons, including Tibetan refugees under the Government's defined rules. It is not an Ordinary Passport. The current U.S. bundle does not assume that an India-based Identity Certificate procedure is directly portable to a U.S. resident.

## Result rule

For these special categories, return `NEEDS_AUTHORITATIVE_CONFIRMATION` unless the applicable Mission/Post has an explicit current procedure matching the applicant's facts.

## Next

- [Special passport/travel-document requirements](../requirements/india-us-passport-special-documents.md)
