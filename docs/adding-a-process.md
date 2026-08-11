# Adding an Official Process

Phase 4 separates the product shell from process-specific logic. A new official process should be added as a registered module instead of adding conditional branches to `App.tsx`.

## 1. Build the authoritative OKF bundle

Add source, jurisdiction, decision, requirement, fee, submission and validation nodes under `okf/`. Critical rules must cite authoritative sources and carry verification/staleness dates.

Run:

```bash
npm run validate:okf
```

## 2. Add a versioned questionnaire

Create a questionnaire under `data/<country>/<service>/.../questionnaire.vN.json`. Keep the questionnaire focused on facts required to select the correct official branch. Avoid asking the user to interpret government terminology when the engine can derive it.

Every referenced rule node must resolve.

## 3. Implement the deterministic evaluator

Keep process-specific decisions outside the UI. The evaluator should accept questionnaire answers and return a deterministic result with blockers, warnings, required/conditional items, next step and source-verification date.

Rules that are incomplete, stale or conflicting must resolve to `NEEDS_AUTHORITATIVE_CONFIRMATION` instead of being guessed.

## 4. Add the catalog entry

Add the process to `data/process-catalog.v1.json`.

Use `status: "coming_soon"` while the OKF/questionnaire/evaluator are incomplete. Change it to `live` only when the evaluator module is registered and passes CI.

Each live entry must have a unique `id`, clean route `slug`, module id, questionnaire id and freshness metadata.

## 5. Register the module

Register the process in `src/engine/registry.ts` with:

- catalog entry;
- questionnaire;
- evaluator;
- result presenter;
- question labels/hints;
- official source links.

The React application should not need process-specific branching after registration.

## 6. Add regression scenarios

Add evaluator tests for the highest-risk mistakes: wrong service type, wrong jurisdiction, eligibility exclusions, fee/checklist mismatches, missing mandatory evidence and known official-source ambiguity.

`npm run test:engine` also verifies that every catalog process marked `live` is registered.

## 7. Validate and build

```bash
npm run validate
npm run build
```

A merge to `main` triggers the GitHub Pages workflow. The published catalog automatically exposes the registered live process at its catalog slug.
