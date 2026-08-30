"use client";

import { useEffect, useState } from "react";
import { FEEDBACK_NOTICE_VERSION, feedbackCategories, type FeedbackCategory, type FeedbackThreadView } from "@/lib/feedback-policy";
import { LearnerHeader } from "./Header";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { mutationHeaders } from "./mutation";
import { useLearner } from "./useLearner";

const categoryLabels: Record<FeedbackCategory, string> = {
  correction: "Correction",
  content: "Learning content",
  feature: "Feature idea",
  other: "Other",
};

type BoardResponse = { threads?: FeedbackThreadView[]; viewerIsOperator?: boolean; error?: string };

export function FeedbackBoard() {
  const { state, loading, error } = useLearner(false);
  const [threads, setThreads] = useState<FeedbackThreadView[]>([]);
  const [viewerIsOperator, setViewerIsOperator] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("correction");
  const [message, setMessage] = useState("");
  const [publicationConsent, setPublicationConsent] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [boardMessage, setBoardMessage] = useState("");
  const [boardLoading, setBoardLoading] = useState(true);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!state) return;
    let active = true;
    fetch("/api/feedback").then(async (response) => {
      const body = await response.json() as BoardResponse;
      if (!active) return;
      if (response.ok) {
        if (body.threads) setThreads(body.threads);
        setViewerIsOperator(Boolean(body.viewerIsOperator));
      }
      else setBoardMessage(body.error ?? "Feedback could not be loaded.");
    }).catch(() => { if (active) setBoardMessage("Feedback could not be loaded. Check your connection and try again."); })
      .finally(() => { if (active) setBoardLoading(false); });
    return () => { active = false; };
  }, [state]);

  function applyBoard(body: BoardResponse) {
    if (body.threads) setThreads(body.threads);
    setViewerIsOperator(Boolean(body.viewerIsOperator));
  }

  async function updateBoard(payload: Record<string, unknown>, actionKey: string) {
    if (busy) return false;
    setBusy(actionKey);
    setBoardMessage("");
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: mutationHeaders(), body: JSON.stringify(payload) });
      const body = await response.json() as BoardResponse;
      if (!response.ok) { setBoardMessage(body.error ?? "Feedback could not be updated."); return false; }
      applyBoard(body);
      return true;
    } catch {
      setBoardMessage("Feedback could not be updated. Check your connection and try again.");
      return false;
    } finally {
      setBusy("");
    }
  }

  async function submitFeedback() {
    if (!message.trim() || !publicationConsent) return;
    const saved = await updateBoard({ action: "create", category, body: message, noticeVersion: FEEDBACK_NOTICE_VERSION, publicationConsent: true }, "create");
    if (saved) {
      setMessage("");
      setPublicationConsent(false);
      setBoardMessage("Feedback sent for review. You can see it now; other parents will see it only after approval.");
    }
  }

  async function reply(threadId: string) {
    const body = replyDrafts[threadId]?.trim();
    if (!body) return;
    if (await updateBoard({ action: "reply", threadId, body }, `reply:${threadId}`)) {
      setReplyDrafts((current) => ({ ...current, [threadId]: "" }));
      setBoardMessage("Owner reply published.");
    }
  }

  if (loading) return <LearningLoading glyph="♡" tone="teal" kicker="PARENT FEEDBACK" title="Opening the parent feedback space…" detail="Only signed-in adult account holders can read or send feedback." />;
  if (!state || error) return <LearningSignInGate glyph="♡" kicker="PARENT FEEDBACK" title="A parent signs in to join this conversation." detail="This area is for adult account holders. Children do not post or create profiles." />;

  return (
    <main className="learner-shell feedback-page parent-feedback-page">
      <LearnerHeader state={state} demo={false} />
      <section className="feedback-wrap parent-feedback-wrap">
        <header className="parent-feedback-hero">
          <span className="section-kicker">ADULT ACCOUNT HOLDERS</span>
          <h1>Help improve family math time.</h1>
          <p>Send a correction or idea. New topics are visible only to you and the site owner until they are reviewed. Approved topics and owner replies can be read by other signed-in parents.</p>
        </header>

        <section className="feedback-form parent-feedback-form" aria-labelledby="feedback-form-heading">
          <div><span aria-hidden="true">✦</span><div><h2 id="feedback-form-heading">Start a feedback topic</h2><p>Use adult words only. Do not include a child’s name, school, contact details, links, or identifying information.</p></div></div>
          <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)}>{feedbackCategories.map((item) => <option value={item} key={item}>{categoryLabels[item]}</option>)}</select></label>
          <label><span>Your feedback</span><textarea value={message} maxLength={1000} rows={5} placeholder="Tell the site owner what should be corrected or improved…" onChange={(event) => setMessage(event.target.value)} /></label>
          <label className="feedback-publication-consent"><input type="checkbox" checked={publicationConsent} onChange={(event) => setPublicationConsent(event.target.checked)} /><span>I am the adult account holder. This message contains no child or contact information, and I understand that it may be shown to other signed-in parents after review.</span></label>
          <button className="primary-button" type="button" disabled={Boolean(busy) || message.trim().length < 3 || !publicationConsent} aria-busy={busy === "create"} onClick={() => void submitFeedback()}>{busy === "create" ? "Sending…" : "Send for review"}</button>
        </section>

        {boardMessage && <p className="feedback-board-message" role="status">{boardMessage}</p>}

        <section className="feedback-discussion" aria-labelledby="feedback-discussion-heading">
          <header><div><span className="section-kicker">REVIEWED PARENT FEEDBACK</span><h2 id="feedback-discussion-heading">Feedback and owner responses</h2></div><span>{threads.length} topics</span></header>
          {boardLoading ? <p className="feedback-empty">Loading feedback…</p> : threads.length === 0 ? <p className="feedback-empty">No feedback topics yet. You can start the first one.</p> : <div className="feedback-thread-list">
            {threads.map((thread) => <article className={`feedback-thread status-${thread.status}`} key={thread.id}>
              <header><div><span>{categoryLabels[thread.category]}</span><strong>{thread.isOwner ? "Your feedback" : "Parent feedback"}</strong></div><div><time dateTime={thread.createdAt}>{formatFeedbackDate(thread.createdAt)}</time>{thread.status !== "published" && <small>{thread.status === "pending" ? "Awaiting review" : "Hidden"}</small>}</div></header>
              <p>{thread.body}</p>
              {thread.replies.map((item) => <section className="feedback-owner-reply" key={item.id}><header><strong>Site owner</strong><time dateTime={item.createdAt}>{formatFeedbackDate(item.createdAt)}</time></header><p>{item.body}</p></section>)}
              <footer>
                {(thread.isOwner || viewerIsOperator) && <button type="button" disabled={Boolean(busy)} onClick={() => void updateBoard({ action: "delete", threadId: thread.id }, `delete:${thread.id}`)}>Delete topic</button>}
                {viewerIsOperator && thread.status !== "published" && <button type="button" disabled={Boolean(busy)} onClick={() => void updateBoard({ action: "publish", threadId: thread.id }, `publish:${thread.id}`)}>Approve</button>}
                {viewerIsOperator && thread.status !== "hidden" && <button type="button" disabled={Boolean(busy)} onClick={() => void updateBoard({ action: "hide", threadId: thread.id }, `hide:${thread.id}`)}>Hide</button>}
              </footer>
              {viewerIsOperator && <div className="feedback-reply-form"><label htmlFor={`reply-${thread.id}`}>Reply as site owner</label><textarea id={`reply-${thread.id}`} rows={3} maxLength={1000} value={replyDrafts[thread.id] ?? ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [thread.id]: event.target.value }))} /><button className="secondary-button" type="button" disabled={Boolean(busy) || (replyDrafts[thread.id]?.trim().length ?? 0) < 3} onClick={() => void reply(thread.id)}>{busy === `reply:${thread.id}` ? "Publishing…" : "Reply and approve"}</button></div>}
            </article>)}
          </div>}
        </section>
      </section>
    </main>
  );
}

function formatFeedbackDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(date);
}
