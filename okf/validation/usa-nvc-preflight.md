---
type: validation-rule
id: validation-usa-nvc-preflight
title: Employment-Based NVC / DS-260 Preflight Validation
generated: 2026-08-30
verified: 2026-08-30
stale_after: 2026-09-13
status: verified
sources:
  - ../sources/dos-employment-immigrant-visas-aug-2026.md
  - ../sources/dos-nvc-processing-aug-2026.md
  - ../sources/dos-nvc-interview-scheduling-aug-2026.md
  - ../sources/dos-immigrant-interview-prep-aug-2026.md
---

# NVC / DS-260 Preflight

Return `NOT_READY` when a deterministic process mismatch exists, including:

- unsupported EB-4/EB-5 case entered into this I-140-based employment NVC module;
- underlying I-140 not approved;
- approved petition retained/not forwarded to DOS while the user attempts NVC steps;
- a claimed later NVC stage without required processed fees, DS-260s or civil-document submission;
- a claimed documentarily complete stage without NVC's own DQ determination;
- a required job offer is withdrawn/unavailable;
- a known one-year NVC-response failure requiring immediate preservation review;
- interview/issuance readiness claimed when current Final Action availability is absent;
- interview stage without completed authorized medical or required interview documents;
- INA 221(g) instructions knowingly not followed;
- planned U.S. admission after the issued immigrant visa expires.

Return `NEEDS_AUTHORITATIVE_CONFIRMATION` for unresolved/fact-specific items such as:

- uncertain NVC/USCIS routing;
- future Visa Bulletin month not in the bundled tables;
- uncertain employment-based I-864 exception;
- derivative CSPA/relationship issue;
- individualized inadmissibility/waiver issue;
- post-specific employer evidence or interview instructions not verified;
- pending INA 221(g) or administrative processing;
- uncertain case-preservation status under INA 203(g).

A documentarily complete preference case with no current Final Action number may still be process-consistent. In that state the correct next action is to preserve the NVC case and wait for visa availability/interview capacity, not to file I-485 or claim visa issuance readiness.

See [NVC process](../processes/usa/immigration/employment-green-card/nvc.md).
