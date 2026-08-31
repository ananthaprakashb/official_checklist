import assert from "node:assert/strict";
import { evaluateProcess, getProcessBySlug, getProcessModule, listProcesses } from "../src/engine/registry";

const processes = listProcesses();
assert.ok(processes.length >= 6, "catalog should contain detailed employment green card, U.S. immigration, passport workflows and planned expansion entries");
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

const employmentGreenCard = getProcessBySlug("usa/immigration/employment-green-card");
assert.equal(employmentGreenCard?.id, "usa-employment-green-card");
assert.ok(getProcessModule("usa-employment-green-card"));

const categoryMismatch = evaluateProcess("usa-employment-green-card", {
  employment_category: "eb2_advanced_degree_exceptional_ability",
  employment_gc_stage: "planning",
  beneficiary_location: "inside_us",
  labor_certification_route: "not_required",
  immigrant_petition_status: "not_filed",
  priority_date_known: false,
  chargeability_country: "india",
  bulletin_month: "september_2026",
  intended_final_processing: "not_sure",
  include_derivatives: false
});
assert.equal(categoryMismatch.status, "NOT_READY");
assert.ok(categoryMismatch.blockers.some((item) => item.includes("labor-certification route")));

const indiaEb2SeptemberFiling = evaluateProcess("usa-employment-green-card", {
  employment_category: "eb2_advanced_degree_exceptional_ability",
  employment_gc_stage: "adjustment_of_status",
  beneficiary_location: "inside_us",
  labor_certification_route: "dol_perm",
  perm_status: "certified",
  perm_certification_within_180_days: true,
  immigrant_petition_status: "approved",
  priority_date_known: true,
  priority_date: "2015-01-01",
  chargeability_country: "india",
  bulletin_month: "september_2026",
  intended_final_processing: "adjustment_in_us",
  physically_present_in_us: true,
  uscis_chart_selection: "dates_for_filing",
  employment_basis_still_valid: true,
  medical_i693_ready: true,
  complex_adjustment_issue: false,
  i485_status: "not_filed",
  include_derivatives: true,
  request_ead_with_i485: true,
  request_advance_parole_with_i485: true
});
assert.equal(indiaEb2SeptemberFiling.status, "READY");
assert.ok(indiaEb2SeptemberFiling.summary.some((item) => item.label === "Dates for Filing" && item.value.includes("2015-01-15")));
assert.ok(indiaEb2SeptemberFiling.summary.some((item) => item.label === "Final Action" && item.value.includes("Not eligible")));
assert.ok(indiaEb2SeptemberFiling.warnings.some((item) => item.includes("Final Action Date")));

const indiaEb2SeptemberTooLate = evaluateProcess("usa-employment-green-card", {
  employment_category: "eb2_advanced_degree_exceptional_ability",
  employment_gc_stage: "adjustment_of_status",
  beneficiary_location: "inside_us",
  labor_certification_route: "dol_perm",
  perm_status: "certified",
  perm_certification_within_180_days: true,
  immigrant_petition_status: "approved",
  priority_date_known: true,
  priority_date: "2015-02-01",
  chargeability_country: "india",
  bulletin_month: "september_2026",
  intended_final_processing: "adjustment_in_us",
  physically_present_in_us: true,
  uscis_chart_selection: "dates_for_filing",
  employment_basis_still_valid: true,
  medical_i693_ready: true,
  complex_adjustment_issue: false,
  i485_status: "not_filed",
  include_derivatives: false,
  request_ead_with_i485: false,
  request_advance_parole_with_i485: false
});
assert.equal(indiaEb2SeptemberTooLate.status, "NOT_READY");
assert.ok(indiaEb2SeptemberTooLate.blockers.some((item) => item.includes("2015-01-15")));

const adjustmentOutsideUs = evaluateProcess("usa-employment-green-card", {
  employment_category: "eb1a_extraordinary_ability",
  employment_gc_stage: "adjustment_of_status",
  beneficiary_location: "outside_us",
  labor_certification_route: "not_required",
  immigrant_petition_status: "approved",
  priority_date_known: true,
  priority_date: "2026-01-01",
  chargeability_country: "all_other",
  bulletin_month: "september_2026",
  intended_final_processing: "adjustment_in_us",
  physically_present_in_us: false,
  uscis_chart_selection: "final_action",
  employment_basis_still_valid: true,
  medical_i693_ready: true,
  complex_adjustment_issue: false,
  i485_status: "not_filed",
  include_derivatives: false,
  request_ead_with_i485: false,
  request_advance_parole_with_i485: false
});
assert.equal(adjustmentOutsideUs.status, "NOT_READY");
assert.ok(adjustmentOutsideUs.blockers.some((item) => item.includes("physically present")));

const eb1aWrongPerm = evaluateProcess("usa-employment-green-card", {
  employment_category: "eb1a_extraordinary_ability",
  employment_gc_stage: "planning",
  beneficiary_location: "inside_us",
  labor_certification_route: "dol_perm",
  immigrant_petition_status: "not_filed",
  priority_date_known: false,
  chargeability_country: "all_other",
  bulletin_month: "september_2026",
  intended_final_processing: "not_sure",
  include_derivatives: false
});
assert.equal(eb1aWrongPerm.status, "NOT_READY");

const eb4Route = evaluateProcess("usa-employment-green-card", {
  employment_category: "eb4_special_immigrant",
  employment_gc_stage: "immigrant_petition",
  beneficiary_location: "inside_us",
  labor_certification_route: "not_required",
  immigrant_petition_status: "not_filed",
  priority_date_known: false,
  chargeability_country: "all_other",
  bulletin_month: "september_2026",
  intended_final_processing: "not_sure",
  include_derivatives: false
});
assert.equal(eb4Route.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(eb4Route.summary.some((item) => item.label === "Petition" && item.value.includes("I-360")));

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
