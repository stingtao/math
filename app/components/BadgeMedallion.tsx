import type { CSSProperties } from "react";
import type { BadgeSpec } from "@/lib/badges";
import { TopicIcon } from "./TopicIcon";
import { getBadgeExperienceStage } from "@/lib/experience-progression";

export function BadgeMedallion({ badge, earned, size = "md" }: { badge: BadgeSpec; earned: boolean; size?: "sm" | "md" | "lg" | "xl" }) {
  const turn = (badge.catalogNumber * 29) % 360;
  const experience = getBadgeExperienceStage(badge.kind, badge.catalogNumber, badge.target);
  return (
    <div
      className={`badge-medallion badge-${size} badge-pattern-${badge.pattern} badge-rank-${badge.rank} badge-material-${experience.material} badge-experience-${experience.id} accent-${badge.tone} ${earned ? "earned" : "locked"}`}
      style={{ "--badge-turn": `${turn}deg`, "--badge-counter-turn": `${-turn}deg`, "--badge-experience": experience.intensity } as CSSProperties}
      role="img"
      aria-label={`${badge.title} badge`}
    >
      <span className="badge-medallion-rays" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="badge-medallion-crown" aria-hidden="true"><i /><i /><i /><i /><i /></span>
      <span className="badge-medallion-plate" aria-hidden="true">
        <i className="badge-etch badge-etch-one" /><i className="badge-etch badge-etch-two" />
        <span className="badge-medallion-symbol">
          {badge.visual ? <TopicIcon visual={badge.visual} accent={badge.tone} size={size === "xl" ? "lg" : "sm"} label="" /> : badge.glyph}
        </span>
      </span>
    </div>
  );
}
