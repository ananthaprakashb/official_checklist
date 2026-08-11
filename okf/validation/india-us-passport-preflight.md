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
  - ../sources/vfs-passport-information-usa.md
  - ../sources/vfs-adult-reissue-checklist-may-2026.md
  - ../sources/vfs-minor-reissue-checklist-may-2026.md
---

# Indian Passport Preflight — USA

Run this gate before payment is treated as final, before appointment/travel to VFS, and again before mail/walk-in submission.

## Resolved facts to compare

- existing/previous passport vs first passport;
- adult vs minor;
- current residence and Indian Mission/jurisdiction;
- Fresh vs Re-issue;
- complete set of re-issue reasons;
- all changed personal particulars;
- booklet/validity selection;
- Regular vs Tatkaal eligibility;
- lost/stolen/damaged and damaged-beyond-recognition flags;
- adult/minor checklist branch and Annexure requirements;
- Government ARN and VFS reference/payment mapping;
- online photo/signature upload completion;
- fee tier;
- selected submission mode and address/package rules.

## Hard blockers

Return `NOT_READY` for any confirmed mismatch:

1. **Application type mismatch** — facts require Re-issue but Government/VFS says Fresh, or vice versa.
2. **Applicant category mismatch** — adult/minor branch differs from resolved age/category.
3. **Checklist mismatch** — adult checklist used for a minor or minor checklist used for an adult.
4. **Jurisdiction mismatch** — selected Indian Mission does not match the verified jurisdiction.
5. **Reason mismatch** — expiry/pages/lost/damaged/change facts are omitted or represented by the wrong Re-issue reason.
6. **Change-particular mismatch** — Government data differs from the current passport without selecting the corresponding change branch and supporting-document route.
7. **Tatkaal incompatibility** — an official exclusion applies, or Tatkaal eligibility is unresolved but the application is represented as Tatkaal-ready.
8. **Reference mismatch** — Government ARN and VFS payment/application reference do not align where the current checklist requires alignment.
9. **Mandatory upload incomplete** — required Government-portal photograph/signature upload is missing.
10. **Lost/damaged branch incomplete** — applicable lost/damaged checklist, Annexure F, or lost/damaged fee tier is missing.
11. **Minor consent branch incomplete** — required parent signatures, Annexure D, or conditional Annexure C is missing.
12. **Fee mismatch** — calculated/selected fee tier does not match applicant category, booklet, processing route and lost/damaged status.
13. **Submission mismatch** — package/address/mode contradicts the current process-specific submission rules.

## Result model

```text
READY
NOT_READY
NEEDS_AUTHORITATIVE_CONFIRMATION
```

For `NOT_READY`, return a structured blocker with:

```text
field
expected
observed
reason
source_node
recovery_action
```

For `NEEDS_AUTHORITATIVE_CONFIRMATION`, do not guess. Preserve the unresolved fact/source conflict and prevent the UI from displaying a green readiness state.

## Related graph

- [Service classification](../decisions/india-us-passport-service-classification.md)
- [Applicant category](../decisions/india-us-passport-applicant-category.md)
- [Re-issue reason](../decisions/india-us-passport-reissue-reason.md)
- [Personal-particular changes](../decisions/india-us-passport-change-particulars.md)
- [Regular vs Tatkaal](../decisions/india-us-passport-processing-route.md)
- [Fees](../fees/india-us-passport-reissue-fees.md)
- [Submission](../submission/india-us-passport-submission.md)
