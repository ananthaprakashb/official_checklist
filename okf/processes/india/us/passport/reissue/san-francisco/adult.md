---
type: process
id: process-india-us-passport-reissue-sf-adult
title: Indian Passport Adult Re-issue - San Francisco
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../../../../../../sources/cgisf-passport-faq.md
  - ../../../../../../sources/cgisf-passport-services.md
  - ../../../../../../sources/cgisf-gpsp2-migration.md
  - ../../../../../../sources/vfs-us-india-passport.md
---

# Indian Passport Adult Re-issue — San Francisco

Reference process for an adult applicant in the Consulate General of India, San Francisco jurisdiction who needs another Indian passport in lieu of an existing passport.

## Phase A — classify before applying

1. Establish whether the applicant already holds or previously held an Indian passport.
2. Establish adult/minor category.
3. Determine the applicant's current U.S. consular jurisdiction.
4. Determine the reason another passport is required.
5. Run [Passport service classification](../../../../../../decisions/india-us-passport-service-classification.md).

**STOP:** do not proceed to a document checklist when service classification is unresolved.

## Phase B — establish the re-issue reason

Capture all facts that affect the selected Government application branch, including:

- expired/due-to-expire passport;
- validity expired more than three years ago;
- pages exhausted;
- lost passport;
- damaged passport;
- change in existing personal particulars, including applicable name/address/appearance/signature/date/place-of-birth changes.

When more than one fact applies, do not hide secondary facts merely to force a simpler category. The selected reason/change fields must accurately represent the applicant's situation according to current official guidance.

## Phase C — Regular vs Tatkaal

If the applicant requests Tatkaal, run [Adult Tatkaal eligibility](../../../../../../decisions/india-us-passport-tatkaal-eligibility.md).

**STOP:** an excluded or unresolved Tatkaal case must not be represented as Tatkaal-eligible.

## Phase D — Government/VFS application path

Use the current official VFS/Passport Seva path for the verified service classification and jurisdiction.

Before physical submission, current CGI San Francisco GPSP 2.0 guidance requires the Government application flow to include upload of:

- an ICAO-compliant photograph;
- scanned signature;
- required supporting documents.

The exact current forms, document checklist, fees, appointment/submission mode, and service-provider steps must be read from the linked authoritative source nodes at execution time rather than copied permanently into UI code.

## Phase E — preflight before appointment/submission

Run [Passport preflight](../../../../../../validation/india-us-passport-preflight.md).

The process is **not ready** until these dimensions agree:

```text
Applicant facts
    ↓
Service classification
    ↓
Consular jurisdiction
    ↓
Re-issue reason / changes
    ↓
Regular or Tatkaal eligibility
    ↓
Government application selections
    ↓
VFS/service-provider selections and identifiers
    ↓
Required uploads and supporting-document branch
    ↓
READY FOR NEXT OFFICIAL STEP
```

## User-facing result

A successful preflight should summarize at minimum:

```text
Service: Indian Passport
Application type: Re-issue
Applicant: Adult
Jurisdiction: San Francisco
Reason: <verified reason(s)>
Processing: Regular | Tatkaal
Preflight: READY
Official sources last verified: <date>
```

A failed preflight must state **which field is wrong and why**, rather than only saying that the application is invalid.

## Scope boundary for v0.1

This node does not yet attempt to encode every document variation. The first milestone is correct process routing and blocker detection. Document-specific nodes will be added only after the relevant branch has been selected and source-verified.
