import catalogJson from "../../data/process-catalog.v1.json";
import passportQuestionnaireJson from "../../data/india/us/passport/reissue/questionnaire.v2.json";
import passportServicesQuestionnaireJson from "../../data/india/us/passport/services/questionnaire.v1.json";
import { evaluatePassport } from "../core/evaluatePassport";
import { evaluatePassportServices, type PassportServiceRouterResult } from "../core/evaluatePassportServices";
import type { PassportAnswers, ProcessResult, Questionnaire } from "../types";
import { labelOption, QUESTION_LABELS } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessPresentation } from "./types";

const entries = catalogJson.processes as ProcessCatalogEntry[];
const questionnaire = passportQuestionnaireJson as Questionnaire;
const serviceQuestionnaire = passportServicesQuestionnaireJson as Questionnaire;

const SERVICE_QUESTION_LABELS: Record<string, string> = {
  requested_passport_service: "What Indian passport or passport-related service do you need?",
  fresh_ever_held_ordinary_passport: "Has the applicant ever held an Ordinary Indian Passport?",
  reissue_ever_held_ordinary_passport: "Has the applicant ever held an Ordinary Indian Passport?",
  svp_ever_held_ordinary_passport: "Was a Short Validity Ordinary Indian Passport previously issued to the applicant?",
  ec_one_way_return_to_india: "Is the applicant seeking one-way emergency travel to India because a normal passport cannot be issued immediately?",
  pcc_tourist_visa_only: "Is the PCC request only for travel abroad on a tourist visa?",
  surrender_acquired_foreign_nationality: "Has the applicant acquired citizenship or nationality of another country?",
  appeal_adverse_action_received: "Has the applicant received a passport rejection/refusal, impounding, revocation or another appealable adverse action?"
};

const SERVICE_OPTION_LABELS: Record<string, string> = {
  fresh_ordinary_passport: "First / Fresh Ordinary Indian Passport",
  passport_reissue: "Re-issue an existing or previous Ordinary Indian Passport",
  renewal_short_validity_passport: "Renew a Short Validity Passport (SVP)",
  emergency_certificate: "Emergency Certificate for one-way travel to India",
  police_clearance_certificate: "Police Clearance Certificate (PCC)",
  global_entry_background_verification: "Global Entry Program background verification",
  surrender_indian_passport: "Surrender Indian Passport after foreign nationality",
  diplomatic_passport: "Diplomatic Passport",
  official_passport: "Official Passport",
  identity_certificate: "Identity Certificate travel document",
  passport_adverse_action_appeal: "Appeal passport refusal / impounding / revocation",
  not_sure: "I am not sure which service applies"
};

function labelServiceOption(value: string): string {
  return SERVICE_OPTION_LABELS[value] ?? labelOption(value);
}

function presentPassport(raw: unknown): ProcessPresentation {
  const result = raw as ProcessResult;
  return {
    status: result.status,
    title: result.application_type === "reissue" ? "Passport Re-issue" : "Fresh Passport",
    subtitle: `${labelOption(result.applicant_category)} · ${labelOption(result.jurisdiction)} · Sources verified ${result.sources_verified}`,
    summary: [
      { label: "Application", value: labelOption(result.application_type) },
      { label: "Applicant", value: labelOption(result.applicant_category) },
      { label: "Processing", value: labelOption(result.processing) },
      { label: "Booklet", value: labelOption(result.booklet) },
      { label: "Reason(s)", value: result.reissue_reasons.length ? result.reissue_reasons.map(labelOption).join(", ") : "Not resolved" },
      { label: "Current fee branch", value: result.fee ? `$${result.fee.current_total}` : "Confirm first" }
    ],
    blockers: result.blockers,
    warnings: result.warnings,
    requiredItems: result.required_documents,
    conditionalItems: result.conditional_documents,
    nextStep: result.next_step,
    sourcesVerified: result.sources_verified,
    rawResult: result
  };
}

function presentPassportServices(raw: unknown): ProcessPresentation {
  const result = raw as PassportServiceRouterResult;
  return {
    status: result.status,
    title: result.title,
    subtitle: `Resolved service: ${labelServiceOption(result.service_family)} · Sources verified ${result.sources_verified}`,
    summary: [
      { label: "Service family", value: labelServiceOption(result.service_family) },
      { label: "Path status", value: result.status === "READY" ? "Correct service family identified" : result.status === "NOT_READY" ? "Selected path conflicts with applicant facts" : "Authoritative confirmation required" }
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

const passportEntry = entries.find((entry) => entry.id === "india-us-passport-reissue");
if (!passportEntry) throw new Error("Process catalog is missing india-us-passport-reissue");
const passportServicesEntry = entries.find((entry) => entry.id === "india-us-passport-services");
if (!passportServicesEntry) throw new Error("Process catalog is missing india-us-passport-services");

const modules = new Map<string, ProcessModule>([
  [
    passportServicesEntry.id,
    {
      entry: passportServicesEntry,
      questionnaire: serviceQuestionnaire,
      storageKey: `official-checklist:${serviceQuestionnaire.id}:answers`,
      eyebrow: "INDIA · U.S. · PASSPORT SERVICES · CLASSIFY FIRST",
      questionLabels: SERVICE_QUESTION_LABELS,
      questionHints: {
        requested_passport_service: "Choose the outcome you actually need. The correct service family determines the Government form, VFS route, documents, fees and whether an appointment/submission channel applies.",
        ec_one_way_return_to_india: "Emergency Certificate is a distinct one-way emergency travel document; it is not an expedited ordinary passport.",
        pcc_tourist_visa_only: "Current VFS PCC guidance distinguishes immigration/employment/long-term purposes from tourist-visa travel."
      },
      labelOption: labelServiceOption,
      sourceLinks: [
        { label: "Passport Seva travel-document types", url: "https://www.passportindia.gov.in/psp/GettingStarted" },
        { label: "Passport Seva Fresh document advisor", url: "https://www.passportindia.gov.in/psp/docAdvisor/attachmentAdvFreshInp" },
        { label: "Passport Seva Re-issue case router", url: "https://www.passportindia.gov.in/psp/docAdvisor/selectCaseReissue" },
        { label: "CGI San Francisco Emergency Certificate", url: "https://www.cgisf.gov.in/page/emergency-travel-document-emergency-certificate-ec/" },
        { label: "VFS Police Clearance Certificate", url: "https://services.vfsglobal.com/usa/en/ind/apply-for-pcc" },
        { label: "CGI San Francisco Global Entry Program", url: "https://www.cgisf.gov.in/page/global-entry-program-gep-for-indian-nationals/" },
        { label: "VFS Surrender of Indian Passport", url: "https://services.vfsglobal.com/usa/en/ind/apply-for-surrender" },
        { label: "Passport Seva Diplomatic/Official Passport", url: "https://www.passportindia.gov.in/psp/ApplyDiplomatic" },
        { label: "Passport Seva Appeal guidance", url: "https://services1.passportindia.gov.in/psp/FaqAppeal" }
      ],
      evaluate: (answers: PassportAnswers) => evaluatePassportServices(answers),
      present: presentPassportServices
    }
  ],
  [
    passportEntry.id,
    {
      entry: passportEntry,
      questionnaire,
      storageKey: `official-checklist:${questionnaire.id}:answers`,
      eyebrow: "INDIA · U.S. · PASSPORT RE-ISSUE · CURRENT SF/LA SERVICING TRANSITION",
      questionLabels: QUESTION_LABELS,
      questionHints: {
        government_selected_mission: "Use the mission exactly as shown on your submitted Government application.",
        change_existing_particulars: "Select every change that applies. Do not hide a change to get a simpler checklist.",
        minor_15_17_validity: "CGI says applicants aged 15–17 may request a 10-year passport or validity until age 18. Select the exact application branch."
      },
      labelOption,
      sourceLinks: [
        { label: "CGI San Francisco passport services", url: "https://www.cgisf.gov.in/page/passport-related-services/" },
        { label: "Current U.S. consular jurisdictions", url: "https://www.cgisf.gov.in/page.php?id=consulates-in-us" },
        { label: "VFS India passport services", url: "https://services.vfsglobal.com/usa/en/ind/apply-passport" }
      ],
      evaluate: (answers: PassportAnswers) => evaluatePassport(answers),
      present: presentPassport
    }
  ]
]);

export function listProcesses(): ProcessCatalogEntry[] {
  return entries;
}

export function getProcessBySlug(slug: string): ProcessCatalogEntry | undefined {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  return entries.find((entry) => entry.slug === normalized);
}

export function getProcessModule(id: string): ProcessModule | undefined {
  return modules.get(id);
}

export function evaluateProcess(id: string, answers: PassportAnswers): ProcessPresentation {
  const process = getProcessModule(id);
  if (!process) throw new Error(`No evaluator is registered for process '${id}'`);
  return process.present(process.evaluate(answers));
}
