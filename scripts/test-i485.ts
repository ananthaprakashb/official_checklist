import assert from "node:assert/strict";
import { evaluateI485 } from "../src/core/evaluateI485";

const base = {
  i485_basis: "eb3_professional",
  i485_stage: "ready_to_file",
  beneficiary_location: "inside_us",
  inspected_admitted_or_paroled: "yes",
  underlying_petition_status: "approved",
  priority_date_known: true,
  priority_date: "2013-12-01",
  chargeability_country: "india",
  bulletin_month: "september_2026",
  uscis_chart_selection: "final_action",
  status_history_245k: "none_known",
  complex_adjustment_issue: false,
  current_i485_edition_confirmed: "yes",
  i693_status: "ready_current_complete",
  supplement_j_status: "ready",
  include_derivatives: false,
  request_i765_c9: false,
  request_i131_advance_parole: false,
  planned_international_travel_before_i485_decision: false,
  job_change_or_portability_requested: false,
  transfer_underlying_basis_requested: false
};

const ready = evaluateI485(base);
assert.equal(ready.status, "READY");
assert.equal(ready.filing_eligible, true);
assert.equal(ready.final_action_eligible, true);

const indiaEb2 = evaluateI485({ ...base, i485_basis: "eb2_regular", priority_date: "2014-01-01" });
assert.equal(indiaEb2.status, "NOT_READY");
assert.equal(indiaEb2.filing_eligible, false);

const datesForFilingVsFinalAction = evaluateI485({ ...base, i485_basis: "eb2_regular", priority_date: "2015-01-01", uscis_chart_selection: "dates_for_filing" });
assert.equal(datesForFilingVsFinalAction.filing_eligible, true);
assert.equal(datesForFilingVsFinalAction.final_action_eligible, false);
assert.ok(datesForFilingVsFinalAction.warnings.some((item) => item.includes("Final Action")));

const chartUnknown = evaluateI485({ ...base, uscis_chart_selection: "not_checked" });
assert.equal(chartUnknown.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const abroad = evaluateI485({ ...base, beneficiary_location: "outside_us" });
assert.equal(abroad.status, "NOT_READY");

const locationUnknown = evaluateI485({ ...base, beneficiary_location: "not_sure" });
assert.equal(locationUnknown.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const over245k = evaluateI485({ ...base, status_history_245k: "over_180_since_last_lawful_admission" });
assert.equal(over245k.status, "NOT_READY");

const maybe245k = evaluateI485({ ...base, status_history_245k: "possible_180_or_less_since_last_lawful_admission", last_entry_for_245k_was_lawful_admission: "yes" });
assert.equal(maybe245k.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const bad245kAnchor = evaluateI485({ ...base, status_history_245k: "possible_180_or_less_since_last_lawful_admission", last_entry_for_245k_was_lawful_admission: "no" });
assert.equal(bad245kAnchor.status, "NOT_READY");
assert.ok(bad245kAnchor.blockers.some((item) => item.includes("lawful admission")));

const noMedical = evaluateI485({ ...base, i693_status: "not_ready" });
assert.equal(noMedical.status, "NOT_READY");

const medicalExceptionNeedsConfirmation = evaluateI485({ ...base, i693_status: "not_required_confirmed" });
assert.equal(medicalExceptionNeedsConfirmation.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

const earlyPort = evaluateI485({ ...base, i485_stage: "filed_pending", job_change_or_portability_requested: true, i485_pending_days: 179, new_job_same_or_similar: "yes", portability_supplement_j_ready: "yes" });
assert.equal(earlyPort.status, "NOT_READY");

const goodPort = evaluateI485({ ...base, i485_stage: "filed_pending", job_change_or_portability_requested: true, i485_pending_days: 181, new_job_same_or_similar: "yes", portability_supplement_j_ready: "yes" });
assert.equal(goodPort.status, "READY");

const niwPort = evaluateI485({ ...base, i485_basis: "eb2_niw", chargeability_country: "all_other", priority_date: "2026-01-01", job_change_or_portability_requested: true, i485_pending_days: 200, new_job_same_or_similar: "not_applicable", portability_supplement_j_ready: "not_applicable", supplement_j_status: "not_applicable" });
assert.equal(niwPort.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(niwPort.warnings.some((item) => item.includes("does not use ordinary INA 204(j) portability")));

const travel = evaluateI485({ ...base, i485_stage: "filed_pending", planned_international_travel_before_i485_decision: true, travel_document_or_exception_confirmed: "no" });
assert.equal(travel.status, "NOT_READY");

const missedRfe = evaluateI485({ ...base, i485_stage: "rfe", rfe_or_noid_response_status: "deadline_missed" });
assert.equal(missedRfe.status, "NOT_READY");

const transfer = evaluateI485({ ...base, i485_stage: "filed_pending", transfer_underlying_basis_requested: true });
assert.equal(transfer.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");

console.log("PASS I-485 Tests: filing chart, Final Action, 245(k), I-693, Supplement J portability, travel and notice handling.");
