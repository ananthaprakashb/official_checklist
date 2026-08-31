import type { PassportAnswers, Questionnaire, ResultStatus } from "../types";

export type ProcessCatalogStatus = "live" | "coming_soon" | "disabled";

export type ProcessCatalogEntry = {
  id: string;
  slug: string;
  country_code: string;
  country_name: string;
  applicant_country: string;
  service: string;
  title: string;
  short_title: string;
  summary: string;
  status: ProcessCatalogStatus;
  module?: string;
  questionnaire_id?: string;
  verified?: string;
  stale_after?: string;
  tags?: string[];
};

export type ProcessPresentation = {
  status: ResultStatus;
  title: string;
  subtitle: string;
  summary: Array<{ label: string; value: string }>;
  blockers: string[];
  warnings: string[];
  requiredItems: string[];
  conditionalItems: string[];
  nextStep: string;
  sourcesVerified: string;
  rawResult: unknown;
};

export type ProcessOfficialLink = {
  label: string;
  url: string;
};

export type ProcessModule = {
  entry: ProcessCatalogEntry;
  questionnaire: Questionnaire;
  storageKey: string;
  eyebrow: string;
  questionLabels: Record<string, string>;
  questionHints?: Record<string, string>;
  labelOption: (value: string) => string;
  sourceLinks: ProcessOfficialLink[];
  resolveSourceLinks?: (answers: PassportAnswers, presentation: ProcessPresentation) => ProcessOfficialLink[];
  evaluate: (answers: PassportAnswers) => unknown;
  present: (result: unknown) => ProcessPresentation;
};
