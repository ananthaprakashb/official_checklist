# OKF Change Log

## 2026-08-10 — v0.2 India/U.S. passport decision graph

- Added adult/minor applicant-category routing.
- Added complete re-issue reason routing for expiry, pages exhausted, lost, damaged, personal-particular changes and multiple simultaneous reasons.
- Added explicit change-of-particulars flags and current Tatkaal consequences.
- Added booklet/validity and Regular/Tatkaal routing with minor appearance/signature exceptions preserved.
- Added common, condition-based and minor-specific document requirement nodes.
- Added current Regular, lost/damaged and Tatkaal fee logic from VFS source tables.
- Added submission-mode guardrails and expanded preflight to validate fee tier, checklist branch, minor consent/Annexure requirements and lost/damaged routing.
- Added San Francisco minor re-issue, adult lost and adult damaged process nodes.
- Added May 2026 VFS adult/minor workflow-specific checklist source nodes.
- Added a machine-readable questionnaire contract and result JSON schema for future web/API clients.
- Extended CI so questionnaire/rule-node references and staleness are validated alongside the OKF graph.

## 2026-08-10 — v0.1 seed

- Initialized the country-agnostic Official Checklist OKF repository.
- Preserved OKF v0.2 strict-link conventions.
- Added deterministic three-phase validation: schema, graph integrity, official-process guardrails.
- Added the first official-process bundle for Indian passport adult re-issue in the United States, beginning with the Consulate General of India, San Francisco jurisdiction.
- Added freshness metadata and authoritative source nodes so stale guidance fails validation instead of remaining silently active.
- Added preflight rules designed to detect an incorrect application/service branch before appointment, payment, or physical submission.
