import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";
import YAML from "yaml";
import { z } from "zod";

const ROOT = resolve(process.cwd(), "okf");
const FRONTMATTER_EXEMPT = new Set(["index.md", "log.md"]);
const CRITICAL_TYPES = new Set(["process", "decision", "jurisdiction", "validation-rule"]);

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const idPattern = /^[a-z0-9][a-z0-9-]{2,100}$/;

const baseSchema = z.object({
  type: z.enum([
    "process",
    "decision",
    "question",
    "requirement",
    "document",
    "form",
    "step",
    "validation-rule",
    "exception",
    "fee",
    "appointment-rule",
    "submission-method",
    "source",
    "jurisdiction"
  ]),
  id: z.string().regex(idPattern),
  title: z.string().min(3),
  generated: z.string().regex(isoDate),
  verified: z.string().regex(isoDate),
  stale_after: z.string().regex(isoDate),
  status: z.enum(["draft", "verified", "needs-review", "conflict"]).default("draft"),
  sources: z.array(z.string().min(1)).optional(),
  source_level: z.number().int().min(1).max(6).optional(),
  authority: z.string().min(2).optional(),
  official_url: z.string().url().optional(),
  checked_at: z.string().regex(isoDate).optional(),
  conflict_status: z.enum(["none", "open", "resolved"]).optional()
}).passthrough();

type NodeMeta = z.infer<typeof baseSchema>;

type ParsedNode = {
  path: string;
  body: string;
  meta?: NodeMeta;
};

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function parseNode(path: string): ParsedNode {
  const text = readFileSync(path, "utf8");
  const rel = relative(ROOT, path).replaceAll("\\", "/");
  if (FRONTMATTER_EXEMPT.has(rel)) return { path, body: text };

  if (!text.startsWith("---\n")) {
    throw new Error(`${rel}: missing YAML frontmatter`);
  }

  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error(`${rel}: unterminated YAML frontmatter`);

  const raw = text.slice(4, end);
  const body = text.slice(end + 5);
  const result = baseSchema.safeParse(YAML.parse(raw));
  if (!result.success) {
    throw new Error(`${rel}: schema error: ${result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  return { path, body, meta: result.data };
}

function stripTarget(target: string): string {
  return decodeURIComponent(target.split("#")[0].split("?")[0]);
}

function isExternal(target: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(target) || target.startsWith("#");
}

function phase1Schema(nodes: ParsedNode[]): string[] {
  const errors: string[] = [];
  const ids = new Map<string, string>();
  const today = new Date().toISOString().slice(0, 10);

  for (const node of nodes) {
    if (!node.meta) continue;
    const rel = relative(ROOT, node.path).replaceAll("\\", "/");
    const previous = ids.get(node.meta.id);
    if (previous) errors.push(`${rel}: duplicate id '${node.meta.id}' also used by ${previous}`);
    ids.set(node.meta.id, rel);

    if (node.meta.verified < node.meta.generated) {
      errors.push(`${rel}: verified date precedes generated date`);
    }
    if (node.meta.stale_after < node.meta.verified) {
      errors.push(`${rel}: stale_after precedes verified date`);
    }
    if (node.meta.status === "verified" && node.meta.stale_after < today) {
      errors.push(`${rel}: verified node is stale (${node.meta.stale_after}); re-verify official guidance`);
    }
  }
  return errors;
}

function phase2Graph(nodes: ParsedNode[]): string[] {
  const errors: string[] = [];
  const markdownLink = /\[[^\]]*\]\(([^)]+)\)/g;

  for (const node of nodes) {
    const rel = relative(ROOT, node.path).replaceAll("\\", "/");
    const targets: string[] = [];
    for (const match of node.body.matchAll(markdownLink)) targets.push(match[1].trim());
    if (node.meta?.sources) targets.push(...node.meta.sources);

    for (const target of targets) {
      if (!target || isExternal(target)) continue;
      const clean = stripTarget(target);
      const absolute = normalize(resolve(dirname(node.path), clean));
      if (!absolute.startsWith(ROOT)) {
        errors.push(`${rel}: internal reference escapes /okf: ${target}`);
      } else if (!existsSync(absolute)) {
        errors.push(`${rel}: broken internal reference: ${target}`);
      }
    }
  }
  return errors;
}

function phase3Guardrails(nodes: ParsedNode[]): string[] {
  const errors: string[] = [];
  const unsafe = /<script\b|javascript:|data:text\/html/i;

  for (const node of nodes) {
    if (!node.meta) continue;
    const rel = relative(ROOT, node.path).replaceAll("\\", "/");
    const meta = node.meta;

    if (unsafe.test(node.body)) errors.push(`${rel}: unsafe HTML/URL pattern detected`);

    if (CRITICAL_TYPES.has(meta.type) && (!meta.sources || meta.sources.length === 0)) {
      errors.push(`${rel}: critical '${meta.type}' node requires at least one authoritative source node`);
    }

    if (meta.type === "source") {
      if (!meta.source_level) errors.push(`${rel}: source node requires source_level`);
      if (!meta.authority) errors.push(`${rel}: source node requires authority`);
      if (!meta.official_url || !meta.official_url.startsWith("https://")) {
        errors.push(`${rel}: source node requires an HTTPS official_url`);
      }
      if (!meta.checked_at) errors.push(`${rel}: source node requires checked_at`);
      if (!meta.conflict_status) errors.push(`${rel}: source node requires conflict_status`);
    }
  }
  return errors;
}

if (!existsSync(ROOT)) {
  console.error("FAIL: /okf directory does not exist");
  process.exit(1);
}

const markdownFiles = walk(ROOT).filter((p) => extname(p) === ".md");
const nodes: ParsedNode[] = [];
const parseErrors: string[] = [];

for (const file of markdownFiles) {
  try {
    nodes.push(parseNode(file));
  } catch (error) {
    parseErrors.push(error instanceof Error ? error.message : String(error));
  }
}

const phases = [
  ["Phase 1: Schema Validation", [...parseErrors, ...phase1Schema(nodes)]],
  ["Phase 2: Graph Integrity", phase2Graph(nodes)],
  ["Phase 3: Official Process Guardrails", phase3Guardrails(nodes)]
] as const;

let failed = false;
for (const [name, errors] of phases) {
  if (errors.length === 0) {
    console.log(`PASS ${name}`);
  } else {
    failed = true;
    console.error(`FAIL ${name}`);
    for (const error of errors) console.error(`  - ${error}`);
  }
}

if (failed) process.exit(1);
console.log(`OKF validation complete: ${markdownFiles.length} Markdown files checked.`);
