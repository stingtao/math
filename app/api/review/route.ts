import { isAnswerCorrect, lessonById } from "@/lib/curriculum";
import { rejectCrossOriginMutation } from "@/lib/http";
import { claimMutation, completeReviewSet, getDueReviewItems, getLearnerState, learnerFromRequest } from "@/lib/store";

export async function GET(request: Request) {
  const learner = await learnerFromRequest(request);
  if (!learner) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  const due = await getDueReviewItems(learner.id);
  const questions = due.flatMap((item) => {
    const lesson = lessonById.get(item.lesson_id);
    const question = lesson?.practice.find((entry) => entry.id === item.question_id);
    return lesson && question ? [{ lessonId: lesson.id, lessonTitle: lesson.title, questionId: question.id, prompt: question.prompt, answer: question.answer, hint: question.hint, choices: question.choices }] : [];
  });
  return Response.json({ questions });
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  const body = await request.json() as { answers?: Array<{ lessonId: string; questionId: string; answer: string }> };
  if (!body.answers?.length) return Response.json({ error: "No review answers were submitted." }, { status: 400 });
  const results = body.answers.map((entry) => {
    const question = lessonById.get(entry.lessonId)?.practice.find((item) => item.id === entry.questionId);
    return { lessonId: entry.lessonId, questionId: entry.questionId, correct: Boolean(question && isAnswerCorrect(entry.answer, question.answer)) };
  });
  const isNew = await claimMutation(learner.id, request.headers.get("Idempotency-Key"), "review");
  if (isNew) await completeReviewSet(learner.id, results);
  return Response.json({ results, state: await getLearnerState(learner.id) });
}
