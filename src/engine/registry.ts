import catalogJson from "../../data/process-catalog.v1.json";
import passportQuestionnaireJson from "../../data/india/us/passport/reissue/questionnaire.v2.json";
import { evaluatePassport } from "../core/evaluatePassport";
import type { PassportAnswers, ProcessResult, Questionnaire } from "../types";
import { labelOption, QUESTION_LABELS } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessPresentation } from "./types";

const entries = catalogJson.processes as ProcessCatalogEntry[];
const questionnaire = passportQuestionnaireJson as Questionnaire;

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

const passportEntry = entries.find((entry) => entry.id === "india-us-passport-reissue");
if (!passportEntry) throw new Error("Process catalog is missing india-us-passport-reissue");

const modules = new Map<string, ProcessModule>([
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
