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
    if (response.ok) { setMessage(""); setStatus("Posted with a new random name. Thanks for helping improve Math."); await load(); }
    else setStatus(body.error ?? "That note did not post. Try again.");
    setBusy(false);
  }

  return <main className="site-shell feedback-page">
    <PublicHeader />
    <section className="feedback-wrap">
      <header><span className="eyebrow">ANONYMOUS FEEDBACK BOARD</span><h1>What should feel clearer?</h1><p>Point out a confusing step, missing example, or rough screen. Your post gets a new random name and never connects to your account or progress.</p></header>
      <form className="feedback-form" onSubmit={submit}>
        <label><span>Your suggestion</span><textarea maxLength={600} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Which step felt confusing? What example or change would help?" /></label>
        <input className="feedback-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <div><small>{message.length}/600 · Names, email addresses, phone numbers, social handles, school names, and links do not belong here. Contact details are blocked before posting.</small><button className="primary-button" type="submit" disabled={busy || message.trim().length < 3}>{busy ? "Posting…" : "Post anonymously"}</button></div>
        {status && <p className="signin-status" aria-live="polite">{status}</p>}
      </form>
      <section className="feedback-list" aria-live="polite">
        <div className="section-heading"><span className="section-kicker">RECENT NOTES</span><h2>{messages.length ? "What learners are saying" : "The board is ready for its first note"}</h2></div>
        {messages.map((item) => <article key={item.id}><div><span className="feedback-avatar" aria-hidden="true">◇</span><strong>{item.nickname}</strong><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</time></div><p>{item.body}</p></article>)}
      </section>
    </section>
  </main>;
}
