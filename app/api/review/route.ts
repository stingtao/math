import { isAnswerCorrect, lessonById } from "@/lib/curriculum";
import { privateJson, rejectCrossOriginMutation } from "@/lib/http";
import { claimMutation, completeReviewSet, creditCorrectAnswer, getDueReviewItems, getLearnerState, learnerFromRequest, localDate } from "@/lib/store";

export async function GET(request: Request) {
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Sign in to continue." }, { status: 401 });
  const due = await getDueReviewItems(learner.id);
  const questions = due.flatMap((item) => {
    const lesson = lessonById.get(item.lesson_id);
    const question = lesson?.practice.find((entry) => entry.id === item.question_id);
    return lesson && question ? [{ lessonId: lesson.id, lessonTitle: lesson.title, questionId: question.id, prompt: question.prompt, hint: question.hint, interaction: question.interaction, interactionConfig: question.interactionConfig, choices: question.choices }] : [];
  });
  return privateJson({ questions });
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Sign in to continue." }, { status: 401 });
  const body = await request.json() as {
    action?: "check" | "complete";
    lessonId?: string;
    questionId?: string;
    answer?: string;
    answers?: Array<{ lessonId: string; questionId: string; answer: string }>;
  };
  const due = await getDueReviewItems(learner.id);
  if (body.action === "check") {
    const dueItem = due.find((item) => item.lesson_id === body.lessonId && item.question_id === body.questionId);
    const question = dueItem ? lessonById.get(dueItem.lesson_id)?.practice.find((item) => item.id === dueItem.question_id) : null;
    if (!question || typeof body.answer !== "string") return privateJson({ error: "That review question is not due." }, { status: 400 });
    const correct = isAnswerCorrect(body.answer, question.answer);
    const badgeResult = correct
      ? await creditCorrectAnswer(learner.id, `review:${localDate(learner.timezone)}:${body.lessonId}:${body.questionId}`, "review")
      : { correctAnswers: undefined, badgeUnlocks: [] };
    return privateJson({ correct, hint: correct ? null : question.hint, ...badgeResult });
  }
  if (body.action !== "complete" || !body.answers?.length) return privateJson({ error: "No review answers were submitted." }, { status: 400 });
  if (body.answers.length !== due.length) return privateJson({ error: "Complete every question in today’s review set." }, { status: 400 });
  const dueKeys = new Set(due.map((item) => `${item.lesson_id}:${item.question_id}`));
  if (body.answers.some((entry) => !dueKeys.has(`${entry.lessonId}:${entry.questionId}`))) {
    return privateJson({ error: "The review set changed. Reload and try again." }, { status: 409 });
  }
  const results = body.answers.map((entry) => {
    const question = lessonById.get(entry.lessonId)?.practice.find((item) => item.id === entry.questionId);
    return { lessonId: entry.lessonId, questionId: entry.questionId, correct: Boolean(question && isAnswerCorrect(entry.answer, question.answer)) };
  });
  if (results.some((entry) => !entry.correct)) return privateJson({ error: "Correct each review question before finishing." }, { status: 400 });
  const isNew = await claimMutation(learner.id, request.headers.get("Idempotency-Key"), "review");
  if (isNew) await completeReviewSet(learner.id, results, localDate(learner.timezone));
  return privateJson({ results, state: await getLearnerState(learner.id) });
}
