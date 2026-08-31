# Official Checklist — Process Onboarding Roadmap

Generated: 2026-08-30

Official Checklist should prioritize processes where a wrong branch, missed prerequisite, stale form, jurisdiction error, or agency handoff can cause material delay, duplicate fees, lost appointments, status problems, or rejected submissions.

## Priority model

Each candidate is scored conceptually on:

- **Impact** — cost of getting it wrong.
- **Branch risk** — likelihood that users choose the wrong form/service.
- **Cross-agency handoffs** — number of agencies/portals involved.
- **Freshness risk** — how often forms, fees, dates, eligibility charts or appointment rules change.
- **Determinism** — whether authoritative sources support a safe machine-readable decision path.

## Wave 1 — U.S. immigration and visas

**Onboard first:**

1. U.S. Immigration & Visa Services classifier — USCIS / DOL / DOS / NVC / CBP.
2. Employment-based permanent residence — PERM → I-140 → Visa Bulletin/USCIS filing chart → I-485 or NVC/DS-260.
3. Family-based permanent residence — I-130 → adjustment vs consular processing → financial/civil documents → interview.
4. Nonimmigrant visa application — DS-160 → category-specific petition/SEVIS facts → fee → interview-waiver/appointment route.
5. H-1B — cap-subject vs cap-exempt vs change-employer vs extension/amendment → LCA → I-129 → visa/status handoff.
6. H-4 — visa abroad vs extension/change inside U.S. → I-539 where applicable.
7. H-4 EAD — category (c)(26), H-4 proof, relationship, approved I-140 or qualifying AC21 basis.
8. I-485 ancillary benefits — EAD and advance parole, preserving the separate eligibility categories and travel consequences.
9. Permanent Resident Card — I-90 renewal/replacement/correction versus I-751/I-829 removal of conditions.
10. Naturalization/citizenship — N-400 versus possible already-acquired/derived citizenship and N-600 documentation route.
11. USCIS address changes — AR-11/online update, pending-case updates, NVC/DOS handoff and I-865 sponsor duties.
12. I-94 — retrieval, not-found recovery, CBP entry correction, USCIS-issued correction and extension/change-of-status separation.
13. RFE / NOID / denial / appeal-response router — driven by the actual notice and deadline rather than a generic checklist.
14. Premium Processing — I-907 eligibility tied to the underlying form/classification and current USCIS availability.

## Wave 2 — India consular services for applicants abroad

- OCI registration, re-issue and miscellaneous OCI services.
- Indian visa/eVisa classification and eligibility.
- Consular birth registration / citizenship by descent.
- Attestation, power of attorney and miscellaneous consular documents.
- Death registration / transport-of-remains process.
- Renunciation/citizenship-related services not already covered by passport surrender.

## Wave 3 — high-friction U.S. civic processes

- U.S. Passport: first passport, renewal, child passport, lost/stolen/damaged and urgent travel.
- Social Security: first SSN, replacement card, name/status update and retirement/disability benefit application routing.
- REAL ID / driver's license: state-specific identity/residency/status evidence and appointment path.
- IRS ITIN: new ITIN, renewal, acceptable identity documents and tax-return exceptions.
- FAFSA / Federal Student Aid: dependency, contributor/parent data, identity and financial-information workflow.
- Medicare / Social Security retirement enrollment timing and special enrollment periods.
- State unemployment and paid-family-leave claims where source APIs/rules are sufficiently stable.
- Vital records: birth/death/marriage certificates with state/county routing.

## Wave 4 — business and property processes

- Business entity formation and annual compliance by state.
- EIN application and responsible-party routing.
- Local business licenses and seller permits.
- Property purchase/transfer checklist, recording and homestead/property-tax exemptions by jurisdiction.
- Landlord/tenant move-in, security-deposit and notice compliance by state/locality.

## Activation rule

A process becomes `live` only when:

1. authoritative source nodes exist;
2. the service/application branch can be classified before documents;
3. freshness metadata is current;
4. unresolved legal/factual discretion returns `NEEDS_AUTHORITATIVE_CONFIRMATION`;
5. questionnaire/evaluator regression tests pass;
6. the UI exposes the process instead of leaving knowledge only in OKF.

For immigration and other legal-status processes, Official Checklist is routing/preflight guidance and must not present itself as individualized legal advice or predict discretionary adjudication outcomes.
