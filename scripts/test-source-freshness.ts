import assert from "node:assert/strict";
import { applySourceFreshness, evaluateSourceFreshness, type SourceHealthSnapshot, type SourceRegistrySnapshot } from "../src/core/sourceFreshness";
import type { ProcessCatalogEntry, ProcessPresentation } from "../src/engine/types";

const entry: ProcessCatalogEntry = {
  id: "test-process",
  slug: "test/process",
  country_code: "US",
  country_name: "United States",
  applicant_country: "United States",
  service: "Test",
  title: "Test Process",
  short_title: "Test",
  summary: "Test",
  status: "live",
  verified: "2026-08-30",
  stale_after: "2026-09-13"
};

const presentation: ProcessPresentation = {
  status: "READY",
  title: "Ready",
  subtitle: "Test",
  summary: [],
  blockers: [],
  warnings: [],
  requiredItems: [],
  conditionalItems: [],
  nextStep: "Continue",
  sourcesVerified: "2026-08-30",
  rawResult: { ok: true }
};

const registry: SourceRegistrySnapshot = {
  version: 1,
  sources: [{ id: "source-a", authority: "Official Agency", official_url: "https://example.gov/a", stale_after: "2026-09-13", process_ids: ["test-process"] }]
};

const healthy: SourceHealthSnapshot = { version: 1, sources: { "source-a": { status: "healthy", accepted_fingerprint: "a", observed_fingerprint: "a" } } };
assert.equal(evaluateSourceFreshness(entry, new Date("2026-09-01T12:00:00Z"), registry, healthy).requiresReview, false);
assert.equal(applySourceFreshness(entry, presentation, new Date("2026-09-01T12:00:00Z"), registry, healthy).status, "READY");

const changed: SourceHealthSnapshot = { version: 1, sources: { "source-a": { status: "changed", accepted_fingerprint: "a", observed_fingerprint: "b" } } };
const changedResult = applySourceFreshness(entry, presentation, new Date("2026-09-01T12:00:00Z"), registry, changed);
assert.equal(changedResult.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(changedResult.warnings.some((item) => item.includes("changed")));

const unavailable: SourceHealthSnapshot = { version: 1, sources: { "source-a": { status: "unavailable", accepted_fingerprint: "a", http_status: 503 } } };
assert.equal(applySourceFreshness(entry, presentation, new Date("2026-09-01T12:00:00Z"), registry, unavailable).status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const staleProcess = { ...entry, stale_after: "2026-08-31" };
assert.equal(applySourceFreshness(staleProcess, presentation, new Date("2026-09-01T12:00:00Z"), registry, healthy).status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const alreadyBlocked = { ...presentation, status: "NOT_READY" as const };
assert.equal(applySourceFreshness(entry, alreadyBlocked, new Date("2026-09-01T12:00:00Z"), registry, changed).status, "NOT_READY");

console.log("PASS Source Freshness Tests: healthy, changed, unavailable, stale-process and NOT_READY precedence.");
