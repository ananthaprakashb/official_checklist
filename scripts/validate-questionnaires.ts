import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, resolve } from "node:path";

const directory = resolve("data/india/us/passport/reissue");
const files = readdirSync(directory)
  .filter((name) => /^questionnaire\.v\d+\.json$/.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const errors: string[] = [];
const versions = new Set<number>();
const questionnaireIds = new Set<string>();
let totalQuestions = 0;
let latestVersion = 0;

for (const file of files) {
  const path = resolve(directory, file);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const prefix = `${basename(path)}:`;
  const filenameVersion = Number(file.match(/v(\d+)/)?.[1]);

  if (!data.id || !Number.isInteger(data.version)) errors.push(`${prefix} questionnaire id/version missing or invalid`);
  if (data.version !== filenameVersion) errors.push(`${prefix} JSON version ${data.version} does not match filename version ${filenameVersion}`);
  if (versions.has(data.version)) errors.push(`${prefix} duplicate questionnaire version ${data.version}`);
  if (questionnaireIds.has(data.id)) errors.push(`${prefix} duplicate questionnaire id ${data.id}`);
  versions.add(data.version);
  questionnaireIds.add(data.id);
  latestVersion = Math.max(latestVersion, data.version ?? 0);

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

console.log(`PASS Questionnaire Validation: ${files.length} versions, latest v${latestVersion}, ${totalQuestions} total questions.`);
