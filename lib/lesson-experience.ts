import type { LessonDefinition } from "./curriculum.ts";

export type LessonScene = "numbers" | "resources" | "systems" | "navigation" | "habitat" | "risk" | "growth" | "motion";

export type LessonHistory = {
  era: string;
  title: string;
  story: string;
  connection: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type LessonExperience = {
  scene: LessonScene;
  kicker: string;
  title: string;
  problem: string;
  model: string;
  signalA: string;
  signalB: string;
  history: LessonHistory;
};

const histories: Record<LessonScene, LessonHistory> = {
  numbers: {
    era: "INDIA · 628 CE",
    title: "Below zero became useful.",
    story: "Brahmagupta wrote rules for positive and negative numbers using fortunes and debts. The idea made gains, losses, height, and temperature computable.",
    connection: "Signed values now track everything from bank balances to a rover moving below its starting elevation.",
    sourceLabel: "Brahmagupta · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Biographies/Brahmagupta/",
  },
  resources: {
    era: "EGYPT · ABOUT 1650 BCE",
    title: "Fractions organized real supplies.",
    story: "The Rhind Mathematical Papyrus collected practical problems about sharing food, measuring land, and working with fractions.",
    connection: "Ratios, fractions, and percents still turn a limited supply into a plan that scales.",
    sourceLabel: "Egyptian mathematics · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/HistTopics/Egyptian_mathematics/",
  },
  systems: {
    era: "BAGHDAD · ABOUT 825 CE",
    title: "Algebra began as a problem-solving tool.",
    story: "Al-Khwarizmi explained algebra in words to solve practical questions about trade, inheritance, land, and measurement.",
    connection: "An unknown variable still lets engineers solve backward from the result they need.",
    sourceLabel: "Al-Khwarizmi · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/",
  },
  navigation: {
    era: "FRANCE · 1637",
    title: "Geometry learned to speak in coordinates.",
    story: "René Descartes published La Géométrie, linking equations with curves and positions on a plane.",
    connection: "That bridge now powers maps, animation, robotics, and every plotted flight path.",
    sourceLabel: "Descartes’ La Géométrie · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Extras/Descartes_La_Geometrie/",
  },
  habitat: {
    era: "ALEXANDRIA · ABOUT 300 BCE",
    title: "Geometry became a system you could prove.",
    story: "Euclid organized definitions, postulates, and proofs into the Elements, creating a reusable way to reason about space and shape.",
    connection: "The same logic checks a structure before anyone spends material building it.",
    sourceLabel: "Euclidean geometry · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/HistTopics/Non-Euclidean_geometry/",
  },
  risk: {
    era: "FRANCE · 1654",
    title: "A game-of-chance puzzle created probability theory.",
    story: "Blaise Pascal and Pierre de Fermat exchanged letters about dice and how to divide stakes fairly when a game stopped early.",
    connection: "Probability now helps teams judge uncertain evidence, from medical trials to landing risk.",
    sourceLabel: "Pascal and Fermat · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Chronology/11/",
  },
  growth: {
    era: "SCOTLAND · 1614",
    title: "Logarithms made huge calculations manageable.",
    story: "John Napier designed logarithms to replace long multiplications and divisions with easier operations.",
    connection: "Growth, decay, powers, and logarithms now describe signals, populations, finance, and scale.",
    sourceLabel: "John Napier · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Biographies/Napier/",
  },
  motion: {
    era: "EUROPE · 17TH CENTURY",
    title: "Calculus caught motion in the act.",
    story: "Isaac Newton and Gottfried Leibniz developed different methods for calculating continuous change and accumulation.",
    connection: "Rates and areas now predict acceleration, orbits, fuel use, and a lander’s path over time.",
    sourceLabel: "The rise of calculus · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/HistTopics/The_rise_of_calculus/",
  },
};

const riskVisuals = new Set(["probability", "tree", "trials", "two-way", "sample", "scatter", "residual", "box-plots", "data-line"]);
const habitatVisuals = new Set(["angles", "area", "circle", "congruence", "cross-section", "cylinder", "dilation", "distance", "net", "prism", "right-triangle", "scale", "solid-compare", "transform", "triangle", "coordinate-transform"]);
const navigationVisuals = new Set(["coordinate", "curve-line", "line-graph", "mapping", "parabola", "slope"]);
const resourceVisuals = new Set(["area-model", "estimate", "fraction-bars", "fractions", "percent-grid", "ratio-table", "reciprocal"]);
const growthVisuals = new Set(["decay", "exponent-blocks", "factor-chain", "factor-tree", "growth", "powers", "root-line", "root-tiles", "sequence"]);
const numberVisuals = new Set(["compare", "inequality-line", "number-line", "sign-grid"]);

function classifyLesson(lesson: Pick<LessonDefinition, "title" | "standard" | "visual">): LessonScene {
  const text = `${lesson.title} ${lesson.standard}`.toLowerCase();
  if (/calculus|derivative|integral|limit|instantaneous|accumulation|area under|rate of change|ap\.calc/.test(text)) return "motion";
  if (/statistics|probability|sample|distribution|regression|correlation|residual|confidence|survey|random|data/.test(text) || riskVisuals.has(lesson.visual)) return "risk";
  if (/exponential|logarithm|growth|decay|geometric sequence|power|radical|root/.test(text) || growthVisuals.has(lesson.visual)) return "growth";
  if (/geometry|triangle|circle|angle|volume|surface area|congruen|similar|transform|trigon|sine|cosine|radian/.test(text) || habitatVisuals.has(lesson.visual)) return "habitat";
  if (/coordinate|graph|function|slope|linear|quadratic|parabola|domain|range|mapping/.test(text) || navigationVisuals.has(lesson.visual)) return "navigation";
  if (/fraction|percent|ratio|proportion|decimal|unit rate|scale factor/.test(text) || resourceVisuals.has(lesson.visual)) return "resources";
  if (/negative|positive|integer|absolute value|inequal|compare|number/.test(text) || numberVisuals.has(lesson.visual)) return "numbers";
  return "systems";
}

const sceneCopy: Record<LessonScene, Omit<LessonExperience, "scene" | "model" | "history">> = {
  numbers: {
    kicker: "MARS ELEVATION LOG",
    title: "Can the rover cross zero and still reach the ridge?",
    problem: "Track height and temperature above and below a starting level. One sign error can send the route the wrong way.",
    signalA: "start: −2",
    signalB: "change: +5",
  },
  resources: {
    kicker: "HABITAT SUPPLY PLAN",
    title: "Will the same supply ratio support a larger crew?",
    problem: "Scale water, air, food, and power without changing the relationship that keeps the habitat running.",
    signalA: "crew: 4",
    signalB: "scale: ×2",
  },
  systems: {
    kicker: "LIFE-SUPPORT CONTROL",
    title: "What unknown value keeps the habitat stable?",
    problem: "Turn a target reading into an equation, then solve backward before changing a real control.",
    signalA: "target: safe",
    signalB: "solve: x",
  },
  navigation: {
    kicker: "ROVER NAVIGATION",
    title: "Where will the rover be after the next move?",
    problem: "Connect coordinates, tables, graphs, and equations so mission control can predict a route before the rover drives it.",
    signalA: "x: time",
    signalB: "y: position",
  },
  habitat: {
    kicker: "BASE ENGINEERING",
    title: "Will this design fit before the crew builds it?",
    problem: "Use measurements and shape relationships to test a panel, tunnel, or habitat with zero wasted material.",
    signalA: "measure",
    signalB: "verify",
  },
  risk: {
    kicker: "MISSION SIGNAL CHECK",
    title: "Which signal should mission control trust?",
    problem: "Turn noisy observations into evidence, compare uncertainty, and choose the safer mission decision.",
    signalA: "collect data",
    signalB: "judge risk",
  },
  growth: {
    kicker: "COLONY FORECAST",
    title: "How fast will this system grow—or fade?",
    problem: "Model repeated change in power, population, signals, or resources before the effect becomes too large to guess.",
    signalA: "now: 1×",
    signalB: "next: ?",
  },
  motion: {
    kicker: "LANDING TRAJECTORY",
    title: "Can we predict the lander before touchdown?",
    problem: "Measure change from moment to moment and accumulation over time to keep speed, distance, and fuel inside safe limits.",
    signalA: "rate: changing",
    signalB: "landing: safe",
  },
};

export function getLessonExperience(lesson: Pick<LessonDefinition, "title" | "goal" | "example" | "standard" | "visual">): LessonExperience {
  const scene = classifyLesson(lesson);
  if (/symbol/i.test(lesson.title)) {
    return {
      scene: "systems",
      kicker: "MISSION CONTROL LANGUAGE",
      title: "Which symbol sends the right instruction?",
      problem: "Comparison and operation symbols let a crew read the same command without guessing what the values mean.",
      model: lesson.example,
      signalA: "read values",
      signalB: "choose relation",
      history: {
        ...histories.systems,
        title: "Math was not always written in symbols.",
        story: "Al-Khwarizmi solved algebra problems entirely in words. Later notation compressed those instructions into symbols that people could scan and reuse.",
        connection: "Reading a symbol correctly is what turns a short expression back into a precise mathematical instruction.",
      },
    };
  }
  return {
    scene,
    ...sceneCopy[scene],
    model: lesson.example,
    history: histories[scene],
  };
}

export function getGradeMission(grade: number) {
  const missions: Record<number, { kicker: string; title: string; copy: string; scene: LessonScene }> = {
    7: { kicker: "MARS SUPPLY RUN", title: "Turn ratios into a working colony.", copy: "Plan water, distance, scale, and probability across a chain of short missions.", scene: "resources" },
    8: { kicker: "ROVER ROUTE · GRADE 8", title: "Move across Mars with math as your navigation system.", copy: "Read the terrain, model the route, test the answer, then see why people invented the method.", scene: "navigation" },
    9: { kicker: "FIRST LANDING WINDOW", title: "Use algebra to predict what happens next.", copy: "Build equations and functions that turn changing signals into a flight plan.", scene: "systems" },
    10: { kicker: "HABITAT BLUEPRINT", title: "Build a base that fits the world around it.", copy: "Use proof, geometry, and measurement before the first structure touches the ground.", scene: "habitat" },
    11: { kicker: "DEEP-SPACE SIGNAL", title: "Read patterns too large or distant to see directly.", copy: "Use functions, trigonometry, and growth models to decode motion and change.", scene: "growth" },
    12: { kicker: "ORBITAL COMMAND", title: "Model motion while it is still changing.", copy: "Use limits, rates, probability, and accumulation to make high-stakes decisions.", scene: "motion" },
  };
  return missions[grade] ?? missions[8];
}
