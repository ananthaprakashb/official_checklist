import assert from "node:assert/strict";
import { evaluateProcess, getProcessBySlug, getProcessModule, listProcesses } from "../src/engine/registry";

const processes = listProcesses();
assert.ok(processes.length >= 4, "catalog should contain passport service router, detailed reissue, and planned expansion entries");
assert.equal(new Set(processes.map((entry) => entry.id)).size, processes.length, "process ids must be unique");
assert.equal(new Set(processes.map((entry) => entry.slug)).size, processes.length, "process slugs must be unique");

for (const entry of processes) {
  assert.ok(entry.id && entry.slug && entry.title && entry.status, `invalid catalog entry: ${JSON.stringify(entry)}`);
  if (entry.status === "live") {
    assert.ok(entry.module, `${entry.id}: live process requires module`);
    assert.ok(entry.questionnaire_id, `${entry.id}: live process requires questionnaire_id`);
    assert.ok(getProcessModule(entry.id), `${entry.id}: live process is not registered`);
  }
}

const serviceRouter = getProcessBySlug("india/passport/us");
assert.equal(serviceRouter?.id, "india-us-passport-services");
assert.ok(getProcessModule("india-us-passport-services"));

const freshPresentation = evaluateProcess("india-us-passport-services", {
  requested_passport_service: "fresh_ordinary_passport",
  fresh_ever_held_ordinary_passport: false
});
assert.equal(freshPresentation.status, "READY");
assert.equal(freshPresentation.title, "Fresh Ordinary Passport");
assert.ok(freshPresentation.requiredItems.some((item) => item.includes("Fresh Ordinary Passport")));

const wrongFreshPresentation = evaluateProcess("india-us-passport-services", {
  requested_passport_service: "fresh_ordinary_passport",
  fresh_ever_held_ordinary_passport: true
});
assert.equal(wrongFreshPresentation.status, "NOT_READY");
assert.ok(wrongFreshPresentation.blockers.length > 0);

const ecPresentation = evaluateProcess("india-us-passport-services", {
  requested_passport_service: "emergency_certificate",
  ec_one_way_return_to_india: true
});
assert.equal(ecPresentation.status, "READY");
assert.equal(ecPresentation.title, "Emergency Certificate");

const specialPresentation = evaluateProcess("india-us-passport-services", {
  requested_passport_service: "identity_certificate"
});
assert.equal(specialPresentation.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const bySlug = getProcessBySlug("india/passport/reissue/us");
assert.equal(bySlug?.id, "india-us-passport-reissue");

const presentation = evaluateProcess("india-us-passport-reissue", {
  residence_state: "CA",
  residence_california_region: "northern_or_central",
  age: 40,
  has_existing_or_previous_passport: true,
  passport_validity: "due_to_expire",
  pages_exhausted: false,
  passport_lost_or_stolen: false,
  passport_damaged: false,
  change_existing_particulars: ["none"],
  requested_processing: "regular",
  booklet: "ordinary_36_pages",
  government_form_already_submitted: false,
  vfs_registration_complete: false
});

assert.equal(presentation.status, "READY");
assert.equal(presentation.title, "Passport Re-issue");
assert.ok(presentation.requiredItems.length > 0);
assert.ok(presentation.summary.some((item) => item.label === "Current fee branch" && item.value === "$146"));

console.log(`PASS Process Engine Tests: ${processes.length} catalog entries, ${processes.filter((entry) => entry.status === "live").length} live module(s).`);
