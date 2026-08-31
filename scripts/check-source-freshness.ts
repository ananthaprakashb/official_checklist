import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const registryPath = resolve("data/source-registry.v1.json");
const healthPath = resolve("data/source-health.v1.json");
const reportPath = resolve("reports/source-freshness.json");
const offline = process.argv.includes("--offline");

type RegistrySource = {
  id: string;
  authority: string;
  official_url: string;
  stale_after: string;
  monitor: "content_fingerprint" | "metadata_only";
  expected_markers?: string[];
  min_normalized_chars?: number;
  process_ids: string[];
};
type Registry = {
  version: number;
  policy?: {
    visa_bulletin_review_day_utc?: number;
  };
  sources: RegistrySource[];
};
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

function extractSemanticRegion(html: string): string {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main?.[1]) return main[1];
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  return article?.[1] ?? html;
}

function normalizeHtml(html: string): string {
  return extractSemanticRegion(html)
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprintNormalized(normalized: string): string {
  return createHash("sha256").update(normalized).digest("hex");
}

function dateExpired(dateText: string, now: Date): boolean {
  const end = new Date(`${dateText}T23:59:59.999Z`);
  return Number.isFinite(end.getTime()) && now.getTime() > end.getTime();
}

function retryable(status: number): boolean {
  return status === 0 || status === 408 || status === 425 || status === 429 || status >= 500;
}

function delay(ms: number) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function fetchOnce(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "official-checklist-source-monitor/1.1 (+https://github.com/ananthaprakashb/official_checklist)",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5"
      },
      signal: AbortSignal.timeout(25000)
    });
    return { ok: response.ok, status: response.status, body: response.ok ? await response.text() : "" };
  } catch {
    return { ok: false, status: 0, body: "" };
  }
}

async function fetchText(url: string, attempts = 3): Promise<{ ok: boolean; status: number; body: string; attempts: number }> {
  let latest = { ok: false, status: 0, body: "" };
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    latest = await fetchOnce(url);
    if (latest.ok || !retryable(latest.status) || attempt === attempts) return { ...latest, attempts: attempt };
    await delay(350 * attempt);
  }
  return { ...latest, attempts };
}

function validateFetchedContent(source: RegistrySource, body: string): { valid: boolean; normalized: string; detail?: string } {
  const normalized = normalizeHtml(body);
  const minChars = source.min_normalized_chars ?? 200;
  if (normalized.length < minChars) {
    return { valid: false, normalized, detail: `normalized content was only ${normalized.length} characters; expected at least ${minChars}` };
  }
  const lower = normalized.toLowerCase();
  const missing = (source.expected_markers ?? []).filter((marker) => !lower.includes(marker.toLowerCase()));
  if (missing.length > 0) {
    return { valid: false, normalized, detail: `expected marker(s) missing: ${missing.join(", ")}` };
  }
  if (/just a moment|captcha|access denied|request unsuccessful/i.test(normalized.slice(0, 1500))) {
    return { valid: false, normalized, detail: "response resembles an access-control or challenge page" };
  }
  return { valid: true, normalized };
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

  if (offline) {
    const fingerprintSources = registry.sources.filter((source) => source.monitor === "content_fingerprint");
    for (const source of fingerprintSources) {
      if (!source.expected_markers?.length) throw new Error(`${source.id}: content_fingerprint requires expected_markers`);
      if (!source.min_normalized_chars || source.min_normalized_chars < 100) throw new Error(`${source.id}: content_fingerprint requires min_normalized_chars >= 100`);
    }
    console.log(`Source monitor offline execution OK: ${registry.sources.length} source(s), ${fingerprintSources.length} fingerprint source(s).`);
    return;
  }

  const today = new Date();
  const isoDay = today.toISOString().slice(0, 10);
  const reviewIssues: ReviewIssue[] = [];
  const observations: Observation[] = [];

  for (const source of registry.sources) {
    if (dateExpired(source.stale_after, today)) {
      reviewIssues.push({ source_id: source.id, kind: "stale_metadata", detail: `${source.authority} review date expired after ${source.stale_after}.`, url: source.official_url });
    }

    if (source.monitor === "metadata_only") {
      // A source previously fingerprinted may be moved to metadata-only after a
      // production transport limitation is confirmed. Never let the old network
      // state keep poisoning runtime results after that policy change.
      delete health.sources[source.id];
      continue;
    }

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
      reviewIssues.push({ source_id: source.id, kind: "source_unavailable", detail: `${source.authority} returned HTTP ${fetched.status || "network error"} after ${fetched.attempts} attempt(s).`, url: source.official_url });
      observations.push({ source_id: source.id, status: "unavailable", http_status: fetched.status });
      continue;
    }

    const content = validateFetchedContent(source, fetched.body);
    if (!content.valid) {
      health.sources[source.id] = {
        status: "unavailable",
        accepted_fingerprint: previous?.accepted_fingerprint,
        observed_fingerprint: previous?.observed_fingerprint,
        last_changed: previous?.last_changed,
        http_status: fetched.status
      };
      reviewIssues.push({ source_id: source.id, kind: "invalid_source_response", detail: `${source.authority} returned HTTP 200 but failed content validation: ${content.detail}.`, url: source.official_url });
      observations.push({ source_id: source.id, status: "invalid_response", http_status: fetched.status });
      continue;
    }

    const observed = fingerprintNormalized(content.normalized);
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
  const nextBulletinEncoded = registry.sources.some((source) => source.official_url === discovery.url);
  const reviewDay = registry.policy?.visa_bulletin_review_day_utc ?? 10;
  if (!nextBulletinEncoded && today.getUTCDate() >= reviewDay) {
    reviewIssues.push({
      kind: "visa_bulletin_manual_review_due",
      detail: `${discovery.label} Visa Bulletin is not yet encoded. GitHub-hosted runners are blocked by travel.state.gov, so manually check the official page and update the source node/cutoff tables if a new bulletin is published. This is a calendar review reminder, not a publication claim.`,
      url: discovery.url
    });
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
    visa_bulletin_review: {
      next_expected_route: discovery,
      encoded: nextBulletinEncoded,
      manual_review_day_utc: reviewDay,
      transport_note: "travel.state.gov blocks GitHub-hosted Actions runners; publication is reviewed manually against the official State Department source"
    }
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
