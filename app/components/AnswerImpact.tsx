"use client";

import type { CSSProperties } from "react";
import { SuccessBurst } from "./SuccessBurst";
import { getComboSpec } from "@/lib/combo";
import { getExperienceStage } from "@/lib/experience-progression";

function stableOffset(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
  return hash % 24;
}

export function AnswerImpact({ eventKey, label, chain, progress, total, tone = "blue", experienceLevel = 0 }: { eventKey: string; label: string; chain: number; progress: number; total: number; tone?: "blue" | "teal" | "coral" | "violet" | "gold"; experienceLevel?: number }) {
  const powerful = chain >= 3 || progress === total;
  const offset = stableOffset(eventKey);
  const combo = getComboSpec(chain);
  const experience = getExperienceStage(experienceLevel);
  const lineCount = 16 + experience.intensity * 4;
  return (
    <>
      <SuccessBurst eventKey={eventKey} large={powerful} experienceLevel={experienceLevel} />
      <div className={`answer-impact accent-${tone} combo-${combo.tier} experience-${experience.pattern} experience-intensity-${experience.intensity} ${powerful ? "powerful" : ""}`} data-experience-stage={experience.id} aria-hidden="true">
        <span className="answer-impact-wash" />
        <span className="answer-impact-lines">{Array.from({ length: lineCount }, (_, index) => <i key={index} style={{ "--impact-angle": `${(index + offset) * (360 / lineCount)}deg`, "--impact-delay": `${index * 18}ms` } as CSSProperties} />)}</span>
        <div className="answer-impact-core">
          <span>{combo.motif}</span>
          <strong>{label}</strong>
          <small>{chain > 1 ? `${chain} correct in a row` : "Nice work"}</small>
        </div>
        <span className="answer-impact-evolution">{experience.motif}</span>
        <div className="answer-impact-charge"><span style={{ width: `${Math.min(100, progress / Math.max(1, total) * 100)}%` }} /><b>{progress}/{total}</b></div>
      </div>
    </>
  );
}
