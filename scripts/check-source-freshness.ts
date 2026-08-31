import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const registryPath = resolve("data/source-registry.v1.json");
const healthPath = resolve("data/source-health.v1.json");
const reportPath = resolve("reports/source-freshness.json");

type RegistrySource = {
  id: string;
  authority: string;
  official_url: string;
  stale_after: string;
  monitor: "content_fingerprint" | "metadata_only";
  process_ids: string[];
};
type Registry = { version: number; sources: RegistrySource[] };
type HealthRecord = {
  status: "healthy" | "changed" | "unavailable";
  accepted_fingerprint?: string;
  observed_fingerprint?: string;
  last_changed?: string;
  http_status?: number;
};
type Health = { version: number; sources: Record<string, HealthRecord> };
type ReviewIssue = { source_id?: string; kind: string; detail: string; url?: string };
type Observation = { source_id: string; status: string; http_status?: number };

function normalizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(body: string): string {
  return createHash("sha256").update(normalizeHtml(body)).digest("hex");
}

function dateExpired(dateText: string, now: Date): boolean {
  const end = new Date(`${dateText}T23:59:59.999Z`);
  return Number.isFinite(end.getTime()) && now.getTime() > end.getTime();
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "official-checklist-source-monitor/1.0 (+https://github.com/ananthaprakashb/official_checklist)",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5"
      },
      signal: AbortSignal.timeout(25000)
    });
    return { ok: response.ok, status: response.status, body: response.ok ? await response.text() : "" };
  } catch {
    return { ok: false, status: 0, body: "" };
  }
}

function nextMonthBulletinUrl(now: Date): { url: string; label: string } {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const year = next.getUTCFullYear();
  const month = next.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const fiscalYear = next.getUTCMonth() >= 9 ? year + 1 : year;
  return {
    url: `https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/${fiscalYear}/visa-bulletin-for-${month.toLowerCase()}-${year}.html`,
    label: `${month} ${year}`
  };
}

function writeReport(report: unknown) {
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

async function main() {
  const registry = JSON.parse(readFileSync(registryPath, "utf8")) as Registry;
  const health = JSON.parse(readFileSync(healthPath, "utf8")) as Health;
  const today = new Date();
  const isoDay = today.toISOString().slice(0, 10);
  const reviewIssues: ReviewIssue[] = [];
  const observations: Observation[] = [];

  for (const source of registry.sources) {
    if (dateExpired(source.stale_after, today)) {
      reviewIssues.push({ source_id: source.id, kind: "stale_metadata", detail: `${source.authority} review date expired after ${source.stale_after}.`, url: source.official_url });
    }
    if (source.monitor !== "content_fingerprint") continue;

    const fetched = await fetchText(source.official_url);
    const previous = health.sources[source.id];
    if (!fetched.ok) {
      health.sources[source.id] = {
        status: "unavailable",
        accepted_fingerprint: previous?.accepted_fingerprint,
        observed_fingerprint: previous?.observed_fingerprint,
        last_changed: previous?.last_changed,
        http_status: fetched.status
      };
      reviewIssues.push({ source_id: source.id, kind: "source_unavailable", detail: `${source.authority} returned HTTP ${fetched.status || "network error"}.`, url: source.official_url });
      observations.push({ source_id: source.id, status: "unavailable", http_status: fetched.status });
      continue;
    }

    const observed = fingerprint(fetched.body);
    if (!previous?.accepted_fingerprint) {
      health.sources[source.id] = { status: "healthy", accepted_fingerprint: observed, observed_fingerprint: observed, http_status: fetched.status };
      observations.push({ source_id: source.id, status: "baseline_created", http_status: fetched.status });
      continue;
    }

    if (previous.accepted_fingerprint !== observed) {
      health.sources[source.id] = {
        status: "changed",
        accepted_fingerprint: previous.accepted_fingerprint,
        observed_fingerprint: observed,
        last_changed: previous.last_changed ?? isoDay,
        http_status: fetched.status
      };
      reviewIssues.push({ source_id: source.id, kind: "content_changed", detail: `${source.authority} content fingerprint differs from the last accepted review.`, url: source.official_url });
      observations.push({ source_id: source.id, status: "changed", http_status: fetched.status });
    } else {
      health.sources[source.id] = { status: "healthy", accepted_fingerprint: previous.accepted_fingerprint, observed_fingerprint: observed, http_status: fetched.status };
      observations.push({ source_id: source.id, status: previous.status === "unavailable" ? "recovered" : "healthy", http_status: fetched.status });
    }
  }

  const discovery = nextMonthBulletinUrl(today);
  if (!registry.sources.some((source) => source.official_url === discovery.url)) {
    const fetched = await fetchText(discovery.url);
    const expectedHeading = `visa bulletin for ${discovery.label}`.toLowerCase();
    if (fetched.ok && normalizeHtml(fetched.body).toLowerCase().includes(expectedHeading)) {
      reviewIssues.push({ kind: "new_visa_bulletin", detail: `${discovery.label} Visa Bulletin is published and is not yet encoded in the source registry/cutoff tables.`, url: discovery.url });
    }
  }

  const orderedHealth: Health = {
    version: 1,
    sources: Object.fromEntries(Object.entries(health.sources).sort(([a], [b]) => a.localeCompare(b)))
  };
  const nextHealth = `${JSON.stringify(orderedHealth, null, 2)}\n`;
  const oldHealth = readFileSync(healthPath, "utf8");
  if (oldHealth !== nextHealth) writeFileSync(healthPath, nextHealth);

  writeReport({
    checked_at: today.toISOString(),
    review_required: reviewIssues.length > 0,
    issues: reviewIssues,
    observations,
    next_bulletin_checked: discovery
  });

  console.log(`Source freshness check: ${observations.length} fingerprint source(s), ${reviewIssues.length} review issue(s).`);
  for (const issue of reviewIssues) console.log(`REVIEW ${issue.kind}: ${issue.detail}`);
  if (reviewIssues.length > 0) process.exitCode = 2;
}

main().catch((error: unknown) => {
  const detail = error instanceof Error ? error.stack ?? error.message : String(error);
  writeReport({
    checked_at: new Date().toISOString(),
    review_required: true,
    issues: [{ kind: "monitor_internal_error", detail }],
    observations: []
  });
  console.error("Source freshness monitor failed before completing authoritative checks.");
  console.error(detail);
  process.exitCode = 1;
});
