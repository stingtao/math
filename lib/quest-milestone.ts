export type QuestMilestone = {
  tone: "start" | "progress" | "near" | "boss" | "memory" | "complete";
  glyph: string;
  kicker: string;
  title: string;
  badge: string;
};

export function getQuestMilestone({
  gradeComplete,
  reviewBatchSize,
  activeBossReady,
  activeDone,
  regionSize,
  nextLessonTitle,
}: {
  gradeComplete: boolean;
  reviewBatchSize: number;
  activeBossReady: boolean;
  activeDone: number;
  regionSize: number;
  nextLessonTitle?: string;
}): QuestMilestone {
  if (gradeComplete && reviewBatchSize > 0) return {
    tone: "memory",
    glyph: "◇",
    kicker: "MEMORY READY",
    title: `${reviewBatchSize} ${reviewBatchSize === 1 ? "idea is" : "ideas are"} ready to recharge`,
    badge: "+20 XP",
  };
  if (gradeComplete) return { tone: "complete", glyph: "✓", kicker: "GRADE TRAIL SAFE", title: "Nothing is due today", badge: "Saved" };
  if (activeBossReady) return { tone: "boss", glyph: "★", kicker: "BOSS GATE OPEN", title: `All ${regionSize} region keys are connected`, badge: "+100 XP" };
  const remaining = Math.max(1, regionSize - activeDone);
  if (remaining === 1) return { tone: "near", glyph: String(regionSize), kicker: "FINAL KEY AHEAD", title: `${nextLessonTitle ?? "One more lesson"} opens the Boss`, badge: "1 left" };
  if (activeDone > 0) return {
    tone: "progress",
    glyph: "◆",
    kicker: `${activeDone} ${activeDone === 1 ? "KEY" : "KEYS"} SAFE`,
    title: `${remaining} short ${remaining === 1 ? "lesson" : "lessons"} to the Boss`,
    badge: `${activeDone}/${regionSize}`,
  };
  return { tone: "start", glyph: "1", kicker: "FIRST KEY AHEAD", title: `${nextLessonTitle ?? "Your next lesson"} starts this region`, badge: `0/${regionSize}` };
}
