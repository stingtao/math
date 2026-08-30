import { getRuntimeEnv } from "@/db/bootstrap";
import { FAMILY_AGREEMENT_VERSION } from "@/lib/family-policy";
import { verifyGoogleIdentity } from "@/lib/google-auth";
import { privateJson, rejectCrossOriginMutation } from "@/lib/http";
import { hmacIdentity, sessionCookie } from "@/lib/security";
import { createSession, getLearnerState, getOrCreateLearner } from "@/lib/store";

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 16_384) return privateJson({ error: "Sign-in request is too large." }, { status: 413 });
    const raw = await request.text();
    if (raw.length > 16_384) return privateJson({ error: "Sign-in request is too large." }, { status: 413 });
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return privateJson({ error: "Sign-in request is invalid." }, { status: 400 });
    }
    if (!parsed || typeof parsed !== "object") return privateJson({ error: "Sign-in request is invalid." }, { status: 400 });
    const body = parsed as { credential?: unknown; timezone?: unknown; parentConfirmed?: unknown; agreementVersion?: unknown };
    if (typeof body.credential !== "string" || body.credential.length < 100 || body.credential.length > 16_000
      || body.parentConfirmed !== true || body.agreementVersion !== FAMILY_AGREEMENT_VERSION) {
      return privateJson({ error: "An adult parent or legal guardian must confirm the family learning agreement." }, { status: 400 });
    }
    const identity = await verifyGoogleIdentity(body.credential);
    const runtime = getRuntimeEnv();
    const secret = runtime.AUTH_HMAC_SECRET;
    if (!secret) return privateJson({ error: "Sign-in is not configured yet." }, { status: 503 });
    const authKey = await hmacIdentity(secret, identity.subject);
    const adminEmail = runtime.FEEDBACK_ADMIN_EMAIL?.trim().toLowerCase();
    const isFeedbackOperator = Boolean(adminEmail && identity.emailVerified && identity.email?.toLowerCase() === adminEmail);
    const timezone = typeof body.timezone === "string" && body.timezone.length <= 80 && /^[A-Za-z0-9_+./-]+$/.test(body.timezone) ? body.timezone : "UTC";
    const learner = await getOrCreateLearner(authKey, timezone, true, FAMILY_AGREEMENT_VERSION, isFeedbackOperator);
    const token = await createSession(learner.id);
    return privateJson({ ok: true, state: await getLearnerState(learner.id) }, {
      headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" },
    });
  } catch {
    return privateJson({ error: "We could not verify that Google sign-in. Please try again." }, { status: 401 });
  }
}
