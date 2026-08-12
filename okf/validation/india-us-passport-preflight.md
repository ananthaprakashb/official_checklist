---
type: validation-rule
id: validation-india-us-passport-preflight
title: Indian Passport and Related Services Preflight - USA
generated: 2026-08-10
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/passport-seva-abroad-services-2026.md
  - ../sources/passport-seva-service-taxonomy-2026.md
  - ../sources/passport-seva-reissue-cases-2026.md
  - ../sources/vfs-us-passport-aug-2026.md
  - ../sources/vfs-us-pcc-2026.md
  - ../sources/vfs-us-surrender-2026.md
  - ../sources/cgisf-emergency-certificate-aug-2026.md
---

# Indian Passport and Related Services Preflight — USA

Run this gate before document collection is treated as complete, before payment/appointment/travel is treated as final, and again before submission.

## Stage 1 — classify the requested outcome

Resolve exactly one primary service family before selecting documents:

- ordinary passport — Fresh;
- ordinary passport — Re-issue;
- Emergency Certificate;
- Police Clearance Certificate;
- GEP background verification;
- Surrender of Indian Passport;
- Diplomatic Passport;
- Official Passport;
- Identity Certificate;
- adverse-action appeal/review.

If the requested outcome and selected Government/VFS service disagree, return `NOT_READY`.

## Stage 2 — resolve branch facts

For ordinary passports resolve:

- applicant age/category;
- jurisdiction/Mission;
- Fresh vs Re-issue;
- complete Re-issue reason set, including Short Validity Passport renewal and lost/stolen cases;
- all changed personal particulars;
- booklet/validity;
- Regular vs Tatkaal eligibility;
- current checklist and fee branch.

For non-ordinary-passport services resolve the service-specific eligibility, authority, documents, fee and submission channel. Do not inherit ordinary-passport rules by analogy.

## Hard blockers

Return `NOT_READY` for a confirmed mismatch, including:

1. **Service-family mismatch** — for example PCC, EC or Surrender represented as Fresh/Re-issue.
2. **Fresh/Re-issue mismatch** for an ordinary passport.
3. **Applicant-category mismatch** — adult/minor or other category does not match facts.
4. **Jurisdiction mismatch** — selected Mission/authority conflicts with verified residence/service rules.
5. **Re-issue reason mismatch** — expiry, pages, SVP renewal, lost/stolen, damaged or change facts are omitted/misclassified.
6. **Change-particular mismatch** — changed passport data lacks the matching change branch/evidence route.
7. **Tatkaal incompatibility** — an official exclusion applies or eligibility is unresolved.
8. **Checklist mismatch** — documents/checklist belong to another service or applicant category.
9. **Reference mismatch** — Government/VFS identifiers do not align where the official workflow requires alignment.
10. **Fee mismatch** — selected fee does not match the resolved service/category/branch.
11. **Submission-channel mismatch** — for example EC sent through an ordinary VFS passport route or Diplomatic/Official Passport sent through an unsupported retail channel.
12. **Surrender-status mismatch** — surrender selected without the citizenship/status facts required by the current rules, or a former citizen attempts Re-issue instead of surrender where prohibited.
13. **Appeal bypass** — an adverse-action case is replaced by a routine application without authority instruction.

## Authoritative-confirmation conditions

Return `NEEDS_AUTHORITATIVE_CONFIRMATION` instead of guessing when:

- a current official source is stale, unavailable or contradictory;
- a dynamic official checklist has not been resolved for the applicant facts;
- Identity Certificate eligibility/channel is not fully resolved;
- Diplomatic/Official entitlement or sponsoring-authority evidence is unresolved;
- SVP renewal requires case-specific evidence not exposed by the current U.S. source;
- the operative adverse-action notice has not been reviewed.

## Result model

```text
READY
NOT_READY
NEEDS_AUTHORITATIVE_CONFIRMATION
```

For blockers return structured fields: `field`, `expected`, `observed`, `reason`, `source_node`, `recovery_action`.

## Related graph

- [Service classification](../decisions/india-us-passport-service-classification.md)
- [Ordinary passport issuance](../decisions/india-us-passport-ordinary-issuance.md)
- [Related services](../decisions/india-us-passport-related-services.md)
- [Emergency travel](../decisions/india-us-passport-emergency-travel-route.md)
- [Special documents](../decisions/india-us-passport-special-document-route.md)
- [Adverse actions](../decisions/india-us-passport-adverse-action-route.md)
- [Submission routing](../submission/india-us-passport-submission.md)
