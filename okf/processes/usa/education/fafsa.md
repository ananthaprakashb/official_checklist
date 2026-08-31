---
type: process
id: usa-fafsa-federal-student-aid
title: FAFSA and Federal Student Aid Preflight
generated: 2026-08-31
verified: 2026-08-31
stale_after: 2026-09-15
status: verified
sources:
  - ../../../sources/fsa-fafsa-2026-27-aug-2026.md
  - ../../../sources/fsa-fafsa-contributors-aug-2026.md
  - ../../../sources/fsa-fafsa-special-circumstances-aug-2026.md
  - ../../../sources/fsa-fafsa-corrections-verification-aug-2026.md
  - ../../../sources/fsa-fafsa-2027-28-beta-aug-2026.md
---

# FAFSA and Federal Student Aid Preflight

Classify the award year and FAFSA task before collecting financial data or deciding which parent/contributor should participate.

## Required classification order

1. Identify the FAFSA award year and whether that cycle is publicly available, beta-only, or uncertain.
2. Identify the task: start/resume, dependency status, contributor selection, contributor completion, unusual circumstances, parent refusal, correction, verification, school list, deadline, or changed financial circumstances.
3. Let the FAFSA determine dependent/independent/provisionally-independent status under federal student-aid rules; do not substitute IRS dependency or household assumptions.
4. For dependent students, resolve the required legal parent/contributor using current FAFSA contributor logic; do not choose solely by residence.
5. Require a separate StudentAid.gov account and consent/approval from each required contributor before treating the ordinary FAFSA as submission-ready.
6. Keep unusual-circumstances/provisional-independence separate from a parent's simple refusal to provide information.
7. Keep FAFSA corrections separate from school financial-aid-office professional judgment and verification.
8. Treat federal, state and school deadlines as separate controls.

## Status rules

- `READY`: the correct FAFSA procedural branch is identified and its known prerequisites are satisfied.
- `NOT_READY`: an objective prerequisite conflicts with the chosen route, such as missing required contributor consent for ordinary submission.
- `NEEDS_AUTHORITATIVE_CONFIRMATION`: a school financial aid administrator, the FAFSA itself, or current Federal Student Aid release status must determine the outcome, including provisional independence, parent-refusal unsubsidized-only requests, verification, professional judgment, or a future/beta award-year state.
