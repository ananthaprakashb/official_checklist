import permQuestionnaireJson from "../../data/usa/immigration/employment-green-card/perm/questionnaire.v1.json";
import { evaluatePerm, type PermPreflightResult } from "../core/evaluatePerm";
import type { PassportAnswers, Questionnaire } from "../types";
import { labelOption } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessPresentation } from "./types";

const questionnaire = permQuestionnaireJson as Questionnaire;

const QUESTION_LABELS: Record<string, string> = {
  perm_stage: "What is the employer's current PERM stage?",
  perm_occupation_route: "Which PERM occupation/recruitment route applies?",
  pwd_status: "What is the current Prevailing Wage Determination status?",
  pwd_validity_known: "Do you know the PWD validity start and end dates?",
  pwd_valid_from: "PWD valid from (YYYY-MM-DD)",
  pwd_valid_to: "PWD valid through (YYYY-MM-DD)",
  recruitment_started: "Has prefiling recruitment started?",
  first_recruitment_date: "What was the first recruitment date (YYYY-MM-DD)?",
  swa_job_order_start_date: "SWA job-order start date (YYYY-MM-DD)",
  swa_job_order_end_date: "SWA job-order end date (YYYY-MM-DD)",
  newspaper_recruitment_route: "Which newspaper/professional-journal recruitment route is being used?",
  newspaper_ad_1_date: "First newspaper advertisement date (YYYY-MM-DD)",
  newspaper_ad_2_date: "Second newspaper advertisement date, if applicable (YYYY-MM-DD)",
  professional_journal_ad_date: "Professional-journal advertisement date (YYYY-MM-DD)",
  journal_substitution_job_qualifies: "Does the job meet the conditions for the professional-journal substitution?",
  professional_additional_steps_count: "How many additional professional recruitment methods were completed?",
  professional_additional_steps_timing_valid: "Do the three additional professional recruitment steps satisfy the 30/180-day timing rule?",
  bargaining_representative_exists: "Is there a bargaining representative for this occupational classification at the location?",
  union_notice_provided: "Was the required Notice of Filing provided to the bargaining representative?",
  notice_posted_10_business_days: "Was the employee Notice of Filing posted for at least 10 consecutive business days?",
  notice_post_start_date: "Notice of Filing posting start date (YYYY-MM-DD)",
  notice_post_end_date: "Notice of Filing posting end date (YYYY-MM-DD)",
  in_house_media_required: "Does the employer normally use in-house media to recruit for similar positions?",
  in_house_media_completed: "Was the Notice of Filing published in the applicable in-house media?",
  qualifying_layoffs_within_6_months: "Did the employer have qualifying layoffs in the occupation/related occupation in the area within 6 months of filing?",
  laid_off_workers_notified_considered: "Were potentially qualified laid-off U.S. workers specifically notified and considered?",
  job_and_recruitment_terms_consistent: "Are the PWD, recruitment and ETA-9089 job/wage terms consistent?",
  recruitment_report_ready: "Is the signed recruitment report/supporting recruitment file ready?",
  eta9089_filing_date: "Planned or actual ETA-9089 filing date, if known (YYYY-MM-DD)",
  five_year_record_file_ready: "Is the employer prepared to retain ETA-9089 and supporting documentation for 5 years from filing?",
  audit_response_status: "What is the audit-response status?",
  audit_extension_deadline_met: "If an audit extension was granted, was the extended deadline met?",
  supervised_ad_approved_before_publication: "Was the supervised-recruitment advertisement approved by the Certifying Officer before publication?",
  supervised_deadline_status: "Are the Certifying Officer's supervised-recruitment response deadlines being met?",
  certification_date: "DOL certification date (YYYY-MM-DD)",
  i140_filed_with_certification: "Has the certified PERM already been filed with Form I-140?",
  i140_filing_date: "Form I-140 filing date (YYYY-MM-DD)",
  certification_still_within_180_days: "If I-140 is not filed yet, is the PERM certification still within its 180-day validity period?",
  denial_review_requested_within_30_days: "Was reconsideration/BALCA review requested within 30 days of the denial?",
  review_request_was_timely: "Was the pending reconsideration/BALCA request sent within the 30-day review window?"
};

const OPTION_LABELS: Record<string, string> = {
  planning: "Planning / job opportunity definition",
  prevailing_wage: "Prevailing Wage Determination",
  recruitment: "Prefiling recruitment + Notice of Filing",
  eta9089_ready: "Ready to file ETA-9089",
  eta9089_filed: "ETA-9089 filed / analyst review",
  audit: "Audit",
  supervised_recruitment: "Supervised recruitment",
  certified: "PERM certified",
  denied: "PERM denied",
  reconsideration_or_balca: "Reconsideration / BALCA review",
  professional: "Standard professional occupation — 20 CFR 656.17",
  nonprofessional: "Standard nonprofessional occupation — 20 CFR 656.17",
  college_teacher_special_handling: "College/university teacher special handling — 20 CFR 656.18",
  professional_athlete: "Professional athlete",
  schedule_a: "Schedule A — not ordinary PERM",
  not_requested: "Not requested",
  pending: "Pending",
  issued: "Issued",
  expired_or_unknown: "Expired / validity uncertain",
  two_sunday_ads: "Two different Sunday newspaper advertisements",
  rural_no_sunday_edition: "Rural area with no Sunday edition",
  professional_journal_substitution: "One Sunday ad + qualifying professional-journal substitution",
  yes: "Yes",
  no: "No",
  audit_received: "Audit received",
  preparing: "Preparing response",
  submitted_within_30_days: "Submitted within the 30-day response window",
  extension_granted: "Extension granted",
  late: "Late / deadline missed",
  on_time: "On time",
  not_sure: "Not sure"
};

function labelPermOption(value: string): string {
  return OPTION_LABELS[value] ?? labelOption(value);
}

function present(raw: unknown): ProcessPresentation {
  const result = raw as PermPreflightResult;
  return {
    status: result.status,
    title: "PERM Labor Certification",
    subtitle: `${labelPermOption(result.stage)} · ${labelPermOption(result.occupation_route)} · Sources verified ${result.sources_verified}`,
    summary: [
      { label: "Stage", value: labelPermOption(result.stage) },
      { label: "Occupation route", value: labelPermOption(result.occupation_route) },
      { label: "PWD", value: labelPermOption(result.pwd_status) },
      { label: "PWD timing", value: result.pwd_window_status },
      { label: "Recruitment timing", value: result.recruitment_window_status },
      { label: "Notice timing", value: result.notice_window_status },
      { label: "ETA-9089 / priority-date basis", value: result.eta9089_filing_date ?? "Not resolved" },
      { label: "Determination", value: result.determination_status }
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

export function createPermModule(entry: ProcessCatalogEntry): ProcessModule {
  return {
    entry,
    questionnaire,
    storageKey: `official-checklist:${questionnaire.id}:answers`,
    eyebrow: "UNITED STATES · EMPLOYMENT GREEN CARD · PERM · PWD → RECRUITMENT → ETA-9089 → DOL DETERMINATION",
    questionLabels: QUESTION_LABELS,
    questionHints: {
      perm_occupation_route: "This module applies the standard 20 CFR 656.17 professional/nonprofessional calendar. Special-handling teachers, professional athletes and Schedule A must use their own route.",
      pwd_validity_known: "The employer must either begin required recruitment or file ETA-9089 while the PWD is valid. Enter the dates so this can be calculated.",
      eta9089_filing_date: "For prefiling use, enter the intended filing date. Recruitment can age out of the 180-day window, so recalculate immediately before filing.",
      newspaper_recruitment_route: "The ordinary route uses two different Sunday advertisements. The rural and professional-journal alternatives have additional conditions.",
      professional_additional_steps_timing_valid: "For professional cases, none of the three additional steps may be older than 180 days at filing and only one may consist solely of activity inside the last 30 days.",
      audit_response_status: "The actual audit letter controls the requested documentation. The regulation gives 30 days, with one discretionary extension of up to 30 days.",
      supervised_deadline_status: "The Certifying Officer controls the supervised-recruitment advertisement, placement and response schedule. Do not reuse the ordinary prefiling ad without approval.",
      certification_still_within_180_days: "A certified PERM generally expires if it is not filed in support of Form I-140 within 180 calendar days of DOL certification."
    },
    labelOption: labelPermOption,
    sourceLinks: [
      { label: "DOL PERM Program", url: "https://flag.dol.gov/programs/perm" },
      { label: "DOL Prevailing Wage Program", url: "https://flag.dol.gov/programs/prevailingwages" },
      { label: "20 CFR 656.17 Recruitment", url: "https://www.ecfr.gov/current/title-20/chapter-V/part-656/subpart-C/section-656.17" },
      { label: "DOL Notice of Filing guide", url: "https://webapps.dol.gov/elaws/elg/pewbi.htm" },
      { label: "20 CFR 656.20 Audit", url: "https://www.ecfr.gov/current/title-20/chapter-V/part-656/subpart-C/section-656.20" },
      { label: "20 CFR 656.21 Supervised Recruitment", url: "https://www.ecfr.gov/current/title-20/chapter-V/part-656/subpart-C/section-656.21" },
      { label: "20 CFR 656.24 Determination", url: "https://www.ecfr.gov/current/title-20/chapter-V/part-656/subpart-C/section-656.24" },
      { label: "20 CFR 656.26 BALCA Review", url: "https://www.ecfr.gov/current/title-20/chapter-V/part-656/subpart-C/section-656.26" },
      { label: "20 CFR 656.30 Certification Validity", url: "https://www.ecfr.gov/current/title-20/chapter-V/part-656/subpart-C/section-656.30" }
    ],
    evaluate: (answers: PassportAnswers) => evaluatePerm(answers),
    present
  };
}
