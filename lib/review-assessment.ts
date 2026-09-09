import { isAnswerCorrect } from "./curriculum.ts";
import type { ReviewQuestion } from "./assessment-selection.ts";

export type ReviewAnswer = { lessonId: string; questionId: string; sourceQuestionId?: string; answer: string };
export function reviewAnswerKey(entry: Pick<ReviewAnswer, "lessonId" | "questionId" | "sourceQuestionId">) {
  return `${entry.lessonId}:${entry.sourceQuestionId ?? entry.questionId}:${entry.questionId}`;
}
export function checkReviewSubmission(plan: ReviewQuestion[], answers: ReviewAnswer[]) {
  if (!plan.length || answers.length !== plan.length) throw new Error("Complete every question in today’s review set.");
  const expected = new Map(plan.map((question) => [reviewAnswerKey(question), question]));
  const submitted = new Set(answers.map(reviewAnswerKey));
  if (submitted.size !== expected.size || answers.some((entry) => !expected.has(reviewAnswerKey(entry)))) throw new Error("The review set changed. Reload and try again.");
  if (answers.some((entry) => typeof entry.answer !== "string" || !isAnswerCorrect(entry.answer, expected.get(reviewAnswerKey(entry))!.answer ?? ""))) throw new Error("Correct each review question before finishing.");
  // Only the original item advances the spaced-review schedule, once per source.
  return plan.filter((question) => question.role === "repair").map((question) => ({ lessonId: question.lessonId, questionId: question.sourceQuestionId, correct: true }));
}
