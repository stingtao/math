"use client";

import { FormEvent, useEffect, useState } from "react";
import { PublicHeader } from "./Header";
import { mutationHeaders } from "./mutation";

type FeedbackMessage = { id: string; nickname: string; body: string; created_at: string };

export function FeedbackBoard() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/feedback");
    const body = await response.json() as { messages?: FeedbackMessage[] };
    setMessages(body.messages ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || message.trim().length < 3) return;
    setBusy(true); setStatus("");
    const response = await fetch("/api/feedback", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ message, website: "" }) });
    const body = await response.json() as { error?: string };
    if (response.ok) { setMessage(""); setStatus("Thanks. Your note is now on the board with a new random name."); await load(); }
    else setStatus(body.error ?? "That note could not be posted.");
    setBusy(false);
  }

  return <main className="site-shell feedback-page">
    <PublicHeader />
    <section className="feedback-wrap">
      <header><span className="eyebrow">ANONYMOUS FEEDBACK BOARD</span><h1>Tell me what would help.</h1><p>I read these notes when deciding what to fix or explain next. Each post gets a new random name; it is not connected to a Google account, learner profile, progress, or leaderboard.</p></header>
      <form className="feedback-form" onSubmit={submit}>
        <label><span>Your note</span><textarea maxLength={600} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What was confusing? What should I add or change?" /></label>
        <input className="feedback-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <div><small>{message.length}/600 · Please do not include names, email addresses, school names, or links.</small><button className="primary-button" type="submit" disabled={busy || message.trim().length < 3}>{busy ? "Posting…" : "Post anonymously"}</button></div>
        {status && <p className="signin-status" aria-live="polite">{status}</p>}
      </form>
      <section className="feedback-list" aria-live="polite">
        <div className="section-heading"><span className="section-kicker">RECENT NOTES</span><h2>{messages.length ? "What learners are saying" : "The board is ready for its first note"}</h2></div>
        {messages.map((item) => <article key={item.id}><div><span className="feedback-avatar" aria-hidden="true">◇</span><strong>{item.nickname}</strong><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</time></div><p>{item.body}</p></article>)}
      </section>
    </section>
  </main>;
}
