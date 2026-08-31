import questionnaireJson from "../../data/usa/california/dmv/questionnaire.v1.json";
import type { PassportAnswers, Questionnaire, ResultStatus } from "../types";
import { labelOption } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessOfficialLink, ProcessPresentation } from "./types";

export type CaliforniaDmvResult = {
  status: ResultStatus;
  service_family: string;
  title: string;
  required_items: string[];
  conditional_items: string[];
  blockers: string[];
  warnings: string[];
  next_step: string;
  sources_verified: string;
};

const questionnaire = questionnaireJson as Questionnaire;
const VERIFIED = "2026-08-30";

const LABELS: Record<string, string> = {
  real_id_upgrade: "Upgrade to California REAL ID",
  first_driver_license_adult: "First California driver license — adult",
  teen_instruction_permit: "Under-18 instruction permit",
  teen_provisional_license: "Under-18 provisional driver license",
  transfer_out_of_state_license: "Transfer valid out-of-state license to California",
  transfer_foreign_license: "California license after foreign-country license",
  renew_driver_license: "Renew California driver license",
  replace_driver_license: "Replace California driver license",
  first_id_card: "First California identification card",
  renew_id_card: "Renew California identification card",
  replace_id_card: "Replace California identification card",
  name_change_update: "Update legal name on California DL/ID",
  address_change: "Change California DMV address",
  ab60_driver_license: "California AB 60 driver license",
  real_id: "REAL ID",
  federal_noncompliant: "Federal non-compliant DL/ID",
  adult_18_plus: "Age 18 or older",
  teen_15_5_to_17_5: "Age 15½ to 17½",
  under_15_5: "Under age 15½",
  not_sure: "Not sure"
};

const QUESTION_LABELS: Record<string, string> = {
  ca_dmv_action: "What California DMV DL/ID outcome do you need?",
  ca_card_compliance: "Should the resulting California DL/ID be REAL ID compliant?",
  ca_can_show_accepted_legal_presence_identity: "Can you present a DMV-accepted identity/legal-presence document for this non-AB-60 application?",
  ca_real_id_identity_doc_ready: "Do you have one acceptable REAL ID proof-of-identity document in original/certified form?",
  ca_real_id_residency_docs_count: "How many different California residency documents do you have that meet the REAL ID checklist?",
  ca_real_id_name_mismatch: "Does the name on your identity document differ from your current true full legal name?",
  ca_real_id_name_trace_docs_ready: "Do you have certified legal documents that trace the name difference to your current name?",
  ca_age: "What is the applicant's age?",
  ca_teen_driver_education_complete: "Has the teen completed/enrolled in the driver-education requirement that applies to this stage?",
  ca_teen_permit_held_six_months: "Has the provisional instruction permit been held for at least six months?",
  ca_teen_professional_training_complete: "Have the required six hours of professional driver training been completed?",
  ca_teen_practice_complete: "Have the required 50 supervised practice hours, including at least 10 at night, been completed?",
  ca_existing_license_valid: "Is the existing out-of-state/foreign driver license currently valid?",
  ca_renewal_already_real_id: "Is the current California driver license already a REAL ID?",
  ca_renewal_notice_requires_office: "Does the DMV renewal notice require an in-person office renewal?",
  ca_name_changed_with_ssa: "Has the legal name already been updated with the Social Security Administration?",
  ca_ab60_age_group: "Which age group applies to the AB 60 applicant?",
  ca_ab60_driver_education_complete: "Has the teen AB 60 applicant completed the required driver-education step?",
  ca_ab60_identity_residency_docs_ready: "Do you have the AB 60 identity and California residency documents requested by the DMV checklist?"
};

const SOURCE_LINKS: ProcessOfficialLink[] = [
  { label: "California DMV — start DL/ID application", url: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/dl-id-online-app-edl-44/" },
  { label: "California DMV — Driver Licenses", url: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/driver-licenses-dl/" },
  { label: "California DMV — REAL ID", url: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/" },
  { label: "California DMV — REAL ID document checklist", url: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/real-id-checklist/" },
  { label: "California DMV — learner permits", url: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/learners-permits/" },
  { label: "California DMV — renew DL/ID", url: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/renew-your-driver-license-dl-or-identification-card-id/" },
  { label: "California DMV — replace DL/ID", url: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/replace-your-driver-license-or-identification-dl-id-card/" },
  { label: "California DMV — update DL/ID information", url: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/updating-information-on-your-driver-license-or-identification-dl-id-card/" },
  { label: "California DMV — change address", url: "https://www.dmv.ca.gov/portal/online-change-of-address-coa-system/" },
  { label: "California DMV — AB 60 driver licenses", url: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/assembly-bill-ab-60-driver-licenses/" },
  { label: "California DMV — appointments / drive test", url: "https://www.dmv.ca.gov/portal/appointments/select-location/1/" }
];

const label = (value: string) => LABELS[value] ?? labelOption(value);
const str = (answers: PassportAnswers, key: string) => typeof answers[key] === "string" ? answers[key] as string : "not_sure";
const num = (answers: PassportAnswers, key: string) => typeof answers[key] === "number" ? answers[key] as number : null;
const yes = (answers: PassportAnswers, key: string) => answers[key] === true;

function makeResult(service: string): CaliforniaDmvResult {
  return {
    status: "READY",
    service_family: service,
    title: label(service),
    required_items: [],
    conditional_items: [],
    blockers: [],
    warnings: [],
    next_step: "Continue with the current California DMV instructions for this resolved branch.",
    sources_verified: VERIFIED
  };
}
function block(result: CaliforniaDmvResult, message: string) {
  result.status = "NOT_READY";
  result.blockers.push(message);
}
function confirm(result: CaliforniaDmvResult, message: string) {
  if (result.status === "READY") result.status = "NEEDS_AUTHORITATIVE_CONFIRMATION";
  result.warnings.push(message);
}

function applyCardTypeChecks(result: CaliforniaDmvResult, answers: PassportAnswers) {
  const card = str(answers, "ca_card_compliance");
  if (card === "not_sure") {
    confirm(result, "Choose REAL ID or federal-noncompliant DL/ID before the document checklist. A standard California card is not accepted by itself for federal REAL ID uses.");
    return;
  }
  if (card === "federal_noncompliant") {
    result.warnings.push("A federal-noncompliant California DL/ID remains usable for state identity/driving purposes but is not a REAL ID credential for federal purposes such as domestic-airline identity screening.");
    return;
  }

  result.required_items.push(
    "One California DMV-accepted REAL ID proof of identity in original or certified form",
    "Social Security number information as required by the current REAL ID application",
    "Two different California residency documents showing the required matching name/address",
    "Online REAL ID application/document upload plus an in-person DMV completion visit"
  );
  if (!yes(answers, "ca_real_id_identity_doc_ready")) {
    block(result, "The REAL ID branch is not document-ready without an acceptable original/certified proof-of-identity document.");
  }
  const count = num(answers, "ca_real_id_residency_docs_count");
  if (count === null || count < 2) {
    block(result, "California REAL ID requires two different qualifying California residency documents. Gather both before the DMV visit.");
  }
  if (yes(answers, "ca_real_id_name_mismatch") && !yes(answers, "ca_real_id_name_trace_docs_ready")) {
    block(result, "The identity-document name differs from the current legal name, but the certified name-change/name-trace documents are not ready.");
  }
}

function requireLegalPresenceOrRouteAb60(result: CaliforniaDmvResult, answers: PassportAnswers) {
  if (!yes(answers, "ca_can_show_accepted_legal_presence_identity")) {
    block(result, "This standard/REAL ID branch requires DMV-accepted identity/legal-presence evidence. For a driver license when that evidence cannot be provided, review the separate AB 60 route instead of continuing on this branch.");
  }
}

export function evaluateCaliforniaDmv(answers: PassportAnswers): CaliforniaDmvResult {
  const action = str(answers, "ca_dmv_action");
  const result = makeResult(action);

  if (action === "not_sure") {
    confirm(result, "Resolve whether the task is REAL ID, first/transfer license, teen permit/license, renewal, replacement, ID card, information update, address change, or AB 60 before collecting documents.");
    result.next_step = "Use the California DMV DL/ID service pages to identify the transaction first.";
    return result;
  }

  if (action === "real_id_upgrade") {
    if (str(answers, "ca_card_compliance") !== "real_id") {
      block(result, "A REAL ID upgrade must use the REAL ID card branch, not the federal-noncompliant option.");
    }
    requireLegalPresenceOrRouteAb60(result, answers);
    applyCardTypeChecks(result, answers);
    result.next_step = "Complete the online REAL ID application, upload the documents, save the confirmation code, then bring the original qualifying documents to a DMV office.";
    return result;
  }

  if (action === "first_driver_license_adult") {
    const age = num(answers, "ca_age");
    if (age === null || age < 18) block(result, "The adult first-license route is for age 18 or older. Use the under-18 instruction-permit/provisional route when applicable.");
    requireLegalPresenceOrRouteAb60(result, answers);
    applyCardTypeChecks(result, answers);
    result.required_items.push("California DL/ID application", "Identity and California residency evidence for the selected card type", "Vision exam", "Original-license knowledge test", "Instruction permit followed by a behind-the-wheel drive test when ready");
    result.next_step = "Start the California DL application, complete the DMV office identity/vision/knowledge steps, obtain the instruction permit, and schedule the drive test when ready.";
    return result;
  }

  if (action === "teen_instruction_permit") {
    const age = num(answers, "ca_age");
    if (age === null || age < 15.5 || age >= 18) block(result, "The under-18 instruction-permit branch requires the applicant to be at least 15½ and under 18. Use the adult route at age 18+.");
    if (!yes(answers, "ca_teen_driver_education_complete")) block(result, "The teen permit is not ready until the applicable driver-education completion/enrollment evidence is available.");
    requireLegalPresenceOrRouteAb60(result, answers);
    applyCardTypeChecks(result, answers);
    result.required_items.push("California DL/ID application signed as required by parent/guardian", "Driver-education completion/enrollment evidence", "Identity/residency evidence", "Vision exam", "Knowledge test");
    result.next_step = "Complete the teen DL application and DMV office permit requirements; after issuance, follow the provisional-license training/practice timeline.";
    return result;
  }

  if (action === "teen_provisional_license") {
    const age = num(answers, "ca_age");
    if (age === null || age < 16 || age >= 18) block(result, "The provisional under-18 license branch applies after age 16 and before age 18; otherwise use the applicable permit/adult route.");
    if (!yes(answers, "ca_teen_driver_education_complete")) block(result, "Driver education is not recorded as complete for the provisional-license route.");
    if (!yes(answers, "ca_teen_permit_held_six_months")) block(result, "The provisional instruction permit must be held for at least six months before the under-18 driving test.");
    if (!yes(answers, "ca_teen_professional_training_complete")) block(result, "The required professional driver-training milestone is not complete.");
    if (!yes(answers, "ca_teen_practice_complete")) block(result, "The required supervised practice milestone, including night practice, is not complete.");
    result.required_items.push("Valid provisional instruction permit", "Driver education/training completion", "50 supervised practice hours including at least 10 at night", "Proof of financial responsibility for the test vehicle", "Behind-the-wheel appointment");
    result.next_step = "When all provisional milestones are complete, schedule the California DMV behind-the-wheel drive test and bring the required vehicle/insurance evidence.";
    return result;
  }

  if (action === "transfer_out_of_state_license") {
    if (!yes(answers, "ca_existing_license_valid")) block(result, "This branch assumes a valid driver license from another U.S. state. If it is expired/invalid, use the DMV original-license guidance for the actual facts.");
    requireLegalPresenceOrRouteAb60(result, answers);
    applyCardTypeChecks(result, answers);
    result.required_items.push("California DL/ID application", "Valid out-of-state driver license", "SSN information", "Identity and California residency evidence", "DMV office visit", "Vision exam", "Knowledge test");
    result.next_step = "Start the California DL application and complete the out-of-state transfer requirements at a DMV office.";
    return result;
  }

  if (action === "transfer_foreign_license") {
    if (!yes(answers, "ca_existing_license_valid")) block(result, "This branch assumes a valid foreign-country driver license. If that is not the case, use the first-license route for the actual facts.");
    requireLegalPresenceOrRouteAb60(result, answers);
    applyCardTypeChecks(result, answers);
    result.required_items.push("California DL/ID application", "Identity and California residency evidence", "Vision exam", "Knowledge test", "Behind-the-wheel drive-test appointment", "Proof of financial responsibility for the test vehicle");
    result.warnings.push("California DMV specifically requires the drive test for an applicant relying on a driver license issued by another country.");
    result.next_step = "Complete the California original-license office steps, then schedule and pass the required behind-the-wheel drive test.";
    return result;
  }

  if (action === "renew_driver_license") {
    const age = num(answers, "ca_age");
    const card = str(answers, "ca_card_compliance");
    if (card === "real_id" && !yes(answers, "ca_renewal_already_real_id")) {
      applyCardTypeChecks(result, answers);
      result.warnings.push("This is a standard-to-REAL-ID conversion during renewal, so the REAL ID document/office-completion requirements apply.");
    } else if (card === "real_id" && yes(answers, "ca_renewal_already_real_id")) {
      result.warnings.push("An existing California REAL ID may be eligible for online, mail, or office renewal depending on the current renewal notice and eligibility rules.");
    } else if (card === "federal_noncompliant") {
      result.warnings.push("Renewing the federal-noncompliant card does not convert it to REAL ID.");
    } else {
      confirm(result, "Resolve whether the renewed credential should remain federal-noncompliant or be/currently is REAL ID.");
    }
    result.required_items.push("Current DMV renewal notice/instructions", "Current California driver license", "Renewal application and fee", "Vision/photo/knowledge steps only when the current DMV route requires them");
    if ((age !== null && age >= 70) || yes(answers, "ca_renewal_notice_requires_office")) {
      result.next_step = "Start the renewal application online, then complete the required in-person DMV renewal. Do not assume a knowledge test is required unless DMV indicates it.";
    } else {
      result.next_step = "Check online renewal eligibility and the renewal notice; use online/mail renewal when eligible or the DMV office route when instructed.";
    }
    return result;
  }

  if (action === "replace_driver_license") {
    result.required_items.push("MyDMV account / replacement request", "Current address on DMV record", "Replacement fee");
    result.warnings.push("The online replacement route applies to eligible noncommercial driver licenses. A replacement does not automatically change the credential to REAL ID or update a legal name.");
    result.next_step = "Use the California DMV replacement-driver-license request. If the task is also a legal name change or REAL ID upgrade, switch to that separate branch.";
    return result;
  }

  if (action === "first_id_card") {
    requireLegalPresenceOrRouteAb60(result, answers);
    applyCardTypeChecks(result, answers);
    result.required_items.push("California DL/ID application", "Identity document", "SSN information", "California residency evidence", "DMV office photo/thumbprint steps");
    const age = num(answers, "ca_age");
    if (age !== null && age >= 62) result.conditional_items.push("Ask DMV about the no-fee senior citizen ID card option for applicants age 62 or older.");
    result.next_step = "Start the California ID application and complete the required identity/residency and office steps for the selected card type.";
    return result;
  }

  if (action === "renew_id_card") {
    const card = str(answers, "ca_card_compliance");
    if (card === "real_id") applyCardTypeChecks(result, answers);
    else if (card === "not_sure") confirm(result, "Resolve REAL ID versus federal-noncompliant ID before renewal if you are also changing the card type.");
    result.required_items.push("Current ID card", "Current DMV renewal channel/notice", "Renewal fee unless a no-fee/reduced-fee program applies");
    result.next_step = "Use the California DMV ID-card renewal route; if converting a standard ID to REAL ID, complete the REAL ID document and office requirements.";
    return result;
  }

  if (action === "replace_id_card") {
    result.required_items.push("New DL/ID application for replacement ID", "DMV office visit", "Replacement fee unless an applicable reduced/no-fee program applies");
    result.warnings.push("California DMV's online duplicate-driver-license tool does not cover ID-card replacement; the ID replacement branch requires the application/office process described by DMV.");
    result.next_step = "Start the replacement ID-card application online, then visit a DMV office to complete the replacement.";
    return result;
  }

  if (action === "name_change_update") {
    if (!yes(answers, "ca_name_changed_with_ssa")) {
      block(result, "Update the legal name with the Social Security Administration before the DMV name-change application. DMV verifies the new name against SSA records.");
    }
    const card = str(answers, "ca_card_compliance");
    if (card === "real_id") applyCardTypeChecks(result, answers);
    else if (card === "not_sure") confirm(result, "Resolve whether the updated DL/ID should be REAL ID compliant before the office visit.");
    result.required_items.push("SSA name update completed first", "New California DL/ID application", "Current DL/ID", "Certified legal name-change evidence", "DMV office visit");
    result.next_step = "After SSA reflects the new legal name, start a new DL/ID application and complete the name change at a DMV office.";
    return result;
  }

  if (action === "address_change") {
    result.required_items.push("Old and new address", "MyDMV online change-of-address request or DMV 14 mail/office alternative");
    result.warnings.push("California requires DMV notification within 10 days of an address change. Updating the address does not automatically issue a new physical DL/ID card.");
    result.next_step = "Submit the DMV change of address. If you also want a replacement physical driver license showing the new address, wait for the address update to process and use the separate replacement route.";
    return result;
  }

  if (action === "ab60_driver_license") {
    const ageGroup = str(answers, "ca_ab60_age_group");
    if (ageGroup === "under_15_5") block(result, "The applicant is below the minimum age for the California instruction-permit path. Do not start the AB 60 license application yet.");
    if (ageGroup === "not_sure") confirm(result, "Resolve the applicant age group because teen AB 60 applicants have separate driver-education requirements.");
    if (ageGroup === "teen_15_5_to_17_5" && !yes(answers, "ca_ab60_driver_education_complete")) block(result, "The teen AB 60 driver-education requirement is not complete.");
    if (!yes(answers, "ca_ab60_identity_residency_docs_ready")) {
      confirm(result, "The normal AB 60 identity/residency document set is not ready. DMV may require Secondary Review; use the official AB 60 checklist before the appointment.");
    }
    result.required_items.push("California DL application", "AB 60 proof of identity and California residency", "Knowledge test", "DMV office appointment", "Behind-the-wheel drive test after the permit/identity-review stage");
    result.warnings.push("AB 60 is a California driver license route and is not eligible for a REAL ID credential.");
    result.next_step = "Use the California DMV AB 60 checklist, complete the DL application, and follow DMV's identity/residency review and testing sequence.";
    return result;
  }

  confirm(result, "The selected transaction requires current DMV confirmation before continuing.");
  return result;
}

function present(raw: unknown): ProcessPresentation {
  const result = raw as CaliforniaDmvResult;
  return {
    status: result.status,
    title: result.title,
    subtitle: `California DMV · ${label(result.service_family)} · Sources verified ${result.sources_verified}`,
    summary: [
      { label: "DMV transaction", value: label(result.service_family) },
      { label: "Preflight status", value: result.status === "READY" ? "Correct transaction and known prerequisites aligned" : result.status === "NOT_READY" ? "A branch/prerequisite mismatch must be fixed" : "Current DMV confirmation is required" }
    ],
    blockers: result.blockers,
    warnings: result.warnings,
    requiredItems: result.required_items,
    conditionalItems: result.conditional_items,
    nextStep: result.next_step,
    sourcesVerified: result.sources_verified,
    rawResult: result
  };
}

function resolveLinks(answers: PassportAnswers): ProcessOfficialLink[] {
  const action = str(answers, "ca_dmv_action");
  const find = (...patterns: RegExp[]) => SOURCE_LINKS.filter((link) => patterns.some((pattern) => pattern.test(`${link.label} ${link.url}`)));
  if (action === "real_id_upgrade") return find(/REAL ID/i, /start DL\/ID application/i);
  if (action === "teen_instruction_permit" || action === "teen_provisional_license") return find(/learner permits/i, /appointments/i, /start DL\/ID application/i);
  if (action === "renew_driver_license" || action === "renew_id_card") return find(/renew DL\/ID/i, /REAL ID/i);
  if (action === "replace_driver_license" || action === "replace_id_card") return find(/replace DL\/ID/i);
  if (action === "name_change_update") return find(/update DL\/ID/i, /REAL ID/i);
  if (action === "address_change") return find(/change address/i);
  if (action === "ab60_driver_license") return find(/AB 60/i, /appointments/i, /start DL\/ID application/i);
  if (action === "transfer_foreign_license") return find(/Driver Licenses/i, /appointments/i, /start DL\/ID application/i);
  if (action === "transfer_out_of_state_license" || action === "first_driver_license_adult" || action === "first_id_card") return find(/Driver Licenses/i, /start DL\/ID application/i, /REAL ID/i);
  return SOURCE_LINKS.slice(0, 5);
}

export function createCaliforniaDmvModule(entry: ProcessCatalogEntry): ProcessModule {
  return {
    entry,
    questionnaire,
    storageKey: `official-checklist:${questionnaire.id}:answers`,
    eyebrow: "CALIFORNIA · DMV · DRIVER LICENSE / ID / REAL ID · CLASSIFY FIRST",
    questionLabels: QUESTION_LABELS,
    questionHints: {
      ca_dmv_action: "Choose the outcome first. REAL ID, AB 60, first license, transfer, renewal, replacement, teen licensing, and record updates have different evidence and office/test requirements.",
      ca_card_compliance: "REAL ID is federally compliant. A federal-noncompliant California DL/ID can still serve state purposes but not federal REAL ID uses.",
      ca_real_id_residency_docs_count: "DMV requires two different qualifying California residency documents for REAL ID.",
      ca_name_changed_with_ssa: "DMV checks a legal name change against Social Security records before issuing the updated credential."
    },
    labelOption: label,
    sourceLinks: SOURCE_LINKS,
    resolveSourceLinks: (answers) => resolveLinks(answers),
    evaluate: evaluateCaliforniaDmv,
    present
  };
}
