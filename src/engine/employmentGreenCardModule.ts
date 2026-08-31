import employmentGreenCardQuestionnaireJson from "../../data/usa/immigration/employment-green-card/questionnaire.v1.json";
import { evaluateEmploymentGreenCard, type EmploymentGreenCardResult } from "../core/evaluateEmploymentGreenCard";
import type { PassportAnswers, Questionnaire } from "../types";
import { labelOption } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessPresentation } from "./types";

const questionnaire = employmentGreenCardQuestionnaireJson as Questionnaire;

const QUESTION_LABELS: Record<string, string> = {
  employment_category: "Which employment-based immigrant category applies?",
  schedule_a_preference: "Which preference row applies to the Schedule A case?",
  employment_gc_stage: "What is the current employment-based Green Card stage?",
  beneficiary_location: "Where is the beneficiary currently located?",
  labor_certification_route: "Which labor-certification route is being used?",
  perm_status: "What is the current PERM status?",
  perm_certification_within_180_days: "Is the certified PERM still within its 180-day validity period for the immigrant petition?",
  immigrant_petition_status: "What is the immigrant petition status?",
  priority_date_known: "Do you know the employment-based priority date?",
  priority_date: "What is the priority date?",
  chargeability_country: "Which country of chargeability applies for the Visa Bulletin?",
  bulletin_month: "Which Visa Bulletin month are you evaluating?",
  intended_final_processing: "Will final permanent-residence processing be through I-485 in the U.S. or an immigrant visa abroad?",
  physically_present_in_us: "Is the applicant physically present in the United States for adjustment of status?",
  uscis_chart_selection: "Which employment-based Visa Bulletin chart has USCIS authorized for I-485 filing this month?",
  employment_basis_still_valid: "Is the underlying employment/self-petition basis still valid?",
  medical_i693_ready: "Is the required Form I-693 medical package ready for the planned new I-485 filing?",
  complex_adjustment_issue: "Is there a status-history, unauthorized-employment, admissibility, removal, J-1, or similar issue needing individualized review?",
  i485_status: "What is the Form I-485 status?",
  nvc_case_created: "Has NVC created/accepted the immigrant-visa case?",
  include_derivatives: "Will a spouse or child apply as a derivative beneficiary?",
  i485_pending_180_days: "Has the employment-based I-485 been pending for at least 180 days?",
  job_changed_or_portability_needed: "Has the job changed, or do you need to evaluate INA 204(j) portability?",
  request_ead_with_i485: "Do you want to evaluate an I-765 EAD with the I-485?",
  request_advance_parole_with_i485: "Do you want to evaluate I-131 Advance Parole with the I-485?"
};

const OPTION_LABELS: Record<string, string> = {
  eb1a_extraordinary_ability: "EB-1A Extraordinary Ability",
  eb1b_outstanding_professor_researcher: "EB-1B Outstanding Professor / Researcher",
  eb1c_multinational_manager_executive: "EB-1C Multinational Manager / Executive",
  eb2_advanced_degree_exceptional_ability: "EB-2 Advanced Degree / Exceptional Ability",
  eb2_national_interest_waiver: "EB-2 National Interest Waiver (NIW)",
  eb3_professional: "EB-3 Professional",
  eb3_skilled_worker: "EB-3 Skilled Worker",
  eb3_other_worker: "EB-3 Other Worker",
  schedule_a: "Schedule A",
  eb4_special_immigrant: "EB-4 Special Immigrant",
  eb5_unreserved: "EB-5 Unreserved",
  eb5_rural_set_aside: "EB-5 Rural Set-Aside",
  eb5_high_unemployment_set_aside: "EB-5 High-Unemployment Set-Aside",
  eb5_infrastructure_set_aside: "EB-5 Infrastructure Set-Aside",
  eb2: "EB-2",
  eb3: "EB-3",
  planning: "Planning / category selection",
  labor_certification: "Labor certification",
  immigrant_petition: "Immigrant petition",
  waiting_for_visa_number: "Waiting for visa-number availability",
  adjustment_of_status: "I-485 adjustment of status",
  consular_processing: "NVC / immigrant-visa consular processing",
  pending_adjustment: "Pending employment-based I-485",
  inside_us: "Inside the United States",
  outside_us: "Outside the United States",
  dol_perm: "DOL PERM",
  not_required: "No ordinary labor certification required",
  not_started: "Not started",
  prevailing_wage: "Prevailing Wage Determination",
  recruitment: "Recruitment / Notice of Filing",
  filed: "ETA Form 9089 filed",
  certified: "PERM certified",
  denied: "Denied",
  expired: "Certification expired",
  not_filed: "Not filed",
  pending: "Pending",
  approved: "Approved",
  india: "India",
  china_mainland: "China-mainland born",
  mexico: "Mexico",
  philippines: "Philippines",
  all_other: "All other chargeability areas",
  august_2026: "August 2026",
  september_2026: "September 2026",
  later_or_not_sure: "Later month / not sure",
  adjustment_in_us: "Adjustment of Status in the U.S. (I-485)",
  consular_abroad: "Immigrant Visa abroad (NVC / DS-260)",
  final_action: "Final Action Dates",
  dates_for_filing: "Dates for Filing",
  not_checked: "Not checked yet",
  not_sure: "Not sure"
};

function labelEmploymentOption(value: string): string {
  return OPTION_LABELS[value] ?? labelOption(value);
}

function present(raw: unknown): ProcessPresentation {
  const result = raw as EmploymentGreenCardResult;
  const eligibility = (value: boolean | null) => value === true ? "Eligible by bundled cutoff" : value === false ? "Not eligible by bundled cutoff" : "Not resolved";
  const cutoff = (value: string | null) => value ?? "Not resolved";

  return {
    status: result.status,
    title: "Employment-Based Green Card",
    subtitle: `${labelEmploymentOption(result.category)} · ${labelEmploymentOption(result.stage)} · Sources verified ${result.sources_verified}`,
    summary: [
      { label: "Category", value: labelEmploymentOption(result.category) },
      { label: "Stage", value: labelEmploymentOption(result.stage) },
      { label: "Petition", value: result.petition_form },
      { label: "Labor route", value: labelEmploymentOption(result.labor_certification_route) },
      { label: "Priority date", value: result.priority_date ?? "Not resolved" },
      { label: "Dates for Filing", value: `${cutoff(result.dates_for_filing_cutoff)} · ${eligibility(result.dates_for_filing_eligible)}` },
      { label: "Final Action", value: `${cutoff(result.final_action_cutoff)} · ${eligibility(result.final_action_eligible)}` }
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

export function createEmploymentGreenCardModule(entry: ProcessCatalogEntry): ProcessModule {
  return {
    entry,
    questionnaire,
    storageKey: `official-checklist:${questionnaire.id}:answers`,
    eyebrow: "UNITED STATES · EMPLOYMENT-BASED GREEN CARD · CATEGORY → PETITION → VISA NUMBER → FINAL PROCESSING",
    questionLabels: QUESTION_LABELS,
    questionHints: {
      employment_category: "Start with the actual immigrant preference/petition category. The category determines whether ordinary PERM, Schedule A, I-140, I-360, or I-526/I-526E applies.",
      labor_certification_route: "Do not assume every employment-based case uses PERM. NIW/EB-1 and EB-4/EB-5 use different routes; Schedule A has its own labor-certification procedure.",
      bulletin_month: "The bundled cutoff tables cover August and September 2026 only. Later months require a fresh authoritative source check.",
      uscis_chart_selection: "USCIS separately announces whether employment-based I-485 applicants may use Final Action Dates or Dates for Filing for a month. Verify that selection; do not choose the more favorable chart yourself.",
      complex_adjustment_issue: "This includes potentially material status-history, unauthorized-employment, admissibility, removal, J-1, or similar facts that require individualized legal review."
    },
    labelOption: labelEmploymentOption,
    sourceLinks: [
      { label: "DOL Permanent Labor Certification", url: "https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent" },
      { label: "USCIS Form I-140", url: "https://www.uscis.gov/i-140" },
      { label: "USCIS Form I-485", url: "https://www.uscis.gov/i-485" },
      { label: "USCIS Visa Availability & Priority Dates", url: "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates" },
      { label: "DOS August 2026 Visa Bulletin", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-august-2026.html" },
      { label: "DOS September 2026 Visa Bulletin", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-september-2026.html" },
      { label: "DOS National Visa Center", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/national-visa-center.html" },
      { label: "USCIS I-485 Supplement J", url: "https://www.uscis.gov/i-485supj" },
      { label: "USCIS Form I-693", url: "https://www.uscis.gov/i-693" },
      { label: "USCIS EB-5", url: "https://www.uscis.gov/eb-5" }
    ],
    evaluate: (answers: PassportAnswers) => evaluateEmploymentGreenCard(answers),
    present
  };
}
