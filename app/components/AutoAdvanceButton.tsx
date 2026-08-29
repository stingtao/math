"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export const AUTO_ADVANCE_SECONDS = 6;

export function AutoAdvanceButton({
  eventKey,
  label,
  busy = false,
  busyLabel = "Saving…",
  onAdvance,
}: {
  eventKey: string;
  label: string;
  busy?: boolean;
  busyLabel?: string;
  onAdvance: () => void | Promise<void>;
}) {
  const [remaining, setRemaining] = useState(AUTO_ADVANCE_SECONDS);
  const advanceRef = useRef(onAdvance);
  const firedRef = useRef(false);

  useEffect(() => {
    advanceRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    firedRef.current = false;
    setRemaining(AUTO_ADVANCE_SECONDS);
    if (busy) return;

    let seconds = AUTO_ADVANCE_SECONDS;
    const timer = window.setInterval(() => {
      seconds -= 1;
      setRemaining(seconds);
      if (seconds > 0) return;
      window.clearInterval(timer);
      if (firedRef.current) return;
      firedRef.current = true;
      void advanceRef.current();
    }, 1000);

    return () => window.clearInterval(timer);
  }, [busy, eventKey]);

  function advanceNow() {
    if (busy || firedRef.current) return;
    firedRef.current = true;
    setRemaining(0);
    void advanceRef.current();
  }

  const progress = Math.max(0, Math.min(1, remaining / AUTO_ADVANCE_SECONDS));

  return (
    <button
      className="primary-button auto-advance-button"
      type="button"
      disabled={busy}
      aria-busy={busy}
      aria-label={busy ? busyLabel : `${label}. Automatically continuing in ${remaining} seconds.`}
      onClick={advanceNow}
      style={{ "--auto-advance-progress": `${progress * 360}deg` } as CSSProperties}
    >
      <span>{busy ? busyLabel : label}</span>
      {!busy && <span className="auto-advance-timer" aria-hidden="true">{remaining}s</span>}
      <span aria-hidden="true">→</span>
    </button>
  );
}
