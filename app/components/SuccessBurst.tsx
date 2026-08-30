"use client";

import type { CSSProperties } from "react";
import { getExperienceStage } from "@/lib/experience-progression";

export const successPatterns = ["orbit", "confetti", "ripple", "spark", "lift"] as const;
type SuccessPattern = (typeof successPatterns)[number];

function stablePattern(key: string): SuccessPattern {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  return successPatterns[hash % successPatterns.length];
}

export function SuccessBurst({ eventKey, large = false, experienceLevel }: { eventKey: string; large?: boolean; experienceLevel?: number }) {
  const experience = getExperienceStage(experienceLevel ?? 0);
  const pattern = experienceLevel === undefined ? stablePattern(eventKey) : experience.motion;
  const particleCount = experienceLevel === undefined ? 14 : 14 + experience.intensity * 4;
  return (
    <div
      className={`success-burst success-${pattern} experience-${experience.pattern} experience-intensity-${experience.intensity} ${large ? "success-large" : ""}`}
      aria-hidden="true"
      data-pattern={pattern}
      data-experience-stage={experience.id}
      style={{ "--experience-intensity": experience.intensity, "--experience-turn": `${experience.id * 17}deg` } as CSSProperties}
    >
      <span className="success-flash" />
      <span className="success-check"><b>✓</b><i>{experience.motif}</i></span>
      <span className="success-rings"><i /><i /><i /></span>
      <span className="success-particles">
        {Array.from({ length: particleCount }, (_, index) => (
          <i
            key={index}
            style={{
              "--particle-angle": `${index * (360 / particleCount)}deg`,
              "--particle-distance": `${large ? 150 + index % 3 * 22 : 95 + index % 3 * 16}px`,
              animationDelay: `${index * 32}ms`,
            } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
}
