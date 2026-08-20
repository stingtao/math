import { getRuntimeEnv } from "@/db/bootstrap";
import { verifyGoogleCredential } from "@/lib/google-auth";
import { rejectCrossOriginMutation } from "@/lib/http";
import { hmacIdentity, sessionCookie } from "@/lib/security";
import { createSession, getLearnerState, getOrCreateLearner } from "@/lib/store";

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  try {
    const body = await request.json() as { credential?: string; timezone?: string; ageConfirmed?: boolean };
    if (!body.credential || !body.ageConfirmed) {
      return Response.json({ error: "Confirm that you are 13 or older to continue." }, { status: 400 });
    }
    const subject = await verifyGoogleCredential(body.credential);
    const secret = getRuntimeEnv().AUTH_HMAC_SECRET;
    if (!secret) return Response.json({ error: "Sign-in is not configured yet." }, { status: 503 });
    const authKey = await hmacIdentity(secret, subject);
    const learner = await getOrCreateLearner(authKey, body.timezone || "UTC", true);
    const token = await createSession(learner.id);
    return Response.json({ ok: true, state: await getLearnerState(learner.id) }, {
      headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "We could not verify that Google sign-in. Please try again." }, { status: 401 });
  }
}
