export type LessonRewardBreakdown = {
  previousStars: number;
  runStars: number;
  bestStars: number;
  firstCompletion: boolean;
  starsImproved: boolean;
  baseXp: number;
  starXp: number;
  totalXp: number;
};

function normalizeStars(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(3, Math.floor(value)));
}

function starBonus(stars: number) {
  if (stars >= 3) return 10;
  if (stars >= 2) return 5;
  return 0;
}

/**
 * XP follows permanent milestones instead of attempts: 40 for a first finish,
 * then up to 10 more as the saved marker improves. Replays keep practice useful
 * without turning easy questions into repeatable leaderboard XP.
 */
export function calculateLessonReward(previousStars: number, runStars: number): LessonRewardBreakdown {
  const previous = normalizeStars(previousStars);
  const run = Math.max(1, normalizeStars(runStars));
  const bestStars = Math.max(previous, run);
  const firstCompletion = previous === 0;
  const baseXp = firstCompletion ? 40 : 0;
  const starXp = Math.max(0, starBonus(bestStars) - starBonus(previous));

  return {
    previousStars: previous,
    runStars: run,
    bestStars,
    firstCompletion,
    starsImproved: bestStars > previous && !firstCompletion,
    baseXp,
    starXp,
    totalXp: baseXp + starXp,
  };
}
