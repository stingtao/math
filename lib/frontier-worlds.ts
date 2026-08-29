import type { ThemeId } from "./themes";

export type FrontierWorld = {
  id: ThemeId;
  index: string;
  navLabel: string;
  worldName: string;
  kicker: string;
  title: string;
  story: string;
  mission: string;
  missionLabel: string;
  skills: readonly string[];
  image: string;
  alt: string;
  href: string;
  cta: string;
};

export const frontierWorlds = [
  {
    id: "classic",
    index: "00",
    navLabel: "Atlas",
    worldName: "The Inkbound Atlas",
    kicker: "UNCHARTED EARTH",
    title: "Draw the route beyond the edge.",
    story: "An unfinished map is waiting. Every proof adds a road, a bridge, or a safe passage through territory no one has charted.",
    mission: "Use operation order to restore a broken expedition route.",
    missionLabel: "Route repair",
    skills: ["Operations", "Equations", "Proof"],
    image: "/visuals/operations-sequence-context.webp",
    alt: "An expedition route moving through a carefully ordered sequence of operations",
    href: "/learn/order-of-operations?grade=8&demo=1",
    cta: "Open the atlas",
  },
  {
    id: "space",
    index: "01",
    navLabel: "Mars",
    worldName: "Mars Command",
    kicker: "FIRST HUMAN SETTLEMENT",
    title: "Keep the red planet alive.",
    story: "The colony needs water, power, launch routes, and people who can think under pressure. Every system runs on math.",
    mission: "Plot a rover supply route with coordinates and slope.",
    missionLabel: "Rover route",
    skills: ["Ratios", "Coordinates", "Linear graphs"],
    image: "/visuals/frontier-mars-comic-v2.webp",
    alt: "Teen explorers overlooking a thriving human settlement, rover routes, and launch towers on Mars",
    href: "/labs/linear-graphs#point-mission",
    cta: "Enter Mars Command",
  },
  {
    id: "blossom",
    index: "02",
    navLabel: "Biosphere",
    worldName: "Sky Blossom Biosphere",
    kicker: "ORBITAL ECOSYSTEM",
    title: "Bring a living world back online.",
    story: "A floating biosphere is fading. Find its growth patterns, balance its resources, and restore one habitat at a time.",
    mission: "Model how light and water change the garden's growth.",
    missionLabel: "Habitat restore",
    skills: ["Patterns", "Functions", "Growth"],
    image: "/visuals/exponential-greenhouse-context.webp",
    alt: "A luminous greenhouse where growth patterns control a floating ecosystem",
    href: "/learn/g9-exponential-growth?grade=9&demo=1",
    cta: "Restore the biosphere",
  },
  {
    id: "ocean",
    index: "03",
    navLabel: "The Deep",
    worldName: "Deepglass City",
    kicker: "MIDNIGHT OCEAN COLONY",
    title: "Build a city below the surface.",
    story: "Pressure rises. Light disappears. Your crew is engineering a luminous city where humans have never lived before.",
    mission: "Use geometry and volume to pressure-test a new habitat gate.",
    missionLabel: "Pressure gate",
    skills: ["Geometry", "Volume", "Equations"],
    image: "/visuals/frontier-deepglass-comic-v2.webp",
    alt: "Teen engineers overlooking a vast luminous city built inside a deep ocean trench",
    href: "/learn/g7-prism-volume?grade=7&demo=1",
    cta: "Dive into Deepglass",
  },
  {
    id: "aurora",
    index: "04",
    navLabel: "Unknown",
    worldName: "The Aurora Wilds",
    kicker: "BEYOND THE KNOWN MAP",
    title: "Decode a signal no one can explain.",
    story: "Something is pulsing beyond the last mapped ridge. Find the rule, predict its next move, and follow it into the unknown.",
    mission: "Trace a hidden function through the aurora signal.",
    missionLabel: "Signal trace",
    skills: ["Functions", "Data", "Prediction"],
    image: "/visuals/frontier-aurora-comic-v2.webp",
    alt: "Teen explorers following a geometric signal through an aurora-lit alien wilderness",
    href: "/learn/function-rules?grade=8&demo=1",
    cta: "Follow the signal",
  },
] satisfies readonly FrontierWorld[];

export const featuredFrontierWorlds = frontierWorlds.filter((world) => ["space", "ocean", "aurora"].includes(world.id));
