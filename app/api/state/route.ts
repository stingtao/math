import { isAnswerCorrect, regions } from "@/lib/curriculum";
import { getRuntimeEnv } from "@/db/bootstrap";
import { verifyGoogleCredential } from "@/lib/google-auth";
import { rejectCrossOriginMutation } from "@/lib/http";
import { clearSessionCookie, hmacIdentity } from "@/lib/security";
import { claimDailyReward, claimMutation, completeBoss, completeLesson, deleteLearner, getLearnerState, learnerFromRequest, purchaseFrame, updateProfile } from "@/lib/store";

type StateAction =
  | { action: "completeLesson"; lessonId: string }
  | { action: "completeBoss"; regionId: number; answers: string[]; hearts: number }
  | { action: "claimDaily"; timezone: string }
  | { action: "reroll" }
  | { action: "leaderboard"; enabled: boolean }
  | { action: "purchaseFrame"; frame: string }
  | { action: "deleteAccount"; credential: string };

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  try {
    const body = await request.json() as StateAction;
    const isNew = await claimMutation(learner.id, request.headers.get("Idempotency-Key"), `state:${body.action}`);
    if (!isNew) return Response.json({ duplicate: true, state: await getLearnerState(learner.id) });
    if (body.action === "completeLesson") {
      const result = await completeLesson(learner.id, body.lessonId);
      return Response.json({ ...result, state: await getLearnerState(learner.id) });
    }
    if (body.action === "completeBoss") {
      const region = regions.find((item) => item.id === body.regionId);
      if (!region) throw new Error("Region not found.");
      const questions = [...region.lessons.map((item) => item.practice[0]), region.lessons[0].practice[1]];
      if (body.answers.length !== questions.length || questions.some((question, index) => !isAnswerCorrect(body.answers[index] ?? "", question.answer))) {
        throw new Error("Finish every boss correction before clearing the quest.");
      }
      await completeBoss(learner.id, body.regionId, Math.max(1, Math.min(3, body.hearts)));
      return Response.json({ state: await getLearnerState(learner.id) });
    }
    if (body.action === "claimDaily") {
      const reward = await claimDailyReward(learner.id, body.timezone || learner.timezone);
      return Response.json({ reward, state: await getLearnerState(learner.id) });
    }
    if (body.action === "reroll") {
      await updateProfile(learner.id, "reroll");
      return Response.json({ state: await getLearnerState(learner.id) });
    }
    if (body.action === "leaderboard") {
      await updateProfile(learner.id, "leaderboard", body.enabled);
      return Response.json({ state: await getLearnerState(learner.id) });
    }
    if (body.action === "purchaseFrame") {
      await purchaseFrame(learner.id, body.frame);
      return Response.json({ state: await getLearnerState(learner.id) });
    }
    if (body.action === "deleteAccount") {
      const subject = await verifyGoogleCredential(body.credential);
      const secret = getRuntimeEnv().AUTH_HMAC_SECRET;
      if (!secret) throw new Error("Sign-in is not configured.");
      const authKey = await hmacIdentity(secret, subject);
      const db = getRuntimeEnv().DB;
      const matching = await db?.prepare("SELECT id FROM learners WHERE auth_key = ? AND id = ?").bind(authKey, learner.id).first();
      if (!matching) throw new Error("Reauthentication did not match this account.");
      await deleteLearner(learner.id);
      return Response.json({ deleted: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
    }
    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "That action could not be completed." }, { status: 400 });
  }
}
