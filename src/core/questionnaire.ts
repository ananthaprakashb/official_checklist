import type { PassportAnswers, Question } from "../types";

export function isQuestionVisible(question: Question, answers: PassportAnswers): boolean {
  if (!question.required_when) return true;

  return Object.entries(question.required_when).every(([key, expected]) => {
    if (key.endsWith("_lt")) {
      const sourceKey = key.slice(0, -3);
      const actual = answers[sourceKey];
      return typeof actual === "number" && actual < Number(expected);
    }
    if (key.endsWith("_gte")) {
      const sourceKey = key.slice(0, -4);
      const actual = answers[sourceKey];
      return typeof actual === "number" && actual >= Number(expected);
    }
    const actual = answers[key];
    if (Array.isArray(expected)) return expected.includes(actual as string | number | boolean);
    return actual === expected;
  });
}

export function isAnswered(question: Question, answers: PassportAnswers): boolean {
  const value = answers[question.id];
  if (question.type === "multiselect") return Array.isArray(value) && value.length > 0;
  if (question.type === "string") return typeof value === "string" && value.trim().length > 0;
  if (question.type === "number") return typeof value === "number" && Number.isFinite(value) && (question.min === undefined || value >= question.min);
  return value !== undefined && value !== null && value !== "";
}

export function visibleQuestions(questions: Question[], answers: PassportAnswers): Question[] {
  return questions.filter((question) => isQuestionVisible(question, answers));
}

export function clearHiddenAnswers(questions: Question[], answers: PassportAnswers): PassportAnswers {
  const next = { ...answers };
  for (const question of questions) {
    if (!isQuestionVisible(question, next)) delete next[question.id];
  }
  return next;
}
