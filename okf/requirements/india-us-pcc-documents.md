---
type: requirement
id: requirement-india-us-pcc-documents
title: Indian Police Clearance Certificate Requirements - USA
generated: 2026-08-12
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/vfs-us-pcc-2026.md
  - ../sources/passport-seva-abroad-services-2026.md
---

# Indian Police Clearance Certificate Requirements — USA

Run only when the service family is `police_clearance_certificate`.

## Eligibility/classification gates

- applicant is an Indian passport holder using the Indian-national PCC service;
- stated purpose fits the current PCC service, such as residential status, employment, long-term visa or immigration;
- tourist-visa travel is not represented as an eligible PCC purpose;
- correct Indian Mission/VFS centre is selected from the applicant's U.S. residence.

## Required workflow

- complete the Government Passport Seva PCC application accurately;
- record the Government ARN/application reference;
- use the **current PCC-specific VFS checklist**, not a passport Fresh/Re-issue checklist;
- prepare the physical package and supporting evidence required by that current checklist;
- register with VFS and use the currently available postal/courier or appointment route for the verified jurisdiction;
- pay the current PCC/VFS fees presented for that route.

## Guardrail

Because the supporting-document list and fee display are dynamic by jurisdiction/applicant facts, this OKF node does not hard-code a generic list beyond the stable classification/workflow gates. If the current official PCC checklist cannot be verified at decision time, return `NEEDS_AUTHORITATIVE_CONFIRMATION` rather than reusing passport-reissue documents.
