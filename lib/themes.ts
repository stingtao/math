export const themeIds = ["classic", "space", "blossom", "ocean", "aurora"] as const;
export type ThemeId = (typeof themeIds)[number];

export type ThemeSpec = {
  id: ThemeId;
  name: string;
  kicker: string;
  copy: string;
  motif: string;
  atlasPosition: string;
  worldName: string;
  role: string;
  baseName: string;
  mapLabel: string;
  reviewLabel: string;
  badgeLabel: string;
  leagueLabel: string;
  profileLabel: string;
  missionFocus: string;
  locations: readonly string[];
};

export const themeCatalog: ThemeSpec[] = [
  { id: "classic", name: "Paper Trail", kicker: "WARM · FOCUSED", copy: "Chart an ink-and-gold atlas, one proof at a time.", motif: "✦", atlasPosition: "0%", worldName: "The Inkbound Atlas", role: "Trail Cartographer", baseName: "Map Room", mapLabel: "Atlas Route", reviewLabel: "Field Notes", badgeLabel: "Seal Cabinet", leagueLabel: "Guild Board", profileLabel: "Map Room", missionFocus: "draw the next safe route through the atlas", locations: ["Ivory Quay", "Compass Grove", "Fraction Crossing", "Equation Keep", "Graphmaker Ridge", "Proofkeeper Summit"] },
  { id: "space", name: "Astronaut Orbit", kicker: "DEEP · CURIOUS", copy: "Cruise a quiet starline and calibrate new worlds.", motif: "◎", atlasPosition: "25%", worldName: "The Kepler Starline", role: "Orbit Navigator", baseName: "Command Deck", mapLabel: "Star Map", reviewLabel: "Signal Recall", badgeLabel: "Relic Vault", leagueLabel: "Flight League", profileLabel: "Command Deck", missionFocus: "calibrate the flight path to the next planet", locations: ["Luna Dock", "Kepler Echo", "Vector Belt", "Parabola Prime", "Algebra Nebula", "Polaris Gate"] },
  { id: "blossom", name: "Cherry Blossom", kicker: "SOFT · BRIGHT", copy: "Restore a floating garden with every solved pattern.", motif: "✿", atlasPosition: "50%", worldName: "The Sky Blossom Garden", role: "Pattern Gardener", baseName: "Garden Pavilion", mapLabel: "Bloom Path", reviewLabel: "Seed Recall", badgeLabel: "Petal Archive", leagueLabel: "Garden Guild", profileLabel: "Garden Pavilion", missionFocus: "restore the next pattern garden before it blooms", locations: ["Petal Landing", "Lantern Orchard", "Ratio Terrace", "Equation Arbor", "Graphvine Bridge", "Moonflower Crown"] },
  { id: "ocean", name: "Deep Ocean", kicker: "CLEAR · STEADY", copy: "Build a deep-sea labyrinth from luminous ideas.", motif: "◇", atlasPosition: "75%", worldName: "The Deepglass Labyrinth", role: "Abyss Architect", baseName: "Dive Station", mapLabel: "Labyrinth Chart", reviewLabel: "Echo Scan", badgeLabel: "Treasure Hold", leagueLabel: "Dive Crew", profileLabel: "Dive Station", missionFocus: "open the next gate in the deep-sea labyrinth", locations: ["Sunlit Reef", "Coral Gate", "Current Gallery", "Equation Trench", "Graphglass Maze", "Midnight Vault"] },
  { id: "aurora", name: "Aurora Forest", kicker: "CALM · BOLD", copy: "Follow firefly signals through an emerald night.", motif: "✧", atlasPosition: "100%", worldName: "The Aurora Wilds", role: "Signal Ranger", baseName: "Ranger Camp", mapLabel: "Signal Trail", reviewLabel: "Echo Ritual", badgeLabel: "Firefly Archive", leagueLabel: "Ranger Circle", profileLabel: "Ranger Camp", missionFocus: "relight the next signal across the northern forest", locations: ["Mosslight Camp", "Firefly Ford", "Ratio Pines", "Equation Hollow", "Aurora Pass", "Northstar Sanctuary"] },
];

export type ThemeJourney = {
  stage: number;
  location: string;
  nextLocation: string;
  headline: string;
  story: string;
  status: string;
};

export function getThemeSpec(theme: ThemeId) {
  return themeCatalog.find((item) => item.id === theme) ?? themeCatalog[0];
}

export function getThemeJourney(theme: ThemeId, progress: { lessons: number; bosses: number; dueReview: number }): ThemeJourney {
  const spec = getThemeSpec(theme);
  const stage = progress.lessons + progress.bosses + 1;
  const locationIndex = Math.min(spec.locations.length - 1, Math.floor(progress.lessons / 4));
  const location = spec.locations[locationIndex];
  const nextLocation = spec.locations[Math.min(spec.locations.length - 1, locationIndex + 1)];
  const status = progress.dueReview > 0
    ? `Review mission: ${progress.dueReview} ${progress.dueReview === 1 ? "idea" : "ideas"} waiting in ${spec.reviewLabel}.`
    : `Route clear. Ready to ${spec.missionFocus}.`;

  const storyByTheme: Record<ThemeId, string> = {
    classic: `Charting a route through ${spec.worldName}.`,
    space: `Cruising ${spec.worldName} toward new worlds.`,
    blossom: `Restoring the floating gardens of ${spec.worldName}.`,
    ocean: `Building the next passage through ${spec.worldName}.`,
    aurora: `Following firefly signals across ${spec.worldName}.`,
  };

  return {
    stage,
    location,
    nextLocation,
    headline: `Mission ${stage} · ${location}`,
    story: storyByTheme[theme],
    status,
  };
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (themeIds as readonly string[]).includes(value);
}

export function normalizeTheme(value: unknown): ThemeId {
  return isThemeId(value) ? value : "classic";
}
