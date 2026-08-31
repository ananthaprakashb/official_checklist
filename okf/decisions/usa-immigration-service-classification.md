---
type: decision
id: decision-usa-immigration-service-classification
title: U.S. Immigration and Visa Service Classification
generated: 2026-08-30
verified: 2026-08-30
stale_after: 2026-09-13
status: verified
sources:
  - ../sources/dol-perm-aug-2026.md
  - ../sources/uscis-i140-aug-2026.md
  - ../sources/uscis-i485-aug-2026.md
  - ../sources/uscis-i130-aug-2026.md
  - ../sources/dos-ds160-aug-2026.md
  - ../sources/dos-nvc-ds260-aug-2026.md
  - ../sources/uscis-i129-h1b-aug-2026.md
  - ../sources/uscis-i539-aug-2026.md
  - ../sources/uscis-i765-aug-2026.md
  - ../sources/uscis-i131-aug-2026.md
  - ../sources/uscis-i90-aug-2026.md
  - ../sources/uscis-n400-aug-2026.md
  - ../sources/uscis-address-change-aug-2026.md
  - ../sources/cbp-i94-aug-2026.md
---

# U.S. Immigration and Visa Service Classification

Resolve the desired outcome and controlling agency before collecting documents or choosing a form.

## Service-family outputs

- `employment_green_card`
- `family_green_card`
- `adjustment_of_status`
- `immigrant_visa_consular_processing`
- `nonimmigrant_visa_application`
- `h1b_petition`
- `h4_status`
- `h4_ead`
- `employment_authorization`
- `travel_document`
- `green_card_replace_or_renew`
- `naturalization`
- `change_of_address`
- `i94_record_or_correction`
- `not_sure`

## Mandatory routing facts

1. Requested outcome: temporary status/visa, permanent residence, employment authorization, travel document, citizenship, card maintenance, address update or admission-record correction.
2. Whether the beneficiary/applicant is physically inside or outside the United States when that fact controls USCIS adjustment/change-of-status versus Department of State consular processing.
3. Whether an underlying employer/family petition is required and, if so, its stage.
4. Whether visa-number availability is a filing gate.
5. Whether the requested action belongs to USCIS, Department of State/NVC, Department of Labor or CBP.

## Hard anti-mismatch rules

- Do not use I-485 as the default immigrant-visa process for a beneficiary residing abroad.
- Do not treat DS-160 as an immigrant-visa application; immigrant visa processing uses the NVC/CEAC/DS-260 route.
- Do not use I-90 to remove two-year permanent-residence conditions.
- Do not send an H-4 visa-stamping case abroad into I-539 merely because the applicant previously held H-4 status.
- Do not use CBP Deferred Inspection to request extension/change of status.
- Do not mark an employment-based I-485 path filing-ready without checking the current Visa Bulletin and the USCIS chart selection for that month.

If the service family cannot be resolved from the applicant's intended outcome and current case stage, return `NEEDS_AUTHORITATIVE_CONFIRMATION` rather than guessing.
