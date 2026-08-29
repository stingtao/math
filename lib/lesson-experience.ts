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
  image?: string;
  imageAlt?: string;
  history: LessonHistory;
};

type GradeStoryArc = Pick<LessonExperience, "kicker" | "title" | "problem" | "signalA" | "signalB">;

const gradeStoryArcs: Record<number, GradeStoryArc> = {
  701: { kicker: "MARS SUPPLY RUN", title: "Can the greenhouse support a bigger crew?", problem: "Compare water, food, and travel rates before the next crew leaves base.", signalA: "compare", signalB: "scale" },
  702: { kicker: "CANYON ROUTE", title: "Can the rover cross zero and reach the ridge?", problem: "Track gains and losses in elevation while the route moves above and below base level.", signalA: "start", signalB: "move" },
  703: { kicker: "POWER CONTROL", title: "What setting keeps the greenhouse stable?", problem: "Rewrite and solve a control rule before changing the power system.", signalA: "model", signalB: "solve" },
  704: { kicker: "COLONY MARKET", title: "Which supply deal actually saves resources?", problem: "Compare discounts, fees, tips, interest, and percent change before the colony commits.", signalA: "original", signalB: "change" },
  705: { kicker: "HABITAT FRAME", title: "Will these pieces make a safe structure?", problem: "Use angles, circles, scale, and triangle conditions before a frame is assembled.", signalA: "measure", signalB: "verify" },
  706: { kicker: "FABRICATION BAY", title: "How much material does this design need?", problem: "Break a complex habitat into familiar solids and surfaces before printing parts.", signalA: "decompose", signalB: "build" },
  707: { kicker: "CREW SIGNALS", title: "Does this sample represent the whole colony?", problem: "Choose fair data, compare distributions, and decide what the evidence supports.", signalA: "sample", signalB: "infer" },
  708: { kicker: "DRONE FORECAST", title: "Which route gives the best chance of success?", problem: "Build a sample space, compare expected and observed results, then judge the risk.", signalA: "outcomes", signalB: "chance" },

  1: { kicker: "DEEP-SEA CODE", title: "Can every control symbol be read without guessing?", problem: "Decode signs, operations, and number order before the dive station powers up.", signalA: "read", signalB: "decide" },
  2: { kicker: "OXYGEN MIX", title: "Will the same blend work in every habitat?", problem: "Connect fractions, decimals, and percents to divide a limited reserve accurately.", signalA: "part", signalB: "whole" },
  3: { kicker: "PRESSURE BALANCE", title: "What unknown setting returns the chamber to safe pressure?", problem: "Translate a control message into an equation and undo one operation at a time.", signalA: "unknown", signalB: "balance" },
  4: { kicker: "POWER MODULES", title: "Can one compact rule control a huge energy system?", problem: "Use powers and distribution to combine repeated modules without counting each one.", signalA: "repeat", signalB: "simplify" },
  5: { kicker: "SONAR CALIBRATION", title: "Which readings fit on the rational scale?", problem: "Classify repeating, terminating, and root values so the sensor stores them correctly.", signalA: "estimate", signalB: "classify" },
  6: { kicker: "DEEP-OCEAN SCALE", title: "How do we compare signals that differ by millions?", problem: "Use exponent rules and scientific notation to keep extreme measurements readable.", signalA: "power", signalB: "scale" },
  7: { kicker: "LOCK CONTROL", title: "Which value opens the pressure gate?", problem: "Combine terms, solve multi-step equations, and recognize when a control has one, none, or many solutions.", signalA: "combine", signalB: "unlock" },
  8: { kicker: "CURRENT NAVIGATION", title: "Where do two travel routes meet?", problem: "Use slope, graphs, and systems to predict the crossing before the vehicles move.", signalA: "route A", signalB: "route B" },
  9: { kicker: "AUTONOMOUS ROUTINES", title: "Is this input-output rule reliable enough to automate?", problem: "Connect tables, graphs, and equations, then compare how different functions behave.", signalA: "input", signalB: "output" },
  10: { kicker: "MOVING BRIDGE", title: "Can a bridge move without changing its shape?", problem: "Translate, rotate, reflect, and dilate a design while tracking every coordinate.", signalA: "before", signalB: "after" },
  11: { kicker: "DOME SAFETY", title: "Will this frame close with the right lengths and angles?", problem: "Use angle and triangle relationships to test a structural frame before assembly.", signalA: "length", signalB: "angle" },
  12: { kicker: "BALLAST TANKS", title: "How much water fits inside the new station?", problem: "Model cylinders, cones, spheres, and mixed solids before filling a tank.", signalA: "shape", signalB: "volume" },
  13: { kicker: "OCEAN SIGNAL LAB", title: "What pattern is hiding in the sensor data?", problem: "Use plots, fit lines, tables, and probability to turn observations into a decision.", signalA: "observe", signalB: "predict" },

  901: { kicker: "ORBITAL FORMULA LAB", title: "Can one formula coordinate every module?", problem: "Use units, properties, and literal equations to make each quantity mean exactly one thing.", signalA: "quantity", signalB: "formula" },
  902: { kicker: "SAFE OPERATING WINDOW", title: "Which values keep the station inside its limits?", problem: "Solve equations, inequalities, and absolute-value constraints before changing a live system.", signalA: "boundary", signalB: "solution" },
  903: { kicker: "FLIGHT PATH", title: "Where will a constant-rate route go next?", problem: "Connect points, slope, equation forms, and arithmetic sequences to forecast a path.", signalA: "rate", signalB: "position" },
  904: { kicker: "ROUTE INTERSECTION", title: "Where can two mission plans work at the same time?", problem: "Solve linear systems and regions, then test the point where both conditions agree.", signalA: "system A", signalB: "system B" },
  905: { kicker: "ENERGY CELL SCALE", title: "How can a radical describe the exact power level?", problem: "Move between integer exponents, rational exponents, and radicals without changing the value.", signalA: "power", signalB: "root" },
  906: { kicker: "MODULE ASSEMBLY", title: "How do many pieces combine into one reliable model?", problem: "Name and combine polynomial parts before the station fabricates a larger structure.", signalA: "terms", signalB: "combine" },
  907: { kicker: "FACTOR LOCK", title: "Which smaller parts built this polynomial?", problem: "Reverse multiplication to expose shared factors and the structure hidden inside an expression.", signalA: "product", signalB: "factors" },
  908: { kicker: "SOLAR BRIDGE", title: "Where should a curved bridge rise, cross, and land?", problem: "Use roots, factoring, formulas, and graphs to control a quadratic path.", signalA: "vertex", signalB: "zeros" },
  909: { kicker: "COLONY FORECAST", title: "Will this signal grow steadily—or multiply?", problem: "Compare sequences and exponential models before a small change becomes enormous.", signalA: "now", signalB: "next" },
  910: { kicker: "EVIDENCE DECK", title: "Which model deserves the crew’s trust?", problem: "Use distributions, residuals, and context to judge whether data supports a decision.", signalA: "data", signalB: "model" },
};

const gradeJourneyMedia: Record<7 | 8 | 9, { image: string; imageAlt: string }> = {
  7: { image: "/visuals/g7-frontier-mission.webp", imageAlt: "Students at a Mars greenhouse compare supplies, scaled plans, geometric panels, and chance models." },
  8: { image: "/visuals/g8-frontier-mission.webp", imageAlt: "Students in an underwater city use a coordinate table, data models, solids, and a geometric bridge." },
  9: { image: "/visuals/g9-frontier-mission.webp", imageAlt: "Students in an orbital lab compare straight and curved flight paths with energy and data models." },
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

export function getLessonExperience(lesson: Pick<LessonDefinition, "title" | "goal" | "example" | "standard" | "visual" | "grade" | "regionId">): LessonExperience {
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
  const storyArc = gradeStoryArcs[lesson.regionId];
  const journeyMedia = lesson.grade === 7 || lesson.grade === 8 || lesson.grade === 9 ? gradeJourneyMedia[lesson.grade] : undefined;
  if (storyArc) {
    return {
      scene,
      ...storyArc,
      ...journeyMedia,
      model: lesson.example,
      history: histories[scene],
    };
  }
  return {
    scene,
    ...sceneCopy[scene],
    model: lesson.example,
    history: histories[scene],
  };
}
