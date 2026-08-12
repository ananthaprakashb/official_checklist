# OKF Change Log

## 2026-08-12 — v0.5 Indian passport service-family expansion

- Expanded the India/U.S. OKF from Re-issue-first coverage to the full authoritative passport/travel-document and passport-related service taxonomy.
- Added master classification for Ordinary Passport Fresh/Re-issue, Emergency Certificate, PCC, GEP background verification, Surrender of Indian Passport, Diplomatic Passport, Official Passport, Identity Certificate and adverse-action appeal/review.
- Added Passport Seva's explicit Re-issue case family for Renewal of Short Validity Passport and preserved lost/stolen as a distinct fact set.
- Added Fresh-passport document and fee branches without extrapolating unsupported fee combinations.
- Added EC-specific documents and fee handling based on current Mission guidance.
- Added PCC, GEP and Surrender requirement envelopes that preserve dynamic official checklists rather than inventing universal document sets.
- Added process envelopes for Fresh, SVP renewal, EC, PCC, GEP, Surrender, Diplomatic/Official Passport, Identity Certificate and adverse-action appeals.
- Generalized submission routing and preflight so non-passport-issuance services cannot accidentally inherit the ordinary Fresh/Re-issue workflow.
- Preserved the current interactive application as Re-issue-only until each new service receives its own versioned questionnaire/evaluator and regression tests.

## 2026-08-10 — v0.4 generalized process engine and publication

- Replaced the passport-specific application shell with a global process catalog and reusable process runner.
- Added `data/process-catalog.v1.json` with stable ids, clean route slugs, live/coming-soon status and freshness metadata.
- Registered the current India/U.S. passport Re-issue evaluator as the first live process module.
- Added planned OCI and U.S. Passport catalog entries without publishing unverified rules.
- Added a generic process registry/presentation contract so future workflows can plug into the UI without adding process-specific branches to `App.tsx`.
- Added Pages-safe clean-route navigation and direct-link restoration for process slugs.
- Added process-engine validation requiring every catalog entry marked `live` to have a registered evaluator and executable regression path.
- Added contributor documentation for onboarding a new official process from sources → OKF → questionnaire → evaluator → registry → catalog.
- Added an automatic GitHub Pages build/deploy workflow and configurable Vite production base path.

## 2026-08-10 — v0.3 interactive evaluator

- Added a reusable TypeScript evaluator for the India/U.S. passport Re-issue questionnaire.
- Added deterministic runtime resolution for applicant category, current San Francisco/Los Angeles servicing arrangement, Re-issue reasons, personal-particular changes, Regular/Tatkaal routing, fee tier, required/conditional documents and preflight status.
- Added explicit runtime blockers for Fresh-vs-Re-issue mismatch, mission mismatch, reason mismatch, ARN/VFS mismatch and mandatory online upload gaps.
- Revalidated 2026 jurisdiction guidance and encoded the formal CGI Los Angeles jurisdiction plus the current CGI statement that San Francisco continues to provide consular services for that jurisdiction until further notice.
- Added questionnaire v2 with Southern California/Arizona/Nevada/New Mexico transition routing and explicit minor age 15–17 validity selection.
- Added conservative `NEEDS_AUTHORITATIVE_CONFIRMATION` handling for unresolved jurisdiction, name-change Tatkaal wording differences, DOB/POB/parent-name evidence, American Samoa Mission mapping, under-15 jumbo booklet pricing and the age-15–17 validity-until-18 fee branch.
- Added regression tests covering nine high-value routing, transition and mismatch scenarios.
- Added a responsive React questionnaire UI with saved browser answers, personalized checklist results, print/PDF support and result JSON copy.
- Extended questionnaire CI to validate every versioned contract and its conditional-question references.
- Added TypeScript and production-build checks to the CI merge gate.

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
