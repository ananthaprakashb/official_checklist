import assert from "node:assert/strict";
import { evaluateSsaBenefits, createSsaBenefitsModule } from "../src/engine/ssaBenefitsModule";
import type { ProcessCatalogEntry } from "../src/engine/types";

const entry: ProcessCatalogEntry = {
  id: "usa-social-security-benefits",
  slug: "usa/social-security/benefits",
  country_code: "US",
  country_name: "United States",
  applicant_country: "United States / Abroad",
  service: "Social Security Benefits",
  title: "Social Security Retirement, Family & Survivor Benefits",
  short_title: "Social Security Benefits",
  summary: "test",
  status: "live",
  module: "usa-social-security-benefits-v1",
  questionnaire_id: "usa-social-security-benefits-router-v1",
  verified: "2026-08-31",
  stale_after: "2026-09-30"
};

const tooYoung = evaluateSsaBenefits({
  ssa_benefit_goal: "retirement_own_record",
  ssa_applicant_age: 61,
  ssa_own_retirement_eligibility: "ssa_record_confirms_eligible",
  ssa_desired_start_within_four_months: true
});
assert.equal(tooYoung.status, "NOT_READY");
assert.ok(tooYoung.blockers.some((item) => item.includes("before age 62")));

const retirementReady = evaluateSsaBenefits({
  ssa_benefit_goal: "retirement_own_record",
  ssa_applicant_age: 64,
  ssa_own_retirement_eligibility: "ssa_record_confirms_eligible",
  ssa_desired_start_within_four_months: true
});
assert.equal(retirementReady.status, "READY");
assert.ok(retirementReady.next_step.includes("online Retirement application"));

const youngSpouseWithoutChild = evaluateSsaBenefits({
  ssa_benefit_goal: "spouse_benefit",
  ssa_applicant_age: 60,
  ssa_current_marriage_years: 20,
  ssa_caring_for_qualifying_child: false,
  ssa_living_worker_status: "receiving_retirement_or_disability",
  ssa_applicant_has_own_retirement_benefit: false
});
assert.equal(youngSpouseWithoutChild.status, "NOT_READY");

const youngSpouseWithChild = evaluateSsaBenefits({
  ssa_benefit_goal: "spouse_benefit",
  ssa_applicant_age: 45,
  ssa_current_marriage_years: 5,
  ssa_caring_for_qualifying_child: true,
  ssa_living_worker_status: "receiving_retirement_or_disability",
  ssa_applicant_has_own_retirement_benefit: false
});
assert.equal(youngSpouseWithChild.status, "READY");

const spouseWorkerNotReceiving = evaluateSsaBenefits({
  ssa_benefit_goal: "spouse_benefit",
  ssa_applicant_age: 66,
  ssa_current_marriage_years: 20,
  ssa_caring_for_qualifying_child: false,
  ssa_living_worker_status: "eligible_but_not_receiving",
  ssa_applicant_has_own_retirement_benefit: false
});
assert.equal(spouseWorkerNotReceiving.status, "NOT_READY");

const shortDivorceMarriage = evaluateSsaBenefits({
  ssa_benefit_goal: "divorced_spouse_benefit",
  ssa_applicant_age: 65,
  ssa_divorced_marriage_years: 9,
  ssa_currently_married: false,
  ssa_ex_spouse_status: "receiving_retirement_or_disability",
  ssa_applicant_has_own_retirement_benefit: false
});
assert.equal(shortDivorceMarriage.status, "NOT_READY");
assert.ok(shortDivorceMarriage.blockers.some((item) => item.includes("at least 10 years")));

const independentDivorcedTooSoon = evaluateSsaBenefits({
  ssa_benefit_goal: "divorced_spouse_benefit",
  ssa_applicant_age: 65,
  ssa_divorced_marriage_years: 12,
  ssa_currently_married: false,
  ssa_ex_spouse_status: "age_62_eligible_not_receiving",
  ssa_years_since_divorce: 1,
  ssa_applicant_has_own_retirement_benefit: false
});
assert.equal(independentDivorcedTooSoon.status, "NOT_READY");

const independentDivorcedReady = evaluateSsaBenefits({
  ssa_benefit_goal: "divorced_spouse_benefit",
  ssa_applicant_age: 65,
  ssa_divorced_marriage_years: 12,
  ssa_currently_married: false,
  ssa_ex_spouse_status: "age_62_eligible_not_receiving",
  ssa_years_since_divorce: 3,
  ssa_applicant_has_own_retirement_benefit: true
});
assert.equal(independentDivorcedReady.status, "READY");
assert.ok(independentDivorcedReady.warnings.some((item) => item.includes("Deemed-filing")));

const survivorReady = evaluateSsaBenefits({
  ssa_benefit_goal: "survivor_spouse",
  ssa_applicant_age: 61,
  ssa_caring_for_qualifying_child: false,
  ssa_survivor_has_qualifying_disability: false,
  ssa_survivor_marriage_months: 120,
  ssa_survivor_remarriage_timing: "not_remarried"
});
assert.equal(survivorReady.status, "READY");
assert.ok(survivorReady.next_step.includes("does not currently accept Survivor-benefit applications online"));

const disabledSurvivor = evaluateSsaBenefits({
  ssa_benefit_goal: "survivor_spouse",
  ssa_applicant_age: 55,
  ssa_caring_for_qualifying_child: false,
  ssa_survivor_has_qualifying_disability: true,
  ssa_survivor_marriage_months: 120,
  ssa_survivor_remarriage_timing: "not_remarried"
});
assert.equal(disabledSurvivor.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const studentChild = evaluateSsaBenefits({
  ssa_benefit_goal: "survivor_child",
  ssa_child_age: 18,
  ssa_child_unmarried: true,
  ssa_child_full_time_k12: true,
  ssa_child_disability_before_22: false
});
assert.equal(studentChild.status, "READY");

const dependentParent = evaluateSsaBenefits({
  ssa_benefit_goal: "survivor_dependent_parent",
  ssa_applicant_age: 68,
  ssa_dependent_parent_supported_by_worker: true
});
assert.equal(dependentParent.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const survivorSwitch = evaluateSsaBenefits({
  ssa_benefit_goal: "compare_or_switch_benefits",
  ssa_current_benefit_type: "survivor",
  ssa_possible_other_benefit_type: "retirement"
});
assert.equal(survivorSwitch.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(survivorSwitch.warnings.some((item) => item.includes("exception to ordinary deemed filing")));

const workingOverLimit = evaluateSsaBenefits({
  ssa_benefit_goal: "work_while_receiving",
  ssa_work_benefit_type: "retirement",
  ssa_work_fra_status_2026: "under_fra_all_2026",
  ssa_expected_2026_earnings: 30000
});
assert.equal(workingOverLimit.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(workingOverLimit.warnings.some((item) => item.includes("$24,480")));

const workingAfterFra = evaluateSsaBenefits({
  ssa_benefit_goal: "work_while_receiving",
  ssa_work_benefit_type: "retirement",
  ssa_work_fra_status_2026: "at_or_over_fra",
  ssa_expected_2026_earnings: 150000
});
assert.equal(workingAfterFra.status, "READY");

const abroad = evaluateSsaBenefits({
  ssa_benefit_goal: "benefits_outside_us",
  ssa_abroad_benefit_type: "retirement"
});
assert.equal(abroad.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(abroad.next_step.includes("International Programs"));

const module = createSsaBenefitsModule(entry);
const survivorLinks = module.resolveSourceLinks?.({ ssa_benefit_goal: "survivor_spouse" }, module.present(survivorReady)) ?? [];
assert.ok(survivorLinks.some((link) => link.url.includes("/survivor")));
assert.ok(survivorLinks.some((link) => link.url.includes("KA-02083")));
const workLinks = module.resolveSourceLinks?.({ ssa_benefit_goal: "work_while_receiving" }, module.present(workingOverLimit)) ?? [];
assert.ok(workLinks.some((link) => link.url.includes("whileworking")));

console.log("PASS SSA Benefits Tests: retirement, spouse/divorced-spouse, survivor, child/parent, switching, earnings and abroad routing.");
