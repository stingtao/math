"use client";

import { useCallback } from "react";
import { useEnterAction } from "./useEnterAction";

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
  const advanceNow = useCallback(() => {
    if (!busy) void onAdvance();
  }, [busy, onAdvance]);

  useEnterAction(advanceNow, !busy);

  return (
    <div className="auto-advance-wrap" data-event-key={eventKey}>
      <span className="auto-advance-timer">Talk through the answer, then continue when your child is ready.</span>
      <button className="primary-button auto-advance-button" type="button" disabled={busy} aria-busy={busy} aria-keyshortcuts="Enter" onClick={advanceNow}>
        <span>{busy ? busyLabel : label}</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
