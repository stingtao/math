import { getRuntimeEnv } from "@/db/bootstrap";
import { verifyGoogleCredential } from "@/lib/google-auth";
import { privateJson, rejectCrossOriginMutation } from "@/lib/http";
import { clearSessionCookie, hmacIdentity } from "@/lib/security";
import { claimDailyReward, claimMutation, completeLesson, deleteLearner, deleteLearnerDataCategory, getLearnerState, learnerFromRequest, purchaseFrame, updateProfile, updateTheme } from "@/lib/store";
import type { DataDeletionCategory } from "@/lib/data-retention";
import { type ThemeId } from "@/lib/themes";

type StateAction =
  | { action: "completeLesson"; lessonId: string; runId: string }
  | { action: "claimDaily"; timezone: string }
  | { action: "reroll" }
  | { action: "leaderboard"; enabled: boolean }
  | { action: "purchaseFrame"; frame: string }
  | { action: "theme"; theme: ThemeId }
  | { action: "deleteDataCategory"; category: DataDeletionCategory }
  | { action: "deleteAccount"; credential: string };

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Sign in to continue." }, { status: 401 });
  try {
    const body = await request.json() as StateAction;
    const isNew = await claimMutation(learner.id, request.headers.get("Idempotency-Key"), `state:${body.action}`);
    if (!isNew) return privateJson({ duplicate: true, state: await getLearnerState(learner.id) });
    if (body.action === "completeLesson") {
      const result = await completeLesson(learner.id, body.lessonId, body.runId);
      return privateJson({ ...result, state: await getLearnerState(learner.id) });
    }
    if (body.action === "claimDaily") {
      const reward = await claimDailyReward(learner.id, body.timezone || learner.timezone);
      return privateJson({ reward, state: await getLearnerState(learner.id) });
    }
    if (body.action === "reroll") {
      await updateProfile(learner.id, "reroll");
      return privateJson({ state: await getLearnerState(learner.id) });
    }
    if (body.action === "leaderboard") {
      return privateJson({ error: "Public rankings have been retired for family learning." }, { status: 410 });
    }
    if (body.action === "purchaseFrame") {
      await purchaseFrame(learner.id, body.frame);
      return privateJson({ state: await getLearnerState(learner.id) });
    }
    if (body.action === "theme") {
      await updateTheme(learner.id, body.theme);
      return privateJson({ state: await getLearnerState(learner.id) });
    }
    if (body.action === "deleteDataCategory") {
      const categories: DataDeletionCategory[] = ["learning", "appearance", "feedback", "all"];
      if (!categories.includes(body.category)) throw new Error("Choose a valid data category.");
      await deleteLearnerDataCategory(learner.id, body.category);
      return privateJson({ state: await getLearnerState(learner.id) });
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
      return privateJson({ deleted: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
    }
    return privateJson({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return privateJson({ error: error instanceof Error ? error.message : "That action could not be completed." }, { status: 400 });
  }
}
