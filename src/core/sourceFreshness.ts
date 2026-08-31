import registryJson from "../../data/source-registry.v1.json";
import healthJson from "../../data/source-health.v1.json";
import type { ProcessCatalogEntry, ProcessPresentation } from "../engine/types";

export type MonitoredSource = {
  id: string;
  authority: string;
  official_url: string;
  stale_after: string;
  process_ids: string[];
};

export type SourceHealthRecord = {
  status: "healthy" | "changed" | "unavailable";
  accepted_fingerprint?: string;
  observed_fingerprint?: string;
  last_changed?: string;
  http_status?: number;
};

export type SourceHealthSnapshot = {
  version: number;
  sources: Record<string, SourceHealthRecord>;
};

export type SourceRegistrySnapshot = {
  version: number;
  sources: MonitoredSource[];
};

function expired(dateText: string | undefined, now: Date): boolean {
  if (!dateText) return false;
  const end = new Date(`${dateText}T23:59:59.999Z`);
  return Number.isFinite(end.getTime()) && now.getTime() > end.getTime();
}

export function evaluateSourceFreshness(
  entry: ProcessCatalogEntry,
  now: Date = new Date(),
  registry: SourceRegistrySnapshot = registryJson as SourceRegistrySnapshot,
  health: SourceHealthSnapshot = healthJson as SourceHealthSnapshot
) {
  const issues: string[] = [];
  const affectedSources = registry.sources.filter((source) => source.process_ids.includes(entry.id));

  if (expired(entry.stale_after, now)) {
    issues.push(`Process verification expired after ${entry.stale_after}. Re-review authoritative sources before treating this workflow as READY.`);
  }

  for (const source of affectedSources) {
    if (expired(source.stale_after, now)) {
      issues.push(`${source.authority} source review is overdue after ${source.stale_after}.`);
    }
    const record = health.sources[source.id];
    if (record?.status === "changed") {
      issues.push(`${source.authority} changed after the last accepted fingerprint. Review the official source before relying on this workflow.`);
    } else if (record?.status === "unavailable") {
      issues.push(`${source.authority} could not be verified by the source monitor. Confirm the official source manually.`);
    }
  }

  return {
    requiresReview: issues.length > 0,
    issues,
    monitoredSources: affectedSources.length
  };
}

export function applySourceFreshness(
  entry: ProcessCatalogEntry,
  presentation: ProcessPresentation,
  now: Date = new Date(),
  registry?: SourceRegistrySnapshot,
  health?: SourceHealthSnapshot
): ProcessPresentation {
  const freshness = evaluateSourceFreshness(entry, now, registry, health);
  const status = freshness.requiresReview && presentation.status === "READY"
    ? "NEEDS_AUTHORITATIVE_CONFIRMATION"
    : presentation.status;
  const summary = [...presentation.summary];
  summary.push({
    label: "Source health",
    value: freshness.requiresReview
      ? "Review required before relying on READY"
      : freshness.monitoredSources > 0
        ? `${freshness.monitoredSources} critical source(s) monitored · freshness current`
        : "Process freshness current"
  });
  const warnings = freshness.requiresReview
    ? [...presentation.warnings, ...freshness.issues.filter((issue) => !presentation.warnings.includes(issue))]
    : presentation.warnings;
  const rawResult = presentation.rawResult && typeof presentation.rawResult === "object"
    ? { ...(presentation.rawResult as Record<string, unknown>), source_health: freshness }
    : presentation.rawResult;

  return { ...presentation, status, summary, warnings, rawResult };
}
