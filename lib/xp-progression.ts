import type { ThemeId } from "./themes.ts";

export const XP_PER_LEVEL = 100;

type RankSpec = {
  level: number;
  title: string;
};

const themedRanks: Record<ThemeId, readonly RankSpec[]> = {
  classic: [
    { level: 1, title: "Field Scout" },
    { level: 3, title: "Route Finder" },
    { level: 5, title: "Mapmaker" },
    { level: 8, title: "Wayfinder" },
    { level: 12, title: "Master Cartographer" },
  ],
  space: [
    { level: 1, title: "Flight Cadet" },
    { level: 3, title: "Rover Pilot" },
    { level: 5, title: "Orbit Navigator" },
    { level: 8, title: "Mission Commander" },
    { level: 12, title: "Star Captain" },
  ],
  blossom: [
    { level: 1, title: "Seedling" },
    { level: 3, title: "Pattern Gardener" },
    { level: 5, title: "Bloom Keeper" },
    { level: 8, title: "Sky Gardener" },
    { level: 12, title: "Garden Master" },
  ],
  ocean: [
    { level: 1, title: "Reef Scout" },
    { level: 3, title: "Current Diver" },
    { level: 5, title: "Maze Builder" },
    { level: 8, title: "Abyss Architect" },
    { level: 12, title: "Deepglass Master" },
  ],
  aurora: [
    { level: 1, title: "Trail Scout" },
    { level: 3, title: "Signal Ranger" },
    { level: 5, title: "Firefly Keeper" },
    { level: 8, title: "Aurora Warden" },
    { level: 12, title: "Northstar Guide" },
  ],
};

export type XpProgress = {
  totalXp: number;
  level: number;
  levelStartXp: number;
  nextLevelXp: number;
  earnedInLevel: number;
  xpToNextLevel: number;
  percent: number;
  rankTitle: string;
  tier: number;
  nextRank: { level: number; title: string; xpRequired: number } | null;
};

function normalizeXp(totalXp: number) {
  if (!Number.isFinite(totalXp)) return 0;
  return Math.max(0, Math.floor(totalXp));
}

export function getXpProgress(totalXp: number, theme: ThemeId): XpProgress {
  const xp = normalizeXp(totalXp);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const levelStartXp = (level - 1) * XP_PER_LEVEL;
  const nextLevelXp = level * XP_PER_LEVEL;
  const earnedInLevel = xp - levelStartXp;
  const ranks = themedRanks[theme];
  const tierIndex = ranks.findLastIndex((rank) => rank.level <= level);
  const activeRank = ranks[Math.max(0, tierIndex)];
  const nextRank = ranks[tierIndex + 1];

  return {
    totalXp: xp,
    level,
    levelStartXp,
    nextLevelXp,
    earnedInLevel,
    xpToNextLevel: nextLevelXp - xp,
    percent: Math.round(earnedInLevel / XP_PER_LEVEL * 100),
    rankTitle: activeRank.title,
    tier: tierIndex + 1,
    nextRank: nextRank ? { ...nextRank, xpRequired: (nextRank.level - 1) * XP_PER_LEVEL } : null,
  };
}

export function getXpGain(previousXp: number, totalXp: number, theme: ThemeId) {
  const previous = getXpProgress(previousXp, theme);
  const current = getXpProgress(totalXp, theme);
  return {
    previous,
    current,
    levelsGained: Math.max(0, current.level - previous.level),
    rankUnlocked: current.tier > previous.tier ? current.rankTitle : null,
  };
}
