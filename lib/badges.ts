import { lessons, regions, type Accent } from "./curriculum.ts";

export const BADGE_CATALOG_SIZE = 500;
export const ANSWER_BADGE_STEP = 10;
export const BADGE_CATALOG_VERSION = "2026.2";
const LESSON_BADGE_COUNT = lessons.length;
const ANSWER_BADGE_COUNT = BADGE_CATALOG_SIZE - LESSON_BADGE_COUNT;

export type BadgeKind = "lesson" | "answer";
export type BadgeRank = "trail" | "bronze" | "silver" | "gold" | "platinum" | "diamond" | "stellar" | "cosmic" | "mythic";
export type BadgeUnlock = { id: string; unlockedAt: string };

export type BadgeSpec = {
  id: string;
  catalogNumber: number;
  title: string;
  copy: string;
  requirement: string;
  kind: BadgeKind;
  rank: BadgeRank;
  rankLabel: string;
  series: string;
  tone: Accent;
  glyph: string;
  visual?: string;
  pattern: number;
  target: number;
  lessonId?: string;
  grade?: number;
};

const regionById = new Map(regions.map((region) => [region.id, region]));
const answerRanks = [
  { id: "bronze", label: "Bronze" },
  { id: "silver", label: "Silver" },
  { id: "gold", label: "Gold" },
  { id: "platinum", label: "Platinum" },
  { id: "diamond", label: "Diamond" },
  { id: "stellar", label: "Stellar" },
  { id: "cosmic", label: "Cosmic" },
  { id: "mythic", label: "Mythic" },
] as const;
const badgeTones: Accent[] = ["blue", "teal", "violet", "coral", "gold"];
const mathGlyphs = ["+", "−", "×", "÷", "=", "≠", "<", ">", "π", "√", "∑", "∞", "Δ", "%", "x", "y", "²", "³", "∠", "◇", "◎", "↗", "ƒ", "#"];
const constellationAdjectives = ["Bright", "Calm", "Bold", "Curious", "Nimble", "Steady", "Swift", "Wise"];
const constellationNouns = ["Comet", "Vector", "Prism", "Orbit", "Summit", "Cipher"];
const constellationNames = constellationAdjectives.flatMap((adjective) => constellationNouns.map((noun) => `${adjective} ${noun}`)).slice(0, 47);

if (ANSWER_BADGE_COUNT < 1) throw new Error(`Badge catalog ${BADGE_CATALOG_VERSION} needs room for at least one Answer Quest badge.`);

export const lessonBadges: BadgeSpec[] = lessons.map((lesson, index) => {
  const region = regionById.get(lesson.regionId);
  return {
    id: `lesson-${lesson.id}`,
    catalogNumber: index + 1,
    title: `Grade ${lesson.grade} ${lesson.title} Crest`,
    copy: `A permanent trophy for completing ${lesson.title}.`,
    requirement: `Complete ${lesson.title} in Grade ${lesson.grade}.`,
    kind: "lesson",
    rank: "trail",
    rankLabel: "Lesson Crest",
    series: `Grade ${lesson.grade} · ${region?.title ?? "Math Trail"}`,
    tone: lesson.accent,
    glyph: String(lesson.order),
    visual: lesson.visual,
    pattern: index % 12,
    target: 1,
    lessonId: lesson.id,
    grade: lesson.grade,
  };
});

export const answerBadges: BadgeSpec[] = Array.from({ length: ANSWER_BADGE_COUNT }, (_, index) => {
  const rank = answerRanks[Math.min(answerRanks.length - 1, Math.floor(index / constellationNames.length))];
  const constellation = constellationNames[index % constellationNames.length];
  const target = (index + 1) * ANSWER_BADGE_STEP;
  return {
    id: `answer-${String(index + 1).padStart(3, "0")}`,
    catalogNumber: lessonBadges.length + index + 1,
    title: `${rank.label} ${constellation}`,
    copy: `Answer Quest trophy number ${index + 1}. Every correction keeps the signal moving.`,
    requirement: `Earn credit for ${target.toLocaleString("en-US")} correct answers.`,
    kind: "answer",
    rank: rank.id,
    rankLabel: `${rank.label} Answer Quest`,
    series: `Answer Quest · Signal ${String(index % constellationNames.length + 1).padStart(2, "0")}`,
    tone: badgeTones[(index + Math.floor(index / constellationNames.length)) % badgeTones.length],
    glyph: mathGlyphs[index % mathGlyphs.length],
    pattern: (index * 7 + Math.floor(index / constellationNames.length)) % 12,
    target,
  };
});

export const badgeCatalog: BadgeSpec[] = [...lessonBadges, ...answerBadges];
export const badgeById = new Map(badgeCatalog.map((badge) => [badge.id, badge]));
export const lessonBadgeByLessonId = new Map(lessonBadges.map((badge) => [badge.lessonId!, badge]));

export function answerBadgeForCorrectCount(correctAnswers: number) {
  const earnedIndex = Math.floor(Math.max(0, correctAnswers) / ANSWER_BADGE_STEP) - 1;
  return earnedIndex >= 0 ? answerBadges[Math.min(answerBadges.length - 1, earnedIndex)] : undefined;
}

export function nextAnswerBadge(correctAnswers: number) {
  const nextIndex = Math.floor(Math.max(0, correctAnswers) / ANSWER_BADGE_STEP);
  return answerBadges[nextIndex] ?? null;
}

export function badgeProgress(badge: BadgeSpec, correctAnswers: number, owned: boolean) {
  if (owned) return 100;
  if (badge.kind === "lesson") return 0;
  return Math.min(99, Math.floor(correctAnswers / badge.target * 100));
}
