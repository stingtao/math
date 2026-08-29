"use client";

import { useState } from "react";
import type { Accent } from "@/lib/curriculum";

export function WorkedExampleFlow({ steps, accent, onComplete }: { steps: string[]; accent: Accent; onComplete: () => void }) {
  const [revealed, setRevealed] = useState(Math.min(1, steps.length));
  const complete = revealed >= steps.length;

  function revealNext() {
    const next = Math.min(steps.length, revealed + 1);
    setRevealed(next);
    if (next === steps.length) onComplete();
  }

  return (
    <div className={`worked-example-flow accent-${accent}`}>
      <div className="worked-example-map" aria-label={`${revealed} of ${steps.length} reasoning steps revealed`}>
        {steps.map((step, index) => {
          const visible = index < revealed;
          return (
            <div className={`worked-example-node ${visible ? "revealed" : "waiting"}`} key={`${index}-${step}`} aria-hidden={!visible}>
              <span>{visible ? index + 1 : "?"}</span>
              <div><small>{index === 0 ? "START" : index === steps.length - 1 ? "CONCLUDE" : `THINK ${index + 1}`}</small><p>{visible ? step : "Predict what the next mathematical move should be."}</p></div>
              {index < steps.length - 1 && <i aria-hidden="true">↓</i>}
            </div>
          );
        })}
      </div>
      {!complete ? <div className="worked-example-action"><div><small>YOUR TURN TO THINK</small><strong>Say your prediction before opening step {revealed + 1}.</strong></div><button type="button" onClick={revealNext}>Reveal step {revealed + 1} <span aria-hidden="true">↓</span></button></div> : <div className="worked-example-complete" role="status"><span aria-hidden="true">✓</span><div><small>REASONING CHAIN COMPLETE</small><strong>Now explain why each arrow is valid.</strong></div></div>}
    </div>
  );
}
