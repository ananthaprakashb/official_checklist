export type AnswerValue = string | number | boolean | string[] | null | undefined;
export type PassportAnswers = Record<string, AnswerValue>;

export type ResultStatus = "READY" | "NOT_READY" | "NEEDS_AUTHORITATIVE_CONFIRMATION";
export type ApplicantCategory = "adult" | "minor";
export type ProcessingResult =
  | "regular"
  | "tatkaal_eligible"
  | "tatkaal_ineligible"
  | "tatkaal_needs_authoritative_confirmation";

export type FeeResult = {
  currency: "USD";
  current_total: number;
  convenience_charge_may_apply: boolean;
  verified: string;
};

export type ProcessResult = {
  status: ResultStatus;
  service: "indian_passport";
  application_type: "fresh" | "reissue";
  applicant_category: ApplicantCategory;
  jurisdiction: string;
  reissue_reasons: string[];
  changes: string[];
  processing: ProcessingResult;
  booklet: "ordinary_36_pages" | "jumbo_60_pages";
  fee?: FeeResult;
  required_documents: string[];
  conditional_documents: string[];
  blockers: string[];
  warnings: string[];
  next_step: string;
  sources_verified: string;
};

export type Question = {
  id: string;
  type: "select" | "multiselect" | "boolean" | "number" | "string";
  required?: boolean;
  required_when?: Record<string, string | number | boolean>;
  options?: string[];
  min?: number;
};

export type Questionnaire = {
  id: string;
  version: number;
  verified: string;
  stale_after: string;
  questions: Question[];
  rule_nodes: string[];
  result_schema: string;
};
