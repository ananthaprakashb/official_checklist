# Official Checklist

**Official Checklist** is an open, machine-verifiable platform for complicated government and consular processes across countries.

The project converts official instructions into OKF decision graphs so a user can determine the **correct process branch before** submitting a form, paying a fee, mailing documents, or attending an appointment.

Core principle:

> **Never tell a user what documents to collect until the correct application type has been verified.**

## Phase 4 product

The web application is now a **process catalog + reusable process engine**, rather than a passport-specific screen.

The first live process is:

- India → Passport → Re-issue → applicants in the United States
- clean process route: `india/passport/reissue/us`

The catalog also carries planned processes (currently OCI in the U.S. and U.S. Passport services) as `coming_soon`. A planned process cannot become `live` until its OKF bundle, questionnaire and evaluator are registered and pass CI.

## Architecture

```text
Authoritative official sources
            ↓
       OKF knowledge graph
            ↓
 Versioned questionnaires
            ↓
   Process catalog / registry
            ↓
Reusable deterministic process engine
       ↙                 ↘
 React web catalog       future API/mobile clients
            ↓
READY / NOT_READY / NEEDS_AUTHORITATIVE_CONFIRMATION
```

The shared React shell knows how to:

- show the global process catalog;
- route to a process by slug;
- render a registered questionnaire;
- persist draft answers locally;
- display standardized blockers, warnings, checklists and next steps;
- print/save results and export result JSON.

Process-specific rules stay in evaluator modules and OKF nodes rather than `App.tsx`.

## Current runtime safeguards

- critical OKF nodes require authoritative source nodes and freshness metadata;
- broken internal graph references fail CI;
- every questionnaire/rule-node reference is validated;
- evaluator regression tests cover high-risk routing and mismatch cases;
- process-engine tests require every catalog entry marked `live` to have a registered evaluator;
- TypeScript checking and the production Vite build are merge gates;
- unresolved official-rule ambiguity is surfaced instead of guessed.

## Cloudflare Pages publication

This is a static React/Vite site. It does **not** require the Cloudflare Vite Worker plugin or a Wrangler Worker entrypoint.

Use these Cloudflare Pages build settings:

```text
Framework preset: React (Vite)
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 22
```

The default Vite production base is `/`, which works for `*.pages.dev` and custom domains. No `VITE_BASE_PATH` variable is required for Cloudflare Pages.

## GitHub Pages publication

Merges to `main` are prepared for automatic publication with `.github/workflows/deploy-pages.yml`.

The repository Pages target is:

```text
https://ananthaprakashb.github.io/official_checklist/
```

The Vite production base path is configurable through `VITE_BASE_PATH`. Static/custom-domain builds default to `/`; the GitHub Pages workflow explicitly sets `VITE_BASE_PATH=/official_checklist/`. A Pages-safe `404.html` restores clean process URLs for direct links.

GitHub repository settings must use **Pages → Build and deployment → Source: GitHub Actions** for the deployment workflow to publish.

## Repository layout

```text
okf/                       authoritative OKF knowledge graph
data/process-catalog.v1.json
                            global process catalog
data/.../questionnaire.*   versioned intake contracts
schemas/                   result contracts
src/core/                  process-specific deterministic evaluators
src/engine/                catalog registry, routing and shared engine contracts
src/                       React catalog + generic process runner
scripts/                   graph/data/evaluator/engine validation
docs/adding-a-process.md   process onboarding guide
.github/workflows/          validation and Pages deployment
```

## Adding another process

See [`docs/adding-a-process.md`](docs/adding-a-process.md).

The intended sequence is:

1. authoritative sources and OKF graph;
2. versioned questionnaire;
3. deterministic evaluator;
4. regression scenarios;
5. catalog entry as `coming_soon`;
6. registry module;
7. switch catalog status to `live` only after CI passes.

## Local development

```bash
npm install
npm run dev
```

For a clean reproducible install, especially after dependency/config changes:

```bash
npm ci
npm run build
```

## Validation and production build

```bash
npm run validate
npm run build
```

## Independence and safety

This is an independent guidance and validation project. It is **not affiliated with or endorsed by any government, embassy, consulate, VFS Global, or other service provider**. Official sources remain authoritative. The system should surface uncertainty or source conflicts rather than silently inventing a rule.
