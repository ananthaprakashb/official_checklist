import type { PassportAnswers, Question } from "../types";
import { evaluateProcess, getProcessModule, listProcesses } from "../engine/registry";

const TOKEN_PATTERN = /[a-z0-9]+/g;

function tokens(value: string): string[] {
  return [...new Set(value.toLocaleLowerCase("en-US").match(TOKEN_PATTERN) ?? [])];
}

function processScore(query: string, entry: ReturnType<typeof listProcesses>[number]): number {
  const normalized = query.trim().toLocaleLowerCase("en-US");
  if (!normalized) return entry.status === "live" ? 10 : 1;

  const queryTokens = tokens(normalized);
  const title = `${entry.title} ${entry.short_title}`.toLocaleLowerCase("en-US");
  const tags = (entry.tags ?? []).join(" ").toLocaleLowerCase("en-US");
  const routing = `${entry.id} ${entry.slug} ${entry.service} ${entry.country_name} ${entry.applicant_country}`.toLocaleLowerCase("en-US");
  const summary = entry.summary.toLocaleLowerCase("en-US");
  const all = `${title} ${tags} ${routing} ${summary}`;

  let score = all.includes(normalized) ? 30 : 0;
  for (const token of queryTokens) {
    if (title.includes(token)) score += 8;
    if (tags.includes(token)) score += 6;
    if (routing.includes(token)) score += 4;
    if (summary.includes(token)) score += 2;
  }
  if (entry.status === "live") score += 3;
  return score;
}

export function searchProcesses(query: string, limit = 6) {
  const safeLimit = Math.max(1, Math.min(12, Math.trunc(limit || 6)));
  return listProcesses()
    .map((entry) => ({ entry, score: processScore(query, entry) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, safeLimit)
    .map(({ entry }) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      short_title: entry.short_title,
      service: entry.service,
      country: entry.country_name,
      applicant_country: entry.applicant_country,
      summary: entry.summary,
      status: entry.status,
      verified: entry.verified,
      stale_after: entry.stale_after,
      tags: entry.tags ?? [],
      evaluator_available: Boolean(getProcessModule(entry.id))
    }));
}

function presentQuestion(module: NonNullable<ReturnType<typeof getProcessModule>>, question: Question) {
  return {
    id: question.id,
    label: module.questionLabels[question.id] ?? question.id,
    hint: module.questionHints?.[question.id],
    type: question.type,
    required: question.required ?? false,
    required_when: question.required_when,
    min: question.min,
    options: question.options?.map((value) => ({
      value,
      label: module.labelOption(value)
    }))
  };
}

export function getProcessQuestions(processId: string) {
  const entry = listProcesses().find((candidate) => candidate.id === processId);
  if (!entry) {
    return { status: "error" as const, error: "process_not_found", process_id: processId };
  }

  const module = getProcessModule(processId);
  if (!module) {
    return {
      status: "error" as const,
      error: "process_evaluator_unavailable",
      process_id: processId,
      process_status: entry.status
    };
  }

  return {
    status: "success" as const,
    process: {
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      verified: entry.verified,
      stale_after: entry.stale_after
    },
    questionnaire: {
      id: module.questionnaire.id,
      version: module.questionnaire.version,
      verified: module.questionnaire.verified,
      stale_after: module.questionnaire.stale_after,
      questions: module.questionnaire.questions.map((question) => presentQuestion(module, question))
    },
    official_sources: module.sourceLinks
  };
}

export function runProcessEvaluation(processId: string, answers: PassportAnswers) {
  const module = getProcessModule(processId);
  if (!module) {
    const entry = listProcesses().find((candidate) => candidate.id === processId);
    return {
      status: "error" as const,
      error: entry ? "process_evaluator_unavailable" : "process_not_found",
      process_id: processId
    };
  }

  const presentation = evaluateProcess(processId, answers);
  const officialSources = module.resolveSourceLinks?.(answers, presentation) ?? module.sourceLinks;

  return {
    status: "success" as const,
    process: {
      id: module.entry.id,
      slug: module.entry.slug,
      title: module.entry.title,
      verified: module.entry.verified,
      stale_after: module.entry.stale_after
    },
    decision_status: presentation.status,
    result: {
      title: presentation.title,
      subtitle: presentation.subtitle,
      summary: presentation.summary,
      blockers: presentation.blockers,
      warnings: presentation.warnings,
      required_items: presentation.requiredItems,
      conditional_items: presentation.conditionalItems,
      next_step: presentation.nextStep,
      sources_verified: presentation.sourcesVerified
    },
    official_sources: officialSources,
    raw_result: presentation.rawResult
  };
}
