# Official-source freshness and Visa Bulletin monitoring

Official Checklist separates **detection** from **rule changes**. Automation may detect that an authoritative page changed, disappeared, became stale, or that a new Department of State Visa Bulletin was published. It must never infer new eligibility rules or silently rewrite cutoff tables.

## Runtime behavior

Every live catalog process has `verified` and `stale_after` metadata. The runtime now enforces that date: a result that would otherwise be `READY` becomes `NEEDS_AUTHORITATIVE_CONFIRMATION` after the process freshness window expires.

`data/source-registry.v1.json` contains high-change critical sources mapped to the live processes that depend on them. Sources can use:

- `content_fingerprint` — scheduled monitoring fetches and fingerprints normalized page text.
- `metadata_only` — freshness is enforced from reviewed metadata, avoiding unreliable bot polling for sites that aggressively block automation.

`data/source-health.v1.json` stores only source-health state transitions. It is intentionally not a daily timestamp log.

## Scheduled monitor

`.github/workflows/source-freshness.yml` runs daily and can also be dispatched manually.

For content-fingerprint sources it:

1. fetches the authoritative URL;
2. strips scripts/styles/markup and hashes the normalized page text;
3. creates a baseline on the first successful observation;
4. marks a source `changed` when the observed hash differs from the last accepted hash;
5. marks a source `unavailable` when it cannot be fetched;
6. checks whether the next calendar month's Department of State Visa Bulletin has appeared;
7. persists only source-health state transitions;
8. opens or updates **Official source review required** when human review is needed.

A changed fingerprint is a review signal, not proof that a rule changed.

## Reviewing a changed source

1. Open the official page and compare it with the corresponding `okf/sources/*.md` node and every linked rule/table.
2. If rules changed, update the OKF source node, questionnaire/evaluator data and regression tests as appropriate.
3. Update the source node's `checked_at`, `verified` and `stale_after` metadata.
4. After reviewing the observed page, accept its fingerprint:

```bash
npm run sources:accept -- source-dos-visa-bulletin-sep-2026
```

5. Commit the source/rule updates and `data/source-health.v1.json` together and let the normal merge gate run.

## Visa Bulletin policy

The current bulletin page is fingerprinted because DOS can retrogress a category or make it unavailable during the month. The monitor also probes the next month's expected bulletin URL. Publication of a new bulletin opens a review issue but does **not** create cutoff tables automatically.

A reviewer must encode the new Final Action and Dates-for-Filing tables, update the relevant bulletin source node and tests, and then move the live process freshness window forward.
