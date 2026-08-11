import type { PassportAnswers, ProcessResult, ProcessingResult } from "../types";

const VERIFIED = "2026-08-10";
const SF_STATES = new Set(["CO", "HI", "UT", "WY", "GU"]);

const COMMON_DOCUMENTS = [
  "Government online passport application for the verified Re-issue branch",
  "Current VFS checklist used as the application cover page where required",
  "Physical passport photographs meeting the current workflow checklist",
  "Current original Indian passport and required copies, when available",
  "Affidavit for Change in Appearance & Signature",
  "Annexure E",
  "Acceptable evidence of valid U.S. status",
  "Acceptable U.S. proof of address matching the application",
  "VFS payment/application confirmation and courier or appointment materials"
];

function asBoolean(answers: PassportAnswers, key: string): boolean {
  return answers[key] === true;
}

function asString(answers: PassportAnswers, key: string): string {
  return typeof answers[key] === "string" ? String(answers[key]) : "";
}

function asNumber(answers: PassportAnswers, key: string): number {
  return typeof answers[key] === "number" ? Number(answers[key]) : Number.NaN;
}

function asStringArray(answers: PassportAnswers, key: string): string[] {
  return Array.isArray(answers[key]) ? (answers[key] as string[]) : [];
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function resolveJurisdiction(answers: PassportAnswers, warnings: string[], blockers: string[]): { value: string; needsConfirmation: boolean } {
  const state = asString(answers, "residence_state");
  if (SF_STATES.has(state)) return { value: "san_francisco", needsConfirmation: false };

  if (state === "CA") {
    const region = asString(answers, "residence_california_region");
    if (region === "northern_or_central") return { value: "san_francisco", needsConfirmation: false };
    if (region === "not_sure" || !region) {
      warnings.push("California consular region is not confirmed. Verify the current CGI jurisdiction before continuing.");
      return { value: "san_francisco_needs_confirmation", needsConfirmation: true };
    }
    blockers.push("The current Phase 3 evaluator covers the San Francisco jurisdiction; the selected California region is outside that verified branch.");
    return { value: "outside_san_francisco_scope", needsConfirmation: false };
  }

  blockers.push("The current Phase 3 evaluator covers the San Francisco jurisdiction only. Route this applicant to the correct Indian Mission before using this checklist.");
  return { value: "unsupported_in_v1", needsConfirmation: false };
}

function resolveReasons(answers: PassportAnswers): string[] {
  const reasons: string[] = [];
  const validity = asString(answers, "passport_validity");
  if (validity === "due_to_expire" || validity === "expired_within_3_years") reasons.push("expired_or_due_to_expire");
  if (validity === "expired_more_than_3_years") reasons.push("expired_more_than_3_years");
  if (asBoolean(answers, "pages_exhausted")) reasons.push("pages_exhausted");
  if (asBoolean(answers, "passport_lost_or_stolen")) reasons.push("lost");
  if (asBoolean(answers, "passport_damaged")) reasons.push("damaged");
  if (asStringArray(answers, "change_existing_particulars").some((change) => change !== "none")) {
    reasons.push("change_existing_personal_particulars");
  }
  return unique(reasons);
}

function resolveProcessing(
  answers: PassportAnswers,
  category: "adult" | "minor",
  changes: string[],
  warnings: string[]
): { value: ProcessingResult; needsConfirmation: boolean } {
  if (asString(answers, "requested_processing") !== "tatkaal") {
    return { value: "regular", needsConfirmation: false };
  }

  const hardBlock =
    asBoolean(answers, "passport_lost_or_stolen") ||
    (asBoolean(answers, "passport_damaged") && asBoolean(answers, "damaged_beyond_recognition")) ||
    changes.some((change) => ["sex", "date_of_birth", "place_of_birth", "father_name", "mother_name"].includes(change)) ||
    (category === "adult" && changes.some((change) => ["appearance", "signature"].includes(change)));

  if (hardBlock) return { value: "tatkaal_ineligible", needsConfirmation: false };

  if (changes.includes("name")) {
    warnings.push("Tatkaal excludes major name changes, but the questionnaire does not yet distinguish major from other name changes. Authoritative confirmation is required.");
    return { value: "tatkaal_needs_authoritative_confirmation", needsConfirmation: true };
  }

  return { value: "tatkaal_eligible", needsConfirmation: false };
}

function resolveFee(
  answers: PassportAnswers,
  category: "adult" | "minor",
  processing: ProcessingResult,
  warnings: string[]
): { fee?: ProcessResult["fee"]; needsConfirmation: boolean } {
  if (processing === "tatkaal_ineligible" || processing === "tatkaal_needs_authoritative_confirmation") {
    return { needsConfirmation: processing === "tatkaal_needs_authoritative_confirmation" };
  }

  const age = asNumber(answers, "age");
  const booklet = asString(answers, "booklet");
  const lostOrDamaged = asBoolean(answers, "passport_lost_or_stolen") || asBoolean(answers, "passport_damaged");
  let total: number | undefined;
  let needsConfirmation = false;

  if (category === "adult") {
    total = lostOrDamaged ? (booklet === "jumbo_60_pages" ? 321 : 271) : booklet === "jumbo_60_pages" ? 196 : 146;
  } else if (age < 15) {
    if (booklet === "jumbo_60_pages") {
      warnings.push("The current verified fee table has a single under-15 five-year tier and does not provide a separate 60-page row. Confirm the booklet choice before payment.");
      needsConfirmation = true;
    } else {
      total = lostOrDamaged ? 236 : 111;
    }
  } else {
    warnings.push("For ages 15–17, the current OKF requires an explicit validity selection. Questionnaire v1 does not yet capture it, so fee confirmation is deferred.");
    needsConfirmation = true;
  }

  if (total !== undefined && processing === "tatkaal_eligible") total += 125;

  return {
    fee: total === undefined ? undefined : {
      currency: "USD",
      current_total: total,
      convenience_charge_may_apply: true,
      verified: VERIFIED
    },
    needsConfirmation
  };
}

function resolveDocuments(answers: PassportAnswers, category: "adult" | "minor", changes: string[]): { required: string[]; conditional: string[]; needsConfirmation: boolean } {
  const required = [...COMMON_DOCUMENTS];
  const conditional: string[] = [];
  let needsConfirmation = false;

  if (category === "minor") {
    required.push("Annexure D with parental signatures/notarization required by the current minor checklist");
    required.push("Minor and parental signatures/thumb impression completed in the prescribed places");
    if (asBoolean(answers, "one_parent_consent_missing")) {
      required.push("Annexure C for the one-parent-consent-missing branch");
    }
  }

  if (asBoolean(answers, "passport_lost_or_stolen") || asBoolean(answers, "passport_damaged")) {
    required.push("Annexure F");
    conditional.push("Any current police report, incident explanation, or branch-specific evidence required by the lost/damaged checklist");
  }

  if (changes.some((change) => ["name", "spouse_name"].includes(change))) {
    conditional.push("Supporting marriage/divorce/death/remarriage/name-change evidence applicable to the exact requested change");
  }
  if (changes.some((change) => ["indian_address", "usa_address"].includes(change))) {
    conditional.push("Address evidence accepted by the current checklist for the address being changed");
  }
  if (changes.some((change) => ["father_name", "mother_name"].includes(change))) {
    conditional.push("Public/civil documents carrying the corrected parent name and any additional competent-authority evidence required by the current checklist");
    needsConfirmation = true;
  }
  if (changes.some((change) => ["date_of_birth", "place_of_birth"].includes(change))) {
    conditional.push("Exact civil, school, court, or competent-authority evidence required for DOB/POB correction");
    needsConfirmation = true;
  }

  return { required: unique(required), conditional: unique(conditional), needsConfirmation };
}

export function evaluatePassport(answers: PassportAnswers): ProcessResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  let needsConfirmation = false;

  const age = asNumber(answers, "age");
  const category: "adult" | "minor" = Number.isFinite(age) && age >= 18 ? "adult" : "minor";
  const hasExisting = asBoolean(answers, "has_existing_or_previous_passport");
  const applicationType: "fresh" | "reissue" = hasExisting ? "reissue" : "fresh";

  if (!Number.isFinite(age) || age < 0) blockers.push("Applicant age is required before the correct adult/minor checklist can be selected.");
  if (!hasExisting) blockers.push("This evaluator is for passport Re-issue. A first-time passport application must use the Fresh Passport flow.");

  const jurisdiction = resolveJurisdiction(answers, warnings, blockers);
  needsConfirmation ||= jurisdiction.needsConfirmation;

  const changes = unique(asStringArray(answers, "change_existing_particulars").filter((change) => change !== "none"));
  const rawChanges = asStringArray(answers, "change_existing_particulars");
  if (rawChanges.includes("none") && rawChanges.length > 1) blockers.push("'None' cannot be selected together with a personal-particular change.");

  const reasons = resolveReasons(answers);
  if (applicationType === "reissue" && reasons.length === 0) {
    blockers.push("No supported Re-issue reason was identified. Verify expiry, pages, loss/damage, or requested personal-particular changes.");
  }

  const processing = resolveProcessing(answers, category, changes, warnings);
  needsConfirmation ||= processing.needsConfirmation;
  if (asString(answers, "requested_processing") === "tatkaal" && processing.value === "tatkaal_ineligible") {
    blockers.push("Tatkaal is not available for the applicant facts selected. Change to Regular or correct the underlying application facts.");
  }

  const docs = resolveDocuments(answers, category, changes);
  needsConfirmation ||= docs.needsConfirmation;

  const fee = resolveFee(answers, category, processing.value, warnings);
  needsConfirmation ||= fee.needsConfirmation;

  if (asBoolean(answers, "government_form_already_submitted")) {
    const selectedService = asString(answers, "government_selected_service");
    if (selectedService !== "reissue") {
      blockers.push("Government application type mismatch: this applicant resolves to Passport Re-issue, but the submitted application is not confirmed as Re-issue.");
    }

    const selectedMission = asString(answers, "government_selected_mission").toLowerCase();
    if (jurisdiction.value === "san_francisco" && !selectedMission.includes("san francisco")) {
      blockers.push("Government application mission mismatch: the verified jurisdiction is San Francisco, but the submitted mission does not match.");
    }

    const reasonMatches = asString(answers, "government_reason_matches");
    if (reasonMatches === "no") blockers.push("Government Re-issue reason does not match the applicant facts.");
    if (reasonMatches === "not_sure" || !reasonMatches) {
      warnings.push("The Government Re-issue reason has not been confirmed against the resolved reason set.");
      needsConfirmation = true;
    }

    if (!asString(answers, "government_arn")) blockers.push("Government ARN is required for submitted applications.");
    if (!asBoolean(answers, "online_photo_uploaded")) blockers.push("Mandatory online photo upload is incomplete.");
    if (!asBoolean(answers, "online_signature_uploaded")) blockers.push("Mandatory online signature upload is incomplete.");
  }

  if (asBoolean(answers, "vfs_registration_complete")) {
    const referenceMatch = asString(answers, "vfs_reference_matches_government_arn");
    if (referenceMatch === "no") blockers.push("VFS reference/ARN does not match the Government application reference.");
    if (referenceMatch === "not_sure" || !referenceMatch) {
      warnings.push("VFS reference-to-ARN alignment has not been confirmed.");
      needsConfirmation = true;
    }
  }

  const booklet = asString(answers, "booklet") === "jumbo_60_pages" ? "jumbo_60_pages" : "ordinary_36_pages";
  let status: ProcessResult["status"] = "READY";
  if (blockers.length > 0) status = "NOT_READY";
  else if (needsConfirmation) status = "NEEDS_AUTHORITATIVE_CONFIRMATION";

  let nextStep = "Review the personalized checklist and continue with the next official step.";
  if (status === "NOT_READY") nextStep = "Fix the blocking application mismatch(es) before payment, appointment, mailing, or submission.";
  else if (status === "NEEDS_AUTHORITATIVE_CONFIRMATION") nextStep = "Resolve the flagged official-rule question before relying on the checklist for payment or submission.";
  else if (!asBoolean(answers, "government_form_already_submitted")) nextStep = "Start the Government Passport Re-issue application using the verified branch and jurisdiction.";
  else if (!asBoolean(answers, "vfs_registration_complete")) nextStep = "Complete the VFS registration/payment flow using the same Government ARN and verified application branch.";

  return {
    status,
    service: "indian_passport",
    application_type: applicationType,
    applicant_category: category,
    jurisdiction: jurisdiction.value,
    reissue_reasons: reasons,
    changes,
    processing: processing.value,
    booklet,
    fee: fee.fee,
    required_documents: docs.required,
    conditional_documents: docs.conditional,
    blockers: unique(blockers),
    warnings: unique(warnings),
    next_step: nextStep,
    sources_verified: VERIFIED
  };
}
