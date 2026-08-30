import type { BadgeSpec } from "./badges.ts";
import { lessonById } from "./curriculum.ts";
import type { LearningHistoryEntry } from "./learner-state.ts";

function withDemo(path: string, demo: boolean) {
  if (!demo) return path;
  return `${path}${path.includes("?") ? "&" : "?"}demo=1`;
}

function idFromKey(entry: LearningHistoryEntry) {
  return entry.key.slice(entry.key.indexOf(":") + 1);
}

export function historyReplayDestination(entry: LearningHistoryEntry, demo: boolean) {
  if (entry.kind === "lesson") {
    const lessonId = entry.lessonId ?? idFromKey(entry);
    const lesson = lessonById.get(lessonId);
    return lesson
      ? { href: withDemo(`/learn/${lesson.slug}?grade=${lesson.grade}`, demo), label: "Replay lesson" }
      : { href: withDemo(`/learn?grade=${entry.grade}`, demo), label: "Open learning map" };
  }
  const regionId = entry.regionId ?? Number(idFromKey(entry));
  return Number.isFinite(regionId)
    ? { href: withDemo(`/boss/${regionId}?grade=${entry.grade}`, demo), label: "Replay boss" }
    : { href: withDemo(`/learn?grade=${entry.grade}`, demo), label: "Open learning map" };
}

export function badgeReplayDestination(badge: BadgeSpec, demo: boolean, earned: boolean, reviewReady = false) {
  if (badge.lessonId) {
    const lesson = lessonById.get(badge.lessonId);
    if (lesson) return { href: withDemo(`/learn/${lesson.slug}?grade=${lesson.grade}`, demo), label: earned ? "Replay lesson" : "Open lesson" };
  }
  return { href: withDemo(reviewReady ? "/review" : "/learn", demo), label: earned ? "Practice again" : "Build progress" };
}

export function learningMapDestination(grade: number, demo: boolean) {
  return withDemo(`/learn?grade=${grade}`, demo);
}
