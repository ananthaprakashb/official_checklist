import assert from "node:assert/strict";
import { evaluateProcess, getProcessBySlug, getProcessModule } from "../src/engine/registry";

const entry = getProcessBySlug("usa/immigration/employment-green-card/i140");
assert.equal(entry?.id, "usa-i140-detailed");
assert.ok(getProcessModule("usa-i140-detailed"));

const baseEmployer = {
  i140_stage: "ready_to_file",
  petitioner_route: "employer",
  current_i140_edition_confirmed: "yes",
  category_evidence_ready: "yes",
  job_offer_status: "ready",
  ability_to_pay_status: "evidence_ready",
  beneficiary_met_labor_requirements_by_priority_date: "yes",
  prior_approved_eb123_petition: false,
  request_premium_processing: false,
  intended_final_processing: "adjustment_in_us"
};

const eb2Ready = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb2_regular",
  labor_route: "perm_certified",
  perm_certification_valid_for_new_filing: "yes"
});
assert.equal(eb2Ready.status, "READY");
assert.ok(eb2Ready.summary.some((item) => item.label === "Classification" && item.value.includes("E21")));
assert.ok(eb2Ready.requiredItems.some((item) => item.includes("ability to pay")));

const eb2SelfPetition = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb2_regular",
  petitioner_route: "self_petition",
  labor_route: "perm_certified",
  perm_certification_valid_for_new_filing: "yes"
});
assert.equal(eb2SelfPetition.status, "NOT_READY");
assert.ok(eb2SelfPetition.blockers.some((item) => item.includes("petitioner route")));

const eb1aWrongPerm = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb1a",
  petitioner_route: "self_petition",
  labor_route: "perm_certified",
  perm_certification_valid_for_new_filing: "yes",
  job_offer_status: "not_applicable",
  ability_to_pay_status: "not_applicable",
  beneficiary_met_labor_requirements_by_priority_date: "not_applicable"
});
assert.equal(eb1aWrongPerm.status, "NOT_READY");
assert.ok(eb1aWrongPerm.blockers.some((item) => item.includes("labor route")));

const niw = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb2_niw",
  petitioner_route: "self_petition",
  labor_route: "not_required",
  job_offer_status: "not_applicable",
  ability_to_pay_status: "not_applicable",
  beneficiary_met_labor_requirements_by_priority_date: "not_applicable",
  request_premium_processing: true
});
assert.equal(niw.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(niw.summary.some((item) => item.label === "Premium processing" && item.value.includes("45 days")));
assert.ok(niw.warnings.some((item) => item.includes("fact-intensive")));

const eb1cSelf = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb1c",
  petitioner_route: "self_petition",
  labor_route: "not_required",
  request_premium_processing: true
});
assert.equal(eb1cSelf.status, "NOT_READY");
assert.ok(eb1cSelf.summary.some((item) => item.label === "Premium processing" && item.value.includes("45 days")));

const scheduleA = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "schedule_a",
  schedule_a_group: "group_i_registered_nurse",
  schedule_a_preference: "eb3_professional",
  labor_route: "schedule_a"
});
assert.equal(scheduleA.status, "READY");
assert.ok(scheduleA.summary.some((item) => item.label === "Classification" && item.value.includes("E32 Schedule A")));
assert.ok(scheduleA.requiredItems.some((item) => item.includes("Schedule A direct-to-USCIS")));

const expiredPerm = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb3_skilled",
  labor_route: "perm_certified",
  perm_certification_valid_for_new_filing: "no"
});
assert.equal(expiredPerm.status, "NOT_READY");
assert.ok(expiredPerm.blockers.some((item) => item.includes("PERM")));

const retainedDateBlocked = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb3_professional",
  labor_route: "perm_certified",
  perm_certification_valid_for_new_filing: "yes",
  prior_approved_eb123_petition: true,
  priority_date_retention_issue: "material_error"
});
assert.equal(retainedDateBlocked.status, "NOT_READY");
assert.ok(retainedDateBlocked.blockers.some((item) => item.includes("retained")));

const missedRfe = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb3_professional",
  i140_stage: "rfe",
  labor_route: "perm_certified",
  perm_certification_valid_for_new_filing: "yes",
  rfe_response_status: "deadline_missed"
});
assert.equal(missedRfe.status, "NOT_READY");
assert.ok(missedRfe.blockers.some((item) => item.includes("RFE")));

const timelyRfe = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb3_professional",
  i140_stage: "rfe",
  labor_route: "perm_certified",
  perm_certification_valid_for_new_filing: "yes",
  rfe_response_status: "complete_and_submitted_on_time"
});
assert.equal(timelyRfe.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const approvedAdjustment = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb3_professional",
  i140_stage: "approved",
  labor_route: "perm_certified",
  perm_certification_valid_for_new_filing: "yes",
  intended_final_processing: "adjustment_in_us"
});
assert.ok(approvedAdjustment.nextStep.includes("I-485"));

const approvedConsular = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb3_professional",
  i140_stage: "approved",
  labor_route: "perm_certified",
  perm_certification_valid_for_new_filing: "yes",
  intended_final_processing: "consular_abroad"
});
assert.ok(approvedConsular.nextStep.includes("NVC"));

const wrongFormFamily = evaluateProcess("usa-i140-detailed", {
  ...baseEmployer,
  i140_category: "eb4_or_eb5",
  labor_route: "not_required"
});
assert.equal(wrongFormFamily.status, "NOT_READY");
assert.ok(wrongFormFamily.blockers.some((item) => item.includes("I-360") && item.includes("I-526")));

console.log("PASS I-140 Regression Tests: 12 scenarios.");
