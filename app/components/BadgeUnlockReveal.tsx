"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { badgeById, type BadgeUnlock } from "@/lib/badges";
import { BadgeMedallion } from "./BadgeMedallion";

export function BadgeUnlockReveal({ unlocks, demo, onDismiss }: { unlocks: BadgeUnlock[]; demo: boolean; onDismiss: () => void }) {
  const [index, setIndex] = useState(0);
  const [settled, setSettled] = useState(false);
  const [flying, setFlying] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const flightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlock = unlocks[index];
  const badge = unlock ? badgeById.get(unlock.id) : undefined;

  useEffect(() => {
    if (!badge) return;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleDialogKey(event: KeyboardEvent) {
      if (event.key === "Escape") { onDismiss(); return; }
      if (event.key !== "Tab") return;
      const controls = [...(overlayRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]') ?? [])];
      if (!controls.length) return;
      const first = controls[0];
      const lastControl = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); lastControl.focus(); }
      else if (!event.shiftKey && document.activeElement === lastControl) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", handleDialogKey);
    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener("keydown", handleDialogKey);
    };
  }, [badge, onDismiss]);

  useEffect(() => () => {
    if (flightTimerRef.current) clearTimeout(flightTimerRef.current);
  }, []);

  if (!badge) return null;
  const last = index === unlocks.length - 1;
  function continueReveal() {
    if (flying) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (last) onDismiss();
      else { setIndex((value) => value + 1); setSettled(false); }
      return;
    }
    setFlying(true);
    flightTimerRef.current = setTimeout(() => {
      setFlying(false);
      if (last) onDismiss();
      else { setIndex((value) => value + 1); setSettled(false); }
    }, 920);
  }

  return (
    <div ref={overlayRef} className={`badge-unlock-overlay accent-${badge.tone} ${settled ? "settled" : ""} ${flying ? "vault-flight" : ""}`} role="dialog" aria-modal="true" aria-labelledby="badge-unlock-title" aria-describedby="badge-unlock-copy">
      <span className="badge-unlock-flash" aria-hidden="true" />
      <span className="badge-unlock-beams" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></span>
      <span className="badge-unlock-shockwaves" aria-hidden="true"><i /><i /><i /></span>
      <span className="badge-unlock-confetti" aria-hidden="true">{Array.from({ length: 32 }, (_, particle) => <i key={particle} style={{ "--badge-particle": particle } as CSSProperties} />)}</span>
      <button className="badge-unlock-close" type="button" onClick={onDismiss} aria-label="Close badge reveal">×</button>
      <button className="badge-unlock-skip" type="button" disabled={settled} onClick={() => setSettled(true)}>{settled ? "Animation skipped" : "Skip animation"}</button>
      <span className="badge-vault-target" aria-hidden="true"><b>◆</b><small>VAULT</small><i /></span>
      {flying && <span className="badge-vault-flyer" aria-hidden="true"><BadgeMedallion badge={badge} earned size="xl" /></span>}
      <section className="badge-unlock-card">
        <span className="badge-unlock-kicker">NEW BADGE</span>
        <div className="badge-unlock-medal"><BadgeMedallion badge={badge} earned size="xl" /><span className="badge-unlock-check" aria-hidden="true">✓</span></div>
        <div className="badge-unlock-copy">
          <small>{badge.series}</small>
          <h2 id="badge-unlock-title">{badge.title}</h2>
          <p id="badge-unlock-copy">Added to your badges.</p>
        </div>
        <div className="badge-unlock-actions">
          <button className="primary-button" type="button" disabled={flying} onClick={continueReveal} autoFocus>{flying ? "Adding…" : last ? "Continue" : "Next badge"} <span aria-hidden="true">→</span></button>
          <a className="secondary-button" href={`/badges${demo ? "?demo=1" : ""}`} target="_blank" rel="noreferrer">View badges</a>
        </div>
        {unlocks.length > 1 && <span className="badge-unlock-page">{index + 1} / {unlocks.length} new badges</span>}
      </section>
    </div>
  );
}
