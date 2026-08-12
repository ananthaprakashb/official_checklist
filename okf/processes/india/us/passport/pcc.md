---
type: process
id: process-india-us-police-clearance-certificate
title: Indian Police Clearance Certificate - USA
generated: 2026-08-12
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../../../../sources/vfs-us-pcc-2026.md
  - ../../../../sources/passport-seva-service-taxonomy-2026.md
---

# Police Clearance Certificate (PCC) — USA

PCC is a passport-related service but **not passport issuance**. It has its own Government/VFS application branch and must not be routed through Fresh or Re-issue.

## Route

1. Classify `police_clearance_certificate` before document collection.
2. Resolve jurisdiction and applicant/passport identity.
3. Use the current PCC-specific Government/VFS questionnaire/checklist for the applicant facts.
4. Do not infer a fixed universal document list when the official service exposes conditional requirements.

## Requirements

- [PCC requirements](../../../../requirements/india-us-pcc-documents.md)

## Submission

Follow the PCC-specific VFS flow described by the current official source; do not use the ordinary passport checklist. See [submission routing](../../../../submission/india-us-passport-submission.md).

## Final gate

A Government/VFS application created under Fresh or Re-issue when the requested outcome is PCC is `NOT_READY` until reclassified.
