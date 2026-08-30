export const EXPERIENCE_LESSONS_PER_STAGE = 5;
export const EXPERIENCE_BASE_ROUTE_LESSONS = 100;

export type ExperienceMotionFamily = "orbit" | "confetti" | "ripple" | "spark" | "lift";
export type ExperienceMaterial = "ink" | "bronze" | "enamel" | "silver" | "prism" | "deepglass" | "gold" | "stellar" | "cosmic" | "mythic";

export type ExperienceStage = {
  id: number;
  name: string;
  story: string;
  motif: string;
  pattern: string;
  motion: ExperienceMotionFamily;
  material: ExperienceMaterial;
  intensity: 1 | 2 | 3 | 4 | 5;
  chapter: 1 | 2 | 3 | 4 | 5;
  artPosition: string;
};

const stage = (
  id: number,
  name: string,
  story: string,
  motif: string,
  pattern: string,
  motion: ExperienceMotionFamily,
  material: ExperienceMaterial,
  intensity: ExperienceStage["intensity"],
  chapter: ExperienceStage["chapter"],
): ExperienceStage => ({ id, name, story, motif, pattern, motion, material, intensity, chapter, artPosition: `${(chapter - 1) * 25}%` });

/**
 * The first hundred lesson clears reveal one new visual vocabulary every five
 * lessons. New stages can be appended without changing the rendering contract;
 * 40 stages cover 200 lessons and 60 stages cover 300 lessons.
 */
export const experienceStages: readonly ExperienceStage[] = [
  stage(1, "Trailhead Pulse", "A blank expedition map receives its first living route.", "✦", "ink-pulse", "ripple", "ink", 1, 1),
  stage(2, "Compass Sparks", "The camp compass begins answering every solved signal.", "⌁", "compass-sparks", "spark", "ink", 1, 1),
  stage(3, "Route Ripples", "New paths spread beyond the edge of the paper map.", "◎", "route-ripples", "orbit", "bronze", 2, 1),
  stage(4, "Canyon Lift", "The route climbs toward the first red-world crossing.", "↗", "canyon-lift", "lift", "bronze", 2, 1),
  stage(5, "Bronze Frontier", "A rover gate opens and the expedition leaves base camp.", "◆", "bronze-frontier", "confetti", "bronze", 2, 1),
  stage(6, "Rover Streak", "Supply lines race across the Martian canyon.", "➜", "rover-streak", "lift", "enamel", 2, 2),
  stage(7, "Colony Signal", "A young settlement lights its first coordinated systems.", "◇", "colony-signal", "ripple", "enamel", 2, 2),
  stage(8, "Prism Crossing", "Geometric bridges connect habitats across the canyon.", "△", "prism-crossing", "spark", "prism", 3, 2),
  stage(9, "Comet Tails", "The colony launches a route beyond the atmosphere.", "☄", "comet-tails", "lift", "prism", 3, 2),
  stage(10, "Silver Orbit", "The expedition reaches an observatory above the planet.", "◉", "silver-orbit", "orbit", "silver", 3, 3),
  stage(11, "Lattice Wake", "Proof lines assemble a stable path through orbit.", "⌗", "lattice-wake", "ripple", "silver", 3, 3),
  stage(12, "Deepglass Bloom", "A luminous research city appears below the ocean.", "◈", "deepglass-bloom", "spark", "deepglass", 3, 4),
  stage(13, "Current Rings", "Currents bend into navigable curves around the city.", "≈", "current-rings", "orbit", "deepglass", 4, 4),
  stage(14, "Aurora Sweep", "Signals rise from the ocean and paint the polar sky.", "≋", "aurora-sweep", "lift", "gold", 4, 4),
  stage(15, "Golden Archive", "A hidden archive opens when the routes agree.", "✧", "golden-archive", "confetti", "gold", 4, 5),
  stage(16, "Eclipse Halo", "A rare alignment reveals a door beyond the known map.", "◐", "eclipse-halo", "orbit", "stellar", 4, 5),
  stage(17, "Nova Shards", "New ideas break the old boundary into bright fragments.", "✣", "nova-shards", "spark", "stellar", 4, 5),
  stage(18, "Constellation Stitch", "Every mastered route joins one enormous constellation.", "✶", "constellation-stitch", "ripple", "cosmic", 5, 5),
  stage(19, "Crown Orbit", "The complete expedition circles a final unknown world.", "♢", "crown-orbit", "orbit", "cosmic", 5, 5),
  stage(20, "Mythic Portal", "One hundred cleared lessons transform the map into a gateway.", "✺", "mythic-portal", "confetti", "mythic", 5, 5),
] as const;

export function getExperienceStage(completedLessons: number): ExperienceStage {
  const safeCount = Number.isFinite(completedLessons) ? Math.max(0, Math.floor(completedLessons)) : 0;
  const index = Math.min(experienceStages.length - 1, Math.floor(safeCount / EXPERIENCE_LESSONS_PER_STAGE));
  return experienceStages[index];
}

export function getExperienceProgress(completedLessons: number) {
  const current = getExperienceStage(completedLessons);
  const final = current.id === experienceStages.length;
  const stageStart = (current.id - 1) * EXPERIENCE_LESSONS_PER_STAGE;
  const earnedInStage = Math.max(0, Math.floor(completedLessons) - stageStart);
  const lessonsToNext = final ? 0 : Math.max(0, EXPERIENCE_LESSONS_PER_STAGE - earnedInStage);
  return {
    current,
    next: final ? null : experienceStages[current.id],
    earnedInStage: Math.min(EXPERIENCE_LESSONS_PER_STAGE, earnedInStage),
    lessonsToNext,
    percent: final ? 100 : Math.round(Math.min(EXPERIENCE_LESSONS_PER_STAGE, earnedInStage) / EXPERIENCE_LESSONS_PER_STAGE * 100),
  };
}

export function crossedExperienceStage(previousLessons: number, completedLessons: number) {
  return getExperienceStage(previousLessons).id !== getExperienceStage(completedLessons).id;
}

export function getBadgeExperienceStage(kind: "lesson" | "answer", catalogNumber: number, target: number) {
  const progressIndex = kind === "lesson" ? Math.max(0, catalogNumber - 1) : Math.max(0, Math.floor(target / 10) - 1);
  return getExperienceStage(progressIndex);
}
