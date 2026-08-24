"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { badgeById, type BadgeUnlock } from "@/lib/badges";
import { BadgeMedallion } from "./BadgeMedallion";

export function BadgeUnlockReveal({ unlocks, demo, onDismiss }: { unlocks: BadgeUnlock[]; demo: boolean; onDismiss: () => void }) {
  const [index, setIndex] = useState(0);
  const [settled, setSettled] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
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

  if (!badge) return null;
  const last = index === unlocks.length - 1;
  function continueReveal() {
    if (last) onDismiss();
    else { setIndex((value) => value + 1); setSettled(false); }
  }

  return (
    <div ref={overlayRef} className={`badge-unlock-overlay accent-${badge.tone} ${settled ? "settled" : ""}`} role="dialog" aria-modal="true" aria-labelledby="badge-unlock-title" aria-describedby="badge-unlock-copy">
      <span className="badge-unlock-flash" aria-hidden="true" />
      <span className="badge-unlock-beams" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></span>
      <span className="badge-unlock-shockwaves" aria-hidden="true"><i /><i /><i /></span>
      <span className="badge-unlock-confetti" aria-hidden="true">{Array.from({ length: 32 }, (_, particle) => <i key={particle} style={{ "--badge-particle": particle } as CSSProperties} />)}</span>
      <button className="badge-unlock-close" type="button" onClick={onDismiss} aria-label="Close badge reveal">×</button>
      <button className="badge-unlock-skip" type="button" disabled={settled} onClick={() => setSettled(true)}>{settled ? "Animation skipped" : "Skip animation"}</button>
      <section className="badge-unlock-card">
        <span className="badge-unlock-kicker">NEW BADGE · {badge.rankLabel.toUpperCase()}</span>
        <div className="badge-unlock-medal"><BadgeMedallion badge={badge} earned size="xl" /><span className="badge-unlock-check" aria-hidden="true">✓</span></div>
        <div className="badge-unlock-copy">
          <small>{badge.series} · #{String(badge.catalogNumber).padStart(3, "0")} OF 500</small>
          <h2 id="badge-unlock-title">{badge.title}</h2>
          <p id="badge-unlock-copy">{badge.copy}</p>
          <strong><span aria-hidden="true">◆</span>{badge.requirement}</strong>
        </div>
        <div className="badge-unlock-actions">
          <button className="primary-button" type="button" onClick={continueReveal} autoFocus>{last ? "Add to my vault" : "Reveal next badge"} <span aria-hidden="true">→</span></button>
          <a className="secondary-button" href={`/badges${demo ? "?demo=1" : ""}`} target="_blank" rel="noreferrer">View Badge Vault</a>
        </div>
        {unlocks.length > 1 && <span className="badge-unlock-page">{index + 1} / {unlocks.length} new badges</span>}
      </section>
    </div>
  );
}
