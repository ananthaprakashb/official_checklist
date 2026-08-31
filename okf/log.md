# OKF Change Log

## 2026-08-30 — v0.8 detailed PERM labor-certification preflight

- Activated a dedicated `/usa/immigration/employment-green-card/perm` workflow for the standard employer-side 20 CFR 656.17 PERM route.
- Added authoritative PWD, recruitment, Notice of Filing, audit, supervised-recruitment, determination/review and certification-validity source nodes from DOL and the current eCFR.
- Added stage classification for planning, prevailing wage, recruitment, ETA-9089 readiness/filing, audit, supervised recruitment, certification, denial and reconsideration/BALCA review.
- Added route guards so college/university teacher special handling, professional-athlete and Schedule A cases do not inherit the standard professional/nonprofessional recruitment calendar.
- Added objective PWD-validity checks requiring recruitment to begin or ETA-9089 to be filed during the recorded PWD validity period.
- Added date-calculated recruitment checks for the 30-day SWA job order, Sunday/professional-journal advertising and the 30-to-180-day prefiling window.
- Added professional-occupation controls for three additional recruitment methods and their special 30/180-day timing restriction.
- Added Notice-of-Filing controls for bargaining-representative notice or 10-consecutive-business-day posting, applicable in-house media and the 30-to-180-day filing window.
- Added six-month layoff review, recruitment-report readiness and five-year PERM supporting-record retention controls.
- Added audit handling for the 30-day response period and the single discretionary extension, plus supervised-recruitment approval/deadline controls driven by the Certifying Officer's instructions.
- Added denial/reconsideration/BALCA routing with the 30-day administrative-review deadline and pending-review duplicate-filing guardrail.
- Added certified-PERM → I-140 handoff validation for the 180-calendar-day certification-validity period and preserved the ETA-9089 filing date as the priority-date basis.
- Added regression tests for a short SWA job order, recruitment aging beyond 180 days, late Notice of Filing, missed audit deadline, unauthorized supervised-recruitment publication and late I-140 handoff.

## 2026-08-30 — v0.7 detailed employment-based Green Card preflight

- Activated a dedicated `/usa/immigration/employment-green-card` workflow rather than stopping at the generic U.S. immigration classifier.
- Added employment-category routing across EB-1A/EB-1B/EB-1C, regular EB-2, EB-2 NIW, EB-3 Professional/Skilled/Other Worker, Schedule A, EB-4 and EB-5 unreserved/set-aside families.
- Added explicit category-to-labor/petition controls so EB-1A/NIW and other non-PERM paths are not forced through ordinary PERM, Schedule A is not treated as ordinary DOL PERM, EB-4 is not mislabeled as I-140, and EB-5 is not mislabeled as I-140.
- Added PERM-stage controls for prevailing wage/recruitment/ETA 9089 and the certified-labor-certification validity gate before a new I-140 filing.
- Added August and September 2026 Department of State employment-based Final Action and Dates-for-Filing tables with country-of-chargeability handling and strict priority-date comparison.
- Added a separate USCIS monthly filing-chart selection gate so the engine never assumes Dates for Filing merely because it is more favorable.
- Added detailed I-485-vs-NVC final-processing routing, required I-693-at-filing control, Supplement J / INA 204(j) portability handling, optional I-765/I-131 ancillary-benefit routing, derivative-beneficiary reminders and separate Final Action availability.
- Added `NEEDS_AUTHORITATIVE_CONFIRMATION` handling for future Visa Bulletin months, unverified USCIS chart selection, material adjustment/admissibility/status-history issues, and EB-4/EB-5 category-specific evidence not yet modeled in dedicated modules.
- Added regression coverage for category/PERM mismatches, India EB-2 September 2026 filing-vs-final-action separation, priority-date cutoff failures, adjustment selected from abroad, EB-1A/PERM mismatch and EB-4 petition routing.

## 2026-08-30 — v0.6 U.S. immigration and visa onboarding

- Added a cross-agency U.S. Immigration & Visa Services classifier spanning USCIS, Department of Labor, Department of State/NVC and CBP.
- Added authoritative source nodes for PERM, I-140, I-485, the September 2026 Visa Bulletin, I-130, DS-160, NVC/DS-260, I-129/H-1B, I-539, I-765, I-131, I-90, N-400, USCIS address changes and CBP I-94.
- Added process envelopes for employment-based permanent residence, family-based permanent residence, DS-160 vs DS-260 visa routing, H-1B/H-4/H-4 EAD, permanent-resident/citizenship services and I-94 retrieval/correction.
- Added a live `/usa/immigration` service router that asks for the desired outcome/stage before selecting forms or documents.
- Added anti-mismatch controls for I-485 vs consular processing, DS-160 vs DS-260, H-4 visa vs I-539, H-4 EAD (c)(26) basis, I-90 vs I-751/I-829, and CBP I-94 correction vs USCIS status-extension/change routes.
- Generalized questionnaire validation from the India/passport subtree to every versioned questionnaire under `data/`.
- Added regression coverage for employment-based I-485 visa-availability gating, petition-based worker DS-160, H-4 EAD eligibility, removal-of-conditions routing and CBP Deferred Inspection.
- Added a multi-wave onboarding roadmap covering India consular services, U.S. civic processes, and state/business/property compliance workflows.
- Preserved conservative `NEEDS_AUTHORITATIVE_CONFIRMATION` results for legal/eligibility facts or freshness-sensitive filing gates rather than predicting approval.

## 2026-08-12 — v0.5 Indian passport service-family expansion

- Expanded the India/U.S. OKF from Re-issue-first coverage to the full authoritative passport/travel-document and passport-related service taxonomy.
- Added master classification for Ordinary Passport Fresh/Re-issue, Emergency Certificate, PCC, GEP background verification, Surrender of Indian Passport, Diplomatic Passport, Official Passport, Identity Certificate and adverse-action appeal/review.
- Added Passport Seva's explicit Re-issue case family for Renewal of Short Validity Passport and preserved lost/stolen as a distinct fact set.
- Added Fresh-passport document and fee branches without extrapolating unsupported fee combinations.
- Added EC-specific documents and fee handling based on current Mission guidance.
- Added PCC, GEP and Surrender requirement envelopes that preserve dynamic official checklists rather than inventing universal document sets.
- Added process envelopes for Fresh, SVP renewal, EC, PCC, GEP, Surrender, Diplomatic/Official Passport, Identity Certificate and adverse-action appeals.
- Generalized submission routing and preflight so non-passport-issuance services cannot accidentally inherit the ordinary Fresh/Re-issue workflow.
- Activated a passport-service classifier in the web catalog so expanded OKF coverage is visible instead of remaining knowledge-graph-only.

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
