import { ensureSchema, getStore } from "@/db/bootstrap";
import { FEEDBACK_NOTICE_VERSION, feedbackCategories, type FeedbackCategory, type FeedbackThreadView } from "@/lib/feedback-policy";
import { publicTextPrivacyIssue } from "@/lib/privacy";
import { sha256 } from "@/lib/security";

type FeedbackThreadRow = {
  id: string;
  learner_id: string;
  category: FeedbackCategory;
  body: string;
  status: "pending" | "published" | "hidden";
  created_at: string;
  updated_at: string;
};

type FeedbackReplyRow = {
  id: string;
  thread_id: string;
  body: string;
  created_at: string;
};

function normalizeFeedback(value: unknown) {
  if (typeof value !== "string") throw new Error("Write a short message first.");
  const message = value.trim().replace(/\s+/g, " ");
  if (message.length < 3 || message.length > 1000) throw new Error("Feedback must be between 3 and 1,000 characters.");
  if (/https?:\/\/|www\./i.test(message)) throw new Error("Please leave links out of feedback.");
  if (/[<>]/.test(message)) throw new Error("Please use plain text without HTML tags.");
  const privacyIssue = publicTextPrivacyIssue(message);
  if (privacyIssue) throw new Error(`For privacy, remove the ${privacyIssue} before sending.`);
  return message;
}

export async function isFeedbackOperator(learnerId: string) {
  await ensureSchema();
  const row = await getStore().prepare("SELECT 1 AS allowed FROM site_roles WHERE learner_id = ? AND role = 'feedback_admin'")
    .bind(learnerId).first<{ allowed: number }>();
  return Boolean(row?.allowed);
}

export async function listFeedbackThreads(viewerId: string) {
  await ensureSchema();
  const db = getStore();
  const operator = await isFeedbackOperator(viewerId);
  const threads = await db.prepare(`SELECT id, learner_id, category, body, status, created_at, updated_at
    FROM feedback_threads
    WHERE ? = 1 OR status = 'published' OR learner_id = ?
    ORDER BY updated_at DESC LIMIT 50`).bind(operator ? 1 : 0, viewerId).all<FeedbackThreadRow>();
  const ids = threads.results.map((thread) => thread.id);
  let replies: FeedbackReplyRow[] = [];
  if (ids.length) {
    const placeholders = ids.map(() => "?").join(", ");
    replies = (await db.prepare(`SELECT id, thread_id, body, created_at FROM feedback_replies WHERE thread_id IN (${placeholders}) ORDER BY created_at`)
      .bind(...ids).all<FeedbackReplyRow>()).results;
  }
  return {
    viewerIsOperator: operator,
    threads: threads.results.map((thread): FeedbackThreadView => ({
      id: thread.id,
      category: thread.category,
      body: thread.body,
      status: thread.status,
      createdAt: thread.created_at,
      updatedAt: thread.updated_at,
      isOwner: thread.learner_id === viewerId,
      replies: replies.filter((reply) => reply.thread_id === thread.id).map((reply) => ({ id: reply.id, body: reply.body, createdAt: reply.created_at })),
    })),
  };
}

export async function createFeedbackThread(
  learnerId: string,
  input: { category?: string; body?: unknown; requestKey?: string | null; noticeVersion?: string; publicationConsent?: boolean },
) {
  if (!feedbackCategories.includes(input.category as FeedbackCategory)) throw new Error("Choose a feedback category.");
  if (!input.publicationConsent || input.noticeVersion !== FEEDBACK_NOTICE_VERSION) throw new Error("Confirm the adult feedback notice before sending.");
  if (!input.requestKey || input.requestKey.length < 12 || input.requestKey.length > 120) throw new Error("A valid request key is required.");
  const body = normalizeFeedback(input.body);
  await ensureSchema();
  const db = getStore();
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 3_600_000).toISOString();
  const dayAgo = new Date(now.getTime() - 86_400_000).toISOString();
  const [hourly, daily] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS total FROM mutation_keys WHERE learner_id = ? AND route = 'feedback:create' AND created_at >= ?").bind(learnerId, hourAgo).first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) AS total FROM mutation_keys WHERE learner_id = ? AND route = 'feedback:create' AND created_at >= ?").bind(learnerId, dayAgo).first<{ total: number }>(),
  ]);
  if (Number(hourly?.total ?? 0) > 5 || Number(daily?.total ?? 0) > 20) throw new Error("Feedback limit reached. Please try again later.");
  const requestKeyHash = await sha256(input.requestKey);
  const existing = await db.prepare("SELECT id FROM feedback_threads WHERE learner_id = ? AND request_key_hash = ?")
    .bind(learnerId, requestKeyHash).first<{ id: string }>();
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  const createdAt = now.toISOString();
  await db.prepare(`INSERT INTO feedback_threads
    (id, learner_id, category, body, status, request_key_hash, notice_version, publication_consent_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`)
    .bind(id, learnerId, input.category, body, requestKeyHash, FEEDBACK_NOTICE_VERSION, createdAt, createdAt, createdAt).run();
  return id;
}

async function getThreadForAction(threadId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(threadId)) throw new Error("Feedback thread not found.");
  const thread = await getStore().prepare("SELECT id, learner_id, status FROM feedback_threads WHERE id = ?")
    .bind(threadId).first<{ id: string; learner_id: string; status: string }>();
  if (!thread) throw new Error("Feedback thread not found.");
  return thread;
}

export async function replyToFeedbackThread(operatorId: string, threadId: string, value: unknown) {
  await ensureSchema();
  if (!await isFeedbackOperator(operatorId)) throw new Error("Only the site owner can reply.");
  await getThreadForAction(threadId);
  const body = normalizeFeedback(value);
  const now = new Date().toISOString();
  await getStore().batch([
    getStore().prepare("INSERT INTO feedback_replies (id, thread_id, operator_learner_id, body, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), threadId, operatorId, body, now),
    getStore().prepare("UPDATE feedback_threads SET status = 'published', updated_at = ? WHERE id = ?").bind(now, threadId),
  ]);
}

export async function moderateFeedbackThread(operatorId: string, threadId: string, status: "published" | "hidden") {
  await ensureSchema();
  if (!await isFeedbackOperator(operatorId)) throw new Error("Only the site owner can review feedback.");
  await getThreadForAction(threadId);
  await getStore().prepare("UPDATE feedback_threads SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, new Date().toISOString(), threadId).run();
}

export async function deleteFeedbackThread(viewerId: string, threadId: string) {
  await ensureSchema();
  const thread = await getThreadForAction(threadId);
  const operator = await isFeedbackOperator(viewerId);
  if (!operator && thread.learner_id !== viewerId) throw new Error("You can only delete your own feedback.");
  await getStore().prepare("DELETE FROM feedback_threads WHERE id = ?").bind(threadId).run();
}
