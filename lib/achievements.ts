export const achievementSpecs = [
  { id: "first-step", title: "First Step", copy: "Finish one lesson.", glyph: "→", tone: "blue", source: "lessons", target: 1, unit: "lesson" },
  { id: "star-spark", title: "Twelve Sparks", copy: "Collect twelve lesson stars.", glyph: "✦", tone: "gold", source: "stars", target: 12, unit: "star" },
  { id: "boss-link", title: "Boss Link", copy: "Clear your first mixed boss.", glyph: "★", tone: "coral", source: "bosses", target: 1, unit: "boss" },
  { id: "steady-week", title: "Steady Week", copy: "Reach a seven-day learning rhythm.", glyph: "▲", tone: "teal", source: "streak", target: 7, unit: "day" },
  { id: "trail-builder", title: "Trail Builder", copy: "Complete twenty lessons.", glyph: "◆", tone: "violet", source: "lessons", target: 20, unit: "lesson" },
  { id: "boss-pathfinder", title: "Boss Pathfinder", copy: "Clear eight region bosses.", glyph: "◎", tone: "blue", source: "bosses", target: 8, unit: "boss" },
] as const;

export type AchievementSpec = (typeof achievementSpecs)[number];
export type AchievementTotals = Record<(typeof achievementSpecs)[number]["source"], number>;

type AchievementStateSnapshot = {
  completedLessons: readonly { stars: number }[];
  clearedBosses: readonly unknown[];
  profile: { longestStreak: number };
};

export function achievementTotalsForState(state: AchievementStateSnapshot): AchievementTotals {
  return {
    lessons: state.completedLessons.length,
    stars: state.completedLessons.reduce((total, item) => total + item.stars, 0),
    bosses: state.clearedBosses.length,
    streak: state.profile.longestStreak,
  };
}

export function evaluateAchievements(totals: AchievementTotals) {
  return achievementSpecs.map((item) => {
    const value = totals[item.source];
    return {
      ...item,
      value,
      unlocked: value >= item.target,
      progress: Math.min(100, Math.round(value / item.target * 100)),
    };
  });
}

export function getNextAchievement(totals: AchievementTotals) {
  return evaluateAchievements(totals).find((item) => !item.unlocked) ?? null;
}

export function achievementUnlockedBetween(previous: AchievementTotals, current: AchievementTotals) {
  return achievementSpecs.filter((item) => previous[item.source] < item.target && current[item.source] >= item.target).at(-1) ?? null;
}
