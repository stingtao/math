import type { PracticeQuestion, RegionDefinition } from "./curriculum.ts";
import {
  buildPracticeQuestion,
  MULTI_SELECT_SEPARATOR,
  type GraphChoicePlot,
  type QuestionInteraction,
  type QuestionInteractionConfig,
  type TableChoiceRow,
} from "./question-interactions.ts";

type AdvancedQuestion = {
  prompt: string;
  answer: string;
  hint: string;
  interaction: QuestionInteraction;
  interactionConfig: QuestionInteractionConfig;
  choices?: string[];
};

const choose = (prompt: string, correct: string[], choices: string[], hint: string): AdvancedQuestion => ({
  prompt,
  answer: correct.join(MULTI_SELECT_SEPARATOR),
  hint,
  choices,
  interaction: "multi-select",
  interactionConfig: { kind: "multi-select", requiredSelections: correct.length },
});

const point = (prompt: string, answer: string, hint: string, xMin: number, xMax: number, yMin: number, yMax: number): AdvancedQuestion => ({
  prompt,
  answer,
  hint,
  interaction: "coordinate-grid",
  interactionConfig: { kind: "coordinate-grid", xMin, xMax, yMin, yMax },
});

const line = (prompt: string, answer: string, hint: string, min: number, max: number, step = 1): AdvancedQuestion => ({
  prompt,
  answer,
  hint,
  interaction: "number-line",
  interactionConfig: { kind: "number-line", min, max, step },
});

const graph = (
  prompt: string,
  answer: string,
  hint: string,
  limits: { xMin: number; xMax: number; yMin: number; yMax: number },
  plots: GraphChoicePlot[],
): AdvancedQuestion => ({
  prompt,
  answer,
  hint,
  choices: plots.map((plot) => plot.value),
  interaction: "graph-choice",
  interactionConfig: { kind: "graph-choice", ...limits, plots },
});

const table = (prompt: string, answer: string, hint: string, columns: string[], rows: TableChoiceRow[]): AdvancedQuestion => ({
  prompt,
  answer,
  hint,
  choices: rows.map((row) => row.value),
  interaction: "table-choice",
  interactionConfig: { kind: "table-choice", columns, rows },
});

// One authored visual-reasoning mission per advanced region. These questions
// exercise the representation that carries the mathematics instead of adding
// another free-form calculation to an already calculation-heavy lesson.
const advancedQuestionBySlug: Record<string, AdvancedQuestion> = {
  "g10-angle-proofs": table(
    "Choose the row that correctly proves x from the vertical angles 3x + 10 and 5x − 30.",
    "Vertical-angle proof",
    "Vertical angles are congruent, so their measures—not the expressions themselves—are equal.",
    ["Proof move", "Reason", "Result"],
    [
      { value: "Vertical-angle proof", cells: ["3x + 10 = 5x − 30", "Vertical angles are congruent", "x = 20"] },
      { value: "Supplement proof", cells: ["3x + 10 + 5x − 30 = 90", "Vertical angles are complementary", "x = 13.75"] },
      { value: "Copy the coefficients", cells: ["3x = 5x", "Vertical sides are equal", "x = 0"] },
      { value: "Add the measures", cells: ["8x − 20 = 180", "Vertical angles form a line", "x = 25"] },
    ],
  ),
  "g10-rigid-transformations": point(
    "Rotate (2, −1) 90° counterclockwise about the origin. Plot the image.",
    "(1, 2)",
    "A 90° counterclockwise rotation maps (x, y) to (−y, x).",
    -4, 4, -4, 4,
  ),
  "g10-right-triangle-trig": choose(
    "For an acute angle θ in a 6–8–10 triangle, the opposite side is 6. Choose both true ratios.",
    ["sin θ = 3/5", "tan θ = 3/4"],
    ["sin θ = 3/5", "tan θ = 3/4", "cos θ = 3/5", "tan θ = 4/3"],
    "Use opposite/hypotenuse for sine and opposite/adjacent for tangent.",
  ),
  "g10-parallel-perpendicular": graph(
    "Which line is perpendicular to y = 2x − 1?",
    "y = −0.5x + 3",
    "Perpendicular nonvertical lines have slopes whose product is −1.",
    { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
    [
      { value: "y = −0.5x + 3", label: "y = −0.5x + 3", kind: "linear", a: -.5, b: 3 },
      { value: "y = 0.5x + 3", label: "y = 0.5x + 3", kind: "linear", a: .5, b: 3 },
      { value: "y = 2x + 1", label: "y = 2x + 1", kind: "linear", a: 2, b: 1 },
      { value: "y = −2x + 1", label: "y = −2x + 1", kind: "linear", a: -2, b: 1 },
    ],
  ),
  "g10-circle-equations": graph(
    "Choose the graph of (x − 1)² + (y + 1)² = 4.",
    "center (1, −1), radius 2",
    "Circle form (x − h)² + (y − k)² = r² reveals center (h, k) and radius r.",
    { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
    [
      { value: "center (1, −1), radius 2", label: "center (1, −1), radius 2", kind: "circle", h: 1, k: -1, r: 2 },
      { value: "center (−1, 1), radius 2", label: "center (−1, 1), radius 2", kind: "circle", h: -1, k: 1, r: 2 },
      { value: "center (1, −1), radius 4", label: "center (1, −1), radius 4", kind: "circle", h: 1, k: -1, r: 4 },
      { value: "center (1, 1), radius 2", label: "center (1, 1), radius 2", kind: "circle", h: 1, k: 1, r: 2 },
    ],
  ),
  "g10-volume-and-scaling": choose(
    "A 3D model is enlarged by scale factor 3. Choose both correct changes.",
    ["Surface area is multiplied by 9", "Volume is multiplied by 27"],
    ["Surface area is multiplied by 9", "Volume is multiplied by 27", "Surface area is multiplied by 3", "Volume is multiplied by 9"],
    "Area uses the square of the scale factor; volume uses the cube.",
  ),
  "g10-conditional-probability": table(
    "In Group A, 12 of 20 students chose robotics. Which row correctly calculates P(robotics | Group A)?",
    "12 ÷ 20 = 0.60",
    "Once Group A is given, its total becomes the denominator.",
    ["Calculation", "Denominator means", "Probability"],
    [
      { value: "12 ÷ 20 = 0.60", cells: ["12 ÷ 20", "all of Group A", "0.60"] },
      { value: "12 ÷ 50 = 0.24", cells: ["12 ÷ 50", "both groups", "0.24"] },
      { value: "20 ÷ 12 = 1.67", cells: ["20 ÷ 12", "robotics choices", "1.67"] },
      { value: "8 ÷ 20 = 0.40", cells: ["8 ÷ 20", "all of Group A", "0.40"] },
    ],
  ),
  "g10-piecewise-functions": graph(
    "A sensor uses f(x) = −x for x < 0 and f(x) = x for x ≥ 0. Choose its graph.",
    "absolute-value graph",
    "Both pieces report the distance from zero, so the graph is V-shaped.",
    { xMin: -4, xMax: 4, yMin: -1, yMax: 5 },
    [
      { value: "absolute-value graph", label: "f(x) = |x|", kind: "absolute", a: 1 },
      { value: "negative absolute-value graph", label: "f(x) = −|x|", kind: "absolute", a: -1 },
      { value: "f(x) = x", label: "f(x) = x", kind: "linear", a: 1, b: 0 },
      { value: "f(x) = x²", label: "f(x) = x²", kind: "quadratic", a: 1 },
    ],
  ),

  "g11-polynomial-features": graph(
    "Which graph has a double zero at x = 1 and opens upward?",
    "y = (x − 1)²",
    "A double zero touches the x-axis and turns instead of crossing.",
    { xMin: -3, xMax: 4, yMin: -2, yMax: 7 },
    [
      { value: "y = (x − 1)²", label: "y = (x − 1)²", kind: "quadratic", a: 1, h: 1 },
      { value: "y = (x + 1)²", label: "y = (x + 1)²", kind: "quadratic", a: 1, h: -1 },
      { value: "y = −(x − 1)²", label: "y = −(x − 1)²", kind: "quadratic", a: -1, h: 1 },
      { value: "y = x − 1", label: "y = x − 1", kind: "linear", a: 1, b: -1 },
    ],
  ),
  "g11-polynomial-identities": choose(
    "Choose both polynomial identities that are true for every real a and b.",
    ["(a + b)² = a² + 2ab + b²", "(a − b)(a + b) = a² − b²"],
    ["(a + b)² = a² + 2ab + b²", "(a − b)(a + b) = a² − b²", "(a + b)² = a² + b²", "(a − b)² = a² − b²"],
    "An identity must survive expansion for all allowed values, not just one example.",
  ),
  "g11-rational-expressions": line(
    "For f(x) = 1/(x − 3), choose the excluded x-value.",
    "3",
    "The denominator cannot equal zero.",
    -2, 6,
  ),
  "g11-exponential-models": graph(
    "Choose the model that starts at 1 and doubles whenever x increases by 1.",
    "y = 2ˣ",
    "At x = 0 the value is 1; then each step right multiplies by 2.",
    { xMin: -3, xMax: 3, yMin: -1, yMax: 9 },
    [
      { value: "y = 2ˣ", label: "y = 2ˣ", kind: "exponential", a: 1, b: 2 },
      { value: "y = (1/2)ˣ", label: "y = (1/2)ˣ", kind: "exponential", a: 1, b: .5 },
      { value: "y = 2x", label: "y = 2x", kind: "linear", a: 2, b: 0 },
      { value: "y = x²", label: "y = x²", kind: "quadratic", a: 1 },
    ],
  ),
  "g11-geometric-sequences": table(
    "Which row is a geometric sequence with common ratio 2 and the correct next term?",
    "3, 6, 12, 24 → 48",
    "A geometric sequence multiplies by the same ratio each step.",
    ["Sequence", "Ratio", "Next term"],
    [
      { value: "3, 6, 12, 24 → 48", cells: ["3, 6, 12, 24", "×2", "48"] },
      { value: "3, 6, 9, 12 → 15", cells: ["3, 6, 9, 12", "×2", "15"] },
      { value: "2, 4, 8, 16 → 24", cells: ["2, 4, 8, 16", "×2", "24"] },
      { value: "5, 10, 20, 40 → 60", cells: ["5, 10, 20, 40", "+5", "60"] },
    ],
  ),
  "g11-trig-graphs": graph(
    "Which graph has value 0 at x = 0 and initially rises?",
    "y = sin x",
    "Sine passes through the origin with a positive slope; cosine starts at 1.",
    { xMin: -3.15, xMax: 3.15, yMin: -1.5, yMax: 1.5 },
    [
      { value: "y = sin x", label: "y = sin x", kind: "sine", a: 1, b: 1 },
      { value: "y = cos x", label: "y = cos x", kind: "cosine", a: 1, b: 1 },
      { value: "y = −sin x", label: "y = −sin x", kind: "sine", a: -1, b: 1 },
      { value: "y = 0.5 sin x", label: "y = 0.5 sin x", kind: "sine", a: .5, b: 1 },
    ],
  ),
  "g11-ellipses": graph(
    "Choose the ellipse centered at the origin with horizontal semiaxis 3 and vertical semiaxis 2.",
    "x²/9 + y²/4 = 1",
    "The denominators are the squares of the horizontal and vertical semiaxes.",
    { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
    [
      { value: "x²/9 + y²/4 = 1", label: "x²/9 + y²/4 = 1", kind: "ellipse", rx: 3, ry: 2 },
      { value: "x²/4 + y²/9 = 1", label: "x²/4 + y²/9 = 1", kind: "ellipse", rx: 2, ry: 3 },
      { value: "x² + y² = 9", label: "x² + y² = 9", kind: "circle", r: 3 },
      { value: "(x − 1)²/9 + y²/4 = 1", label: "center shifted right 1", kind: "ellipse", h: 1, rx: 3, ry: 2 },
    ],
  ),
  "g11-vectors": point(
    "A drone starts at (−1, 2) and follows vector ⟨3, −4⟩. Plot its endpoint.",
    "(2, -2)",
    "Add the vector components to the starting coordinates.",
    -4, 4, -4, 4,
  ),
  "g11-confidence-intervals": table(
    "A random sample gives a 95% confidence interval of 42% to 50%. Choose the responsible interpretation.",
    "The method captures the population proportion in about 95% of repeated samples",
    "Confidence describes the long-run success rate of the interval method, not a changing population parameter.",
    ["Claim", "Scope", "Verdict"],
    [
      { value: "The method captures the population proportion in about 95% of repeated samples", cells: ["95% of such intervals capture p", "repeated random samples", "supported"] },
      { value: "There is a 95% chance this fixed interval moves to p", cells: ["this interval moves", "one finished sample", "unsupported"] },
      { value: "95% of sampled people are inside the interval", cells: ["people lie in 42%–50%", "individual responses", "unsupported"] },
      { value: "The population proportion changes 95% of the time", cells: ["p changes", "future populations", "unsupported"] },
    ],
  ),

  "g12-function-transformations-g12": graph(
    "Choose the graph of g(x) = (x − 2)² + 1.",
    "vertex (2, 1), opens up",
    "Vertex form (x − h)² + k moves x² to vertex (h, k).",
    { xMin: -2, xMax: 6, yMin: -2, yMax: 8 },
    [
      { value: "vertex (2, 1), opens up", label: "vertex (2, 1), opens up", kind: "quadratic", a: 1, h: 2, k: 1 },
      { value: "vertex (−2, 1), opens up", label: "vertex (−2, 1), opens up", kind: "quadratic", a: 1, h: -2, k: 1 },
      { value: "vertex (2, −1), opens up", label: "vertex (2, −1), opens up", kind: "quadratic", a: 1, h: 2, k: -1 },
      { value: "vertex (2, 1), opens down", label: "vertex (2, 1), opens down", kind: "quadratic", a: -1, h: 2, k: 1 },
    ],
  ),
  "g12-limit-from-table-graph": table(
    "Values of f(x) approach 5 from both sides as x approaches 2. Which row states the limit correctly?",
    "lim x→2 f(x) = 5",
    "A two-sided limit exists when the left- and right-hand values approach the same number.",
    ["Left-hand", "Right-hand", "Conclusion"],
    [
      { value: "lim x→2 f(x) = 5", cells: ["→ 5", "→ 5", "limit = 5"] },
      { value: "lim x→2 f(x) = 2", cells: ["→ 5", "→ 5", "limit = 2"] },
      { value: "The limit does not exist", cells: ["→ 5", "→ 5", "DNE"] },
      { value: "The limit must equal f(2)", cells: ["→ 5", "→ 5", "need f(2)"] },
    ],
  ),
  "g12-derivative-meaning": graph(
    "If f′(x) = 2x, which graph could be f(x)?",
    "f(x) = x²",
    "The derivative of x² is 2x; an added constant would only shift the graph vertically.",
    { xMin: -3, xMax: 3, yMin: -2, yMax: 7 },
    [
      { value: "f(x) = x²", label: "f(x) = x²", kind: "quadratic", a: 1 },
      { value: "f(x) = 2x", label: "f(x) = 2x", kind: "linear", a: 2, b: 0 },
      { value: "f(x) = −x²", label: "f(x) = −x²", kind: "quadratic", a: -1 },
      { value: "f(x) = 2ˣ", label: "f(x) = 2ˣ", kind: "exponential", a: 1, b: 2 },
    ],
  ),
  "g12-increasing-extrema-concavity": graph(
    "Choose a graph that is concave down everywhere and has a local maximum at x = 0.",
    "y = −x² + 3",
    "A negative quadratic bends downward; its vertex is a maximum.",
    { xMin: -4, xMax: 4, yMin: -5, yMax: 5 },
    [
      { value: "y = −x² + 3", label: "y = −x² + 3", kind: "quadratic", a: -1, k: 3 },
      { value: "y = x² − 3", label: "y = x² − 3", kind: "quadratic", a: 1, k: -3 },
      { value: "y equals absolute x", label: "y = |x|", kind: "absolute", a: 1 },
      { value: "y = x + 3", label: "y = x + 3", kind: "linear", a: 1, b: 3 },
    ],
  ),
  "g12-definite-integrals": graph(
    "Which graph shows a function that stays above the x-axis on [−2, 2], so its definite integral is positive?",
    "y = 0.5x + 2",
    "When a graph stays above the x-axis, signed area over the interval is positive.",
    { xMin: -2, xMax: 2, yMin: -2, yMax: 4 },
    [
      { value: "y = 0.5x + 2", label: "y = 0.5x + 2", kind: "linear", a: .5, b: 2, shadeToAxis: true },
      { value: "y = 0.5x − 2", label: "y = 0.5x − 2", kind: "linear", a: .5, b: -2, shadeToAxis: true },
      { value: "y = x", label: "y = x", kind: "linear", a: 1, b: 0, shadeToAxis: true },
      { value: "y = −x²", label: "y = −x²", kind: "quadratic", a: -1, shadeToAxis: true },
    ],
  ),
  "g12-polar-coordinates": point(
    "Convert the polar point (r, θ) = (2, 90°) to Cartesian coordinates. Plot it.",
    "(0, 2)",
    "Use x = r cos θ and y = r sin θ.",
    -3, 3, -3, 3,
  ),
  "g12-binomial-distribution": table(
    "A fair coin is flipped 4 times. Which row correctly models the probability of 4 heads?",
    "n = 4, p = 0.5, P(X = 4) = 1/16",
    "Use the binomial model with four fixed independent trials and p = 0.5.",
    ["Parameters", "Event", "Probability"],
    [
      { value: "n = 4, p = 0.5, P(X = 4) = 1/16", cells: ["n = 4, p = 0.5", "4 heads", "1/16"] },
      { value: "n = 4, p = 0.5, P(X = 4) = 1/4", cells: ["n = 4, p = 0.5", "4 heads", "1/4"] },
      { value: "n = 2, p = 0.5, P(X = 4) = 1/16", cells: ["n = 2, p = 0.5", "4 heads", "1/16"] },
      { value: "n = 4, p = 0.25, P(X = 4) = 1/256", cells: ["n = 4, p = 0.25", "4 heads", "1/256"] },
    ],
  ),
  "g12-study-design": table(
    "Which study design supports a cause-and-effect conclusion?",
    "Randomly assign volunteers to two study plans and compare results",
    "Random assignment balances lurking variables and permits a causal conclusion for the experiment's subjects.",
    ["Design", "Key safeguard", "Supported claim"],
    [
      { value: "Randomly assign volunteers to two study plans and compare results", cells: ["randomized experiment", "random assignment", "cause and effect"] },
      { value: "Survey volunteers about their current study plan", cells: ["voluntary survey", "none", "association only"] },
      { value: "Compare two existing classes", cells: ["observational study", "existing groups", "cause and effect"] },
      { value: "Ask the highest-scoring students", cells: ["convenience sample", "high scorers only", "all students"] },
    ],
  ),
  "g12-hypothesis-testing": choose(
    "A study reports p = 0.018. Choose both responsible conclusions at significance level 0.05.",
    ["Reject the null hypothesis", "The data provide evidence for the alternative"],
    ["Reject the null hypothesis", "The data provide evidence for the alternative", "The null hypothesis has an 1.8% chance of being true", "The alternative hypothesis is proved"],
    "Because 0.018 < 0.05, the result is statistically significant, but it does not prove a claim or assign probability to the null.",
  ),
};

function appendAdvancedQuestion(practice: PracticeQuestion[], spec: AdvancedQuestion) {
  const id = `q${practice.length + 1}`;
  return [...practice, buildPracticeQuestion({ id, ...spec })];
}

export function enrichGrade1012Curriculum(regions: RegionDefinition[]): RegionDefinition[] {
  return regions.map((region) => ({
    ...region,
    lessons: region.lessons.map((lesson) => {
      const enrichment = advancedQuestionBySlug[lesson.slug];
      return enrichment ? { ...lesson, practice: appendAdvancedQuestion(lesson.practice, enrichment) } : lesson;
    }),
  }));
}

export const advancedInteractionLessonSlugs = Object.freeze(Object.keys(advancedQuestionBySlug));
