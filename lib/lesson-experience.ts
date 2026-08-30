import type { LessonDefinition } from "./curriculum.ts";

export type LessonScene = "numbers" | "resources" | "systems" | "navigation" | "habitat" | "risk" | "growth" | "motion" | "proof" | "signal" | "orbit" | "accumulation" | "network";

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

  1: { kicker: "DEEP-SEA CONTROL", title: "Can every reading guide the right move?", problem: "Use symbols, signed levels, and operation order to turn each control reading into one safe action.", signalA: "read first", signalB: "move next" },
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

  1001: { kicker: "EUROPA STRUCTURE REVIEW", title: "Can every joint survive before the habitat is built?", problem: "Turn definitions and angle facts into a proof chain that catches a structural mistake before fabrication.", signalA: "claim", signalB: "reason" },
  1002: { kicker: "DOCKING-BAY ALIGNMENT", title: "Can the docking frame move without changing shape?", problem: "Track every vertex through rotations, reflections, and translations so two spacecraft frames still match.", signalA: "original", signalB: "image" },
  1003: { kicker: "CRATER RANGEFINDER", title: "How wide is a crater nobody can walk across?", problem: "Use similarity and trigonometry to turn one measured angle and one safe baseline into an unreachable distance.", signalA: "baseline", signalB: "distance" },
  1004: { kicker: "ORBITAL MAP LOCK", title: "Will two navigation paths meet at the intended relay?", problem: "Use coordinates, slopes, distance, and midpoint to verify a flight plan before the vehicles commit fuel.", signalA: "coordinates", signalB: "verify" },
  1005: { kicker: "DEEP-SPACE DISH", title: "Where should the receiver sit on a circular signal field?", problem: "Connect arcs, tangents, chords, and circle equations to aim a receiver without losing the transmission.", signalA: "center", signalB: "radius" },
  1006: { kicker: "LUNAR FABRICATION BAY", title: "How much material will the full-scale habitat consume?", problem: "Scale area, volume, density, and cross-sections before a small prototype becomes an expensive real structure.", signalA: "scale", signalB: "material" },
  1007: { kicker: "LANDING-RISK BOARD", title: "Which landing signal changes the chance of success?", problem: "Separate overlap, conditional information, and independence before mission control acts on uncertain evidence.", signalA: "given", signalB: "chance" },
  1008: { kicker: "TELEMETRY MODEL CHECK", title: "Which function or data display tells the honest story?", problem: "Compare graphs, piecewise rules, distributions, and residuals so a neat-looking model does not hide a bad fit.", signalA: "represent", signalB: "judge" },

  1101: { kicker: "SIGNAL-ENGINEERING LAB", title: "Which polynomial shape matches the transmission?", problem: "Use zeros, multiplicity, complex roots, and identities to rebuild a signal from the features visible in its graph.", signalA: "zeros", signalB: "shape" },
  1102: { kicker: "REACTOR SAFETY WINDOW", title: "Where does the model stop making physical sense?", problem: "Track domains, asymptotes, radicals, and extraneous solutions before a formula controls a real reactor setting.", signalA: "domain", signalB: "constraint" },
  1103: { kicker: "EXOPLANET GROWTH LOG", title: "Will the colony’s system multiply or decay?", problem: "Use exponentials and logarithms to predict power, population, and signal strength across vastly different scales.", signalA: "factor", signalB: "time" },
  1104: { kicker: "REPEATING-BURST ARRAY", title: "Can a repeating signal be compressed into one rule?", problem: "Model arithmetic and geometric sequences, then add finite or infinite bursts without listing every term.", signalA: "pattern", signalB: "sum" },
  1105: { kicker: "SATELLITE PHASE CONTROL", title: "When will two rotating signals line up again?", problem: "Use radians, unit-circle values, identities, and wave graphs to predict phase before the next transmission window.", signalA: "angle", signalB: "phase" },
  1106: { kicker: "COMET-TRACKING SCOPE", title: "Which conic best describes the object’s path?", problem: "Read focus, vertex, and axis information to distinguish parabolic, elliptical, and hyperbolic trajectories.", signalA: "focus", signalB: "path" },
  1107: { kicker: "3D NAVIGATION CORE", title: "Can one transformation steer every coordinate at once?", problem: "Use matrices and vectors to combine position, direction, and system constraints into a reliable navigation command.", signalA: "vector", signalB: "transform" },
  1108: { kicker: "COLONY EVIDENCE COUNCIL", title: "Is the sample strong enough to guide a real decision?", problem: "Check bias, normal models, confidence intervals, and uncertainty before extending a sample result to everyone.", signalA: "sample", signalB: "infer" },

  1201: { kicker: "AUTONOMOUS MODEL STACK", title: "Can several functions operate as one dependable system?", problem: "Compose, invert, transform, and compare advanced functions so each stage of an automated process can be reversed and tested.", signalA: "input", signalB: "inverse" },
  1202: { kicker: "APPROACH VECTOR", title: "What happens near the target before the lander arrives?", problem: "Use tables, graphs, and limit laws to predict nearby behavior even when the exact target reading is missing.", signalA: "approach", signalB: "limit" },
  1203: { kicker: "LIVE VELOCITY ENGINE", title: "How fast is the rover changing at this exact instant?", problem: "Translate local slope into derivative rules that update motion, power, and signal models moment by moment.", signalA: "local slope", signalB: "rate" },
  1204: { kicker: "FLIGHT-PATH OPTIMIZER", title: "Where should the system speed up, turn, or peak?", problem: "Read derivative signs and concavity to locate safe extrema and optimize a design under real constraints.", signalA: "behavior", signalB: "optimum" },
  1205: { kicker: "RESOURCE-FLOW INTEGRATOR", title: "How much fuel and energy accumulate during the mission?", problem: "Turn changing rates into total quantity with areas, antiderivatives, numerical sums, and differential equations.", signalA: "rate", signalB: "total" },
  1206: { kicker: "MULTI-AXIS ORBIT LAB", title: "Which coordinate language makes this curved route simplest?", problem: "Switch among vectors, parametric paths, polar coordinates, and the complex plane to control motion in two dimensions.", signalA: "parameter", signalB: "position" },
  1207: { kicker: "UNCERTAINTY SIMULATOR", title: "What long-run outcome should mission control expect?", problem: "Build random variables and probability distributions to compare risk, reward, and sampling behavior before a decision.", signalA: "distribution", signalB: "expected" },
  1208: { kicker: "DECISION NETWORK", title: "Which conclusion or route survives the evidence?", problem: "Combine inference, finance, and algorithms to choose a defensible action without overstating what the data can prove.", signalA: "evidence", signalB: "decision" },
};

const gradeJourneyMedia: Partial<Record<7 | 8 | 9, { image: string; imageAlt: string }>> = {
  7: { image: "/visuals/g7-frontier-mission.webp", imageAlt: "Students at a Mars greenhouse compare supplies, scaled plans, geometric panels, and chance models." },
};

const regionScenes: Record<number, LessonScene> = {
  8: "navigation", 904: "navigation",
  1001: "proof", 1002: "proof", 1003: "orbit", 1004: "navigation", 1005: "orbit", 1006: "habitat", 1007: "risk", 1008: "risk",
  1101: "signal", 1102: "systems", 1103: "signal", 1104: "growth", 1105: "signal", 1106: "orbit", 1107: "network", 1108: "risk",
  1201: "network", 1202: "motion", 1203: "motion", 1204: "motion", 1205: "accumulation", 1206: "orbit", 1207: "risk", 1208: "network",
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
  proof: {
    era: "ALEXANDRIA · ABOUT 300 BCE",
    title: "A proof made every step inspectable.",
    story: "Euclid organized geometry so each conclusion followed from definitions, postulates, and earlier results instead of relying on how a diagram looked.",
    connection: "That same claim-and-reason structure now verifies designs, software, and safety arguments before failure is expensive.",
    sourceLabel: "Euclid · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Biographies/Euclid/",
  },
  signal: {
    era: "FRANCE · 1822",
    title: "Complicated signals became combinations of waves.",
    story: "Joseph Fourier showed how periodic behavior could be studied through sine and cosine components, connecting equations to heat and repeating signals.",
    connection: "Trigonometric models now synchronize communication, audio, imaging, and every system built from repeating cycles.",
    sourceLabel: "Joseph Fourier · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Biographies/Fourier/",
  },
  orbit: {
    era: "PRAGUE · 1609",
    title: "An ellipse replaced the perfect circle in the sky.",
    story: "Johannes Kepler used observations of Mars to show that planets move in elliptical orbits with the Sun at a focus.",
    connection: "Conics, vectors, and coordinate systems still describe satellites, trajectories, reflectors, and fields in space.",
    sourceLabel: "Johannes Kepler · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Biographies/Kepler/",
  },
  accumulation: {
    era: "SYRACUSE · 3RD CENTURY BCE",
    title: "Curved area was trapped between simpler shapes.",
    story: "Archimedes used increasingly fine geometric approximations to calculate areas and volumes long before modern integral notation existed.",
    connection: "The same limiting idea turns changing rates into fuel used, distance traveled, probability, and total accumulated quantity.",
    sourceLabel: "Archimedes · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Biographies/Archimedes/",
  },
  network: {
    era: "KÖNIGSBERG · 1736",
    title: "A city walk became the first network problem.",
    story: "Leonhard Euler ignored exact distances and studied only which land areas and bridges were connected, opening a new way to model networks.",
    connection: "Graphs and algorithms now plan routes, data links, schedules, and decisions where connections matter more than physical shape.",
    sourceLabel: "The bridges of Königsberg · MacTutor",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Extras/Konigsberg/",
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
  if (/integral|antiderivative|accumulation|area under|fundamental theorem|differential equation|numerical integration|infinite series|ap\.calc\.int/.test(text)) return "accumulation";
  if (/derivative|limit|continuity|instantaneous|rate of change|tangent|optimization|related rates|ap\.calc\.(?:lim|dif)/.test(text)) return "motion";
  if (/proof|postulate|construction|congruen|angle relationship|circle theorem|corresponding parts/.test(text)) return "proof";
  if (/matrix|determinant|network|algorithm|decision strategies/.test(text)) return "network";
  if (/conic|ellipse|hyperbola|parabola|vector|polar|parametric|complex number|complex plane/.test(text)) return "orbit";
  if (/trigonometric|sine|cosine|radian|unit circle|logarithm|exponential model/.test(text)) return "signal";
  if (/statistics|probability|sample|distribution|regression|correlation|residual|confidence|survey|random|data/.test(text) || riskVisuals.has(lesson.visual)) return "risk";
  if (/exponential|logarithm|growth|decay|geometric sequence|power|radical|root|scientific notation/.test(text) || growthVisuals.has(lesson.visual)) return "growth";
  if (/geometry|triangle|circle|angle|volume|surface area|congruen|similar|transform|trigon|sine|cosine|radian/.test(text) || habitatVisuals.has(lesson.visual)) return "habitat";
  if (/coordinate|graph|function|slope|linear|quadratic|parabola|domain|range|mapping/.test(text) || navigationVisuals.has(lesson.visual)) return "navigation";
  if (/\b(?:fraction|percent|ratio|proportion|decimal|unit rate|scale factor)s?\b/.test(text) || resourceVisuals.has(lesson.visual)) return "resources";
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
  proof: {
    kicker: "STRUCTURE PROOF CHECK",
    title: "Can every design claim survive a line-by-line check?",
    problem: "Link each geometric statement to a definition or theorem so a convincing picture cannot hide an invalid step.",
    signalA: "claim",
    signalB: "reason",
  },
  signal: {
    kicker: "WAVE CONTROL LAB",
    title: "When will a repeating signal reach the needed phase?",
    problem: "Connect angles, cycles, exponentials, and logarithms to predict signals that repeat, grow, or fade over time.",
    signalA: "phase",
    signalB: "amplitude",
  },
  orbit: {
    kicker: "ORBITAL GEOMETRY",
    title: "Which coordinate model makes this curved route predictable?",
    problem: "Use conics, vectors, polar coordinates, or complex numbers to describe direction and position without guessing from a sketch.",
    signalA: "focus",
    signalB: "trajectory",
  },
  accumulation: {
    kicker: "RESOURCE FLOW",
    title: "How much total change builds up across the mission?",
    problem: "Add infinitely small changes through area, antiderivatives, sums, and differential equations to recover a usable total.",
    signalA: "rate",
    signalB: "accumulate",
  },
  network: {
    kicker: "ROUTE NETWORK",
    title: "Which connected plan reaches the target with the least waste?",
    problem: "Use matrices, nodes, edges, and decision rules to organize many linked choices into one testable system.",
    signalA: "connections",
    signalB: "route",
  },
};

export function getLessonExperience(lesson: Pick<LessonDefinition, "title" | "goal" | "example" | "standard" | "visual" | "grade" | "regionId">): LessonExperience {
  const scene = regionScenes[lesson.regionId] ?? classifyLesson(lesson);
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
