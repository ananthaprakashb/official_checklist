---
type: decision
id: decision-india-us-passport-booklet-validity
title: Indian Passport Booklet and Validity Router - USA
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../sources/vfs-passport-information-usa.md
  - ../sources/vfs-adult-reissue-checklist-may-2026.md
  - ../sources/vfs-minor-reissue-checklist-may-2026.md
---

# Booklet and Validity Router

Use applicant category and requested booklet to select the applicable fee/validity row.

## Booklet options

- `ordinary_36_pages`
- `jumbo_60_pages`

## Current validity/fee grouping

- Adult 18+ → 10-year branch.
- Minor under 15 → 5-year branch.
- Minor 15–17 → current VFS table includes a 10-year branch; preserve this as an explicit user/application selection rather than assuming it silently.

## Guardrail

The booklet/validity result must match the Government application and the fee row. If the applicant selected a jumbo booklet, do not charge or display the ordinary-booklet fee.
