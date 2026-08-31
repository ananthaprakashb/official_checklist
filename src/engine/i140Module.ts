import i140QuestionnaireJson from "../../data/usa/immigration/employment-green-card/i140/questionnaire.v1.json";
import { evaluateI140, type I140Result } from "../core/evaluateI140";
import type { PassportAnswers, Questionnaire } from "../types";
import { labelOption } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessPresentation } from "./types";

const questionnaire = i140QuestionnaireJson as Questionnaire;

const QUESTION_LABELS: Record<string, string> = {
  i140_category: "Which Form I-140 immigrant classification applies?",
  schedule_a_group: "Which Schedule A group/occupation applies?",
  schedule_a_preference: "Which underlying EB preference applies to the Schedule A case?",
  i140_stage: "What is the current Form I-140 stage?",
  petitioner_route: "Who is filing the petition?",
  labor_route: "Which labor-certification route applies?",
  perm_certification_valid_for_new_filing: "Is the certified PERM still valid for this new Form I-140 filing?",
  current_i140_edition_confirmed: "Have you confirmed the current USCIS Form I-140 edition and filing instructions?",
  category_evidence_ready: "Is the selected classification evidence package ready?",
  job_offer_status: "What is the qualifying permanent job-offer status?",
  ability_to_pay_status: "What is the employer ability-to-pay evidence status?",
  beneficiary_met_labor_requirements_by_priority_date: "Did the beneficiary meet the labor-certified/Schedule A job requirements at the required priority-date point?",
  prior_approved_eb123_petition: "Does the beneficiary have an earlier approved EB-1, EB-2 or EB-3 petition?",
  priority_date_retention_issue: "Is there a known issue that could prevent retention of the earlier priority date?",
  request_premium_processing: "Do you want to request I-140 premium processing?",
  intended_final_processing: "After petition approval, which permanent-residence route is intended?",
  rfe_response_status: "What is the status of the I-140 RFE response?",
  noid_response_status: "What is the status of the I-140 NOID response?",
  denial_notice_reviewed: "Have you reviewed the complete I-140 denial notice and its appeal/motion instructions?",
  denial_next_action: "Which post-denial action are you considering?"
};

const OPTION_LABELS: Record<string, string> = {
  eb1a: "EB-1A Extraordinary Ability (E11)",
  eb1b: "EB-1B Outstanding Professor / Researcher (E12)",
  eb1c: "EB-1C Multinational Executive / Manager (E13)",
  eb2_regular: "EB-2 Advanced Degree / Exceptional Ability — non-NIW (E21)",
  eb2_niw: "EB-2 National Interest Waiver (E21 NIW)",
  eb3_skilled: "EB-3 Skilled Worker (E31)",
  eb3_professional: "EB-3 Professional (E32)",
  eb3_other: "EB-3 Other Worker (EW3)",
  schedule_a: "Schedule A — direct-to-USCIS labor-certification route",
  eb4_or_eb5: "EB-4 or EB-5 — not Form I-140",
  group_i_registered_nurse: "Schedule A Group I — Registered Nurse",
  group_i_physical_therapist: "Schedule A Group I — Physical Therapist",
  group_ii_sciences_or_arts: "Schedule A Group II — Exceptional Ability in Sciences or Arts",
  group_ii_performing_arts: "Schedule A Group II — Exceptional Ability in Performing Arts",
  eb2: "EB-2",
  planning: "Planning / classification review",
  ready_to_file: "Ready to file",
  filed_pending: "Filed and pending",
  rfe: "Request for Evidence (RFE)",
  noid: "Notice of Intent to Deny (NOID)",
  approved: "Approved",
  denied: "Denied",
  revoked_or_withdrawn: "Revoked / withdrawn",
  employer: "Employer petition",
  self_petition: "Self-petition",
  perm_certified: "Certified PERM",
  not_required: "No labor certification required",
  yes: "Yes",
  no: "No",
  ready: "Ready",
  missing: "Missing",
  not_applicable: "Not applicable",
  evidence_ready: "Evidence ready",
  not_ready: "Not ready",
  none_known: "No known retention disqualifier",
  fraud_or_willful_misrepresentation: "Fraud / willful misrepresentation issue",
  labor_cert_revoked_or_invalidated: "Labor certification revoked / invalidated",
  material_error: "Prior approval revoked for material error",
  other_or_not_sure: "Other / not sure",
  adjustment_in_us: "Adjustment of Status in the U.S. (I-485)",
  consular_abroad: "Immigrant Visa abroad (NVC / DS-260)",
  preparing_before_notice_deadline: "Preparing before the notice deadline",
  complete_and_submitted_on_time: "Complete and submitted on time",
  deadline_missed: "Deadline missed",
  appeal: "Appeal",
  motion_reopen: "Motion to reopen",
  motion_reconsider: "Motion to reconsider",
  new_petition: "New petition",
  not_sure: "Not sure"
};

function labelI140Option(value: string): string {
  return OPTION_LABELS[value] ?? labelOption(value);
}

function present(raw: unknown): ProcessPresentation {
  const result = raw as I140Result;
  return {
    status: result.status,
    title: "Form I-140 Immigrant Petition",
    subtitle: `${labelI140Option(result.category)} · ${result.classification_code} · Sources verified ${result.sources_verified}`,
    summary: [
      { label: "Classification", value: result.classification_code },
      { label: "Petitioner", value: labelI140Option(result.petitioner_route) },
      { label: "Labor route", value: labelI140Option(result.labor_route) },
      { label: "Priority-date basis", value: result.priority_date_basis },
      { label: "Premium processing", value: result.premium_processing_window }
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

export function createI140Module(entry: ProcessCatalogEntry): ProcessModule {
  return {
    entry,
    questionnaire,
    storageKey: `official-checklist:${questionnaire.id}:answers`,
    eyebrow: "UNITED STATES · EMPLOYMENT GREEN CARD · FORM I-140 · CLASSIFICATION → EVIDENCE → USCIS DECISION",
    questionLabels: QUESTION_LABELS,
    questionHints: {
      i140_category: "Choose the actual immigrant classification. EB-1A, EB-1B, EB-1C, regular EB-2, NIW and EB-3 do not share the same petitioner or evidence rules.",
      schedule_a_group: "Schedule A currently has Group I shortage occupations and Group II exceptional-ability routes. Confirm the occupation/group before using the direct-to-USCIS labor-certification path.",
      petitioner_route: "EB-1A and NIW may permit self-petitioning. EB-1B, EB-1C, regular EB-2, EB-3 and Schedule A require a qualifying petitioner/employer route.",
      labor_route: "Ordinary certified PERM, Schedule A and no-labor-certification categories are distinct. Do not convert one into another to simplify the filing.",
      ability_to_pay_status: "For classifications requiring a job offer, USCIS expects continuing ability-to-pay evidence from the priority date until permanent residence.",
      priority_date_retention_issue: "An earlier approved EB-1/2/3 date may be retainable, but certain revocation/invalidation grounds prevent retention.",
      rfe_response_status: "Use the actual RFE deadline and requested evidence as the controlling checklist; the generic I-140 checklist does not replace it.",
      noid_response_status: "Use the actual NOID and deadline. A NOID response must address every proposed-denial ground.",
      denial_next_action: "Appeal, motion, and refiling have different jurisdiction, standing, deadlines and legal effects. The actual decision notice controls."
    },
    labelOption: labelI140Option,
    sourceLinks: [
      { label: "USCIS Form I-140", url: "https://www.uscis.gov/i-140" },
      { label: "USCIS I-140 Instructions", url: "https://www.uscis.gov/sites/default/files/document/forms/i-140instr.pdf" },
      { label: "USCIS Ability to Pay Policy", url: "https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20240105-AbilityToPay.pdf" },
      { label: "USCIS Schedule A Policy", url: "https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20240410-ScheduleA.pdf" },
      { label: "USCIS I-907 Premium Processing", url: "https://www.uscis.gov/sites/default/files/document/forms/i-907instr.pdf" },
      { label: "USCIS Priority-Date / Transfer Guidance", url: "https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-8" },
      { label: "USCIS RFE / NOID Policy", url: "https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20210609-RFEs%26NOIDs.pdf" },
      { label: "USCIS Form I-290B Instructions", url: "https://www.uscis.gov/sites/default/files/document/forms/i-290binstr.pdf" }
    ],
    evaluate: (answers: PassportAnswers) => evaluateI140(answers),
    present
  };
}
