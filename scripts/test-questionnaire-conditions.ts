import assert from "node:assert/strict";
import { isQuestionVisible } from "../src/core/questionnaire";
import type { Question } from "../src/types";

const multi: Question = {
  id: "evidence",
  type: "boolean",
  required_when: { action: ["new", "renew"] }
};
assert.equal(isQuestionVisible(multi, { action: "new" }), true);
assert.equal(isQuestionVisible(multi, { action: "renew" }), true);
assert.equal(isQuestionVisible(multi, { action: "status" }), false);

const exact: Question = { id: "child", type: "boolean", required_when: { route: "minor" } };
assert.equal(isQuestionVisible(exact, { route: "minor" }), true);
assert.equal(isQuestionVisible(exact, { route: "adult" }), false);

const numeric: Question = { id: "age_gate", type: "boolean", required_when: { age_gte: 65 } };
assert.equal(isQuestionVisible(numeric, { age: 65 }), true);
assert.equal(isQuestionVisible(numeric, { age: 64 }), false);

console.log("PASS Questionnaire Condition Tests: exact, multi-value and numeric conditions.");
