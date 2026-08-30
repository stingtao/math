import type { CSSProperties } from "react";
import { getExperienceProgress } from "@/lib/experience-progression";

export function ExperienceScene({ completedLessons, variant = "journey", milestone = false }: { completedLessons: number; variant?: "journey" | "boss" | "level"; milestone?: boolean }) {
  const progress = getExperienceProgress(completedLessons);
  const stage = progress.current;
  const style = {
    "--experience-art-position": stage.artPosition,
    "--experience-intensity": stage.intensity,
  } as CSSProperties;
  const label = `Expedition chapter ${stage.id}: ${stage.name}. ${stage.story}`;

  return (
    <figure className={`experience-scene experience-${variant} material-${stage.material} ${milestone ? "new-stage" : ""}`} data-experience-stage={stage.id} style={style} aria-label={label}>
      <div className="experience-scene-art" aria-hidden="true"><i /><i /><i /></div>
      <figcaption>
        <span><small>CHAPTER {stage.id}</small><strong>{stage.name}</strong></span>
        <p>{stage.story}</p>
        {progress.next && <em>{progress.lessonsToNext} {progress.lessonsToNext === 1 ? "lesson" : "lessons"} to the next visual evolution</em>}
      </figcaption>
    </figure>
  );
}
