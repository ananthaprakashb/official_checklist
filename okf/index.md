# Official Checklist — OKF Index

Canonical entrypoint for the machine-readable official-process graph.

## India — applicants in the United States

### Indian passport — core decisions

- [San Francisco / Los Angeles servicing transition](jurisdictions/india-us-san-francisco.md)
- [Passport service classification](decisions/india-us-passport-service-classification.md)
- [Applicant category](decisions/india-us-passport-applicant-category.md)
- [Re-issue reason router](decisions/india-us-passport-reissue-reason.md)
- [Change in existing personal particulars](decisions/india-us-passport-change-particulars.md)
- [Booklet and validity router](decisions/india-us-passport-booklet-validity.md)
- [Regular vs Tatkaal router](decisions/india-us-passport-processing-route.md)
- [Adult Tatkaal eligibility](decisions/india-us-passport-tatkaal-eligibility.md)

### Requirements, fees and submission

- [Common re-issue documents](requirements/india-us-passport-common-documents.md)
- [Conditional re-issue documents](requirements/india-us-passport-conditional-documents.md)
- [Minor re-issue documents](requirements/india-us-passport-minor-documents.md)
- [Current re-issue fee matrix](fees/india-us-passport-reissue-fees.md)
- [Submission workflow](submission/india-us-passport-submission.md)
- [Preflight validation](validation/india-us-passport-preflight.md)

### San Francisco-serviced processes

- [Adult re-issue](processes/india/us/passport/reissue/san-francisco/adult.md)
- [Minor re-issue](processes/india/us/passport/reissue/san-francisco/minor.md)
- [Adult lost passport](processes/india/us/passport/reissue/san-francisco/lost.md)
- [Adult damaged passport](processes/india/us/passport/reissue/san-francisco/damaged.md)

### Authoritative sources

- [CGI San Francisco — Passport FAQ](sources/cgisf-passport-faq.md)
- [CGI San Francisco — Passport Related Services](sources/cgisf-passport-services.md)
- [CGI San Francisco — Tatkaal Passport Services](sources/cgisf-tatkaal-passport-services.md)
- [CGI San Francisco — Current U.S. consular jurisdictions](sources/cgisf-us-consular-jurisdictions-2026.md)
- [CGI San Francisco — GPSP 2.0 migration notice](sources/cgisf-gpsp2-migration.md)
- [VFS — Apply for passport](sources/vfs-us-india-passport.md)
- [VFS — Passport information/fees](sources/vfs-passport-information-usa.md)
- [VFS — Adult re-issue checklist May 2026](sources/vfs-adult-reissue-checklist-may-2026.md)
- [VFS — Adult lost checklist May 2026](sources/vfs-adult-lost-checklist-may-2026.md)
- [VFS — Adult damaged checklist May 2026](sources/vfs-adult-damaged-checklist-may-2026.md)
- [VFS — Minor re-issue checklist May 2026](sources/vfs-minor-reissue-checklist-may-2026.md)
- [VFS — Minor lost checklist May 2026](sources/vfs-minor-lost-checklist-may-2026.md)
- [VFS — Minor damaged checklist May 2026](sources/vfs-minor-damaged-checklist-may-2026.md)

## Machine-readable UI contract

Versioned questionnaire data is maintained outside the OKF link graph under `data/india/us/passport/reissue/`.

- `questionnaire.v1.json` — initial Phase 2 contract retained for compatibility.
- `questionnaire.v2.json` — current Phase 3 contract with the 2026 San Francisco/Los Angeles servicing transition and explicit age 15–17 validity selection.
- `schemas/passport-process-result.schema.json` — evaluator output contract.

All questionnaire versions, rule-node references, evaluator regression tests, TypeScript compilation and the production web build are validated in CI.

## Repository history

- [OKF change log](log.md)
