# Official Checklist

**Official Checklist** is an open, machine-verifiable knowledge base for complicated government and consular processes across countries.

The project converts official instructions into OKF decision graphs so a user can determine the **correct process branch before** submitting a form, paying a fee, mailing documents, or attending an appointment.

## Why this exists

Official procedures are often spread across government portals, consulates, contracted service providers, PDFs, FAQs, and advisories. A checklist can still be wrong when the applicant picked the wrong service type. Official Checklist therefore validates the decision path first and the documents second.

Core principle:

> **Never tell a user what documents to collect until the correct application type has been verified.**

## OKF conventions

This repository follows the existing OKF v0.2 strict-link approach:

1. **Phase 1 — Schema Validation**: Markdown concept nodes use strongly typed YAML frontmatter.
2. **Phase 2 — Graph Integrity**: every internal Markdown link must resolve; broken references fail validation.
3. **Phase 3 — Official Process Guardrails**: critical process nodes must cite authoritative sources, freshness metadata is checked, and unsafe/link-pattern violations fail validation.

`/okf/index.md` is the canonical machine-readable entrypoint and `/okf/log.md` is the changelog. Those two files intentionally do not require YAML frontmatter.

## First reference process

The initial implementation covers:

- Country/service authority: India
- Applicant location: United States
- Jurisdiction: Consulate General of India, San Francisco
- Service: Indian passport
- Process: adult passport re-issue
- Initial validation focus: application classification, jurisdiction, re-issue reason, regular/Tatkaal routing, and pre-submission blockers

See [`okf/index.md`](okf/index.md).

## Repository layout

```text
okf/                      OKF knowledge graph
  index.md                canonical entrypoint
  log.md                  change log
  jurisdictions/          jurisdiction nodes
  decisions/              routing and eligibility decisions
  processes/              end-to-end official processes
  sources/                source/provenance nodes
scripts/                   deterministic validators
.github/workflows/         CI validation pipeline
```

## Local validation

```bash
npm install
npm run validate
```

## Independence and safety

This is an independent guidance and validation project. It is **not affiliated with or endorsed by any government, embassy, consulate, VFS Global, or other service provider**. Official sources remain authoritative. The project should surface uncertainty or source conflicts rather than silently inventing a rule.
