# Official Checklist

**Official Checklist** is an open, machine-verifiable system for complicated government and consular processes across countries.

The project converts official instructions into OKF decision graphs so a user can determine the **correct process branch before** submitting a form, paying a fee, mailing documents, or attending an appointment.

## Why this exists

Official procedures are often spread across government portals, consulates, contracted service providers, PDFs, FAQs, and advisories. A checklist can still be wrong when the applicant picked the wrong service type. Official Checklist therefore validates the decision path first and the documents second.

Core principle:

> **Never tell a user what documents to collect until the correct application type has been verified.**

## Current product

The first interactive evaluator covers Indian passport Re-issue for applicants in the United States, beginning with the Consulate General of India, San Francisco jurisdiction.

The browser flow:

1. asks process facts from the versioned questionnaire contract;
2. resolves applicant category, jurisdiction, Re-issue reasons, Regular/Tatkaal route and fee branch;
3. compares submitted Government/VFS selections when the applicant has already started the process;
4. returns `READY`, `NOT_READY`, or `NEEDS_AUTHORITATIVE_CONFIRMATION`;
5. generates required and conditional document checklists;
6. allows printing/saving the personalized result or copying its JSON representation.

Answers are stored only in browser local storage in this prototype. Passport documents are not uploaded.

## Architecture

```text
Authoritative official sources
            ↓
       OKF graph
            ↓
Versioned questionnaire contract
            ↓
Reusable TypeScript evaluator
       ↙             ↘
 React web UI      future API/mobile clients
            ↓
READY / NOT_READY / NEEDS_AUTHORITATIVE_CONFIRMATION
```

### OKF validation

This repository follows the OKF v0.2 strict-link approach:

1. **Schema Validation** — Markdown concept nodes use strongly typed YAML frontmatter.
2. **Graph Integrity** — every internal Markdown link must resolve; broken references fail validation.
3. **Official Process Guardrails** — critical process nodes must cite authoritative sources, freshness metadata is checked, and unsafe/link-pattern violations fail validation.

`/okf/index.md` is the canonical knowledge entrypoint and `/okf/log.md` is the changelog.

### Runtime safeguards

- versioned questionnaire data is validated against referenced rule nodes;
- evaluator regression tests cover critical routing and mismatch scenarios;
- TypeScript type checking runs in CI;
- the production web build is a merge gate;
- unresolved official-rule ambiguity is surfaced instead of guessed.

## Repository layout

```text
okf/                       OKF knowledge graph
data/                      machine-readable questionnaire contracts
schemas/                   result contracts
src/core/                  reusable deterministic evaluator
src/                       React web application
scripts/                   graph/data/evaluator validation
.github/workflows/          CI pipeline
```

## Local development

```bash
npm install
npm run dev
```

## Validation and production build

```bash
npm run validate
npm run build
```

## Independence and safety

This is an independent guidance and validation project. It is **not affiliated with or endorsed by any government, embassy, consulate, VFS Global, or other service provider**. Official sources remain authoritative. The system should surface uncertainty or source conflicts rather than silently inventing a rule.
