---
type: jurisdiction
id: jurisdiction-india-us-san-francisco
title: Indian Consular Jurisdiction - San Francisco, USA
generated: 2026-08-10
verified: 2026-08-10
stale_after: 2026-09-09
status: verified
sources:
  - ../sources/cgisf-tatkaal-passport-services.md
  - ../sources/cgisf-passport-services.md
  - ../sources/cgisf-us-consular-jurisdictions-2026.md
  - ../sources/vfs-passport-information-usa.md
---

# Indian Consular Jurisdiction — San Francisco / Los Angeles transition

## Direct CGI San Francisco jurisdiction

Current official CGI guidance identifies the San Francisco jurisdiction as:

- Northern and Central California;
- Colorado;
- Hawaii;
- Utah;
- Wyoming;
- territory of Guam.

## Los Angeles jurisdiction currently serviced by San Francisco

Effective 1 August 2025, CGI Los Angeles has formal jurisdiction over:

- Southern California's listed 10 counties;
- Arizona;
- Nevada;
- New Mexico.

However, the current CGI San Francisco jurisdiction page explicitly states that **CGI San Francisco will continue to provide consular services for the jurisdiction currently under CGI Los Angeles until further notice**. The current VFS U.S. passport page also routes these locations through the San Francisco VFS application centre.

Runtime clients must therefore distinguish:

- `san_francisco_direct` — direct CGI San Francisco jurisdiction;
- `los_angeles_transition_serviced_by_san_francisco` — formal CGI Los Angeles jurisdiction temporarily serviced through San Francisco;
- `needs_jurisdiction_confirmation` — applicant location is not specific enough to resolve the branch.

## Guardrail

Do not flatten the temporary servicing arrangement into a permanent jurisdiction rule. Because the CGI page says "until further notice," this node requires frequent re-verification and must expire through `stale_after` if not checked.

## Connected process

- [Adult passport re-issue — San Francisco](../processes/india/us/passport/reissue/san-francisco/adult.md)
