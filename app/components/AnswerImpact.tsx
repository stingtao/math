"use client";

import type { CSSProperties } from "react";
import { SuccessBurst } from "./SuccessBurst";
import { getComboSpec } from "@/lib/combo";

function stableOffset(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
  return hash % 24;
}

export function AnswerImpact({ eventKey, label, chain, progress, total, tone = "blue" }: { eventKey: string; label: string; chain: number; progress: number; total: number; tone?: "blue" | "teal" | "coral" | "violet" | "gold" }) {
  const powerful = chain >= 3 || progress === total;
  const offset = stableOffset(eventKey);
  const combo = getComboSpec(chain);
  return (
    <>
      <SuccessBurst eventKey={eventKey} large={powerful} />
      <div className={`answer-impact accent-${tone} combo-${combo.tier} ${powerful ? "powerful" : ""}`} aria-hidden="true">
        <span className="answer-impact-wash" />
        <span className="answer-impact-lines">{Array.from({ length: 20 }, (_, index) => <i key={index} style={{ "--impact-angle": `${(index + offset) * 18}deg`, "--impact-delay": `${index * 22}ms` } as CSSProperties} />)}</span>
        <div className="answer-impact-core">
          <span>{combo.motif}</span>
          <strong>{label}</strong>
          <small>{chain > 1 ? `${combo.label} ×${chain}` : combo.label}</small>
        </div>
        <div className="answer-impact-charge"><span style={{ width: `${Math.min(100, progress / Math.max(1, total) * 100)}%` }} /><b>{progress}/{total}</b></div>
      </div>
    </>
  );
}
