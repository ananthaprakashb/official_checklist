import assert from "node:assert/strict";
import { getProcessQuestions, runProcessEvaluation, searchProcesses } from "../src/adk/processAdapter";

const matches = searchProcesses("Indian passport reissue in the United States", 8);
assert.ok(matches.some((item) => item.id === "india-us-passport-reissue"), "passport reissue process should be discoverable");

const questions = getProcessQuestions("india-us-passport-services");
assert.equal(questions.status, "success");
if (questions.status === "success") {
  assert.ok(questions.questionnaire.questions.length > 0, "registered process should expose questions");
  assert.ok(questions.official_sources.length > 0, "registered process should expose official sources");
}

const evaluation = runProcessEvaluation("india-us-passport-services", {
  requested_passport_service: "passport_reissue",
  reissue_ever_held_ordinary_passport: true
});
assert.equal(evaluation.status, "success");
if (evaluation.status === "success") {
  assert.ok(
    ["READY", "NOT_READY", "NEEDS_AUTHORITATIVE_CONFIRMATION"].includes(evaluation.decision_status),
    "ADK adapter must preserve a valid deterministic decision status"
  );
  assert.ok(evaluation.official_sources.length > 0, "evaluation should retain authoritative source links");
}

console.log("ADK Civic Preflight adapter checks passed");
