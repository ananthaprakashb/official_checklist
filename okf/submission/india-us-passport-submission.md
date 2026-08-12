---
type: submission-method
id: submission-india-us-passport-reissue
title: Indian Passport and Related Services Submission - USA
generated: 2026-08-10
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/vfs-us-passport-aug-2026.md
  - ../sources/vfs-us-pcc-2026.md
  - ../sources/vfs-us-surrender-2026.md
  - ../sources/cgisf-emergency-certificate-aug-2026.md
  - ../sources/passport-seva-diplomatic-official-2026.md
---

# Indian Passport and Related Services Submission — USA

Submission is selected **after** service family, document category, jurisdiction, applicant category and branch-specific requirements are resolved.

## Service-to-channel router

### Ordinary Passport — Fresh / Re-issue

Use the current Government passport application plus the official VFS passport-services workflow for the resolved U.S. jurisdiction. Preserve the Government ARN/reference and VFS identity/payment alignment required by the current checklist.

### Police Clearance Certificate

Use the PCC-specific Government/VFS route and PCC checklist. Never substitute the ordinary passport Fresh/Re-issue checklist.

### Surrender of Indian Passport

Use the surrender-specific VFS/Passport Seva workflow. Do not use the ordinary passport submission branch merely because a physical passport is enclosed.

### Emergency Certificate

Use the responsible Indian Mission's EC procedure. EC is Mission-controlled; do not assume ordinary VFS passport submission or appointment rules apply.

### GEP Background Verification

Use the current GEP-specific Government/Mission workflow. Do not infer PCC submission rules.

### Diplomatic / Official Passport

Use the designated Government/Passport Seva institutional channel for the entitled category. Do not route through ordinary VFS passport services unless the current authority explicitly says so.

### Identity Certificate

Use the issuing authority/jurisdiction specifically prescribed for the applicant category. If the U.S.-specific channel is not resolved by a current authoritative source, return `NEEDS_AUTHORITATIVE_CONFIRMATION`.

### Adverse action / appeal

Follow the authority and submission mechanism in the operative notice/Passport Seva appeal route. A routine new passport application is not a substitute for an appeal.

## Ordinary-passport shipping controls

Where the current VFS passport workflow applies:

- one application per package when required by the current checklist;
- return/shipping address must follow current VFS address-matching rules;
- include required payment/confirmation and courier materials;
- incomplete or incorrectly classified applications may be held or returned.

## Final gate

No branch is submission-ready unless [Indian passport preflight](../validation/india-us-passport-preflight.md) returns `READY` for that exact service family. Unsupported or unresolved branches return `NEEDS_AUTHORITATIVE_CONFIRMATION`.
