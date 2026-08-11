---
type: validation-rule
id: validation-india-us-passport-preflight
title: Indian Passport Preflight - USA
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../sources/cgisf-passport-faq.md
  - ../sources/cgisf-gpsp2-migration.md
  - ../sources/vfs-us-india-passport.md
---

# Indian Passport Preflight — USA

The preflight runs before the user treats an application as ready for payment, appointment, mail, or walk-in submission.

## Inputs to compare

Capture the applicant facts and, when available, the selections shown on the Government of India/VFS application:

- first passport vs existing/previous passport;
- adult vs minor;
- residence and selected Indian Mission/jurisdiction;
- requested service: Fresh vs Re-issue;
- re-issue reason;
- personal-particular changes;
- Regular vs Tatkaal;
- lost/stolen/damaged status;
- Government application/reference identifier used in the service-provider flow;
- mandatory photo, signature, and supporting-document upload completion.

## Hard blockers

Return `NOT_READY` when any of the following is detected:

1. **Application type mismatch** — applicant facts resolve to Re-issue but the submitted application says Fresh Passport, or vice versa.
2. **Applicant category mismatch** — adult/minor branch does not match the applicant's age/category.
3. **Jurisdiction mismatch** — selected Indian Mission is inconsistent with the applicant's verified consular jurisdiction.
4. **Re-issue reason mismatch** — facts disclose a change/loss/damage/expiry condition that is not represented by the selected reason.
5. **Tatkaal incompatibility** — the applicant is routed to Tatkaal despite an official exclusion or unresolved eligibility ambiguity.
6. **Reference mismatch** — identifiers used between the Government application and the service-provider workflow do not correspond when the workflow requires them to correspond.
7. **Mandatory GPSP 2.0 uploads incomplete** — required photo, signature, or supporting-document uploads have not been completed before physical submission.

## Result model

```text
READY
NOT_READY
NEEDS_AUTHORITATIVE_CONFIRMATION
```

For `NOT_READY`, the UI must identify the exact blocking field, show the expected value, show the observed value, and link to the source node supporting the decision.

For `NEEDS_AUTHORITATIVE_CONFIRMATION`, the UI must not guess. It should preserve the unresolved fact/source conflict for review.

## Related decisions

- [Passport service classification](../decisions/india-us-passport-service-classification.md)
- [Adult Tatkaal eligibility](../decisions/india-us-passport-tatkaal-eligibility.md)
