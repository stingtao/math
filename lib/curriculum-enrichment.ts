import type { PracticeQuestion, RegionDefinition } from "./curriculum.ts";
import { buildPracticeQuestion, MULTI_SELECT_SEPARATOR, type QuestionInteraction, type QuestionInteractionConfig } from "./question-interactions.ts";

type EnrichmentQuestion = {
  prompt: string;
  answer: string;
  hint: string;
  interaction: QuestionInteraction;
  interactionConfig: QuestionInteractionConfig;
  choices?: string[];
};

const choose = (prompt: string, correct: string[], choices: string[], hint: string): EnrichmentQuestion => ({
  prompt,
  answer: correct.join(MULTI_SELECT_SEPARATOR),
  hint,
  choices,
  interaction: "multi-select",
  interactionConfig: { kind: "multi-select", requiredSelections: correct.length },
});

const point = (prompt: string, answer: string, hint: string, xMin: number, xMax: number, yMin: number, yMax: number): EnrichmentQuestion => ({
  prompt,
  answer,
  hint,
  interaction: "coordinate-grid",
  interactionConfig: { kind: "coordinate-grid", xMin, xMax, yMin, yMax },
});

const line = (prompt: string, answer: string, hint: string, min: number, max: number, step = 1): EnrichmentQuestion => ({
  prompt,
  answer,
  hint,
  interaction: "number-line",
  interactionConfig: { kind: "number-line", min, max, step },
});

const enrichmentBySlug: Record<string, EnrichmentQuestion> = {
  "g7-unit-rates": choose(
    "Choose both situations with a unit rate of 3.",
    ["$12 for 4 notebooks", "18 miles in 6 hours"],
    ["$12 for 4 notebooks", "18 miles in 6 hours", "10 cups in 5 batches", "8 points in 2 games"],
    "Divide the first quantity by the second in each situation.",
  ),
  "g7-proportional-tables": point("The table pairs x = 3 with y = 6. Plot that point.", "(3, 6)", "Move to x = 3 first, then up to y = 6.", 0, 6, 0, 6),
  "g7-proportional-graphs": point("For y = 2x, plot the point where x = 2.", "(2, 4)", "Substitute x = 2, so y = 4.", 0, 5, 0, 6),
  "g7-scale-drawings": point("A scale factor of 2 maps (2, 3) to which point?", "(4, 6)", "Multiply both coordinates by 2.", 0, 6, 0, 6),
  "g7-add-rational-numbers": line("Start at −2 and add 5. Choose the endpoint.", "3", "Adding a positive number moves right.", -5, 5),
  "g7-inequalities-g7": line("For x ≥ −2, choose the boundary value.", "-2", "The boundary is the value beside the inequality symbol.", -5, 5),
  "g7-percent-change": choose(
    "Choose both changes that are a 25% increase.",
    ["40 to 50", "80 to 100"],
    ["40 to 50", "80 to 100", "30 to 36", "60 to 45"],
    "Find change ÷ original for each pair.",
  ),
  "g7-angle-equations": choose(
    "Choose both angle facts that are always true.",
    ["Vertical angles are equal", "A linear pair sums to 180°"],
    ["Vertical angles are equal", "A linear pair sums to 180°", "Adjacent angles are equal", "Supplementary angles are always congruent"],
    "Use the definitions of vertical angles and a linear pair.",
  ),
  "g7-composite-area": choose(
    "Choose both valid ways to find the area of a composite figure.",
    ["Split it into non-overlapping rectangles", "Subtract a missing rectangle from a larger one"],
    ["Split it into non-overlapping rectangles", "Subtract a missing rectangle from a larger one", "Multiply every side length together", "Count overlapping pieces twice"],
    "A valid method must cover the figure exactly once.",
  ),
  "g7-random-samples": choose(
    "Choose both sampling plans designed to reduce selection bias.",
    ["Randomly choose student IDs from the full list", "Start randomly, then choose every 10th name"],
    ["Randomly choose student IDs from the full list", "Start randomly, then choose every 10th name", "Ask only volunteers", "Survey the students nearest the door"],
    "Every member should have a known, fair path into the sample.",
  ),
  "g7-probability-scale": line("Three of four equally likely outcomes are favorable. Place the probability.", "0.75", "Write 3/4 as a decimal.", 0, 1, .25),

  "signed-numbers": line("Start at −3 and add 5. Choose the endpoint.", "2", "Adding 5 moves five units right.", -5, 5),
  "fractions": line("Place 3/4 on the number line.", "0.75", "Three fourths is 0.75.", 0, 1, .25),
  "one-step-equations": line("Choose the solution to x + 3 = 7.", "4", "Undo +3 by subtracting 3.", 0, 8),
  "rational-irrational": choose(
    "Choose both irrational numbers.",
    ["√2", "π"],
    ["√2", "π", "0.75", "−3"],
    "Irrational numbers cannot be written as a ratio of integers.",
  ),
  "coordinate-plane": point("Plot the point (−3, 2).", "(-3, 2)", "Move left to x = −3, then up to y = 2.", -4, 4, -4, 4),
  "slope-rate": point("The line is y = 2x + 1. Plot the point where x = 2.", "(2, 5)", "Substitute 2 for x: y = 2(2) + 1.", 0, 4, 0, 6),
  "graphing-lines": point("For y = −x + 4, plot the point where x = 3.", "(3, 1)", "Substitute x = 3, then calculate y.", 0, 5, 0, 5),
  "rigid-transformations": point("Translate (−2, 1) right 3 and down 2. Plot the image.", "(1, -1)", "Add 3 to x and subtract 2 from y.", -4, 4, -4, 4),
  "pythagorean-theorem": choose(
    "Choose both sets that can be side lengths of a right triangle.",
    ["3, 4, 5", "5, 12, 13"],
    ["3, 4, 5", "5, 12, 13", "2, 3, 4", "6, 8, 11"],
    "For a right triangle, a² + b² = c² using the longest side as c.",
  ),
  "probability": choose(
    "Choose both events with probability 1/2.",
    ["Heads on a fair coin", "An even number on a fair six-sided die"],
    ["Heads on a fair coin", "An even number on a fair six-sided die", "A 6 on a fair die", "Red from a bag with 1 red and 3 blue"],
    "Count favorable outcomes over all equally likely outcomes.",
  ),

  "g9-absolute-value-functions": choose(
    "Choose both solutions of |x| = 3.",
    ["−3", "3"],
    ["−3", "3", "0", "6"],
    "Distance 3 from zero occurs on both sides of zero.",
  ),
  "g9-slope-from-points": point("From A(0, 1), a line has slope 2. Plot B when x = 2.", "(2, 5)", "A run of 2 needs a rise of 4.", 0, 4, 0, 6),
  "g9-graph-linear-functions": point("For y = −2x + 5, plot the point where x = 2.", "(2, 1)", "Substitute 2 for x.", 0, 4, 0, 6),
  "g9-systems-by-graphing-g9": point("Plot the intersection of y = x + 1 and y = −x + 5.", "(2, 3)", "At the intersection both equations have the same x and y.", 0, 5, 0, 6),
  "g9-systems-linear-inequalities": choose(
    "Choose both points in the region x ≥ 0 and y ≤ 2.",
    ["(1, 2)", "(3, −1)"],
    ["(1, 2)", "(3, −1)", "(−1, 0)", "(2, 4)"],
    "Test both coordinates against both inequalities.",
  ),
  "g9-rational-exponents": choose(
    "Choose both true statements.",
    ["16^(1/2) = 4", "8^(1/3) = 2"],
    ["16^(1/2) = 4", "8^(1/3) = 2", "27^(1/2) = 3", "9^(1/3) = 3"],
    "A denominator of 2 means square root; 3 means cube root.",
  ),
  "g9-polynomial-vocabulary": choose(
    "Choose both monomials.",
    ["3x²", "−5xy"],
    ["3x²", "−5xy", "x + 2", "1/x"],
    "A monomial is one term with whole-number exponents.",
  ),
  "g9-factor-trinomials": choose(
    "Choose both factors of x² + 5x + 6.",
    ["x + 2", "x + 3"],
    ["x + 2", "x + 3", "x − 2", "x − 3"],
    "Find two numbers that multiply to 6 and add to 5.",
  ),
  "g9-quadratic-graphs": point("Plot the vertex of y = (x − 2)² − 1.", "(2, -1)", "Vertex form y = (x − h)² + k has vertex (h, k).", -2, 5, -3, 5),
  "g9-exponential-growth": line("A value starts at 3 and doubles twice. Choose the result.", "12", "Multiply 3 by 2².", 0, 12, 2),
  "g9-scatter-models-g9": choose(
    "A scatter plot has a strong positive association. Choose both responsible conclusions.",
    ["Larger x tends to come with larger y", "Association alone does not prove causation"],
    ["Larger x tends to come with larger y", "Association alone does not prove causation", "Every point must lie on one line", "x definitely causes y"],
    "Describe the trend, but do not claim cause without evidence.",
  ),
};

function appendEnrichment(practice: PracticeQuestion[], spec: EnrichmentQuestion) {
  const id = `q${practice.length + 1}`;
  if (practice.some((question) => question.id === id)) return practice;
  return [...practice, buildPracticeQuestion({ id, ...spec })];
}

export function enrichGrade79Curriculum(regions: RegionDefinition[]): RegionDefinition[] {
  return regions.map((region) => ({
    ...region,
    lessons: region.lessons.map((lesson) => {
      const enrichment = enrichmentBySlug[lesson.slug];
      return enrichment ? { ...lesson, practice: appendEnrichment(lesson.practice, enrichment) } : lesson;
    }),
  }));
}
