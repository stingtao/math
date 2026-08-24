import { calculateLessonReward } from "./rewards.ts";
import { answerBadgeForCorrectCount, lessonBadgeByLessonId, type BadgeUnlock } from "./badges.ts";

export type AvatarSpec = { glyph: string; tone: string; frame: string };
export type LearnerState = {
  profile: {
    nickname: string;
    avatar: AvatarSpec;
    rerollUsed: boolean;
    leaderboardOptIn: boolean;
    trailTokens: number;
    currentStreak: number;
    longestStreak: number;
    streakShields: number;
    rewardStep: number;
    ownedFrames: string[];
  };
  completedLessons: Array<{ id: string; stars: number }>;
  clearedBosses: Array<{ regionId: number; hearts: number }>;
  totalXp: number;
  weeklyXp: number;
  dueReview: number;
  dailyRewardClaimed: boolean;
  nextLessonId: string;
  badges: {
    earnedIds: string[];
    recent: BadgeUnlock[];
    correctAnswers: number;
  };
};

const fallback: LearnerState = {
  profile: {
    nickname: "CalmComet482",
    avatar: { glyph: "compass", tone: "blue", frame: "plain" },
    rerollUsed: false,
    leaderboardOptIn: true,
    trailTokens: 35,
    currentStreak: 3,
    longestStreak: 7,
    streakShields: 1,
    rewardStep: 3,
    ownedFrames: ["plain"],
  },
  completedLessons: [{ id: "g8-r1-l1", stars: 3 }],
  clearedBosses: [],
  totalXp: 50,
  weeklyXp: 50,
  dueReview: 3,
  dailyRewardClaimed: false,
  nextLessonId: "g8-r1-l2",
  badges: {
    earnedIds: ["lesson-g8-r1-l1"],
    recent: [{ id: "lesson-g8-r1-l1", unlockedAt: "2026-08-20T08:00:00.000Z" }],
    correctAnswers: 7,
  },
};

export function getDemoState(): LearnerState {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.sessionStorage.getItem("math-demo-state");
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as Partial<LearnerState>;
    const profile = { ...fallback.profile, ...parsed.profile };
    const savedFrames = Array.isArray(parsed.profile?.ownedFrames) ? parsed.profile.ownedFrames : ["plain"];
    profile.ownedFrames = [...new Set(["plain", ...savedFrames, profile.avatar.frame])];
    const parsedBadges = parsed.badges;
    const badges = {
      ...fallback.badges,
      ...parsedBadges,
      earnedIds: Array.isArray(parsedBadges?.earnedIds) ? [...new Set(parsedBadges.earnedIds)] : fallback.badges.earnedIds,
      recent: Array.isArray(parsedBadges?.recent) ? parsedBadges.recent.slice(0, 8) : fallback.badges.recent,
    };
    return { ...fallback, ...parsed, profile, badges } as LearnerState;
  } catch {
    return fallback;
  }
}

export function saveDemoState(state: LearnerState) {
  if (typeof window !== "undefined") window.sessionStorage.setItem("math-demo-state", JSON.stringify(state));
}

export function applyBadgeProgress(state: LearnerState, correctAnswers: number | undefined, unlocks: BadgeUnlock[] = []): LearnerState {
  if (!unlocks.length && correctAnswers === undefined) return state;
  const earnedIds = [...new Set([...state.badges.earnedIds, ...unlocks.map((item) => item.id)])];
  const recentById = new Map([...unlocks, ...state.badges.recent].map((item) => [item.id, item]));
  return {
    ...state,
    badges: {
      earnedIds,
      recent: [...recentById.values()].slice(0, 8),
      correctAnswers: correctAnswers ?? state.badges.correctAnswers,
    },
  };
}

export function creditDemoCorrectAnswer(state: LearnerState) {
  const correctAnswers = state.badges.correctAnswers + 1;
  const badge = correctAnswers % 10 === 0 ? answerBadgeForCorrectCount(correctAnswers) : undefined;
  const badgeUnlocks = badge && !state.badges.earnedIds.includes(badge.id) ? [{ id: badge.id, unlockedAt: new Date().toISOString() }] : [];
  const next = applyBadgeProgress(state, correctAnswers, badgeUnlocks);
  saveDemoState(next);
  return { state: next, badgeUnlocks, correctAnswers };
}

export function completeDemoLesson(state: LearnerState, lessonId: string, stars: number): LearnerState {
  const existing = state.completedLessons.find((item) => item.id === lessonId);
  const reward = calculateLessonReward(existing?.stars ?? 0, stars);
  const completedLessons = existing
    ? state.completedLessons.map((item) => item.id === lessonId ? { ...item, stars: Math.max(item.stars, stars) } : item)
    : [...state.completedLessons, { id: lessonId, stars }];
  const nextOrder = Math.min(51, completedLessons.length);
  const region = Math.floor(nextOrder / 4) + 1;
  const order = (nextOrder % 4) + 1;
  let next: LearnerState = {
    ...state,
    completedLessons,
    totalXp: state.totalXp + reward.totalXp,
    weeklyXp: state.weeklyXp + reward.totalXp,
    nextLessonId: `g8-r${region}-l${order}`,
  };
  const badge = !existing ? lessonBadgeByLessonId.get(lessonId) : undefined;
  if (badge && !next.badges.earnedIds.includes(badge.id)) next = applyBadgeProgress(next, undefined, [{ id: badge.id, unlockedAt: new Date().toISOString() }]);
  saveDemoState(next);
  return next;
}
