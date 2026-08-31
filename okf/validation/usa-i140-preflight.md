---
type: validation-rule
id: validation-usa-i140-preflight
title: U.S. Form I-140 Preflight Validation
generated: 2026-08-30
verified: 2026-08-30
stale_after: 2026-09-13
status: verified
sources:
  - ../sources/uscis-i140-instructions-aug-2026.md
  - ../sources/uscis-i140-ability-to-pay-aug-2026.md
  - ../sources/uscis-i907-i140-premium-aug-2026.md
  - ../sources/uscis-i140-priority-date-retention-aug-2026.md
  - ../sources/uscis-rfe-noid-aug-2026.md
  - ../sources/uscis-i290b-i140-review-aug-2026.md
---

# I-140 Preflight Validation

Return `NOT_READY` for a hard mismatch, including:

- EB-1B, EB-1C, regular EB-2, EB-3 or Schedule A selected with self-petition as the only petitioner route;
- EB-1A or NIW forced through ordinary PERM;
- a PERM-required filing without a valid certified labor certification for the new petition;
- a Schedule A case presented as DOL-certified PERM;
- an employer/job-offer classification without an ability-to-pay evidence package;
- beneficiary evidence that does not meet the selected category or labor-certified job requirements;
- EB-4/EB-5 presented as Form I-140;
- a claimed retained priority date with a known regulatory disqualifier;
- a missed RFE/NOID deadline or an incomplete notice response;
- premium-processing assumptions that do not match the selected classification.

Return `NEEDS_AUTHORITATIVE_CONFIRMATION` when:

- the exact category or petitioner route is unresolved;
- NIW or EB-1A merits must be evaluated from a fact-intensive evidence record;
- Schedule A group/underlying preference is unresolved;
- priority-date retention depends on an uncertain prior revocation/invalidation reason;
- an RFE/NOID/denial notice has not been fully reviewed;
- the correct appeal/motion jurisdiction or deadline is unresolved.

Return `READY` only when the selected stage's objective classification and evidence-preparation gates are satisfied. This status is filing/preflight guidance, not an approval prediction.
