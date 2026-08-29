export const themeIds = ["classic", "space", "blossom", "ocean", "aurora"] as const;
export type ThemeId = (typeof themeIds)[number];

export type ThemeSpec = {
  id: ThemeId;
  name: string;
  kicker: string;
  copy: string;
  motif: string;
  atlasPosition: string;
};

export const themeCatalog: ThemeSpec[] = [
  { id: "classic", name: "Paper Trail", kicker: "WARM · FOCUSED", copy: "Ivory paper, ink blue, and small gold landmarks.", motif: "✦", atlasPosition: "0%" },
  { id: "space", name: "Astronaut Orbit", kicker: "DEEP · CURIOUS", copy: "Midnight space, orbit lines, and a calm explorer.", motif: "◎", atlasPosition: "25%" },
  { id: "blossom", name: "Cherry Blossom", kicker: "SOFT · BRIGHT", copy: "Petal pink, paper geometry, and a quiet spring sky.", motif: "✿", atlasPosition: "50%" },
  { id: "ocean", name: "Deep Ocean", kicker: "CLEAR · STEADY", copy: "Ocean teal, light rays, and floating geometric bubbles.", motif: "◇", atlasPosition: "75%" },
  { id: "aurora", name: "Aurora Forest", kicker: "CALM · BOLD", copy: "Emerald aurora, forest layers, and firefly signals.", motif: "✧", atlasPosition: "100%" },
];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (themeIds as readonly string[]).includes(value);
}

export function normalizeTheme(value: unknown): ThemeId {
  return isThemeId(value) ? value : "classic";
}
