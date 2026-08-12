---
type: requirement
id: requirement-india-us-passport-fresh-documents
title: Fresh Ordinary Indian Passport Requirements - USA
generated: 2026-08-12
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/passport-seva-fresh-document-advisor-2026.md
  - ../sources/vfs-us-passport-aug-2026.md
  - ../sources/cgisf-passport-faq.md
---

# Fresh Ordinary Indian Passport Requirements — USA

Run only after [Ordinary passport issuance classification](../decisions/india-us-passport-ordinary-issuance.md) resolves `fresh_ordinary_passport`.

## Common gates

- applicant has never held an Ordinary Indian Passport;
- Government Passport Seva application is classified as Fresh Ordinary Passport;
- correct Indian Mission/Post and U.S. consular jurisdiction are selected;
- current Fresh Passport document-advisor/checklist is used for the applicant category;
- online photograph and signature upload is complete before submission;
- VFS registration/payment/submission flow is completed after the Government application;
- applicant satisfies Indian citizenship/nationality evidence required by the current official checklist.

## Adult / senior-citizen branch

Fresh adult/senior applications must use the Fresh Passport checklist. Do not substitute the re-issue checklist merely because the applicant possesses another Indian identity/travel document.

## Minor branch

- applicant under 18 is routed through the minor rules;
- parental/legal-guardian consent requirements are resolved;
- Annexure D / Annexure C is selected as applicable under the current checklist;
- age 15–17 validity choice is resolved where available;
- only the booklet/validity supported for the selected minor branch is used.

## U.S.-born child prerequisite

Current CGI San Francisco FAQ states that a child born in the United States to Indian parent(s) can receive an Indian passport as a citizen by descent after the required birth registration with the Consulate. Therefore:

- if consular birth registration/citizenship-by-descent prerequisite is not complete, return `NOT_READY`;
- do not present a passport-document checklist as sufficient until the citizenship prerequisite is resolved.

## Fresh Tatkaal

Tatkaal availability is not assumed for every Fresh category. Run the current Tatkaal eligibility rules and preserve any category-specific exclusions.

## Result rule

Return READY only when the exact Fresh checklist for the resolved applicant category and Mission is satisfied; otherwise return NOT_READY or NEEDS_AUTHORITATIVE_CONFIRMATION.
