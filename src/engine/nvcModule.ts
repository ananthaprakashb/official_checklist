import questionnaireJson from "../../data/usa/immigration/employment-green-card/nvc/questionnaire.v1.json";
import { evaluateNvc, type NvcResult } from "../core/evaluateNvc";
import type { PassportAnswers, Questionnaire } from "../types";
import { labelOption } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessPresentation } from "./types";

const questionnaire = questionnaireJson as Questionnaire;

const Q: Record<string, string> = {
  nvc_basis: "Which employment-based immigrant classification supports this NVC case?",
  nvc_stage: "What is the current NVC / immigrant-visa stage?",
  i140_approved: "Is the underlying Form I-140 approved?",
  nvc_routing_status: "Has USCIS forwarded the approved petition to DOS/NVC?",
  priority_date_known: "Do you know the priority date?",
  priority_date: "Priority date (YYYY-MM-DD)",
  chargeability_country: "Which country of chargeability applies?",
  bulletin_month: "Which Visa Bulletin month are you evaluating?",
  nvc_preprocessing_notice_received: "Has NVC instructed this preference case to begin pre-processing?",
  welcome_letter_received: "Have you received the NVC Welcome Letter / CEAC case credentials?",
  iv_applicant_count: "How many intending immigrants will apply for visas?",
  iv_fee_status: "What is the CEAC immigrant-visa fee status?",
  i864_exception_applies: "Does the employment-based I-864 relative/significant-owner exception apply?",
  aos_fee_status: "What is the CEAC Affidavit-of-Support fee status?",
  i864_status: "What is the Form I-864 package status?",
  ds260_status: "What is the DS-260 status for all intending immigrants?",
  civil_documents_status: "What is the civil-document submission status?",
  reciprocity_schedule_checked: "Have country-specific reciprocity/civil-document rules been checked?",
  police_certificates_status: "What is the police-certificate status?",
  employment_offer_status: "What is the qualifying permanent job-offer status?",
  self_petition_work_intent: "For EB-1A/NIW, does the principal intend to continue the qualifying work/endeavor?",
  post_specific_instructions_checked: "Have the assigned embassy/consulate's current instructions been checked?",
  derivatives_included: "Are derivative spouse/children applying?",
  derivative_eligibility_status: "Are derivative relationship/age/CSPA facts clear?",
  inadmissibility_or_case_issue: "Is there a material inadmissibility/waiver/immigration-history issue?",
  responded_to_nvc_within_one_year: "Has the applicant maintained required NVC contact/application activity within the one-year notice period?",
  documentarily_complete_status: "Has NVC itself marked the case documentarily complete?",
  interview_letter_received: "Has the actual interview appointment letter been received?",
  medical_status: "What is the immigrant-visa medical status?",
  interview_documents_ready: "Are the required interview originals/confirmation pages/passport/photos ready?",
  post_interview_status: "What is the current consular disposition?",
  refusal_instruction_response_status: "If refused under 221(g), what is the instruction-response status?",
  visa_details_checked: "If a visa was issued, were the printed visa details checked?",
  visa_expiration_date: "Immigrant visa expiration date (YYYY-MM-DD)",
  planned_entry_date: "Planned U.S. entry date (YYYY-MM-DD)",
  uscis_immigrant_fee_status: "What is the USCIS Immigrant Fee status?"
};

const L: Record<string, string> = {
  eb1a: "EB-1A Extraordinary Ability", eb1b: "EB-1B Outstanding Professor/Researcher", eb1c: "EB-1C Multinational Manager/Executive",
  eb2_regular: "EB-2 regular", eb2_niw: "EB-2 NIW", eb3_skilled: "EB-3 Skilled Worker", eb3_professional: "EB-3 Professional", eb3_other: "EB-3 Other Worker",
  schedule_a_eb2: "Schedule A / EB-2", schedule_a_eb3: "Schedule A / EB-3", eb4: "EB-4", eb5: "EB-5",
  i140_approved_waiting_transfer: "Approved I-140 / waiting transfer", waiting_case_creation: "Waiting for NVC case creation", welcome_letter: "Welcome Letter", fees: "CEAC fees", ds260: "DS-260", documents: "Civil / employment documents", nvc_review: "NVC review", documentarily_complete: "Documentarily complete", interview_scheduled: "Interview scheduled", medical: "Medical preparation", interview: "Consular interview", refused_221g: "INA 221(g)", administrative_processing: "Administrative processing", visa_issued: "Immigrant visa issued", admitted_lpr: "Admitted as permanent resident",
  forwarded_to_nvc: "Forwarded to NVC", retained_or_not_forwarded: "Retained / not forwarded", india: "India", china_mainland: "China-mainland born", mexico: "Mexico", philippines: "Philippines", all_other: "All other chargeability areas", august_2026: "August 2026", september_2026: "September 2026", later_or_not_sure: "Later month / not sure",
  paid: "Paid", processing: "Processing", unpaid: "Unpaid", not_required: "Not required", ready: "Ready", submitted: "Submitted", not_ready: "Not ready", all_submitted: "All submitted", partial: "Partial", not_started: "Not started", incomplete: "Incomplete", current: "Current", need_update: "Needs update", continuing_valid: "Continuing / valid", withdrawn_or_unavailable: "Withdrawn / unavailable", not_applicable_self_petition: "Not applicable — self petition", continues: "Continues", changed_or_unclear: "Changed / unclear", all_clear: "All clear", age_cspa_or_relationship_issue: "Age / CSPA / relationship issue", completed_authorized_panel_physician: "Completed with authorized panel physician", scheduled: "Scheduled", none: "No post-interview disposition yet", issued: "Issued", "221g_missing_documents": "221(g) — missing documents/information", "221g_administrative_processing": "221(g) — administrative processing", denied_other: "Other refusal/denial", submitted_as_instructed: "Submitted as instructed", preparing: "Preparing response", missed_or_not_followed: "Missed / not followed", exempt: "Exempt", not_paid: "Not paid", yes: "Yes", no: "No", not_sure: "Not sure", not_applicable: "Not applicable"
};

const label = (value: string) => L[value] ?? labelOption(value);
const eligibility = (value: boolean | null) => value === true ? "Eligible by bundled cutoff" : value === false ? "Not eligible by bundled cutoff" : "Not resolved";
const cutoff = (value: string | null) => value ?? "Not resolved";

function present(raw: unknown): ProcessPresentation {
  const r = raw as NvcResult;
  return {
    status: r.status,
    title: "Employment-Based NVC / DS-260",
    subtitle: `${label(r.basis)} · ${label(r.stage)} · Sources verified ${r.sources_verified}`,
    summary: [
      { label: "Basis", value: label(r.basis) },
      { label: "Stage", value: label(r.stage) },
      { label: "NVC pre-processing", value: `${cutoff(r.preprocessing_cutoff)} · ${eligibility(r.preprocessing_eligible)}` },
      { label: "Final Action", value: `${cutoff(r.final_action_cutoff)} · ${eligibility(r.final_action_eligible)}` },
      { label: "IV application fee", value: r.iv_fee_total === null ? `$${r.iv_fee_per_person} per applicant` : `$${r.iv_fee_total} (${r.iv_fee_per_person} × applicants)` }
    ],
    blockers: r.blockers,
    warnings: r.warnings,
    requiredItems: r.required_items,
    conditionalItems: r.conditional_items,
    nextStep: r.next_step,
    sourcesVerified: r.sources_verified,
    rawResult: r
  };
}

export function createNvcModule(entry: ProcessCatalogEntry): ProcessModule {
  return {
    entry,
    questionnaire,
    storageKey: `official-checklist:${questionnaire.id}:answers`,
    eyebrow: "UNITED STATES · EMPLOYMENT GREEN CARD · NVC / DS-260 · PETITION TRANSFER → CEAC → DQ → FINAL ACTION → INTERVIEW → ADMISSION",
    questionLabels: Q,
    questionHints: {
      nvc_routing_status: "An approved I-140 does not itself prove that DOS/NVC has the petition. Confirm the actual transfer/case-creation status.",
      nvc_preprocessing_notice_received: "Dates for Filing can inform pre-processing, but the actual NVC notice controls whether this case should begin fees/documents now.",
      documentarily_complete_status: "Only NVC can mark the case documentarily complete. Uploading documents is not the same as DQ.",
      i864_exception_applies: "Most employment cases do not automatically use I-864. Check the limited U.S.-citizen/LPR relative/significant-owner rule before paying an AOS fee.",
      post_specific_instructions_checked: "Interview evidence and courier/medical instructions vary by embassy or consulate. The generic NVC checklist does not override the assigned post.",
      responded_to_nvc_within_one_year: "Long visa-number waits still require case preservation. NVC warns that failure to respond/apply within one year of notice can trigger INA 203(g) termination risk."
    },
    labelOption: label,
    sourceLinks: [
      { label: "DOS Employment-Based Immigrant Visas", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/employment-based-immigrant-visas.html" },
      { label: "DOS NVC Processing", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-1-submit-a-petition/step-2-begin-nvc-processing.html" },
      { label: "DOS Pay NVC Fees", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-1-submit-a-petition/step-3-pay-fees.html" },
      { label: "DOS DS-260", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/forms/online-immigrant-visa-forms/ds-260-faqs.html" },
      { label: "DOS IV Scheduling Status", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/iv-wait-times.html" },
      { label: "DOS Interview Preparation", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-10-prepare-for-the-interview.html" },
      { label: "DOS After the Interview / 221(g)", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-10-prepare-for-the-interview/step-12-after-the-interview.html" },
      { label: "USCIS Immigrant Fee", url: "https://my.uscis.gov/accounts/uscis-immigrant-fee/start/overview" }
    ],
    evaluate: (answers: PassportAnswers) => evaluateNvc(answers),
    present
  };
}
