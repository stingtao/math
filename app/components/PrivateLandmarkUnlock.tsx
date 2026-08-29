import type { AchievementSpec } from "@/lib/achievements";

export function PrivateLandmarkUnlock({
  achievement,
  demo,
  compact = false,
}: {
  achievement: AchievementSpec;
  demo: boolean;
  compact?: boolean;
}) {
  return (
    <section className={`settlement-landmark accent-${achievement.tone} ${compact ? "compact-landmark" : ""}`} role="status" aria-label={`${achievement.title} achievement unlocked`}>
      <span className="achievement-badge" aria-hidden="true"><b>{achievement.glyph}</b><i /></span>
      <div><small>NEW ACHIEVEMENT</small><strong>{achievement.title}</strong><p>{achievement.copy}</p></div>
      <a href={`/profile${demo ? "?demo=1" : ""}#achievement-heading`}>View achievements <span aria-hidden="true">→</span></a>
    </section>
  );
}
