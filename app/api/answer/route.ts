import { isAnswerCorrect, lessonById } from "@/lib/curriculum";
import { rejectCrossOriginMutation } from "@/lib/http";
import { assertLessonUnlocked, claimMutation, learnerFromRequest, recordAnswer } from "@/lib/store";

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  try {
    const body = await request.json() as { lessonId?: string; questionId?: string; answer?: string; usedHint?: boolean; runId?: string };
    const lesson = body.lessonId ? lessonById.get(body.lessonId) : null;
    const question = lesson?.practice.find((item) => item.id === body.questionId);
    if (!lesson || !question || typeof body.answer !== "string" || typeof body.runId !== "string") return Response.json({ error: "Question not found." }, { status: 400 });
    await assertLessonUnlocked(learner.id, lesson.id);
    const correct = isAnswerCorrect(body.answer, question.answer);
    const isNew = await claimMutation(learner.id, request.headers.get("Idempotency-Key"), "answer");
    if (isNew) await recordAnswer(learner.id, lesson.id, question.id, correct, Boolean(body.usedHint), body.runId);
    return Response.json({ correct, hint: correct ? null : question.hint });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "That answer could not be checked." }, { status: 400 });
  }
}
