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
  };
  completedLessons: Array<{ id: string; stars: number }>;
  clearedBosses: Array<{ regionId: number; hearts: number }>;
  totalXp: number;
  weeklyXp: number;
  dueReview: number;
  dailyRewardClaimed: boolean;
  nextLessonId: string;
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
  },
  completedLessons: [{ id: "g8-r1-l1", stars: 3 }],
  clearedBosses: [],
  totalXp: 50,
  weeklyXp: 50,
  dueReview: 3,
  dailyRewardClaimed: false,
  nextLessonId: "g8-r1-l2",
};

export function getDemoState(): LearnerState {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.sessionStorage.getItem("math-demo-state");
    return saved ? { ...fallback, ...JSON.parse(saved) as LearnerState } : fallback;
  } catch {
    return fallback;
  }
}

export function saveDemoState(state: LearnerState) {
  if (typeof window !== "undefined") window.sessionStorage.setItem("math-demo-state", JSON.stringify(state));
}

export function completeDemoLesson(state: LearnerState, lessonId: string, stars: number): LearnerState {
  const existing = state.completedLessons.find((item) => item.id === lessonId);
  const completedLessons = existing
    ? state.completedLessons.map((item) => item.id === lessonId ? { ...item, stars: Math.max(item.stars, stars) } : item)
    : [...state.completedLessons, { id: lessonId, stars }];
  const nextOrder = Math.min(51, completedLessons.length);
  const region = Math.floor(nextOrder / 4) + 1;
  const order = (nextOrder % 4) + 1;
  const addedXp = existing ? 0 : 40 + (stars === 3 ? 10 : stars === 2 ? 5 : 0);
  const next = {
    ...state,
    completedLessons,
    totalXp: state.totalXp + addedXp,
    weeklyXp: state.weeklyXp + addedXp,
    nextLessonId: `g8-r${region}-l${order}`,
  };
  saveDemoState(next);
  return next;
}
