import assert from "node:assert/strict";
import { evaluateProcess, getProcessBySlug, getProcessModule, listProcesses } from "../src/engine/registry";

const processes = listProcesses();
assert.ok(processes.length >= 5, "catalog should contain U.S. immigration, passport workflows and planned expansion entries");
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

const immigrationRouter = getProcessBySlug("usa/immigration");
assert.equal(immigrationRouter?.id, "usa-immigration-services");
assert.ok(getProcessModule("usa-immigration-services"));

const employmentI485 = evaluateProcess("usa-immigration-services", {
  requested_us_immigration_service: "employment_green_card",
  employment_green_card_stage: "i485"
});
assert.equal(employmentI485.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(employmentI485.requiredItems.some((item) => item.includes("Visa Bulletin")));

const workerVisa = evaluateProcess("usa-immigration-services", {
  requested_us_immigration_service: "nonimmigrant_visa_application",
  nonimmigrant_visa_category: "petition_based_worker"
});
assert.equal(workerVisa.status, "READY");
assert.ok(workerVisa.requiredItems.some((item) => item.includes("DS-160")));
assert.ok(workerVisa.conditionalItems.some((item) => item.includes("I-129")));

const ineligibleH4Ead = evaluateProcess("usa-immigration-services", {
  requested_us_immigration_service: "h4_ead",
  h4_ead_basis: "neither"
});
assert.equal(ineligibleH4Ead.status, "NOT_READY");

const wrongI90 = evaluateProcess("usa-immigration-services", {
  requested_us_immigration_service: "green_card_replace_or_renew",
  green_card_action: "remove_marriage_conditions"
});
assert.equal(wrongI90.status, "NOT_READY");
assert.ok(wrongI90.nextStep.includes("I-751"));

const cbpCorrection = evaluateProcess("usa-immigration-services", {
  requested_us_immigration_service: "i94_record_or_correction",
  i94_issue: "cbp_entry_error"
});
assert.equal(cbpCorrection.status, "READY");
assert.ok(cbpCorrection.requiredItems.some((item) => item.includes("Deferred Inspection")));

const serviceRouter = getProcessBySlug("india/passport/us");
assert.equal(serviceRouter?.id, "india-us-passport-services");
assert.ok(getProcessModule("india-us-passport-services"));

const freshPresentation = evaluateProcess("india-us-passport-services", {
  requested_passport_service: "fresh_ordinary_passport",
  fresh_ever_held_ordinary_passport: false
});
assert.equal(freshPresentation.status, "READY");
assert.equal(freshPresentation.title, "Fresh Ordinary Passport");

const wrongFreshPresentation = evaluateProcess("india-us-passport-services", {
  requested_passport_service: "fresh_ordinary_passport",
  fresh_ever_held_ordinary_passport: true
});
assert.equal(wrongFreshPresentation.status, "NOT_READY");

const ecPresentation = evaluateProcess("india-us-passport-services", {
  requested_passport_service: "emergency_certificate",
  ec_one_way_return_to_india: true
});
assert.equal(ecPresentation.status, "READY");

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
