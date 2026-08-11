import assert from "node:assert/strict";
import { evaluatePassport } from "../src/core/evaluatePassport";
import type { PassportAnswers } from "../src/types";

function base(overrides: PassportAnswers = {}): PassportAnswers {
  return {
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
    vfs_registration_complete: false,
    ...overrides
  };
}

{
  const result = evaluatePassport(base());
  assert.equal(result.status, "READY");
  assert.equal(result.application_type, "reissue");
  assert.equal(result.applicant_category, "adult");
  assert.equal(result.jurisdiction, "san_francisco_direct");
  assert.equal(result.fee?.current_total, 146);
  assert.deepEqual(result.reissue_reasons, ["expired_or_due_to_expire"]);
}

{
  const result = evaluatePassport(base({ residence_california_region: "southern_10_counties" }));
  assert.equal(result.status, "READY");
  assert.equal(result.jurisdiction, "los_angeles_transition_serviced_by_san_francisco");
  assert.ok(result.warnings.some((item) => item.includes("Southern California")));
}

{
  const result = evaluatePassport(base({
    government_form_already_submitted: true,
    government_selected_service: "fresh",
    government_selected_mission: "San Francisco",
    government_reason_matches: "yes",
    government_arn: "ARN123",
    online_photo_uploaded: true,
    online_signature_uploaded: true
  }));
  assert.equal(result.status, "NOT_READY");
  assert.ok(result.blockers.some((item) => item.includes("application type mismatch")));
}

{
  const result = evaluatePassport(base({
    age: 12,
    change_existing_particulars: ["appearance", "signature"],
    requested_processing: "tatkaal"
  }));
  assert.equal(result.processing, "tatkaal_eligible");
  assert.equal(result.status, "READY");
  assert.equal(result.fee?.current_total, 236);
  assert.ok(result.required_documents.some((item) => item.includes("Annexure D")));
}

{
  const result = evaluatePassport(base({
    change_existing_particulars: ["appearance"],
    requested_processing: "tatkaal"
  }));
  assert.equal(result.processing, "tatkaal_ineligible");
  assert.equal(result.status, "NOT_READY");
}

{
  const result = evaluatePassport(base({ age: 16, minor_15_17_validity: "ten_year" }));
  assert.equal(result.status, "READY");
  assert.equal(result.fee?.current_total, 146);
}

{
  const result = evaluatePassport(base({ age: 16, minor_15_17_validity: "until_age_18" }));
  assert.equal(result.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
  assert.equal(result.fee, undefined);
  assert.ok(result.warnings.some((item) => item.includes("ages 15–17") || item.includes("15–17")));
}

{
  const result = evaluatePassport(base({
    passport_validity: "valid_not_due",
    passport_lost_or_stolen: true
  }));
  assert.equal(result.status, "READY");
  assert.equal(result.fee?.current_total, 271);
  assert.ok(result.required_documents.includes("Annexure F"));
  assert.ok(result.reissue_reasons.includes("lost"));
}

{
  const result = evaluatePassport(base({
    passport_validity: "valid_not_due",
    pages_exhausted: false,
    change_existing_particulars: ["none"]
  }));
  assert.equal(result.status, "NOT_READY");
  assert.ok(result.blockers.some((item) => item.includes("No supported Re-issue reason")));
}

console.log("PASS Evaluator Tests: 9 scenarios.");
