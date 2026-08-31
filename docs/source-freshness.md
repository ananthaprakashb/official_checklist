# Official-source freshness and Visa Bulletin monitoring

Official Checklist separates **detection** from **rule changes**. Automation may detect that an authoritative page changed, became unavailable, or passed its reviewed freshness window. It must never infer new eligibility rules or silently rewrite cutoff tables.

## Runtime behavior

Every live catalog process has `verified` and `stale_after` metadata. The runtime enforces that date: a result that would otherwise be `READY` becomes `NEEDS_AUTHORITATIVE_CONFIRMATION` after the process freshness window expires.

`data/source-registry.v1.json` contains critical sources mapped to the live processes that depend on them. Sources can use:

- `content_fingerprint` — scheduled monitoring fetches validated authoritative content and fingerprints its normalized semantic page region.
- `metadata_only` — freshness is enforced from reviewed metadata when reliable automated retrieval is not available.

`data/source-health.v1.json` stores only source-health state transitions for fingerprint sources. It is intentionally not a daily timestamp log.

## Production transport findings

Production smoke tests on GitHub-hosted Actions showed:

- `https://flag.dol.gov/programs/perm` returns HTTP 200 and can be fingerprint monitored.
- `travel.state.gov` returns HTTP 403 to GitHub-hosted runners for both the Visa Bulletin HTML and the official PDF.
- changing the User-Agent does not bypass that block.
- a read-through transport returned a CAPTCHA/challenge page rather than the authoritative State Department content and is therefore not used.

For this reason, State Department Visa Bulletin and NVC sources are `metadata_only` in GitHub Actions. A transport failure caused by bot protection must not be represented to users as an authoritative-source outage.

## Scheduled monitor

`.github/workflows/source-freshness.yml` runs daily and can also be dispatched manually.

For `content_fingerprint` sources it:

1. fetches the authoritative URL;
2. retries transient network/429/5xx failures;
3. extracts the semantic `<main>`/`<article>` region when available;
4. strips scripts/styles/markup and normalizes text;
5. rejects undersized, marker-missing, CAPTCHA, access-denied and challenge responses;
6. creates a baseline on the first validated successful observation;
7. marks a source `changed` when the validated fingerprint differs from the last accepted hash;
8. marks a source `unavailable` only after a real fingerprint source cannot be validated/fetched;
9. persists only source-health state transitions;
10. opens or updates **Official source review required** when human review is needed.

A changed fingerprint is a review signal, not proof that a rule changed.

## Visa Bulletin review policy

Because `travel.state.gov` blocks GitHub-hosted runners, the automation does **not** pretend to detect publication through a failing fetch or a third-party proxy.

Instead:

1. the current DOS bulletin source remains linked to the official State Department URL and is governed by its reviewed `verified` / `stale_after` metadata;
2. beginning on the configured monthly review day (currently UTC day 10), if the next calendar month's bulletin has not been encoded in `data/source-registry.v1.json`, the monitor opens a `visa_bulletin_manual_review_due` reminder;
3. that reminder explicitly makes **no claim that the bulletin has been published**;
4. a reviewer opens the official State Department Visa Bulletin page, determines whether the new bulletin exists, and if so updates the source node, Final Action / Dates-for-Filing tables, evaluator data and regressions;
5. live workflow freshness dates move forward only after that official review.

The review-day setting is an internal operating cadence, not a Department of State publication deadline.

## Reviewing a changed fingerprint source

1. Open the official page and compare it with the corresponding `okf/sources/*.md` node and every linked rule/table.
2. If rules changed, update the OKF source node, questionnaire/evaluator data and regression tests as appropriate.
3. Update the source node's `checked_at`, `verified` and `stale_after` metadata.
4. After reviewing the observed page, accept its fingerprint:

```bash
npm run sources:accept -- <source-id>
```

5. Commit the source/rule updates and `data/source-health.v1.json` together and let the normal merge gate run.

`metadata_only` sources have no fingerprint to accept; their review is represented by explicit source/process metadata updates.

## CI execution guard

Normal PR validation runs the source monitor with `--offline`. This performs registry validation and executes the real CLI entry point without network access. It exists specifically to catch runtime/loader failures such as unsupported top-level `await` while keeping PR CI deterministic and independent of government-site availability.
