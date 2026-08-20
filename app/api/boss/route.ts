import { rejectCrossOriginMutation } from "@/lib/http";
import {
  assertBossUnlocked,
  checkBossAnswer,
  checkBossRepairAnswer,
  claimMutation,
  getActiveBossAttempt,
  getLearnerState,
  learnerFromRequest,
} from "@/lib/store";

export async function GET(request: Request) {
  const learner = await learnerFromRequest(request);
  if (!learner) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  try {
    const regionId = Number(new URL(request.url).searchParams.get("regionId"));
    if (!Number.isInteger(regionId)) throw new Error("Region not found.");
    await assertBossUnlocked(learner.id, regionId);
    return Response.json({ attempt: await getActiveBossAttempt(learner.id, regionId) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Boss attempt not found." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  try {
    const body = await request.json() as {
      action?: "check" | "repair";
      regionId?: number;
      attemptId?: string;
      questionIndex?: number;
      repairIndex?: number;
      answer?: string;
    };
    if (!Number.isInteger(body.regionId) || typeof body.attemptId !== "string" || typeof body.answer !== "string") {
      throw new Error("Boss attempt data is incomplete.");
    }
    const isNew = await claimMutation(learner.id, request.headers.get("Idempotency-Key"), `boss:${body.action ?? "unknown"}`);
    if (!isNew) {
      const attempt = await getActiveBossAttempt(learner.id, body.regionId!);
      const state = await getLearnerState(learner.id);
      if (attempt) {
        const correct = body.action === "check"
          ? attempt.questionIndex > (body.questionIndex ?? attempt.questionIndex)
          : attempt.repairStep > (body.repairIndex ?? attempt.repairStep) || !attempt.failed;
        return Response.json({ duplicate: true, ...attempt, correct, repaired: body.action === "repair" && !attempt.failed, state });
      }
      const clearedBoss = state.clearedBosses.find((item) => item.regionId === body.regionId);
      return Response.json({ duplicate: true, correct: Boolean(clearedBoss), cleared: Boolean(clearedBoss), hearts: clearedBoss?.hearts ?? 3, state });
    }
    if (body.action === "check" && Number.isInteger(body.questionIndex)) {
      const result = await checkBossAnswer(learner.id, body.regionId!, body.attemptId, body.questionIndex!, body.answer);
      return Response.json({ ...result, state: result.cleared ? await getLearnerState(learner.id) : undefined });
    }
    if (body.action === "repair" && Number.isInteger(body.repairIndex)) {
      return Response.json(await checkBossRepairAnswer(learner.id, body.regionId!, body.attemptId, body.repairIndex!, body.answer));
    }
    throw new Error("Unknown boss action.");
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "That boss answer could not be checked." }, { status: 400 });
  }
}
