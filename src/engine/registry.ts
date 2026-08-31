import catalogJson from "../../data/process-catalog.v1.json";
import passportQuestionnaireJson from "../../data/india/us/passport/reissue/questionnaire.v2.json";
import passportServicesQuestionnaireJson from "../../data/india/us/passport/services/questionnaire.v1.json";
import usImmigrationQuestionnaireJson from "../../data/usa/immigration/services/questionnaire.v1.json";
import { evaluatePassport } from "../core/evaluatePassport";
import { evaluatePassportServices, type PassportServiceRouterResult } from "../core/evaluatePassportServices";
import { evaluateUsImmigrationServices, type UsImmigrationServiceRouterResult } from "../core/evaluateUsImmigrationServices";
import type { PassportAnswers, ProcessResult, Questionnaire } from "../types";
import { labelOption, QUESTION_LABELS } from "../uiText";
import { createEmploymentGreenCardModule } from "./employmentGreenCardModule";
import { createHighFrictionModule, HIGH_FRICTION_PROCESS_IDS } from "./highFrictionModules";
import { createI140Module } from "./i140Module";
import { createI485Module } from "./i485Module";
import { createNvcModule } from "./nvcModule";
import { createPermModule } from "./permModule";
import type { ProcessCatalogEntry, ProcessModule, ProcessPresentation } from "./types";

const entries = catalogJson.processes as ProcessCatalogEntry[];
const questionnaire = passportQuestionnaireJson as Questionnaire;
const serviceQuestionnaire = passportServicesQuestionnaireJson as Questionnaire;
const usImmigrationQuestionnaire = usImmigrationQuestionnaireJson as Questionnaire;

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

const US_IMMIGRATION_QUESTION_LABELS: Record<string, string> = {
  requested_us_immigration_service: "What U.S. immigration or visa outcome do you need?",
  employment_green_card_stage: "Which employment-based green card stage are you at?",
  family_beneficiary_location: "Where will the family-based beneficiary process the permanent-residence case?",
  aos_currently_inside_us: "Is the applicant physically present in the United States now?",
  nonimmigrant_visa_category: "Which nonimmigrant visa category best describes the application?",
  h1b_case_type: "What type of H-1B employer petition is this?",
  h4_action: "Does the H-4 applicant need status action inside the U.S. or a visa abroad?",
  h4_ead_basis: "What is the qualifying H-1B principal basis for H-4 EAD?",
  ead_category_known: "Do you know the exact Form I-765 eligibility category?",
  travel_document_type: "Which USCIS travel document do you need?",
  green_card_action: "What needs to happen to the Permanent Resident Card/status?",
  naturalization_may_already_be_citizen: "Could the applicant already have acquired or derived U.S. citizenship?",
  change_address_pending_uscis_case: "Is there a pending USCIS case that also needs the new address?",
  i94_issue: "What is wrong or needed with the I-94?"
};

const US_IMMIGRATION_OPTION_LABELS: Record<string, string> = {
  employment_green_card: "Employment-based Green Card",
  family_green_card: "Family-based Green Card",
  adjustment_of_status: "Adjustment of Status (I-485)",
  immigrant_visa_consular_processing: "Immigrant Visa / NVC / DS-260",
  nonimmigrant_visa_application: "Nonimmigrant Visa / DS-160",
  h1b_petition: "H-1B employer petition",
  h4_status: "H-4 status or visa",
  h4_ead: "H-4 Employment Authorization (EAD)",
  employment_authorization: "Employment Authorization Document (I-765)",
  travel_document: "Travel Document / Advance Parole / Reentry Permit",
  green_card_replace_or_renew: "Renew / replace / correct Green Card",
  naturalization: "Naturalization / citizenship",
  change_of_address: "USCIS change of address",
  i94_record_or_correction: "I-94 record / correction",
  not_sure: "I am not sure which process applies",
  perm: "PERM labor certification",
  i140: "I-140 immigrant petition",
  i485: "I-485 adjustment of status",
  consular: "NVC / immigrant visa consular processing",
  inside_us: "Inside the United States",
  outside_us: "Outside the United States",
  visitor_or_business: "Visitor / business visa",
  student_or_exchange: "Student / exchange visa",
  petition_based_worker: "Petition-based temporary worker",
  dependent: "Dependent visa",
  other_or_not_sure: "Other / not sure",
  cap_selected: "Cap-subject with selected registration",
  cap_exempt: "Cap-exempt",
  change_employer: "Change of employer",
  extension: "Extension",
  amendment: "Amendment",
  extend_or_change_inside_us: "Extend or change H-4 status inside the U.S.",
  visa_abroad: "Apply for H-4 visa abroad",
  approved_i140: "H-1B principal has approved I-140",
  ac21_extension: "H-1B principal has qualifying AC21 extension",
  neither: "Neither qualifying basis",
  advance_parole: "Advance Parole",
  reentry_permit: "Reentry Permit",
  refugee_travel_document: "Refugee Travel Document",
  tps_travel_authorization: "TPS Travel Authorization",
  renew_expiring_10_year_card: "Renew expiring/expired 10-year Green Card",
  replace_lost_stolen_damaged: "Replace lost, stolen or damaged Green Card",
  correct_card_error_or_update: "Correct/update qualifying Green Card information",
  remove_marriage_conditions: "Remove marriage-based two-year conditions",
  remove_investor_conditions: "Remove investor two-year conditions",
  retrieve_record: "Retrieve latest I-94",
  not_found: "I-94 cannot be found",
  cbp_entry_error: "CBP made an error at entry",
  uscis_issued_error: "USCIS-issued I-94 has an error",
  extend_or_change_status: "Need to extend or change status"
};

function labelServiceOption(value: string): string {
  return SERVICE_OPTION_LABELS[value] ?? labelOption(value);
}

function labelUsImmigrationOption(value: string): string {
  return US_IMMIGRATION_OPTION_LABELS[value] ?? labelOption(value);
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

function presentUsImmigrationServices(raw: unknown): ProcessPresentation {
  const result = raw as UsImmigrationServiceRouterResult;
  return {
    status: result.status,
    title: result.title,
    subtitle: `Resolved path: ${labelUsImmigrationOption(result.service_family)} · Sources verified ${result.sources_verified}`,
    summary: [
      { label: "Service family", value: labelUsImmigrationOption(result.service_family) },
      { label: "Routing status", value: result.status === "READY" ? "Correct agency/stage identified" : result.status === "NOT_READY" ? "Selected route conflicts with the facts" : "Current eligibility or authority check required" }
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
const usImmigrationEntry = entries.find((entry) => entry.id === "usa-immigration-services");
if (!usImmigrationEntry) throw new Error("Process catalog is missing usa-immigration-services");
const employmentGreenCardEntry = entries.find((entry) => entry.id === "usa-employment-green-card");
if (!employmentGreenCardEntry) throw new Error("Process catalog is missing usa-employment-green-card");
const permEntry = entries.find((entry) => entry.id === "usa-perm-detailed");
if (!permEntry) throw new Error("Process catalog is missing usa-perm-detailed");
const i140Entry = entries.find((entry) => entry.id === "usa-i140-detailed");
if (!i140Entry) throw new Error("Process catalog is missing usa-i140-detailed");
const i485Entry = entries.find((entry) => entry.id === "usa-i485-detailed");
if (!i485Entry) throw new Error("Process catalog is missing usa-i485-detailed");
const nvcEntry = entries.find((entry) => entry.id === "usa-nvc-employment-detailed");
if (!nvcEntry) throw new Error("Process catalog is missing usa-nvc-employment-detailed");
const highFrictionEntries = HIGH_FRICTION_PROCESS_IDS.map((id) => {
  const entry = entries.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Process catalog is missing ${id}`);
  return entry;
});

const modules = new Map<string, ProcessModule>([
  ...highFrictionEntries.map((entry) => [entry.id, createHighFrictionModule(entry)] as [string, ProcessModule]),
  [nvcEntry.id, createNvcModule(nvcEntry)],
  [i485Entry.id, createI485Module(i485Entry)],
  [i140Entry.id, createI140Module(i140Entry)],
  [permEntry.id, createPermModule(permEntry)],
  [employmentGreenCardEntry.id, createEmploymentGreenCardModule(employmentGreenCardEntry)],
  [
    usImmigrationEntry.id,
    {
      entry: usImmigrationEntry,
      questionnaire: usImmigrationQuestionnaire,
      storageKey: `official-checklist:${usImmigrationQuestionnaire.id}:answers`,
      eyebrow: "UNITED STATES · IMMIGRATION & VISAS · CLASSIFY THE AGENCY AND STAGE FIRST",
      questionLabels: US_IMMIGRATION_QUESTION_LABELS,
      questionHints: {
        requested_us_immigration_service: "Choose the outcome you need, not a form number. The classifier will identify the likely agency and stage before documents or fees.",
        employment_green_card_stage: "PERM, I-140, I-485 and NVC/DS-260 are sequential or alternative stages, not interchangeable applications.",
        h4_action: "An H-4 status action inside the U.S. and an H-4 visa application abroad use different government processes.",
        i94_issue: "The authority that created the I-94 or error determines whether CBP or USCIS can correct it."
      },
      labelOption: labelUsImmigrationOption,
      sourceLinks: [
        { label: "DOL PERM", url: "https://flag.dol.gov/programs/perm" },
        { label: "USCIS Form I-140", url: "https://www.uscis.gov/i-140" },
        { label: "USCIS Form I-485", url: "https://www.uscis.gov/i-485" },
        { label: "DOS September 2026 Visa Bulletin", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-september-2026.html" },
        { label: "DOS DS-160", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/forms/ds-160-online-nonimmigrant-visa-application/ds-160-faqs.html" },
        { label: "DOS National Visa Center", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/national-visa-center.html" },
        { label: "USCIS Form I-129", url: "https://www.uscis.gov/i-129" },
        { label: "USCIS Form I-765", url: "https://www.uscis.gov/i-765" },
        { label: "USCIS Form I-90", url: "https://www.uscis.gov/i-90" },
        { label: "USCIS Form N-400", url: "https://www.uscis.gov/n-400" },
        { label: "USCIS Change of Address", url: "https://www.uscis.gov/addresschange" },
        { label: "CBP I-94", url: "https://www.cbp.gov/I94" }
      ],
      evaluate: (answers: PassportAnswers) => evaluateUsImmigrationServices(answers),
      present: presentUsImmigrationServices
    }
  ],
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
