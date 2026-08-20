import { isAnswerCorrect, lessonById } from "@/lib/curriculum";
import { rejectCrossOriginMutation } from "@/lib/http";
import { claimMutation, learnerFromRequest, recordAnswer } from "@/lib/store";

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  const body = await request.json() as { lessonId?: string; questionId?: string; answer?: string; usedHint?: boolean };
  const lesson = body.lessonId ? lessonById.get(body.lessonId) : null;
  const question = lesson?.practice.find((item) => item.id === body.questionId);
  if (!lesson || !question || typeof body.answer !== "string") return Response.json({ error: "Question not found." }, { status: 400 });
  const correct = isAnswerCorrect(body.answer, question.answer);
  const isNew = await claimMutation(learner.id, request.headers.get("Idempotency-Key"), "answer");
  if (isNew) await recordAnswer(learner.id, lesson.id, question.id, correct, Boolean(body.usedHint));
  return Response.json({ correct, hint: correct ? null : question.hint });
}
