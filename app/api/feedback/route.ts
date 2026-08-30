import { createFeedbackThread, deleteFeedbackThread, listFeedbackThreads, moderateFeedbackThread, replyToFeedbackThread } from "@/lib/feedback";
import { privateJson, rejectCrossOriginMutation } from "@/lib/http";
import { claimMutation, learnerFromRequest } from "@/lib/store";

type FeedbackAction =
  | { action: "create"; category?: string; body?: string; noticeVersion?: string; publicationConsent?: boolean }
  | { action: "reply"; threadId?: string; body?: string }
  | { action: "publish" | "hide" | "delete"; threadId?: string };

export async function GET(request: Request) {
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Parent sign-in is required to view feedback." }, { status: 401 });
  return privateJson(await listFeedbackThreads(learner.id));
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Parent sign-in is required to send feedback." }, { status: 401 });
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 4096) return privateJson({ error: "Feedback request is too large." }, { status: 413 });
    const raw = await request.text();
    if (raw.length > 4096) return privateJson({ error: "Feedback request is too large." }, { status: 413 });
    const body = JSON.parse(raw) as FeedbackAction;
    const requestKey = request.headers.get("Idempotency-Key");
    const isNew = await claimMutation(learner.id, requestKey, `feedback:${body.action}`);
    if (!isNew) return privateJson({ duplicate: true, ...await listFeedbackThreads(learner.id) });

    if (body.action === "create") {
      await createFeedbackThread(learner.id, { ...body, requestKey });
    } else if (body.action === "reply") {
      await replyToFeedbackThread(learner.id, body.threadId ?? "", body.body);
    } else if (body.action === "publish" || body.action === "hide") {
      await moderateFeedbackThread(learner.id, body.threadId ?? "", body.action === "publish" ? "published" : "hidden");
    } else if (body.action === "delete") {
      await deleteFeedbackThread(learner.id, body.threadId ?? "");
    } else {
      return privateJson({ error: "Unknown feedback action." }, { status: 400 });
    }
    return privateJson({ ok: true, ...await listFeedbackThreads(learner.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Feedback could not be updated.";
    return privateJson({ error: message }, { status: message.includes("limit reached") ? 429 : 400 });
  }
}
