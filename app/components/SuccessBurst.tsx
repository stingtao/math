"use client";

import type { CSSProperties } from "react";

export const successPatterns = ["orbit", "confetti", "ripple", "spark", "lift"] as const;
type SuccessPattern = (typeof successPatterns)[number];

function stablePattern(key: string): SuccessPattern {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  return successPatterns[hash % successPatterns.length];
}

export function SuccessBurst({ eventKey, large = false }: { eventKey: string; large?: boolean }) {
  const pattern = stablePattern(eventKey);
  return (
    <div className={`success-burst success-${pattern} ${large ? "success-large" : ""}`} aria-hidden="true" data-pattern={pattern}>
      <span className="success-flash" />
      <span className="success-check">✓</span>
      <span className="success-rings"><i /><i /><i /></span>
      <span className="success-particles">
        {Array.from({ length: 14 }, (_, index) => (
          <i
            key={index}
            style={{
              "--particle-angle": `${index * (360 / 14)}deg`,
              "--particle-distance": `${large ? 150 + index % 3 * 22 : 95 + index % 3 * 16}px`,
              animationDelay: `${index * 16}ms`,
            } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
}
