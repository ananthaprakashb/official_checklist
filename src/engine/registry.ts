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
      questionLabels: QUESTION_LABELS,
      labelOption,
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
