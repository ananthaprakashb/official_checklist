import type { PassportAnswers, ResultStatus } from "../types";

export type NvcResult = {
  status: ResultStatus;
  basis: string;
  stage: string;
  preprocessing_cutoff: string | null;
  preprocessing_eligible: boolean | null;
  final_action_cutoff: string | null;
  final_action_eligible: boolean | null;
  iv_fee_per_person: number;
  iv_fee_total: number | null;
  required_items: string[];
  conditional_items: string[];
  blockers: string[];
  warnings: string[];
  next_step: string;
  sources_verified: string;
};

type Group = "eb1" | "eb2" | "eb3" | "other_workers";
type Country = "india" | "china_mainland" | "mexico" | "philippines" | "all_other";
type Cutoff = "C" | "U" | string;
type BasisRule = { group: Group; jobOfferBased: boolean; petition: string };

const VERIFIED = "2026-08-30";
const IV_FEE = 345;

const BASIS: Record<string, BasisRule> = {
  eb1a: { group: "eb1", jobOfferBased: false, petition: "I-140 E11" },
  eb1b: { group: "eb1", jobOfferBased: true, petition: "I-140 E12" },
  eb1c: { group: "eb1", jobOfferBased: true, petition: "I-140 E13" },
  eb2_regular: { group: "eb2", jobOfferBased: true, petition: "I-140 E21" },
  eb2_niw: { group: "eb2", jobOfferBased: false, petition: "I-140 E21 NIW" },
  eb3_skilled: { group: "eb3", jobOfferBased: true, petition: "I-140 E31" },
  eb3_professional: { group: "eb3", jobOfferBased: true, petition: "I-140 E32" },
  eb3_other: { group: "other_workers", jobOfferBased: true, petition: "I-140 EW3" },
  schedule_a_eb2: { group: "eb2", jobOfferBased: true, petition: "I-140 Schedule A / EB-2" },
  schedule_a_eb3: { group: "eb3", jobOfferBased: true, petition: "I-140 Schedule A / EB-3" }
};

const BULLETINS: Record<string, Record<"dates_for_filing" | "final_action", Record<Group, Record<Country, Cutoff>>>> = {
  august_2026: {
    final_action: {
      eb1: { all_other: "C", china_mainland: "2023-07-01", india: "2022-10-15", mexico: "C", philippines: "C" },
      eb2: { all_other: "C", china_mainland: "2021-09-01", india: "U", mexico: "C", philippines: "C" },
      eb3: { all_other: "2024-09-01", china_mainland: "2022-01-01", india: "2014-01-01", mexico: "2024-09-01", philippines: "2023-08-01" },
      other_workers: { all_other: "2022-04-01", china_mainland: "2019-05-01", india: "2014-01-01", mexico: "2022-04-01", philippines: "2021-12-01" }
    },
    dates_for_filing: {
      eb1: { all_other: "C", china_mainland: "2023-12-01", india: "2023-12-01", mexico: "C", philippines: "C" },
      eb2: { all_other: "C", china_mainland: "2022-01-01", india: "2015-01-15", mexico: "C", philippines: "C" },
      eb3: { all_other: "C", china_mainland: "2022-01-08", india: "2015-01-15", mexico: "C", philippines: "2024-01-01" },
      other_workers: { all_other: "2022-08-01", china_mainland: "2019-10-01", india: "2015-01-15", mexico: "2022-08-01", philippines: "2022-08-01" }
    }
  },
  september_2026: {
    final_action: {
      eb1: { all_other: "C", china_mainland: "2023-07-01", india: "2022-10-15", mexico: "C", philippines: "C" },
      eb2: { all_other: "C", china_mainland: "2021-09-01", india: "U", mexico: "C", philippines: "C" },
      eb3: { all_other: "2024-09-01", china_mainland: "2022-01-01", india: "2014-01-01", mexico: "2024-09-01", philippines: "2023-08-01" },
      other_workers: { all_other: "2022-04-01", china_mainland: "2019-05-01", india: "2014-01-01", mexico: "2022-04-01", philippines: "2021-12-01" }
    },
    dates_for_filing: {
      eb1: { all_other: "C", china_mainland: "2023-12-01", india: "2023-12-01", mexico: "C", philippines: "C" },
      eb2: { all_other: "C", china_mainland: "2022-01-01", india: "2015-01-15", mexico: "C", philippines: "C" },
      eb3: { all_other: "C", china_mainland: "2022-01-08", india: "2015-01-15", mexico: "C", philippines: "2024-01-01" },
      other_workers: { all_other: "2022-08-01", china_mainland: "2019-10-01", india: "2015-01-15", mexico: "2022-08-01", philippines: "2022-08-01" }
    }
  }
};

const STAGE_ORDER = [
  "i140_approved_waiting_transfer",
  "waiting_case_creation",
  "welcome_letter",
  "fees",
  "ds260",
  "documents",
  "nvc_review",
  "documentarily_complete",
  "interview_scheduled",
  "medical",
  "interview",
  "refused_221g",
  "administrative_processing",
  "visa_issued",
  "admitted_lpr"
];

function s(a: PassportAnswers, key: string, fallback = "not_sure"): string {
  const value = a[key];
  return typeof value === "string" ? value : fallback;
}

function validIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function cutoffEligibility(cutoff: Cutoff | null, priorityDate: string | null): boolean | null {
  if (!cutoff || !priorityDate || !validIsoDate(priorityDate)) return null;
  if (cutoff === "C") return true;
  if (cutoff === "U") return false;
  return priorityDate < cutoff;
}

function stageAtLeast(stage: string, minimum: string): boolean {
  const current = STAGE_ORDER.indexOf(stage);
  const required = STAGE_ORDER.indexOf(minimum);
  return current >= 0 && required >= 0 && current >= required;
}

export function evaluateNvc(a: PassportAnswers): NvcResult {
  const basis = s(a, "nvc_basis");
  const stage = s(a, "nvc_stage", "i140_approved_waiting_transfer");
  const rule = BASIS[basis];
  const country = s(a, "chargeability_country") as Country | "not_sure";
  const month = s(a, "bulletin_month", "later_or_not_sure");
  const pd = a.priority_date_known === true && typeof a.priority_date === "string" ? a.priority_date.trim() : null;
  const applicantCount = typeof a.iv_applicant_count === "number" && a.iv_applicant_count >= 1 ? Math.floor(a.iv_applicant_count) : null;
  const ivFeeTotal = applicantCount === null ? null : applicantCount * IV_FEE;

  const blockers: string[] = [];
  const warnings: string[] = [];
  const required: string[] = [];
  const conditional: string[] = [];
  let confirmNeeded = false;
  const block = (message: string) => blockers.push(message);
  const confirm = (message: string) => { warnings.push(message); confirmNeeded = true; };

  if (basis === "eb4" || basis === "eb5") {
    block("EB-4 and EB-5 are not supported by this I-140-based employment NVC module. Use a category-specific immigrant-visa workflow instead.");
  } else if (!rule || basis === "not_sure") {
    confirm("Resolve the exact I-140-based employment preference before using NVC fee, document or Visa Bulletin rows.");
  }

  const i140 = s(a, "i140_approved");
  if (i140 === "no") block("The underlying I-140 is not approved. This post-petition NVC / DS-260 route cannot proceed yet.");
  else if (i140 !== "yes") confirm("Confirm the underlying I-140 approval before relying on this NVC route.");
  required.push(`Preserve the approval notice and priority-date evidence for the ${rule?.petition ?? "underlying employment immigrant petition"}.`);

  const routing = s(a, "nvc_routing_status");
  if (routing === "retained_or_not_forwarded") block("The approved petition is recorded as retained/not forwarded to DOS. Resolve USCIS-to-NVC routing before treating CEAC/NVC processing as active; Form I-824 may be relevant depending on the actual petition history.");
  else if (routing !== "forwarded_to_nvc") confirm("Confirm that USCIS has actually forwarded the approved petition to DOS/NVC; I-140 approval alone does not create an NVC case.");

  let preprocessingCutoff: Cutoff | null = null;
  let finalCutoff: Cutoff | null = null;
  let preprocessingEligible: boolean | null = null;
  let finalEligible: boolean | null = null;
  const bulletin = BULLETINS[month];
  if (!pd || !validIsoDate(pd)) confirm("Enter and verify the employment priority date before calculating NVC preference-case availability.");
  if (country === "not_sure") confirm("Resolve country of chargeability before applying the Visa Bulletin.");
  if (!bulletin) confirm("The selected month is outside the bundled August/September 2026 Visa Bulletin data. Refresh current Department of State cutoffs before advancing the case.");
  if (rule && bulletin && country !== "not_sure") {
    preprocessingCutoff = bulletin.dates_for_filing[rule.group][country];
    finalCutoff = bulletin.final_action[rule.group][country];
    preprocessingEligible = cutoffEligibility(preprocessingCutoff, pd);
    finalEligible = cutoffEligibility(finalCutoff, pd);

    if (preprocessingEligible === false && ["welcome_letter", "fees", "ds260", "documents", "nvc_review"].includes(stage)) {
      if (s(a, "nvc_preprocessing_notice_received") === "yes") {
        confirm(`The bundled Dates for Filing cutoff (${preprocessingCutoff}) does not include priority date ${pd}, but an actual NVC processing notice is recorded. Recheck the current bulletin and follow the case-specific NVC notice rather than discarding it.`);
      } else {
        block(`Priority date ${pd ?? "unknown"} is not earlier than the bundled Dates for Filing cutoff ${preprocessingCutoff}; no case-specific NVC processing notice is recorded to support advancing fee/document pre-processing now.`);
      }
    } else if (preprocessingEligible === false && stageAtLeast(stage, "documentarily_complete")) {
      warnings.push(`The current Dates for Filing cutoff (${preprocessingCutoff}) has retrogressed behind this priority date. Existing NVC documentarily complete history may remain valid; preserve the case and follow NVC notices.`);
    }

    if (finalEligible === false) {
      warnings.push(`Final Action is not currently available for this priority date (cutoff ${finalCutoff}). NVC cannot schedule/issue an employment preference immigrant visa until a number is available.`);
      if (["interview_scheduled", "medical", "interview", "visa_issued", "admitted_lpr"].includes(stage)) {
        block("The recorded stage requires current Final Action visa availability, but the bundled Visa Bulletin calculation shows no visa number available. Recheck the actual appointment/decision date and current bulletin; do not ignore an existing consular appointment notice.");
      }
    }
  }

  const preNotice = s(a, "nvc_preprocessing_notice_received");
  if (stageAtLeast(stage, "fees") && preNotice === "no") block("The case is recorded in active NVC fee/document processing without an NVC processing notice/instruction. Confirm the case is actually eligible and opened for pre-processing.");
  else if (stageAtLeast(stage, "fees") && preNotice === "not_sure") confirm("Verify the NVC notice/instructions authorizing the current pre-processing stage.");

  const welcome = s(a, "welcome_letter_received");
  if (stageAtLeast(stage, "fees") && welcome === "no") block("The case is recorded at the CEAC fee stage or later without an NVC Welcome Letter/case credentials.");
  else if (stageAtLeast(stage, "fees") && welcome === "not_sure") confirm("Confirm the NVC Welcome Letter, case number and Invoice ID before CEAC fee/application work.");

  if (applicantCount === null) confirm("Enter the number of intending immigrant applicants so per-person DS-260 fee and derivative-package requirements can be calculated.");
  required.push(`Current bundled employment immigrant-visa application fee: $${IV_FEE} per intending immigrant; recheck the DOS fee schedule immediately before payment.`);

  const ivFee = s(a, "iv_fee_status");
  if (stageAtLeast(stage, "ds260") && ivFee !== "paid") block("The case is recorded at DS-260 or a later stage, but the immigrant-visa fee is not recorded as processed/paid. NVC states DS-260 access follows processed fee payment.");
  else if (stage === "fees" && ivFee === "not_sure") confirm("Confirm the CEAC immigrant-visa fee status before advancing to DS-260.");

  const i864Exception = s(a, "i864_exception_applies");
  const aosFee = s(a, "aos_fee_status");
  const i864Status = s(a, "i864_status");
  if (i864Exception === "yes") {
    conditional.push("Employment-based I-864 exception applies: follow NVC's current Affidavit-of-Support fee and Form I-864 evidence requirements for the qualifying U.S.-citizen/LPR relative/significant-owner case.");
    if (stageAtLeast(stage, "documents") && aosFee !== "paid") block("This employment case is recorded as requiring Form I-864, but the Affidavit-of-Support fee is not recorded as paid before the document stage.");
    if (stageAtLeast(stage, "nvc_review") && i864Status !== "submitted") block("This employment case is recorded as requiring Form I-864, but the I-864 package is not recorded as submitted before NVC review/DQ.");
  } else if (i864Exception === "no") {
    conditional.push("No employment-based I-864 exception is recorded; do not add an Affidavit-of-Support requirement merely because this is an immigrant-visa case.");
    if (aosFee !== "not_required" || i864Status !== "not_required") warnings.push("The answers show Affidavit-of-Support fee/forms even though the employment-based I-864 exception is recorded as not applicable. Recheck CEAC/NVC instructions before paying or submitting unnecessary items.");
  } else {
    confirm("Confirm whether the limited employment-based I-864 exception applies before paying an Affidavit-of-Support fee or omitting required financial-support evidence.");
  }

  const ds260 = s(a, "ds260_status");
  if (stageAtLeast(stage, "documents") && ds260 !== "all_submitted") block("The case is recorded at document submission or later, but DS-260 is not complete for every intending immigrant.");
  required.push("Submit a separate DS-260 for every intending immigrant and preserve each confirmation page for interview.");

  const civil = s(a, "civil_documents_status");
  if (stageAtLeast(stage, "nvc_review") && civil !== "all_submitted") block("The case is recorded at NVC review/DQ or later, but required civil documents are not recorded as fully submitted.");
  const reciprocity = s(a, "reciprocity_schedule_checked");
  if (stageAtLeast(stage, "nvc_review") && reciprocity === "no") block("Country-specific Reciprocity and Civil Documents requirements were not checked before NVC review/DQ.");
  else if (stageAtLeast(stage, "documents") && reciprocity !== "yes") confirm("Check the Department of State Reciprocity and Civil Documents schedule for every applicant before final document submission.");
  required.push("Upload/submit civil documents exactly as NVC instructs and bring required originals/certified copies to interview.");

  const police = s(a, "police_certificates_status");
  if (["interview_scheduled", "medical", "interview"].includes(stage) && police === "need_update") block("A required police certificate needs updating before interview. Follow the post/NVC instructions and bring the updated original as required.");
  else if (["interview_scheduled", "medical", "interview"].includes(stage) && police === "not_sure") confirm("Recheck police-certificate validity and post-specific requirements before interview.");

  if (rule?.jobOfferBased) {
    const offer = s(a, "employment_offer_status");
    if (offer === "withdrawn_or_unavailable" || offer === "not_applicable_self_petition") block("This employment classification requires the qualifying permanent job offer, but the offer is unavailable or marked not applicable.");
    else if (offer !== "continuing_valid") confirm("Confirm that the qualifying permanent job offer remains valid through immigrant-visa adjudication and intended U.S. admission.");
    conditional.push("Follow the assigned embassy/consulate's current employment-based employer-letter/job-offer evidence instructions; format and recency can be post-specific.");
  } else if (rule) {
    const intent = s(a, "self_petition_work_intent");
    if (intent === "not_applicable") block("EB-1A/NIW consular processing still requires the qualifying intent to continue the extraordinary-ability work or national-interest endeavor; it is recorded as not applicable.");
    else if (intent !== "continues") confirm("Confirm the principal continues to intend the qualifying EB-1A work or NIW endeavor; do not invent an employer job-offer requirement for this self-petition basis.");
  }

  if (a.derivatives_included === true) {
    conditional.push("Each derivative spouse/child needs separate visa eligibility, fee, DS-260, civil documents, medical and interview readiness.");
    const derivative = s(a, "derivative_eligibility_status");
    if (derivative === "age_cspa_or_relationship_issue" || derivative === "not_sure") confirm("Resolve derivative relationship, age/CSPA and individual visa eligibility before relying on the principal's NVC status.");
  }

  if (a.inadmissibility_or_case_issue === true) confirm("A material inadmissibility, waiver, prior-immigration, criminal, fraud/misrepresentation or other individualized consular issue requires authoritative review; NVC document completeness does not resolve visa eligibility.");

  const oneYear = s(a, "responded_to_nvc_within_one_year");
  if (oneYear === "no") block("The answers indicate no response/application within the one-year NVC notice period. INA 203(g) termination risk requires immediate authoritative case-preservation/reinstatement review.");
  else if (oneYear === "not_sure") confirm("Confirm NVC contact/application activity so the one-year INA 203(g) termination risk is not missed during a long preference-category wait.");

  const dq = s(a, "documentarily_complete_status");
  if (stageAtLeast(stage, "documentarily_complete") && dq === "no") block("The case is labeled documentarily complete or later, but NVC has not marked it documentarily complete.");
  else if (stageAtLeast(stage, "documentarily_complete") && dq !== "yes") confirm("Confirm NVC's actual documentarily complete determination/date; uploaded documents alone do not self-create DQ status.");

  const postInstructions = s(a, "post_specific_instructions_checked");
  if (stageAtLeast(stage, "interview_scheduled") && postInstructions === "no") block("The assigned embassy/consulate's current pre-interview instructions have not been checked.");
  else if (stageAtLeast(stage, "interview_scheduled") && postInstructions !== "yes") confirm("Verify the assigned post's current medical, courier, document and employment-evidence instructions before interview.");

  const interviewLetter = s(a, "interview_letter_received");
  if (stageAtLeast(stage, "interview_scheduled") && interviewLetter === "no") block("The case is recorded as interview scheduled or later without the actual NVC/consular appointment letter.");
  else if (stageAtLeast(stage, "interview_scheduled") && interviewLetter !== "yes") confirm("Confirm the actual interview appointment letter and assigned post before acting on interview timing.");

  const medical = s(a, "medical_status");
  if (["interview_scheduled", "medical"].includes(stage) && !["scheduled", "completed_authorized_panel_physician"].includes(medical)) block("The immigrant-visa medical is not recorded as scheduled/completed with the authorized panel physician before the interview stage.");
  if (stageAtLeast(stage, "interview") && !["refused_221g", "administrative_processing"].includes(stage) && medical !== "completed_authorized_panel_physician") block("The case is recorded at interview or later without a completed authorized-panel-physician medical examination.");
  if (["interview", "interview_scheduled", "medical"].includes(stage)) {
    const docsReady = s(a, "interview_documents_ready");
    if (stage === "interview" && docsReady === "no") block("Required interview originals/confirmation pages/passport/photos are not ready.");
    else if (stage === "interview" && docsReady !== "yes") confirm("Confirm the interview document package against the appointment letter and post instructions.");
  }

  const postStatus = s(a, "post_interview_status");
  const refusalResponse = s(a, "refusal_instruction_response_status");
  if (stage === "refused_221g") {
    if (postStatus !== "221g_missing_documents" && postStatus !== "not_sure") confirm("Confirm the actual INA 221(g) refusal basis from the consular sheet.");
    if (refusalResponse === "missed_or_not_followed") block("The actual 221(g) document/instruction response was not followed. Use the consular refusal sheet immediately.");
    else confirm("INA 221(g) resolution is notice- and evidence-specific; follow the actual consular instructions and do not predict issuance timing.");
  }
  if (stage === "administrative_processing") confirm("Administrative processing is case-specific and its duration cannot be predicted. Follow the consular instructions/status channels.");
  if (postStatus === "denied_other") confirm("A non-221(g) refusal/denial is recorded. The actual consular ground controls any waiver, reconsideration or future application path.");

  if (stage === "visa_issued" || stage === "admitted_lpr") {
    if (postStatus !== "issued") block("The stage says immigrant visa issued/admitted, but the post-interview disposition is not recorded as issued.");
    const details = s(a, "visa_details_checked");
    if (details === "no") block("The issued immigrant visa biographical/classification details have not been checked for errors before travel.");
    else if (details !== "yes") confirm("Verify the printed immigrant visa details immediately after issuance.");
    const expiration = typeof a.visa_expiration_date === "string" ? a.visa_expiration_date.trim() : "";
    const entry = typeof a.planned_entry_date === "string" ? a.planned_entry_date.trim() : "";
    if (!validIsoDate(expiration)) confirm("Record the actual immigrant-visa expiration date before planning U.S. admission.");
    if (entry && !validIsoDate(entry)) confirm("Use a valid planned U.S. entry date when checking visa validity.");
    if (validIsoDate(expiration) && validIsoDate(entry) && entry > expiration) block(`Planned U.S. entry ${entry} is after the immigrant visa expiration date ${expiration}.`);

    const immigrantFee = s(a, "uscis_immigrant_fee_status");
    if (immigrantFee === "not_paid" || immigrantFee === "not_sure") warnings.push("USCIS Immigrant Fee is not recorded as paid/exempt. This does not itself invalidate admission on a valid immigrant visa, but USCIS will not produce the Green Card until the fee is paid.");
  }

  let next = "Confirm approved-petition routing and current NVC preference-case availability before fee or document collection.";
  if (stage === "waiting_case_creation") next = "Monitor current NVC case-creation timing and use the Public Inquiry Form if the petition should be at NVC but no case has been created.";
  if (stage === "welcome_letter" || stage === "fees") next = "Use the Welcome Letter/CEAC instructions to pay only the required fees; wait for the IV fee to show paid before DS-260.";
  if (stage === "ds260") next = "Complete and submit DS-260 for every intending immigrant, then preserve each confirmation page.";
  if (stage === "documents") next = "Finish country-specific civil/employment/financial-support evidence and submit it exactly as NVC instructs.";
  if (stage === "nvc_review") next = "Wait for NVC review and respond promptly to document corrections; do not self-declare the case documentarily complete.";
  if (stage === "documentarily_complete") next = finalEligible === true ? "Keep the case current and monitor the assigned post's IV Scheduling Status until NVC issues the interview appointment." : "Preserve NVC contact and monitor monthly Final Action Dates; DQ does not permit interview scheduling without a visa number.";
  if (stage === "interview_scheduled" || stage === "medical") next = "Follow the actual appointment/post instructions, complete the panel-physician medical and assemble interview originals before the appointment.";
  if (stage === "interview") next = "Attend the scheduled consular interview with the required originals and current employment/classification evidence; the consular officer determines visa eligibility.";
  if (stage === "refused_221g") next = "Follow the actual INA 221(g) refusal sheet exactly and submit requested items through the stated channel.";
  if (stage === "administrative_processing") next = "Follow the post's administrative-processing instructions/status channel and avoid predicting completion timing.";
  if (stage === "visa_issued") next = "Check the visa, pay the USCIS Immigrant Fee unless exempt, and enter the United States before the visa expires.";
  if (stage === "admitted_lpr") next = "Preserve admission records and ensure the USCIS Immigrant Fee/address are resolved so Permanent Resident Card production can complete.";

  const status: ResultStatus = blockers.length ? "NOT_READY" : confirmNeeded ? "NEEDS_AUTHORITATIVE_CONFIRMATION" : "READY";
  return {
    status,
    basis,
    stage,
    preprocessing_cutoff: preprocessingCutoff,
    preprocessing_eligible: preprocessingEligible,
    final_action_cutoff: finalCutoff,
    final_action_eligible: finalEligible,
    iv_fee_per_person: IV_FEE,
    iv_fee_total: ivFeeTotal,
    required_items: [...new Set(required)],
    conditional_items: [...new Set(conditional)],
    blockers: [...new Set(blockers)],
    warnings: [...new Set(warnings)],
    next_step: next,
    sources_verified: VERIFIED
  };
}
