import assert from "node:assert/strict";
import { evaluateProcess, getProcessBySlug, getProcessModule } from "../src/engine/registry";

for (const slug of [
  "usa/passport",
  "usa/social-security/card",
  "usa/tax/itin",
  "usa/medicare/enrollment",
  "usa/immigration/family-green-card"
]) {
  const entry = getProcessBySlug(slug);
  assert.ok(entry, `${slug}: catalog route must exist`);
  assert.equal(entry.status, "live", `${slug}: process must be live`);
  assert.ok(getProcessModule(entry.id), `${slug}: process module must be registered`);
}

const badRenewal = evaluateProcess("usa-passport", {
  usa_passport_need: "renew_passport",
  renewal_eligibility_confirmed: false
});
assert.equal(badRenewal.status, "NOT_READY");
assert.ok(badRenewal.blockers.some((item) => item.includes("DS-11")));

const childConsent = evaluateProcess("usa-passport", {
  usa_passport_need: "child_under_16",
  child_parent_consent_issue: true
});
assert.equal(childConsent.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(childConsent.warnings.some((item) => item.includes("parents/guardians")));

const urgentPassport = evaluateProcess("usa-passport", {
  usa_passport_need: "urgent_travel",
  urgent_travel_window: "travel_within_14_days"
});
assert.equal(urgentPassport.status, "READY");
assert.ok(urgentPassport.nextStep.includes("passport agency"));

const nonUrgentAgency = evaluateProcess("usa-passport", {
  usa_passport_need: "urgent_travel",
  urgent_travel_window: "travel_15_days_or_more"
});
assert.equal(nonUrgentAgency.status, "NOT_READY");

const driverLicenseOnlySsn = evaluateProcess("usa-social-security-card", {
  ssn_action: "first_number",
  ssn_citizenship_status: "us_born_citizen",
  ssn_original_or_certified_documents_ready: true,
  ssn_nonwork_driver_license_only: true
});
assert.equal(driverLicenseOnlySsn.status, "NOT_READY");
assert.ok(driverLicenseOnlySsn.blockers.some((item) => item.includes("driver's license")));

const noncitizenSsn = evaluateProcess("usa-social-security-card", {
  ssn_action: "first_number",
  ssn_citizenship_status: "noncitizen",
  ssn_original_or_certified_documents_ready: true,
  ssn_nonwork_driver_license_only: false
});
assert.equal(noncitizenSsn.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(noncitizenSsn.warnings.some((item) => item.includes("Noncitizen")));

const itinWrongIdentity = evaluateProcess("usa-itin", {
  itin_action: "new_itin",
  eligible_for_ssn: true,
  itin_tax_return_route: "attach_federal_return",
  itin_submission_method: "certifying_acceptance_agent",
  itin_identity_foreign_status_documents_ready: true
});
assert.equal(itinWrongIdentity.status, "NOT_READY");
assert.ok(itinWrongIdentity.blockers.some((item) => item.includes("SSN")));

const itinReady = evaluateProcess("usa-itin", {
  itin_action: "new_itin",
  eligible_for_ssn: false,
  itin_tax_return_route: "attach_federal_return",
  itin_submission_method: "certifying_acceptance_agent",
  itin_identity_foreign_status_documents_ready: true
});
assert.equal(itinReady.status, "READY");
assert.ok(itinReady.requiredItems.some((item) => item.includes("Form W-7")));

const cobraIsNotJobSep = evaluateProcess("usa-medicare-enrollment", {
  medicare_action: "job_coverage_special_enrollment",
  medicare_has_part_a: true,
  medicare_current_employment_group_coverage: false,
  medicare_months_since_job_or_group_coverage_ended: 3,
  medicare_cobra_or_retiree_only: true
});
assert.equal(cobraIsNotJobSep.status, "NOT_READY");
assert.ok(cobraIsNotJobSep.blockers.some((item) => item.includes("COBRA")));

const missedPartBSep = evaluateProcess("usa-medicare-enrollment", {
  medicare_action: "job_coverage_special_enrollment",
  medicare_has_part_a: true,
  medicare_current_employment_group_coverage: false,
  medicare_months_since_job_or_group_coverage_ended: 9,
  medicare_cobra_or_retiree_only: false
});
assert.equal(missedPartBSep.status, "NOT_READY");
assert.ok(missedPartBSep.blockers.some((item) => item.includes("8 months")));

const activeJobCoverageSep = evaluateProcess("usa-medicare-enrollment", {
  medicare_action: "job_coverage_special_enrollment",
  medicare_has_part_a: true,
  medicare_current_employment_group_coverage: true,
  medicare_months_since_job_or_group_coverage_ended: 0,
  medicare_cobra_or_retiree_only: false
});
assert.equal(activeJobCoverageSep.status, "READY");
assert.ok(activeJobCoverageSep.requiredItems.some((item) => item.includes("CMS-L564")));

const citizenSpouseInside = evaluateProcess("usa-family-green-card", {
  family_petitioner_status: "us_citizen",
  family_relationship: "spouse",
  family_beneficiary_location: "inside_us",
  family_case_stage: "i130_preparation",
  family_inside_us_inspected_admitted_or_paroled: true
});
assert.equal(citizenSpouseInside.status, "READY");
assert.equal(citizenSpouseInside.title, "Immediate Relative of U.S. Citizen");
assert.ok(citizenSpouseInside.conditionalItems.some((item) => item.includes("concurrently")));

const lprParent = evaluateProcess("usa-family-green-card", {
  family_petitioner_status: "lawful_permanent_resident",
  family_relationship: "parent",
  family_petitioner_age_21_or_over: true,
  family_beneficiary_location: "outside_us",
  family_case_stage: "planning"
});
assert.equal(lprParent.status, "NOT_READY");
assert.ok(lprParent.blockers.some((item) => item.includes("permanent resident")));

const youngCitizenSibling = evaluateProcess("usa-family-green-card", {
  family_petitioner_status: "us_citizen",
  family_relationship: "sibling",
  family_petitioner_age_21_or_over: false,
  family_beneficiary_location: "outside_us",
  family_case_stage: "planning"
});
assert.equal(youngCitizenSibling.status, "NOT_READY");
assert.ok(youngCitizenSibling.blockers.some((item) => item.includes("at least 21")));

const f2aAdjustment = evaluateProcess("usa-family-green-card", {
  family_petitioner_status: "lawful_permanent_resident",
  family_relationship: "spouse",
  family_beneficiary_location: "inside_us",
  family_case_stage: "adjustment_i485",
  family_inside_us_inspected_admitted_or_paroled: true
});
assert.equal(f2aAdjustment.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(f2aAdjustment.warnings.some((item) => item.includes("Visa Bulletin")));

console.log("PASS High-Friction Government Router Tests: passport, SSA, ITIN, Medicare and family Green Card routing.");
