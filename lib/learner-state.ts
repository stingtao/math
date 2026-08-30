import { calculateLessonReward } from "./rewards.ts";
import { answerBadgeForCorrectCount, lessonBadgeByLessonId, type BadgeUnlock } from "./badges.ts";
import { normalizeTheme, type ThemeId } from "./themes.ts";
import { getGradeCurriculum, getGradeLessons, lessonById, regions } from "./curriculum.ts";
import { retentionDeadline } from "./data-retention.ts";
import { FAMILY_ACCOUNT_RETENTION_MONTHS, FAMILY_DATA_RETENTION_MONTHS } from "./family-policy.ts";

export type AvatarSpec = { glyph: string; tone: string; frame: string };
export type LearningHistoryEntry = {
  key: string;
  kind: "lesson" | "boss";
  lessonId?: string;
  regionId?: number;
  title: string;
  grade: number;
  regionTitle: string;
  completedAt: string;
  stars?: number;
  firstCorrectCount?: number;
  questionCount?: number;
  hearts?: number;
};
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
    theme: ThemeId;
  };
  completedLessons: Array<{ id: string; stars: number }>;
  clearedBosses: Array<{ regionId: number; hearts: number }>;
  totalXp: number;
  weeklyXp: number;
  dueReview: number;
  dailyRewardClaimed: boolean;
  nextLessonId: string;
  learningHistory: LearningHistoryEntry[];
  badges: {
    earnedIds: string[];
    recent: BadgeUnlock[];
    correctAnswers: number;
  };
  retention: {
    consentedAt: string;
    learningDataExpiresAt: string;
    accountExpiresAt: string;
  };
};

const previewStartedAt = new Date();
const fallback: LearnerState = {
  profile: {
    nickname: "CalmComet482",
    avatar: { glyph: "compass", tone: "blue", frame: "plain" },
    rerollUsed: false,
    leaderboardOptIn: false,
    trailTokens: 35,
    currentStreak: 3,
    longestStreak: 7,
    streakShields: 1,
    rewardStep: 3,
    ownedFrames: ["plain"],
    theme: "classic",
  },
  completedLessons: [{ id: "g8-r1-l1", stars: 3 }],
  clearedBosses: [],
  totalXp: 50,
  weeklyXp: 50,
  dueReview: 3,
  dailyRewardClaimed: false,
  nextLessonId: "g8-r1-l2",
  learningHistory: [{
    key: "lesson:g8-r1-l1",
    kind: "lesson",
    lessonId: "g8-r1-l1",
    regionId: 1,
    title: "Math Symbols",
    grade: 8,
    regionTitle: "Number Foundations",
    completedAt: "2026-08-20T08:00:00.000Z",
    stars: 3,
    firstCorrectCount: 5,
    questionCount: 5,
  }],
  badges: {
    earnedIds: ["lesson-g8-r1-l1"],
    recent: [{ id: "lesson-g8-r1-l1", unlockedAt: "2026-08-20T08:00:00.000Z" }],
    correctAnswers: 7,
  },
  retention: {
    consentedAt: previewStartedAt.toISOString(),
    learningDataExpiresAt: retentionDeadline(previewStartedAt, FAMILY_DATA_RETENTION_MONTHS),
    accountExpiresAt: retentionDeadline(previewStartedAt, FAMILY_ACCOUNT_RETENTION_MONTHS),
  },
};

export function getDemoState(): LearnerState {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.sessionStorage.getItem("math-demo-state");
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as Partial<LearnerState>;
    const profile = { ...fallback.profile, ...parsed.profile };
    profile.leaderboardOptIn = false;
    profile.theme = normalizeTheme(parsed.profile?.theme);
    const savedFrames = Array.isArray(parsed.profile?.ownedFrames) ? parsed.profile.ownedFrames : ["plain"];
    profile.ownedFrames = [...new Set(["plain", ...savedFrames, profile.avatar.frame])];
    const parsedBadges = parsed.badges;
    const badges = {
      ...fallback.badges,
      ...parsedBadges,
      earnedIds: Array.isArray(parsedBadges?.earnedIds) ? [...new Set(parsedBadges.earnedIds)] : fallback.badges.earnedIds,
      recent: Array.isArray(parsedBadges?.recent) ? parsedBadges.recent.slice(0, 8) : fallback.badges.recent,
    };
    const sourceHistory = Array.isArray(parsed.learningHistory) ? parsed.learningHistory : fallback.learningHistory;
    const regionById = new Map(regions.map((region) => [region.id, region]));
    const learningHistory = sourceHistory.map((entry) => {
      if (entry.kind === "lesson") {
        const lessonId = entry.lessonId ?? entry.key.replace(/^lesson:/, "");
        const lesson = lessonById.get(lessonId);
        const region = lesson ? regionById.get(lesson.regionId) : undefined;
        return lesson ? { ...entry, lessonId, regionId: lesson.regionId, title: lesson.title, grade: lesson.grade, regionTitle: region?.title ?? entry.regionTitle } : entry;
      }
      const regionId = entry.regionId ?? Number(entry.key.replace(/^boss:/, ""));
      const region = regionById.get(regionId);
      return region ? { ...entry, regionId, title: `${region.title} Boss`, grade: region.grade, regionTitle: region.title } : entry;
    });
    return { ...fallback, ...parsed, profile, badges, learningHistory } as LearnerState;
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

export function completeDemoLesson(state: LearnerState, lessonId: string, stars: number, firstCorrectCount?: number): LearnerState {
  const existing = state.completedLessons.find((item) => item.id === lessonId);
  const reward = calculateLessonReward(existing?.stars ?? 0, stars);
  const completedLessons = existing
    ? state.completedLessons.map((item) => item.id === lessonId ? { ...item, stars: Math.max(item.stars, stars) } : item)
    : [...state.completedLessons, { id: lessonId, stars }];
  const currentLesson = lessonById.get(lessonId);
  const gradeLessons = currentLesson ? getGradeLessons(currentLesson.grade) : [];
  const currentIndex = gradeLessons.findIndex((item) => item.id === lessonId);
  const followingLesson = gradeLessons[currentIndex + 1] ?? currentLesson;
  const region = currentLesson ? getGradeCurriculum(currentLesson.grade).regions.find((item) => item.id === currentLesson.regionId) : undefined;
  const learningHistory = !currentLesson ? state.learningHistory : existing
    ? state.learningHistory.map((entry) => entry.key === `lesson:${lessonId}` ? {
        ...entry,
        lessonId,
        regionId: currentLesson.regionId,
        title: currentLesson.title,
        grade: currentLesson.grade,
        regionTitle: region?.title ?? entry.regionTitle,
        stars: Math.max(entry.stars ?? 0, stars),
        firstCorrectCount: Math.max(entry.firstCorrectCount ?? 0, firstCorrectCount ?? (stars === 3 ? currentLesson.practice.length : 0)),
        questionCount: currentLesson.practice.length,
      } : entry)
    : [{
        key: `lesson:${lessonId}`,
        kind: "lesson" as const,
        lessonId,
        regionId: currentLesson.regionId,
        title: currentLesson.title,
        grade: currentLesson.grade,
        regionTitle: region?.title ?? "Math route",
        completedAt: new Date().toISOString(),
        stars,
        firstCorrectCount: firstCorrectCount ?? (stars === 3 ? currentLesson.practice.length : 0),
        questionCount: currentLesson.practice.length,
      }, ...state.learningHistory];
  let next: LearnerState = {
    ...state,
    completedLessons,
    learningHistory,
    totalXp: state.totalXp + reward.totalXp,
    weeklyXp: state.weeklyXp + reward.totalXp,
    nextLessonId: followingLesson?.id ?? state.nextLessonId,
  };
  const badge = !existing ? lessonBadgeByLessonId.get(lessonId) : undefined;
  if (badge && !next.badges.earnedIds.includes(badge.id)) next = applyBadgeProgress(next, undefined, [{ id: badge.id, unlockedAt: new Date().toISOString() }]);
  saveDemoState(next);
  return next;
}
