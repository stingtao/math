import { getXpGain, getXpProgress } from "@/lib/xp-progression";
import type { XpProgress as XpProgressState } from "@/lib/xp-progression";
import type { ThemeId } from "@/lib/themes";
import { getExperienceStage } from "@/lib/experience-progression";
import type { CSSProperties } from "react";

export function XpProgress({ totalXp, theme, previousXp, variant = "profile", onOpen, completedLessons }: { totalXp: number; theme: ThemeId; previousXp?: number; variant?: "profile" | "reward"; onOpen?: (progress: XpProgressState) => void; completedLessons?: number }) {
  const progress = getXpProgress(totalXp, theme);
  const experience = getExperienceStage(completedLessons ?? Math.floor(totalXp / 40));
  const gain = previousXp === undefined ? null : getXpGain(previousXp, totalXp, theme);
  const levelUp = Boolean(gain?.levelsGained);
  const rewardCopy = gain?.rankUnlocked
    ? `New rank: ${gain.rankUnlocked}`
    : levelUp
      ? `Level ${progress.level} reached`
      : `${progress.xpToNextLevel} XP to Level ${progress.level + 1}`;
  const experienceStyle = { "--experience-art-position": experience.artPosition, "--experience-intensity": experience.intensity } as CSSProperties;

  if (variant === "reward") return (
    <div className={`xp-reward-progress xp-tier-${progress.tier} experience-${experience.pattern} experience-intensity-${experience.intensity} ${levelUp ? "level-up" : ""}`} data-experience-stage={experience.id} style={experienceStyle} role="status" aria-label={`Level ${progress.level}, ${progress.earnedInLevel} of ${progress.nextLevelXp - progress.levelStartXp} XP toward the next level`}>
      <span className="xp-level-orb"><small>LV</small><strong>{progress.level}</strong></span>
      <div className="xp-reward-copy"><strong>{levelUp ? "Level up!" : progress.rankTitle}</strong><span>{rewardCopy}</span><XpMeter progress={progress.percent} /></div>
      <span className="xp-experience-motif" aria-hidden="true">{experience.motif}</span>
    </div>
  );

  return (
    <section className={`xp-profile-progress xp-tier-${progress.tier} experience-${experience.pattern} experience-intensity-${experience.intensity}`} data-experience-stage={experience.id} style={experienceStyle} id="xp-level" aria-labelledby="xp-level-heading">
      {onOpen && <button className="progress-detail-hitarea" type="button" onClick={() => onOpen(progress)} aria-label={`Open Level ${progress.level} XP details`} />}
      <span className="xp-level-orb"><small>LEVEL</small><strong>{progress.level}</strong></span>
      <div className="xp-profile-copy">
        <span className="section-kicker">LIFETIME XP</span>
        <h2 id="xp-level-heading">{progress.rankTitle}</h2>
        <p><strong>{progress.totalXp} XP</strong><span>{progress.xpToNextLevel} XP to Level {progress.level + 1}</span></p>
        <XpMeter progress={progress.percent} />
      </div>
      <div className="xp-next-rank">
        {progress.nextRank ? <><small>NEXT RANK · LEVEL {progress.nextRank.level}</small><strong>{progress.nextRank.title}</strong><span>{progress.nextRank.xpRequired - progress.totalXp} XP away</span></> : <><small>TOP RANK</small><strong>{progress.rankTitle}</strong><span>New levels keep counting.</span></>}
      </div>
      <span className="xp-experience-motif" aria-hidden="true">{experience.motif}</span>
    </section>
  );
}

function XpMeter({ progress }: { progress: number }) {
  return <span className="xp-level-meter" role="progressbar" aria-label="XP toward next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{ width: `${progress}%` }} /></span>;
}
