import { FunctionTool } from "@google/adk";
import { z } from "zod";
import { getProcessQuestions, runProcessEvaluation, searchProcesses } from "./processAdapter";

const answerValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null()
]);

export const searchProcessesTool = new FunctionTool({
  name: "search_processes",
  description:
    "Search the Official Checklist process catalog for the user's stated goal. This is discovery only and must not be treated as an eligibility decision.",
  parameters: z.object({
    query: z.string().describe("The user's goal in natural language, including country or location when known."),
    limit: z.number().int().min(1).max(12).optional().describe("Maximum number of candidate processes to return.")
  }),
  execute: ({ query, limit }) => ({
    status: "success",
    matches: searchProcesses(query, limit ?? 6)
  })
});

export const getProcessQuestionsTool = new FunctionTool({
  name: "get_process_questions",
  description:
    "Return the versioned questionnaire, labels, conditions, freshness metadata, and official sources for a registered deterministic Official Checklist process.",
  parameters: z.object({
    process_id: z.string().describe("The exact process id returned by search_processes.")
  }),
  execute: ({ process_id }) => getProcessQuestions(process_id)
});

export const evaluateProcessTool = new FunctionTool({
  name: "evaluate_process",
  description:
    "Run the registered deterministic Official Checklist evaluator for a process. The returned READY, NOT_READY, or NEEDS_AUTHORITATIVE_CONFIRMATION status is authoritative within Civic Preflight and must not be changed by the agent.",
  parameters: z.object({
    process_id: z.string().describe("The exact process id to evaluate."),
    answers: z.record(answerValue).describe("Answers keyed by questionnaire question id. Do not invent missing answers.")
  }),
  execute: ({ process_id, answers }) => runProcessEvaluation(process_id, answers)
});

export const civicPreflightTools = [
  searchProcessesTool,
  getProcessQuestionsTool,
  evaluateProcessTool
];
