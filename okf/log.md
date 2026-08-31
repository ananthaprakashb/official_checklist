# OKF Change Log

## 2026-08-30 — v0.11 employment-based NVC / DS-260 consular-processing preflight

- Activated a dedicated `/usa/immigration/employment-green-card/nvc` workflow for the consular branch after I-140 approval rather than stopping at the generic I-140 handoff.
- Added current Department of State source nodes for employment-based immigrant visas, NVC processing/INA 203(g), CEAC fee access, documentarily complete/interview scheduling, interview preparation and INA 221(g)/administrative processing.
- Added USCIS source nodes for approved-petition transfer to NVC through Form I-824 where applicable and for the USCIS Immigrant Fee/Green Card production handoff.
- Added I-140-based category routing for EB-1A, EB-1B, EB-1C, regular EB-2, EB-2 NIW, EB-3 Skilled/Professional/Other Worker and Schedule A EB-2/EB-3 while explicitly sending EB-4/EB-5 to category-specific consular modules.
- Added a USCIS-to-NVC routing gate so an approved I-140 retained/not forwarded by USCIS cannot silently enter CEAC/NVC processing; the exact need for Form I-824 remains petition-history-specific.
- Added separate Visa Bulletin controls for Dates-for-Filing/NVC pre-processing and Final Action/interview visa-number availability, preserving documentarily complete cases during later retrogression.
- Added current $345-per-intending-immigrant employment immigrant-visa fee calculation and the conditional $120 Affidavit-of-Support fee path only where the limited employment-based I-864 relative/significant-owner exception applies.
- Added per-applicant DS-260, civil-document, reciprocity, police-certificate and derivative eligibility checks without treating uploads as self-declared documentarily complete status.
- Added employer/job-offer continuity for job-offer-based EB categories while keeping EB-1A/NIW on their qualifying work/endeavor-intent path rather than inventing an employer-letter requirement.
- Added NVC case-preservation handling for the one-year INA 203(g) response/application risk during long visa-number waits.
- Added post-specific interview-instruction, panel-physician medical, appointment-letter and interview-original checks, with current Final Action availability kept separate from embassy/consulate capacity.
- Added INA 221(g) and administrative-processing states controlled by the actual consular instructions instead of predicting duration or treating every 221(g) as a permanent denial.
- Added immigrant-visa detail/expiration checks, planned-entry validation, USCIS Immigrant Fee reminders and final CBP admission/Green Card production handoff.
- Added a dedicated NVC regression suite to the mandatory validation chain covering routing, DFF/Final Action separation, fees, DS-260/DQ consistency, job basis, derivatives, INA 203(g), 221(g), visa validity and immigrant-fee handling.

## 2026-08-30 — v0.10 detailed employment-based Form I-485 preflight

- Activated a dedicated `/usa/immigration/employment-green-card/i485` workflow for employment-based adjustment of status rather than stopping at the generic employment-green-card stage gate.
- Added current USCIS source nodes for detailed Form I-485 filing instructions, employment-based INA 245(k), pending-adjustment I-765 category `(c)(9)`, and I-131 Advance Parole handling.
- Reused the authoritative August/September 2026 Department of State cutoff model while preserving a separate USCIS monthly filing-chart confirmation gate; the engine does not infer Dates for Filing from the more favorable table.
- Added separate filing eligibility and Final Action availability so a case that may be fileable is not described as approvable before an immigrant visa number is available.
- Added physical-presence and inspection/admission/parole routing to prevent outside-U.S. applicants from being sent into Form I-485 instead of consular processing.
- Added INA 245(c)/245(k) status-history controls, including the 180-day threshold and an explicit most-recent-lawful-admission anchor before relying on 245(k).
- Added conservative authoritative-confirmation handling for uncertain status history, inadmissibility, removal, J-1 212(e), fraud/misrepresentation, criminal, immigration-history, or other individualized adjustment issues.
- Added current Form I-485 edition/filing-location verification and I-693-at-filing controls, including a confirmation gate for any claimed medical-exam exception.
- Added job-offer-based Supplement J handling and separate treatment for EB-1A/NIW cases that do not use Supplement J merely to confirm a job offer or request ordinary INA 204(j) portability.
- Added derivative-beneficiary reminders, pending-I-485 I-765 `(c)(9)` and I-131 Advance Parole routing, and a hard travel blocker when departure is planned without a confirmed issued travel document or recognized exception.
- Added INA 204(j) portability checks for at least 180 pending days, a same-or-similar permanent job, and the Supplement J portability package.
- Added transfer-of-underlying-basis as a separate discretionary confirmation path rather than silently treating a basis switch as ordinary portability.
- Added RFE/NOID, interview, denial, and approval-state checks driven by the actual USCIS notices and current Final Action availability.
- Added a dedicated I-485 regression suite to the mandatory validation chain covering visa-chart differences, India EB-2 unavailability, location routing, 245(k), I-693, portability, travel, RFE deadlines, and transfer-of-basis handling.

## 2026-08-30 — v0.9 detailed Form I-140 immigrant-petition preflight

- Activated a dedicated `/usa/immigration/employment-green-card/i140` workflow covering Form I-140 classification through USCIS adjudication and downstream I-485/NVC routing.
- Added current USCIS source nodes for I-140 instructions, employer ability to pay, Schedule A, I-907 premium processing, employment-based priority-date retention, RFE/NOID policy and I-290B appeal/motion routing.
- Added classification-first routing for E11, E12, E13, E21 non-NIW, E21 NIW, E31, E32, EW3 and Schedule A while explicitly rejecting EB-4/EB-5 as Form I-140 families.
- Added petitioner-route guardrails so employer-only classifications cannot be treated as self-petitions while EB-1A and NIW preserve their permitted self-petition routes.
- Added PERM/Schedule-A/no-labor-certification alignment, including valid-certified-PERM gating and explicit Schedule A Group I/Group II classification.
- Added category-evidence envelopes for EB-1A, EB-1B, EB-1C, regular EB-2, NIW, EB-3 Skilled/Professional/Other Worker and Schedule A.
- Added job-offer and continuing ability-to-pay gates only to classifications that require them rather than contaminating EB-1A/NIW with employer-only requirements.
- Added priority-date basis and prior-approved EB-1/EB-2/EB-3 retention checks, including hard blocks for known fraud/willful-misrepresentation, labor-certification invalidation and material-error disqualifiers.
- Added current I-907 premium-processing mapping: 15-day classes versus 45-day E13/NIW classes, without treating premium processing as an evidentiary shortcut.
- Added RFE/NOID handling driven by the actual USCIS notice and deadline, with missed deadlines as blockers and timely responses remaining fact-specific.
- Added denial/revocation routing that requires the actual decision notice before choosing appeal, motion or refiling and preserves petitioner/standing distinctions.
- Added approved-petition handoff to current visa-availability/USCIS-chart evaluation for I-485 or NVC/DS-260 rather than treating I-140 approval as visa availability.
- Added a dedicated I-140 regression suite to the mandatory validation chain.

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
