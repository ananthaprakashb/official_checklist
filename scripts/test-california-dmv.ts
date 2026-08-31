import assert from "node:assert/strict";
import { resultOfficialLinks } from "../src/engine/processOfficialLinks";
import { evaluateProcess, getProcessBySlug, getProcessModule } from "../src/engine/registry";

const entry = getProcessBySlug("usa/california/dmv");
assert.ok(entry, "California DMV route must exist");
assert.equal(entry.id, "usa-california-dmv-dl-id");
assert.equal(entry.status, "live");
const module = getProcessModule(entry.id);
assert.ok(module, "California DMV module must be registered");

const missingRealIdResidency = evaluateProcess(entry.id, {
  ca_dmv_action: "real_id_upgrade",
  ca_card_compliance: "real_id",
  ca_can_show_accepted_legal_presence_identity: true,
  ca_real_id_identity_doc_ready: true,
  ca_real_id_residency_docs_count: 1,
  ca_real_id_name_mismatch: false
});
assert.equal(missingRealIdResidency.status, "NOT_READY");
assert.ok(missingRealIdResidency.blockers.some((item) => item.includes("two different")));

const missingNameTrace = evaluateProcess(entry.id, {
  ca_dmv_action: "real_id_upgrade",
  ca_card_compliance: "real_id",
  ca_can_show_accepted_legal_presence_identity: true,
  ca_real_id_identity_doc_ready: true,
  ca_real_id_residency_docs_count: 2,
  ca_real_id_name_mismatch: true,
  ca_real_id_name_trace_docs_ready: false
});
assert.equal(missingNameTrace.status, "NOT_READY");
assert.ok(missingNameTrace.blockers.some((item) => item.includes("name-change")));

const adultRouteForTeen = evaluateProcess(entry.id, {
  ca_dmv_action: "first_driver_license_adult",
  ca_card_compliance: "federal_noncompliant",
  ca_can_show_accepted_legal_presence_identity: true,
  ca_age: 17
});
assert.equal(adultRouteForTeen.status, "NOT_READY");
assert.ok(adultRouteForTeen.blockers.some((item) => item.includes("age 18")));

const adultFirstLicense = evaluateProcess(entry.id, {
  ca_dmv_action: "first_driver_license_adult",
  ca_card_compliance: "federal_noncompliant",
  ca_can_show_accepted_legal_presence_identity: true,
  ca_age: 30
});
assert.equal(adultFirstLicense.status, "READY");
assert.ok(adultFirstLicense.requiredItems.some((item) => item.includes("knowledge")));
assert.ok(adultFirstLicense.requiredItems.some((item) => item.includes("behind-the-wheel")));

const teenTooYoung = evaluateProcess(entry.id, {
  ca_dmv_action: "teen_instruction_permit",
  ca_card_compliance: "federal_noncompliant",
  ca_can_show_accepted_legal_presence_identity: true,
  ca_age: 15,
  ca_teen_driver_education_complete: true
});
assert.equal(teenTooYoung.status, "NOT_READY");

const teenPermitReady = evaluateProcess(entry.id, {
  ca_dmv_action: "teen_instruction_permit",
  ca_card_compliance: "federal_noncompliant",
  ca_can_show_accepted_legal_presence_identity: true,
  ca_age: 15.5,
  ca_teen_driver_education_complete: true
});
assert.equal(teenPermitReady.status, "READY");

const teenProvisionalMissingSixMonths = evaluateProcess(entry.id, {
  ca_dmv_action: "teen_provisional_license",
  ca_age: 16,
  ca_teen_driver_education_complete: true,
  ca_teen_permit_held_six_months: false,
  ca_teen_professional_training_complete: true,
  ca_teen_practice_complete: true
});
assert.equal(teenProvisionalMissingSixMonths.status, "NOT_READY");
assert.ok(teenProvisionalMissingSixMonths.blockers.some((item) => item.includes("six months")));

const outOfStateTransfer = evaluateProcess(entry.id, {
  ca_dmv_action: "transfer_out_of_state_license",
  ca_card_compliance: "federal_noncompliant",
  ca_can_show_accepted_legal_presence_identity: true,
  ca_existing_license_valid: true
});
assert.equal(outOfStateTransfer.status, "READY");
assert.ok(outOfStateTransfer.requiredItems.some((item) => item.includes("Knowledge") || item.includes("knowledge")));

const foreignTransfer = evaluateProcess(entry.id, {
  ca_dmv_action: "transfer_foreign_license",
  ca_card_compliance: "federal_noncompliant",
  ca_can_show_accepted_legal_presence_identity: true,
  ca_existing_license_valid: true
});
assert.equal(foreignTransfer.status, "READY");
assert.ok(foreignTransfer.requiredItems.some((item) => item.includes("Behind-the-wheel")));

const wrongRealIdLegalPresence = evaluateProcess(entry.id, {
  ca_dmv_action: "real_id_upgrade",
  ca_card_compliance: "real_id",
  ca_can_show_accepted_legal_presence_identity: false,
  ca_real_id_identity_doc_ready: false,
  ca_real_id_residency_docs_count: 2,
  ca_real_id_name_mismatch: false
});
assert.equal(wrongRealIdLegalPresence.status, "NOT_READY");
assert.ok(wrongRealIdLegalPresence.blockers.some((item) => item.includes("AB 60")));

const seniorRenewal = evaluateProcess(entry.id, {
  ca_dmv_action: "renew_driver_license",
  ca_card_compliance: "real_id",
  ca_age: 72,
  ca_renewal_already_real_id: true,
  ca_renewal_notice_requires_office: false
});
assert.equal(seniorRenewal.status, "READY");
assert.ok(seniorRenewal.nextStep.includes("in-person"));
assert.ok(seniorRenewal.nextStep.includes("Do not assume"));

const ssaNameMismatch = evaluateProcess(entry.id, {
  ca_dmv_action: "name_change_update",
  ca_card_compliance: "federal_noncompliant",
  ca_name_changed_with_ssa: false
});
assert.equal(ssaNameMismatch.status, "NOT_READY");
assert.ok(ssaNameMismatch.blockers.some((item) => item.includes("Social Security")));

const addressChange = evaluateProcess(entry.id, {
  ca_dmv_action: "address_change"
});
assert.equal(addressChange.status, "READY");
assert.ok(addressChange.warnings.some((item) => item.includes("10 days")));
assert.ok(addressChange.warnings.some((item) => item.includes("does not automatically")));

const ab60SecondaryReview = evaluateProcess(entry.id, {
  ca_dmv_action: "ab60_driver_license",
  ca_ab60_age_group: "adult_18_plus",
  ca_ab60_identity_residency_docs_ready: false
});
assert.equal(ab60SecondaryReview.status, "NEEDS_AUTHORITATIVE_CONFIRMATION");
assert.ok(ab60SecondaryReview.warnings.some((item) => item.includes("Secondary Review")));
assert.ok(ab60SecondaryReview.warnings.some((item) => item.includes("not eligible for a REAL ID")));

const ab60TooYoung = evaluateProcess(entry.id, {
  ca_dmv_action: "ab60_driver_license",
  ca_ab60_age_group: "under_15_5",
  ca_ab60_identity_residency_docs_ready: true
});
assert.equal(ab60TooYoung.status, "NOT_READY");

const replacementId = evaluateProcess(entry.id, {
  ca_dmv_action: "replace_id_card",
  ca_card_compliance: "federal_noncompliant"
});
assert.equal(replacementId.status, "READY");
assert.ok(replacementId.nextStep.includes("DMV office"));

const realIdLinks = resultOfficialLinks(module, { ca_dmv_action: "real_id_upgrade" }, missingRealIdResidency);
assert.ok(realIdLinks.some((link) => link.url.includes("/real-id/")), "REAL ID branch must expose the DMV REAL ID page");
const ab60Links = resultOfficialLinks(module, { ca_dmv_action: "ab60_driver_license" }, ab60SecondaryReview);
assert.ok(ab60Links.some((link) => link.url.includes("assembly-bill-ab-60")), "AB 60 branch must expose the DMV AB 60 page");
const addressLinks = resultOfficialLinks(module, { ca_dmv_action: "address_change" }, addressChange);
assert.ok(addressLinks.some((link) => link.url.includes("online-change-of-address")), "address-change branch must expose the DMV change-of-address service");

console.log("PASS California DMV Tests: REAL ID, first/transfer licensing, teen milestones, renewal, updates, AB 60 and official links.");
