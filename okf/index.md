# Official Checklist — OKF Index

Canonical entrypoint for the machine-readable official-process graph.

## India — applicants in the United States

### Indian passport / travel-document master classification

- [San Francisco / Los Angeles servicing transition](jurisdictions/india-us-san-francisco.md)
- [Passport service classification](decisions/india-us-passport-service-classification.md)
- [Ordinary passport issuance: Fresh vs Re-issue](decisions/india-us-passport-ordinary-issuance.md)
- [Passport-related services router](decisions/india-us-passport-related-services.md)
- [Emergency travel router](decisions/india-us-passport-emergency-travel-route.md)
- [Special document router](decisions/india-us-passport-special-document-route.md)
- [Adverse-action / appeal router](decisions/india-us-passport-adverse-action-route.md)

### Ordinary passport decisions

- [Applicant category](decisions/india-us-passport-applicant-category.md)
- [Re-issue reason router](decisions/india-us-passport-reissue-reason.md)
- [Change in existing personal particulars](decisions/india-us-passport-change-particulars.md)
- [Booklet and validity router](decisions/india-us-passport-booklet-validity.md)
- [Regular vs Tatkaal router](decisions/india-us-passport-processing-route.md)
- [Adult Tatkaal eligibility](decisions/india-us-passport-tatkaal-eligibility.md)

### Process envelopes

- [Ordinary Passport — Fresh](processes/india/us/passport/fresh.md)
- [Ordinary Passport — Adult Re-issue](processes/india/us/passport/reissue/san-francisco/adult.md)
- [Ordinary Passport — Minor Re-issue](processes/india/us/passport/reissue/san-francisco/minor.md)
- [Ordinary Passport — Lost/Stolen](processes/india/us/passport/reissue/san-francisco/lost.md)
- [Ordinary Passport — Damaged](processes/india/us/passport/reissue/san-francisco/damaged.md)
- [Short Validity Passport renewal](processes/india/us/passport/short-validity-renewal.md)
- [Emergency Certificate](processes/india/us/passport/emergency-certificate.md)
- [Police Clearance Certificate](processes/india/us/passport/pcc.md)
- [GEP background verification](processes/india/us/passport/gep.md)
- [Surrender of Indian Passport](processes/india/us/passport/surrender.md)
- [Diplomatic / Official Passport](processes/india/us/passport/diplomatic-official.md)
- [Identity Certificate](processes/india/us/passport/identity-certificate.md)
- [Refusal / impounding / revocation appeal](processes/india/us/passport/adverse-action-appeal.md)

### Requirements

- [Fresh ordinary-passport documents](requirements/india-us-passport-fresh-documents.md)
- [Common Re-issue documents](requirements/india-us-passport-common-documents.md)
- [Conditional Re-issue documents](requirements/india-us-passport-conditional-documents.md)
- [Minor Re-issue documents](requirements/india-us-passport-minor-documents.md)
- [Emergency Certificate documents](requirements/india-us-emergency-certificate-documents.md)
- [PCC documents](requirements/india-us-pcc-documents.md)
- [GEP documents](requirements/india-us-gep-documents.md)
- [Surrender documents](requirements/india-us-passport-surrender-documents.md)
- [Diplomatic / Official / Identity Certificate requirements](requirements/india-us-passport-special-documents.md)

### Fees and submission

- [Fresh ordinary-passport fees](fees/india-us-passport-fresh-fees.md)
- [Re-issue fee matrix](fees/india-us-passport-reissue-fees.md)
- [Emergency Certificate fee](fees/india-us-emergency-certificate-fee.md)
- [Service-specific submission router](submission/india-us-passport-submission.md)
- [Cross-service preflight validation](validation/india-us-passport-preflight.md)

### Authoritative source nodes

Government / Mission sources:

- [Passport Seva — services for applicants abroad](sources/passport-seva-abroad-services-2026.md)
- [Passport Seva — passport-related service taxonomy](sources/passport-seva-service-taxonomy-2026.md)
- [Passport Seva — travel document types](sources/passport-seva-travel-document-types-2026.md)
- [Passport Seva — Fresh document advisor](sources/passport-seva-fresh-document-advisor-2026.md)
- [Passport Seva — Re-issue case router](sources/passport-seva-reissue-cases-2026.md)
- [Passport Seva — Surrender](sources/passport-seva-surrender-2026.md)
- [Passport Seva — Diplomatic / Official](sources/passport-seva-diplomatic-official-2026.md)
- [Passport Seva — appeals](sources/passport-seva-appeals-2026.md)
- [CGI San Francisco — Passport FAQ](sources/cgisf-passport-faq.md)
- [CGI San Francisco — Passport Related Services](sources/cgisf-passport-services.md)
- [CGI San Francisco — Tatkaal Passport Services](sources/cgisf-tatkaal-passport-services.md)
- [CGI San Francisco — U.S. jurisdictions](sources/cgisf-us-consular-jurisdictions-2026.md)
- [CGI San Francisco — Emergency Certificate](sources/cgisf-emergency-certificate-aug-2026.md)
- [CGI San Francisco — GEP](sources/cgisf-gep-aug-2026.md)

Official service-provider sources:

- [VFS — current U.S. passport service](sources/vfs-us-passport-aug-2026.md)
- [VFS — PCC](sources/vfs-us-pcc-2026.md)
- [VFS — Surrender](sources/vfs-us-surrender-2026.md)
- [VFS — Adult Re-issue checklist](sources/vfs-adult-reissue-checklist-may-2026.md)
- [VFS — Adult lost checklist](sources/vfs-adult-lost-checklist-may-2026.md)
- [VFS — Adult damaged checklist](sources/vfs-adult-damaged-checklist-may-2026.md)
- [VFS — Minor Re-issue checklist](sources/vfs-minor-reissue-checklist-may-2026.md)
- [VFS — Minor lost checklist](sources/vfs-minor-lost-checklist-may-2026.md)
- [VFS — Minor damaged checklist](sources/vfs-minor-damaged-checklist-may-2026.md)

## Machine-readable runtime scope

The OKF bundle now models the complete service taxonomy above. The current interactive evaluator remains intentionally limited to the already-verified **Ordinary Passport Re-issue** questionnaire under `data/india/us/passport/reissue/`.

Other process envelopes are knowledge-graph coverage until their versioned questionnaire/evaluator modules are separately activated. This prevents a partially researched service from appearing `READY` in the UI.

## Repository history

- [OKF change log](log.md)
