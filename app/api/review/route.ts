import { isAnswerCorrect, lessonById, lessons } from "@/lib/curriculum";
import { buildReviewQuestions, isDepthVersion, type ReviewQuestion } from "@/lib/assessment-selection";
import { getQuestionBank } from "@/lib/curriculum-depth";
import { checkReviewSubmission, reviewAnswerKey, type ReviewAnswer } from "@/lib/review-assessment";
import { privateJson, rejectCrossOriginMutation } from "@/lib/http";
import { claimMutation, completeReviewSet, creditCorrectAnswer, getDueReviewItems, getLearnerState, learnerFromRequest, localDate } from "@/lib/store";

async function reviewPlan(learnerId: string, version?: string): Promise<ReviewQuestion[]> {
  if (version && !isDepthVersion(version)) throw new Error("That review version is unavailable. Reload to open the current review.");
  const due = await getDueReviewItems(learnerId, isDepthVersion(version) ? 3 : 5);
  if (isDepthVersion(version)) return buildReviewQuestions(due, lessons, version, version);
  return due.flatMap((item) => {
    const lesson = lessonById.get(item.lesson_id);
    const question = lesson && getQuestionBank(lesson).find((entry) => entry.id === item.question_id);
    if (!lesson || !question) return [];
    const { id, ...content } = question;
    return [{ ...content, lessonId: lesson.id, lessonTitle: lesson.title, questionId: id, sourceQuestionId: id, role: "repair" as const }];
  });
}

export async function GET(request: Request) {
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Sign in to continue." }, { status: 401 });
  try {
    const plan = await reviewPlan(learner.id, new URL(request.url).searchParams.get("version") ?? undefined);
    const questions = plan.map((question) => {
      const { answer: _answer, explanation: _explanation, ...publicQuestion } = question;
      void _answer;
      void _explanation;
      return publicQuestion;
    });
    return privateJson({ questions });
  } catch (error) {
    return privateJson({ error: error instanceof Error ? error.message : "Could not open the review." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Sign in to continue." }, { status: 401 });
  try {
    const body = await request.json() as Partial<ReviewAnswer> & { action?: "check" | "complete"; version?: string; answers?: ReviewAnswer[] };
    const plan = await reviewPlan(learner.id, body.version);
    if (body.action === "check") {
      const question = plan.find((entry) => reviewAnswerKey(entry) === reviewAnswerKey({ lessonId: body.lessonId ?? "", questionId: body.questionId ?? "", sourceQuestionId: body.sourceQuestionId }));
      if (!question || typeof body.answer !== "string") return privateJson({ error: "That review question is not due." }, { status: 400 });
      const correct = isAnswerCorrect(body.answer, question.answer ?? "");
      const badgeResult = correct
        ? await creditCorrectAnswer(learner.id, `review:${localDate(learner.timezone)}:${question.lessonId}:${question.questionId}`, "review")
        : { correctAnswers: undefined, badgeUnlocks: [] };
      return privateJson({ correct, hint: correct ? null : question.hint, explanation: correct ? question.explanation : undefined, ...badgeResult });
    }
    if (body.action !== "complete" || !Array.isArray(body.answers)) return privateJson({ error: "No review answers were submitted." }, { status: 400 });
    const results = checkReviewSubmission(plan, body.answers);
    const isNew = await claimMutation(learner.id, request.headers.get("Idempotency-Key"), "review");
    if (isNew) await completeReviewSet(learner.id, results, localDate(learner.timezone));
    return privateJson({ results, state: await getLearnerState(learner.id) });
  } catch (error) {
    return privateJson({ error: error instanceof Error ? error.message : "That review could not be saved." }, { status: 400 });
  }
}
