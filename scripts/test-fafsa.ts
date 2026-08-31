import assert from "node:assert/strict";
import { evaluateProcess, getProcessBySlug, getProcessModule } from "../src/engine/registry";

const entry = getProcessBySlug("usa/education/fafsa");
assert.equal(entry?.id, "usa-fafsa-federal-student-aid");
const module = getProcessModule("usa-fafsa-federal-student-aid");
assert.ok(module, "FAFSA module must be registered");
assert.ok(module.sourceLinks.some((link) => link.url.includes("studentaid.gov/h/apply-for-aid/fafsa")));

const readyIndependent = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "start_or_resume",
  fafsa_award_year: "2026_27",
  student_has_studentaid_account: true,
  fafsa_dependency_status: "independent",
  fafsa_required_contributor_count: 0,
  fafsa_all_required_consent_approval_complete: true,
  fafsa_state_deadline_checked: true,
  fafsa_school_deadline_checked: true
});
assert.equal(readyIndependent.status, "READY");
assert.ok(readyIndependent.warnings.some((item) => item.includes("June 30, 2027")));

const missingContributorAccount = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "start_or_resume",
  fafsa_award_year: "2026_27",
  student_has_studentaid_account: true,
  fafsa_dependency_status: "dependent",
  fafsa_parent_contributor_resolved_with_official_logic: true,
  fafsa_required_contributor_count: 1,
  fafsa_all_required_contributors_have_accounts: false,
  fafsa_all_required_contributor_sections_complete: false,
  fafsa_all_required_consent_approval_complete: false,
  fafsa_state_deadline_checked: true,
  fafsa_school_deadline_checked: true
});
assert.equal(missingContributorAccount.status, "NOT_READY");
assert.ok(missingContributorAccount.blockers.some((item) => item.includes("own StudentAid.gov account")));

const contributorWithoutSsn = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "complete_contributor",
  fafsa_award_year: "2026_27",
  fafsa_dependency_status: "dependent",
  fafsa_parent_contributor_resolved_with_official_logic: true,
  fafsa_required_contributor_count: 1,
  fafsa_all_required_contributors_have_accounts: true,
  fafsa_contributor_without_ssn: true,
  fafsa_all_required_contributor_sections_complete: true,
  fafsa_all_required_consent_approval_complete: true
});
assert.equal(contributorWithoutSsn.status, "READY");
assert.ok(contributorWithoutSsn.warnings.some((item) => item.includes("without an SSN")));

const unresolvedParent = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "identify_contributors",
  fafsa_award_year: "2026_27",
  student_has_studentaid_account: true,
  fafsa_dependency_status: "dependent",
  fafsa_parent_situation: "parents_divorced_or_separated_not_living_together",
  fafsa_parent_contributor_resolved_with_official_logic: false,
  fafsa_required_contributor_count: 1,
  fafsa_contributor_without_ssn: false
});
assert.equal(unresolvedParent.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(unresolvedParent.warnings.some((item) => item.includes("Who’s My FAFSA Parent")));

const unusualCircumstances = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "unusual_circumstances",
  fafsa_award_year: "2026_27",
  student_has_studentaid_account: true,
  fafsa_dependency_status: "provisionally_independent",
  fafsa_unusual_circumstances_prevent_parent_contact: true
});
assert.equal(unusualCircumstances.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(unusualCircumstances.warnings.some((item) => item.includes("financial aid administrator")));

const falseUnusualCircumstances = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "unusual_circumstances",
  fafsa_award_year: "2026_27",
  student_has_studentaid_account: true,
  fafsa_dependency_status: "dependent",
  fafsa_unusual_circumstances_prevent_parent_contact: false
});
assert.equal(falseUnusualCircumstances.status, "NOT_READY");

const parentRefusal = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "parent_refusal_unsub_only",
  fafsa_award_year: "2026_27",
  student_has_studentaid_account: true,
  fafsa_dependency_status: "dependent",
  fafsa_parent_refuses_information: true
});
assert.equal(parentRefusal.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(parentRefusal.warnings.some((item) => item.includes("Direct Unsubsidized Loan only")));
assert.ok(parentRefusal.warnings.some((item) => item.includes("Pell Grant")));

const onlineCorrection = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "make_correction",
  fafsa_award_year: "2026_27",
  fafsa_form_submitted: true,
  fafsa_submission_processed: true,
  fafsa_correction_type: "online_typo_signature_consent_contact_school"
});
assert.equal(onlineCorrection.status, "READY");
assert.ok(onlineCorrection.nextStep.includes("Make a Correction"));

const financialChange = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "make_correction",
  fafsa_award_year: "2026_27",
  fafsa_form_submitted: true,
  fafsa_submission_processed: true,
  fafsa_correction_type: "amended_tax_return_or_financial_change"
});
assert.equal(financialChange.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(financialChange.nextStep.includes("financial aid office"));

const verificationWaiting = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "verification",
  fafsa_award_year: "2026_27",
  fafsa_form_submitted: true,
  fafsa_submission_processed: true,
  fafsa_selected_for_verification: true,
  fafsa_school_verification_request_received: false
});
assert.equal(verificationWaiting.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(verificationWaiting.warnings.some((item) => item.includes("Do not guess")));

const specialFinancial = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "special_financial_circumstances",
  fafsa_award_year: "2026_27",
  fafsa_form_submitted: true,
  fafsa_special_financial_change_exists: true
});
assert.equal(specialFinancial.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(specialFinancial.nextStep.includes("professional-judgment"));

const deadlineUnknown = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "deadline_check",
  fafsa_award_year: "2026_27",
  fafsa_state_deadline_checked: false,
  fafsa_school_deadline_checked: false
});
assert.equal(deadlineUnknown.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(deadlineUnknown.warnings.some((item) => item.includes("State aid deadlines")));

const public2027NotYet = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "start_or_resume",
  fafsa_award_year: "2027_28",
  fafsa_2027_28_beta_status: "not_participating",
  student_has_studentaid_account: true,
  fafsa_dependency_status: "independent",
  fafsa_required_contributor_count: 0,
  fafsa_all_required_consent_approval_complete: true,
  fafsa_state_deadline_checked: true,
  fafsa_school_deadline_checked: true
});
assert.equal(public2027NotYet.status, "NOT_READY");
assert.ok(public2027NotYet.blockers.some((item) => item.includes("not yet generally public")));

const beta2027 = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "determine_dependency",
  fafsa_award_year: "2027_28",
  fafsa_2027_28_beta_status: "approved_or_participating",
  student_has_studentaid_account: true,
  fafsa_dependency_status: "independent"
});
assert.equal(beta2027.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(beta2027.warnings.some((item) => item.includes("Beta")));

const statusProcessed = evaluateProcess("usa-fafsa-federal-student-aid", {
  fafsa_action: "check_status_submission_summary",
  fafsa_award_year: "2026_27",
  student_has_studentaid_account: true,
  fafsa_form_submitted: true,
  fafsa_submission_processed: true
});
assert.equal(statusProcessed.status, "READY");
assert.ok(statusProcessed.requiredItems.some((item) => item.includes("Submission Summary")));

const correctionLinks = module.resolveSourceLinks?.({
  fafsa_action: "make_correction",
  fafsa_award_year: "2026_27"
}, onlineCorrection);
assert.ok(correctionLinks?.some((link) => link.label.includes("Submission Summary")));

console.log("PASS FAFSA Tests: award year, dependency/contributors, unusual circumstances, parent refusal, corrections, verification, deadlines, beta and status routing.");
