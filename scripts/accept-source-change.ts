import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sourceId = process.argv[2];
if (!sourceId) {
  console.error("Usage: npm run sources:accept -- <source-id>");
  process.exit(1);
}

const healthPath = resolve("data/source-health.v1.json");
const health = JSON.parse(readFileSync(healthPath, "utf8")) as {
  version: number;
  sources: Record<string, { status: string; accepted_fingerprint?: string; observed_fingerprint?: string; last_changed?: string; http_status?: number }>;
};
const record = health.sources[sourceId];
if (!record) throw new Error(`No monitored health record exists for ${sourceId}. Run sources:check first.`);
if (!record.observed_fingerprint) throw new Error(`${sourceId} has no observed fingerprint to accept.`);

health.sources[sourceId] = {
  status: "healthy",
  accepted_fingerprint: record.observed_fingerprint,
  observed_fingerprint: record.observed_fingerprint,
  http_status: record.http_status
};
writeFileSync(healthPath, `${JSON.stringify(health, null, 2)}\n`);
console.log(`Accepted the observed fingerprint for ${sourceId}.`);
console.log("Review and update the corresponding OKF source node checked_at/verified/stale_after metadata before merging this acceptance.");
