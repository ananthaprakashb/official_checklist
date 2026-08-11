import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const questionnairePath = resolve("data/india/us/passport/reissue/questionnaire.v1.json");
const data = JSON.parse(readFileSync(questionnairePath, "utf8"));
const errors: string[] = [];

if (!data.id || data.version !== 1) errors.push("questionnaire id/version missing or invalid");
if (!Array.isArray(data.questions) || data.questions.length === 0) errors.push("questionnaire must contain questions");

const ids = new Set<string>();
for (const q of data.questions ?? []) {
  if (!q.id || !q.type) errors.push("each question requires id and type");
  if (ids.has(q.id)) errors.push(`duplicate question id: ${q.id}`);
  ids.add(q.id);
  if (q.options && (!Array.isArray(q.options) || q.options.length === 0)) errors.push(`${q.id}: options must be non-empty`);
}

for (const node of data.rule_nodes ?? []) {
  if (!existsSync(resolve(node))) errors.push(`missing rule node: ${node}`);
}
if (!data.result_schema || !existsSync(resolve(data.result_schema))) errors.push("result_schema does not resolve");

const today = new Date().toISOString().slice(0, 10);
if (!data.stale_after || data.stale_after < today) errors.push(`questionnaire is stale: ${data.stale_after ?? "missing"}`);

if (errors.length) {
  console.error("FAIL Questionnaire Validation");
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`PASS Questionnaire Validation: ${data.questions.length} questions, ${data.rule_nodes.length} rule nodes.`);
