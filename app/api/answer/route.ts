import { isAnswerCorrect, lessonById } from "@/lib/curriculum";
import { selectLessonQuestions } from "@/lib/assessment-selection";
import { privateJson, rejectCrossOriginMutation } from "@/lib/http";
import { assertLessonUnlocked, claimMutation, getActiveLessonRun, learnerFromRequest, recordAnswer, recordMasteryCheck } from "@/lib/store";

export async function GET(request: Request) {
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Sign in to continue." }, { status: 401 });
  try {
    const lessonId = new URL(request.url).searchParams.get("lessonId");
    if (!lessonId || !lessonById.has(lessonId)) throw new Error("Lesson not found.");
    return privateJson({ run: await getActiveLessonRun(learner.id, lessonId) });
  } catch (error) {
    return privateJson({ error: error instanceof Error ? error.message : "Could not open the saved lesson." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Sign in to continue." }, { status: 401 });
  try {
    const body = await request.json() as { lessonId?: string; questionId?: string; answer?: string; usedHint?: boolean; runId?: string; mastery?: boolean; masteryRound?: number };
    const lesson = body.lessonId ? lessonById.get(body.lessonId) : null;
    const question = lesson && typeof body.runId === "string" ? selectLessonQuestions(lesson, body.runId).find((item) => item.id === body.questionId) : undefined;
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
    const message = error instanceof Error ? error.message : "That answer could not be checked.";
    return privateJson({ error: message, code: message === "Reload to continue the saved lesson run." ? "lesson_run_conflict" : undefined }, { status: 400 });
  }
}
