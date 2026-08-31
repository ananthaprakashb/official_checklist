import assert from "node:assert/strict";
import { evaluateNvc } from "../src/core/evaluateNvc";

const base = {
  nvc_basis: "eb3_professional",
  nvc_stage: "documentarily_complete",
  i140_approved: "yes",
  nvc_routing_status: "forwarded_to_nvc",
  priority_date_known: true,
  priority_date: "2013-12-01",
  chargeability_country: "india",
  bulletin_month: "september_2026",
  nvc_preprocessing_notice_received: "yes",
  welcome_letter_received: "yes",
  iv_applicant_count: 2,
  iv_fee_status: "paid",
  i864_exception_applies: "no",
  aos_fee_status: "not_required",
  i864_status: "not_required",
  ds260_status: "all_submitted",
  civil_documents_status: "all_submitted",
  reciprocity_schedule_checked: "yes",
  police_certificates_status: "current",
  employment_offer_status: "continuing_valid",
  self_petition_work_intent: "not_applicable",
  post_specific_instructions_checked: "yes",
  derivatives_included: true,
  derivative_eligibility_status: "all_clear",
  inadmissibility_or_case_issue: false,
  responded_to_nvc_within_one_year: "yes",
  documentarily_complete_status: "yes",
  interview_letter_received: "no",
  medical_status: "not_completed",
  interview_documents_ready: "no",
  post_interview_status: "none",
  refusal_instruction_response_status: "not_applicable",
  visa_details_checked: "not_sure",
  uscis_immigrant_fee_status: "not_paid"
};

const readyDq = evaluateNvc(base);
assert.equal(readyDq.status, "READY");
assert.equal(readyDq.preprocessing_eligible, true);
assert.equal(readyDq.final_action_eligible, true);
assert.equal(readyDq.iv_fee_total, 690);

const noI140 = evaluateNvc({ ...base, i140_approved: "no" });
assert.equal(noI140.status, "NOT_READY");

const notForwarded = evaluateNvc({ ...base, nvc_routing_status: "retained_or_not_forwarded" });
assert.equal(notForwarded.status, "NOT_READY");
assert.ok(notForwarded.blockers.some((item) => item.includes("I-824")));

const indiaEb2Dq = evaluateNvc({ ...base, nvc_basis: "eb2_regular", priority_date: "2015-01-01" });
assert.equal(indiaEb2Dq.status, "READY");
assert.equal(indiaEb2Dq.preprocessing_eligible, true);
assert.equal(indiaEb2Dq.final_action_eligible, false);
assert.ok(indiaEb2Dq.next_step.includes("Final Action"));

const indiaEb2Interview = evaluateNvc({ ...base, nvc_basis: "eb2_regular", priority_date: "2015-01-01", nvc_stage: "interview_scheduled", interview_letter_received: "yes", medical_status: "scheduled", interview_documents_ready: "yes" });
assert.equal(indiaEb2Interview.status, "NOT_READY");
assert.ok(indiaEb2Interview.blockers.some((item) => item.includes("Final Action")));

const unpaidFeeAtDs260 = evaluateNvc({ ...base, nvc_stage: "ds260", iv_fee_status: "unpaid", documentarily_complete_status: "no", derivatives_included: false });
assert.equal(unpaidFeeAtDs260.status, "NOT_READY");

const partialDs260AtDq = evaluateNvc({ ...base, ds260_status: "partial" });
assert.equal(partialDs260AtDq.status, "NOT_READY");

const incompleteCivilAtDq = evaluateNvc({ ...base, civil_documents_status: "incomplete" });
assert.equal(incompleteCivilAtDq.status, "NOT_READY");

const withdrawnOffer = evaluateNvc({ ...base, employment_offer_status: "withdrawn_or_unavailable" });
assert.equal(withdrawnOffer.status, "NOT_READY");

const eb1a = evaluateNvc({ ...base, nvc_basis: "eb1a", chargeability_country: "all_other", priority_date: "2026-01-01", employment_offer_status: "not_applicable_self_petition", self_petition_work_intent: "continues", derivatives_included: false });
assert.equal(eb1a.status, "READY");

const i864Unknown = evaluateNvc({ ...base, i864_exception_applies: "not_sure", aos_fee_status: "not_sure", i864_status: "not_sure" });
assert.equal(i864Unknown.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const derivativeIssue = evaluateNvc({ ...base, derivative_eligibility_status: "age_cspa_or_relationship_issue" });
assert.equal(derivativeIssue.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const inactivity = evaluateNvc({ ...base, responded_to_nvc_within_one_year: "no" });
assert.equal(inactivity.status, "NOT_READY");
assert.ok(inactivity.blockers.some((item) => item.includes("203(g)")));

const missing221g = evaluateNvc({ ...base, nvc_stage: "refused_221g", interview_letter_received: "yes", medical_status: "completed_authorized_panel_physician", interview_documents_ready: "yes", post_interview_status: "221g_missing_documents", refusal_instruction_response_status: "submitted_as_instructed" });
assert.equal(missing221g.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const visaExpiredBeforeEntry = evaluateNvc({ ...base, nvc_basis: "eb1a", chargeability_country: "all_other", priority_date: "2026-01-01", nvc_stage: "visa_issued", derivatives_included: false, employment_offer_status: "not_applicable_self_petition", self_petition_work_intent: "continues", interview_letter_received: "yes", medical_status: "completed_authorized_panel_physician", interview_documents_ready: "yes", post_interview_status: "issued", visa_details_checked: "yes", visa_expiration_date: "2026-10-01", planned_entry_date: "2026-10-02" });
assert.equal(visaExpiredBeforeEntry.status, "NOT_READY");

const unpaidImmigrantFee = evaluateNvc({ ...base, nvc_basis: "eb1a", chargeability_country: "all_other", priority_date: "2026-01-01", nvc_stage: "visa_issued", derivatives_included: false, employment_offer_status: "not_applicable_self_petition", self_petition_work_intent: "continues", interview_letter_received: "yes", medical_status: "completed_authorized_panel_physician", interview_documents_ready: "yes", post_interview_status: "issued", visa_details_checked: "yes", visa_expiration_date: "2026-10-15", planned_entry_date: "2026-10-01", uscis_immigrant_fee_status: "not_paid" });
assert.equal(unpaidImmigrantFee.status, "READY");
assert.ok(unpaidImmigrantFee.warnings.some((item) => item.includes("Green Card")));

const eb4WrongModule = evaluateNvc({ ...base, nvc_basis: "eb4" });
assert.equal(eb4WrongModule.status, "NOT_READY");

console.log("PASS NVC Tests: transfer, DFF/Final Action, fees, DS-260, DQ, job basis, derivatives, INA 203(g), 221(g), visa validity and immigrant fee.");
