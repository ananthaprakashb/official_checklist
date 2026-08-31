---
type: process
id: usa-social-security-retirement-family-survivor
title: Social Security Retirement, Family and Survivor Benefits
generated: 2026-08-31
verified: 2026-08-31
stale_after: 2026-09-30
status: verified
sources:
  - ../../sources/ssa-retirement-aug-2026.md
  - ../../sources/ssa-family-benefits-aug-2026.md
  - ../../sources/ssa-survivor-benefits-aug-2026.md
  - ../../sources/ssa-retirement-claiming-rules-aug-2026.md
  - ../../sources/ssa-earnings-test-2026.md
  - ../../sources/ssa-international-payments-aug-2026.md
---

# Social Security Retirement, Family and Survivor Benefits

Classify the benefit family and application channel before comparing payment amounts or choosing a claiming strategy.

## Required classification order

1. Identify whether the request is the worker's own retirement benefit, a spouse/divorced-spouse family benefit, a survivor benefit, a child/dependent-parent benefit, a work/earnings question, an existing-benefit switch/comparison, or an international-payment question.
2. Verify age, relationship/marriage duration and worker-status facts required for the selected family.
3. Keep retirement/spouse deemed-filing rules separate from survivor-benefit sequencing.
4. Apply the 2026 earnings-test branch only when the recipient is below full retirement age; do not treat earnings above the threshold as loss of underlying eligibility.
5. Route survivor applications to SSA phone/office channels because SSA does not currently accept them online.
6. Route residence/work abroad through SSA international/payment-screening tools rather than assuming domestic payment rules.
7. Do not recommend a claiming age or benefit-switch strategy solely from generic rules. Personal benefit amounts, earnings history and household facts require SSA estimates or individualized financial analysis.

## Status rules

- `READY`: the correct SSA benefit/application family is identified and no known branch prerequisite conflicts with the supplied facts.
- `NOT_READY`: a concrete threshold or relationship prerequisite conflicts with the selected route, such as retirement before age 62, a short divorced-spouse marriage, or a survivor age below the ordinary threshold without a qualifying child/disability basis.
- `NEEDS_AUTHORITATIVE_CONFIRMATION`: SSA must resolve insured status, disability, exceptional relationship/remarriage facts, competing-benefit amounts, international payment eligibility, or another individualized determination.
