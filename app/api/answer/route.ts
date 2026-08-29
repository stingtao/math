import { isAnswerCorrect, lessonById } from "@/lib/curriculum";
import { privateJson, rejectCrossOriginMutation } from "@/lib/http";
import { assertLessonUnlocked, claimMutation, learnerFromRequest, recordAnswer, recordMasteryCheck } from "@/lib/store";

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Sign in to continue." }, { status: 401 });
  try {
    const body = await request.json() as { lessonId?: string; questionId?: string; answer?: string; usedHint?: boolean; runId?: string; mastery?: boolean; masteryRound?: number };
    const lesson = body.lessonId ? lessonById.get(body.lessonId) : null;
    const question = lesson?.practice.find((item) => item.id === body.questionId);
    if (!lesson || !question || typeof body.answer !== "string" || typeof body.runId !== "string") return privateJson({ error: "Question not found." }, { status: 400 });
    await assertLessonUnlocked(learner.id, lesson.id);
    const correct = isAnswerCorrect(body.answer, question.answer);
    const isNew = await claimMutation(learner.id, request.headers.get("Idempotency-Key"), body.mastery ? "answer:mastery" : "answer");
    if (body.mastery) {
      const masteryResult = isNew ? await recordMasteryCheck(learner.id, lesson.id, question.id, correct, Boolean(body.usedHint), body.runId, body.masteryRound ?? 0) : { cleanCorrected: false };
      return privateJson({ correct, hint: correct ? null : question.hint, mastery: true, ...masteryResult });
    }
    const badgeResult = isNew ? await recordAnswer(learner.id, lesson.id, question.id, correct, Boolean(body.usedHint), body.runId) : { correctAnswers: undefined, badgeUnlocks: [] };
    return privateJson({ correct, hint: correct ? null : question.hint, ...badgeResult });
  } catch (error) {
    return privateJson({ error: error instanceof Error ? error.message : "That answer could not be checked." }, { status: 400 });
  }
}
