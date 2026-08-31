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
  for (const processId of source.process_ids) assert.ok(processIds.has(processId), `${source.id}: unknown process id ${processId}`);
}
assert.ok(realRegistry.sources.some((source) => source.id.includes("visa-bulletin") && source.monitor === "content_fingerprint"), "current DOS Visa Bulletin must be fingerprint monitored");

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

console.log(`PASS Source Freshness Tests: ${realRegistry.sources.length} registered critical sources plus healthy/changed/unavailable/stale runtime guards.`);
