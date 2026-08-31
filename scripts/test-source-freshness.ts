import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import catalogJson from "../data/process-catalog.v1.json";
import registryJson from "../data/source-registry.v1.json";
import { applySourceFreshness, evaluateSourceFreshness, type SourceHealthSnapshot, type SourceRegistrySnapshot } from "../src/core/sourceFreshness";
import type { ProcessCatalogEntry, ProcessPresentation } from "../src/engine/types";

const realRegistry = registryJson as typeof registryJson;
const processIds = new Set(catalogJson.processes.map((process) => process.id));
assert.equal(new Set(realRegistry.sources.map((source) => source.id)).size, realRegistry.sources.length, "source-registry ids must be unique");
for (const source of realRegistry.sources) {
  assert.ok(source.official_url.startsWith("https://"), `${source.id}: official_url must use https`);
  assert.ok(existsSync(source.okf_path), `${source.id}: missing OKF source node ${source.okf_path}`);
  assert.ok(source.monitor === "content_fingerprint" || source.monitor === "metadata_only", `${source.id}: invalid monitor mode`);
  if (source.monitor === "content_fingerprint") {
    assert.ok("expected_markers" in source && Array.isArray(source.expected_markers) && source.expected_markers.length > 0, `${source.id}: fingerprint sources require expected markers`);
    assert.ok("min_normalized_chars" in source && typeof source.min_normalized_chars === "number" && source.min_normalized_chars >= 100, `${source.id}: fingerprint sources require minimum validated content size`);
  }
  for (const processId of source.process_ids) assert.ok(processIds.has(processId), `${source.id}: unknown process id ${processId}`);
}
const visaBulletin = realRegistry.sources.find((source) => source.id === "source-dos-visa-bulletin-sep-2026");
assert.equal(visaBulletin?.monitor, "metadata_only", "DOS Visa Bulletin must not be direct-polled from GitHub Actions while travel.state.gov blocks runners");
const nvc = realRegistry.sources.find((source) => source.id === "source-dos-nvc-ds260-aug-2026");
assert.equal(nvc?.monitor, "metadata_only", "DOS NVC must use metadata freshness while travel.state.gov blocks GitHub Actions");
const dol = realRegistry.sources.find((source) => source.id === "source-dol-perm-aug-2026");
assert.equal(dol?.monitor, "content_fingerprint", "DOL PERM should retain real content fingerprint monitoring");
assert.equal(realRegistry.policy.discovery, "visa_bulletin_calendar_review");
assert.ok(realRegistry.policy.visa_bulletin_review_day_utc >= 1 && realRegistry.policy.visa_bulletin_review_day_utc <= 28);

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

console.log(`PASS Source Freshness Tests: ${realRegistry.sources.length} registered critical sources with production-safe monitor modes plus runtime guards.`);
