import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";

const root = resolve("data/india/us/passport");
const errors: string[] = [];
const questionnaireIds = new Set<string>();
const versionsByDirectory = new Map<string, Set<number>>();
let totalQuestions = 0;

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(root)
  .filter((path) => /^questionnaire\.v\d+\.json$/.test(basename(path)))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

for (const path of files) {
  const file = basename(path);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const rel = relative(process.cwd(), path).replaceAll("\\", "/");
  const prefix = `${rel}:`;
  const filenameVersion = Number(file.match(/v(\d+)/)?.[1]);
  const directory = dirname(path);
  const versions = versionsByDirectory.get(directory) ?? new Set<number>();

  if (!data.id || !Number.isInteger(data.version)) errors.push(`${prefix} questionnaire id/version missing or invalid`);
  if (data.version !== filenameVersion) errors.push(`${prefix} JSON version ${data.version} does not match filename version ${filenameVersion}`);
  if (versions.has(data.version)) errors.push(`${prefix} duplicate questionnaire version ${data.version} in ${relative(root, directory)}`);
  if (questionnaireIds.has(data.id)) errors.push(`${prefix} duplicate questionnaire id ${data.id}`);
  versions.add(data.version);
  versionsByDirectory.set(directory, versions);
  questionnaireIds.add(data.id);

  if (!Array.isArray(data.questions) || data.questions.length === 0) errors.push(`${prefix} questionnaire must contain questions`);
  const ids = new Set<string>();
  for (const q of data.questions ?? []) {
    totalQuestions += 1;
    if (!q.id || !q.type) errors.push(`${prefix} each question requires id and type`);
    if (ids.has(q.id)) errors.push(`${prefix} duplicate question id: ${q.id}`);
    ids.add(q.id);
    if (q.options && (!Array.isArray(q.options) || q.options.length === 0)) errors.push(`${prefix} ${q.id}: options must be non-empty`);
  }

  for (const q of data.questions ?? []) {
    for (const conditionKey of Object.keys(q.required_when ?? {})) {
      const sourceId = conditionKey.endsWith("_lt")
        ? conditionKey.slice(0, -3)
        : conditionKey.endsWith("_gte")
          ? conditionKey.slice(0, -4)
          : conditionKey;
      if (!ids.has(sourceId)) errors.push(`${prefix} ${q.id}: required_when references missing question '${sourceId}'`);
    }
  }

  for (const node of data.rule_nodes ?? []) {
    if (!existsSync(resolve(node))) errors.push(`${prefix} missing rule node: ${node}`);
  }
  if (!data.result_schema || !existsSync(resolve(data.result_schema))) errors.push(`${prefix} result_schema does not resolve`);

  const today = new Date().toISOString().slice(0, 10);
  if (!data.stale_after || data.stale_after < today) errors.push(`${prefix} questionnaire is stale: ${data.stale_after ?? "missing"}`);
}

if (files.length === 0) errors.push("no versioned questionnaires found");

if (errors.length) {
  console.error("FAIL Questionnaire Validation");
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(`PASS Questionnaire Validation: ${files.length} questionnaire files across ${versionsByDirectory.size} process directories, ${totalQuestions} total questions.`);
