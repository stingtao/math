import type { PracticeQuestion, RegionDefinition } from "./curriculum.ts";
import {
  buildPracticeQuestion,
  MULTI_SELECT_SEPARATOR,
  type GraphChoicePlot,
  type QuestionInteraction,
  type QuestionInteractionConfig,
  type TableChoiceRow,
} from "./question-interactions.ts";

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

const graph = (
  prompt: string,
  answer: string,
  hint: string,
  limits: { xMin: number; xMax: number; yMin: number; yMax: number },
  plots: GraphChoicePlot[],
): EnrichmentQuestion => ({
  prompt,
  answer,
  hint,
  choices: plots.map((plot) => plot.value),
  interaction: "graph-choice",
  interactionConfig: { kind: "graph-choice", ...limits, plots },
});

const table = (prompt: string, answer: string, hint: string, columns: string[], rows: TableChoiceRow[]): EnrichmentQuestion => ({
  prompt,
  answer,
  hint,
  choices: rows.map((row) => row.value),
  interaction: "table-choice",
  interactionConfig: { kind: "table-choice", columns, rows },
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

// One representation-rich mission per Grade 8–9 region. These tasks make the
// learner read a graph, table, or spatial scale instead of adding another
// near-identical free-response calculation to an already large question bank.
const visualEnrichmentBySlug: Record<string, EnrichmentQuestion> = {
  "order-of-operations": table(
    "The dive station reads 2 + 3 × 4². Which row follows the control order correctly?",
    "Exponent, multiply, add",
    "Evaluate the exponent first, then multiply, then add.",
    ["First move", "Second move", "Result"],
    [
      { value: "Exponent, multiply, add", cells: ["4² = 16", "3 × 16 = 48", "2 + 48 = 50"] },
      { value: "Add before multiply", cells: ["2 + 3 = 5", "5 × 16 = 80", "80"] },
      { value: "Multiply before exponent", cells: ["3 × 4 = 12", "12² = 144", "146"] },
      { value: "Square the full sum", cells: ["2 + 3 × 4 = 14", "14² = 196", "196"] },
    ],
  ),
  percent: table(
    "An 80-liter oxygen tank keeps 25% in reserve. Which row shows the same reserve three ways?",
    "25% = 0.25 = 20 L",
    "Write 25% as 0.25, then multiply 0.25 × 80.",
    ["Percent", "Decimal", "Reserve"],
    [
      { value: "25% = 0.25 = 20 L", cells: ["25%", "0.25", "20 L"] },
      { value: "25% = 2.5 = 200 L", cells: ["25%", "2.5", "200 L"] },
      { value: "25% = 0.025 = 2 L", cells: ["25%", "0.025", "2 L"] },
      { value: "25% = 0.75 = 60 L", cells: ["25%", "0.75", "60 L"] },
    ],
  ),
  "two-step-equations": table(
    "The pressure controller reports 3p + 4 = 19. Which repair path isolates p without breaking the balance?",
    "Subtract 4, divide by 3, p = 5",
    "Undo the outside addition before undoing multiplication.",
    ["First move", "Second move", "Check"],
    [
      { value: "Subtract 4, divide by 3, p = 5", cells: ["3p = 15", "p = 5", "3(5) + 4 = 19"] },
      { value: "Divide by 3, subtract 4, p = 7/3", cells: ["p + 4 = 19/3", "p = 7/3", "3(7/3) + 4 = 11"] },
      { value: "Add 4, divide by 3, p = 23/3", cells: ["3p = 23", "p = 23/3", "3(23/3) + 4 = 27"] },
      { value: "Subtract 3, divide by 4, p = 4", cells: ["4p = 16", "p = 4", "3(4) + 4 = 16"] },
    ],
  ),
  "distributive-property": table(
    "Six identical habitat trays each hold x filters and 2 spare seals. Which row expands 6(x + 2) correctly?",
    "6x + 12",
    "The outside factor multiplies every term inside the group.",
    ["Filters", "Spare seals", "Total"],
    [
      { value: "6x + 12", cells: ["6 × x = 6x", "6 × 2 = 12", "6x + 12"] },
      { value: "6x + 2", cells: ["6 × x = 6x", "leave 2", "6x + 2"] },
      { value: "x + 12", cells: ["leave x", "6 × 2 = 12", "x + 12"] },
      { value: "12x", cells: ["6 × x = 6x", "6 × 2 = 12", "combine unlike terms"] },
    ],
  ),
  "approximating-irrationals": line(
    "A sonar distance is √20 meters. Place its value to the nearest half meter.",
    "4.5",
    "Because 4² < 20 < 5², √20 lies between 4 and 5 and is about 4.5.",
    0,
    6,
    .5,
  ),
  "scientific-notation": table(
    "A micro-sensor gap is 0.00042 meter. Which row records it correctly in scientific notation?",
    "4.2 × 10⁻⁴",
    "Move the decimal four places right to make 4.2, so the exponent is −4.",
    ["Coefficient", "Power of ten", "Notation"],
    [
      { value: "4.2 × 10⁻⁴", cells: ["4.2", "10⁻⁴", "4.2 × 10⁻⁴"] },
      { value: "4.2 × 10⁴", cells: ["4.2", "10⁴", "4.2 × 10⁴"] },
      { value: "42 × 10⁻⁴", cells: ["42", "10⁻⁴", "42 × 10⁻⁴"] },
      { value: "0.42 × 10⁻⁴", cells: ["0.42", "10⁻⁴", "0.42 × 10⁻⁴"] },
    ],
  ),
  "solution-types": table(
    "The lock compares 2(x + 3) with 2x + 6. Which row describes what happens after simplifying?",
    "6 = 6, all real x",
    "Both sides simplify to the same expression, so every real x works.",
    ["Simplified statement", "Meaning", "Solution set"],
    [
      { value: "6 = 6, all real x", cells: ["2x + 6 = 2x + 6", "always true", "all real x"] },
      { value: "x = 0, one solution", cells: ["2x = 2x", "cancel x", "x = 0"] },
      { value: "6 = 0, no solution", cells: ["6 = 0", "contradiction", "none"] },
      { value: "x = 6, one solution", cells: ["2x = 12", "divide by 2", "x = 6"] },
    ],
  ),
  "systems-algebra": table(
    "Two research drones follow y = 2x + 1 and y = −x + 7. Which row finds their meeting point?",
    "x = 2, y = 5",
    "At the meeting point the y-values match, so set the two expressions equal.",
    ["Set equal", "Solve x", "Meeting point"],
    [
      { value: "x = 2, y = 5", cells: ["2x + 1 = −x + 7", "3x = 6 → x = 2", "(2, 5)"] },
      { value: "x = 7/3, y = 14/3", cells: ["2x = −x + 7", "3x = 7", "(7/3, 14/3)"] },
      { value: "x = 3, y = 7", cells: ["2x + 1 = 7", "x = 3", "(3, 7)"] },
      { value: "x = −2, y = −3", cells: ["2x + 1 = −x − 7", "3x = −8", "(−2, −3)"] },
    ],
  ),
  "linear-nonlinear": graph(
    "An underwater rover moves 2 meters forward each minute from the station. Choose its distance-time graph.",
    "constant-rate route",
    "A constant rate creates a straight line; starting at the station means the line passes through the origin.",
    { xMin: -1, xMax: 4, yMin: -1, yMax: 8 },
    [
      { value: "constant-rate route", optionLabel: "Route A", label: "Route A, a straight line through the origin rising 2 units for each unit right", kind: "linear", a: 2, b: 0 },
      { value: "accelerating curve", optionLabel: "Route B", label: "Route B, an upward-curving parabola through the origin", kind: "quadratic", a: .5 },
      { value: "multiplying route", optionLabel: "Route C", label: "Route C, an exponential curve starting at 1", kind: "exponential", a: 1, b: 2 },
      { value: "turnaround route", optionLabel: "Route D", label: "Route D, a V-shaped absolute-value graph", kind: "absolute", a: 1 },
    ],
  ),
  "coordinate-transformations": table(
    "A map marker at (−2, 3) reflects across the y-axis. Which row tracks the coordinate change?",
    "(−2, 3) → (2, 3)",
    "A reflection across the y-axis changes the sign of x and keeps y.",
    ["Rule", "x-coordinate", "Image"],
    [
      { value: "(−2, 3) → (2, 3)", cells: ["(x, y) → (−x, y)", "−2 → 2", "(2, 3)"] },
      { value: "(−2, 3) → (−2, −3)", cells: ["(x, y) → (x, −y)", "−2 stays", "(−2, −3)"] },
      { value: "(−2, 3) → (3, −2)", cells: ["swap coordinates", "−2 → 3", "(3, −2)"] },
      { value: "(−2, 3) → (−3, 2)", cells: ["rotate 90°", "−2 → −3", "(−3, 2)"] },
    ],
  ),
  "pythagorean-theorem": table(
    "A habitat brace has perpendicular legs 6 m and 8 m. Which row proves the diagonal length?",
    "6² + 8² = 10²",
    "For a right triangle, the squares of the legs add to the square of the hypotenuse.",
    ["Leg squares", "Sum", "Diagonal"],
    [
      { value: "6² + 8² = 10²", cells: ["36 + 64", "100", "√100 = 10 m"] },
      { value: "6 + 8 = 14", cells: ["6 + 8", "14", "14 m"] },
      { value: "8² − 6² = √28", cells: ["64 − 36", "28", "√28 m"] },
      { value: "6 × 8 = 48", cells: ["6 × 8", "48", "√48 m"] },
    ],
  ),
  "mixed-volume": table(
    "A cylinder and cone share radius 3 m and height 4 m. Which row compares their volumes correctly?",
    "Cylinder 36π, cone 12π, difference 24π",
    "A cone with the same base and height has one third of the cylinder's volume.",
    ["Cylinder", "Cone", "Difference"],
    [
      { value: "Cylinder 36π, cone 12π, difference 24π", cells: ["36π m³", "12π m³", "24π m³"] },
      { value: "Cylinder 12π, cone 36π, difference 24π", cells: ["12π m³", "36π m³", "24π m³"] },
      { value: "Cylinder 36π, cone 18π, difference 18π", cells: ["36π m³", "18π m³", "18π m³"] },
      { value: "Cylinder 12π, cone 4π, difference 8π", cells: ["12π m³", "4π m³", "8π m³"] },
    ],
  ),
  "two-way-tables": table(
    "In Habitat A, 18 of 30 students chose the coral lab. Which row gives the within-group percent?",
    "18 ÷ 30 = 60%",
    "Because Habitat A is the given group, its total 30 is the denominator.",
    ["Numerator", "Denominator", "Within-group percent"],
    [
      { value: "18 ÷ 30 = 60%", cells: ["18 coral choices", "30 in Habitat A", "60%"] },
      { value: "18 ÷ 50 = 36%", cells: ["18 coral choices", "50 in both habitats", "36%"] },
      { value: "30 ÷ 18 = 167%", cells: ["30 in Habitat A", "18 coral choices", "167%"] },
      { value: "12 ÷ 30 = 40%", cells: ["12 other choices", "30 in Habitat A", "40%"] },
    ],
  ),

  "g9-literal-equations": table(
    "A flight computer uses v = d/t. Which row correctly isolates distance d?",
    "d = vt",
    "Multiply both sides by t so the denominator cancels.",
    ["Operation", "Equation", "Meaning"],
    [
      { value: "d = vt", cells: ["multiply both sides by t", "vt = d", "distance = rate × time"] },
      { value: "d = v/t", cells: ["divide both sides by t", "v/t = d", "distance = rate ÷ time"] },
      { value: "d = t/v", cells: ["swap v and t", "t/v = d", "distance = time ÷ rate"] },
      { value: "d = v − t", cells: ["subtract t", "v − t = d", "distance = rate − time"] },
    ],
  ),
  "g9-absolute-value-functions": graph(
    "A docking sensor has its lowest reading −1 at x = 2 and rises equally on both sides. Choose the model.",
    "V with vertex (2, −1)",
    "An absolute-value graph is V-shaped, and y = |x − h| + k has vertex (h, k).",
    { xMin: -2, xMax: 6, yMin: -3, yMax: 5 },
    [
      { value: "V with vertex (2, −1)", optionLabel: "Signal A", label: "Signal A, a V-shaped graph with vertex at 2 negative 1 opening upward", kind: "absolute", a: 1, h: 2, k: -1 },
      { value: "V with vertex (−2, −1)", optionLabel: "Signal B", label: "Signal B, a V-shaped graph with vertex at negative 2 negative 1 opening upward", kind: "absolute", a: 1, h: -2, k: -1 },
      { value: "inverted V with vertex (2, −1)", optionLabel: "Signal C", label: "Signal C, an upside-down V-shaped graph with vertex at 2 negative 1", kind: "absolute", a: -1, h: 2, k: -1 },
      { value: "parabola with vertex (2, −1)", optionLabel: "Signal D", label: "Signal D, a curved parabola with vertex at 2 negative 1", kind: "quadratic", a: 1, h: 2, k: -1 },
    ],
  ),
  "g9-linear-equation-forms": graph(
    "A supply shuttle begins 3 km from base and approaches at 2 km per hour. Choose its position-time graph.",
    "starts at 3 and falls by 2",
    "The starting position is the y-intercept 3; approaching base gives slope −2.",
    { xMin: -1, xMax: 4, yMin: -5, yMax: 6 },
    [
      { value: "starts at 3 and falls by 2", optionLabel: "Route A", label: "Route A, a line crossing y at 3 and falling 2 units per unit right", kind: "linear", a: -2, b: 3 },
      { value: "starts at −3 and rises by 2", optionLabel: "Route B", label: "Route B, a line crossing y at negative 3 and rising 2 units per unit right", kind: "linear", a: 2, b: -3 },
      { value: "starts at 3 and rises by 2", optionLabel: "Route C", label: "Route C, a line crossing y at 3 and rising 2 units per unit right", kind: "linear", a: 2, b: 3 },
      { value: "starts at −3 and falls by 2", optionLabel: "Route D", label: "Route D, a line crossing y at negative 3 and falling 2 units per unit right", kind: "linear", a: -2, b: -3 },
    ],
  ),
  "g9-system-models": table(
    "A launch carries 20 crew and robots. Crew seats use 10 units each, robot bays use 6, and the total is 152. Which row models the mission?",
    "c + r = 20 and 10c + 6r = 152",
    "Use one equation for the total number and one for the total resource use.",
    ["Variables", "Count equation", "Resource equation"],
    [
      { value: "c + r = 20 and 10c + 6r = 152", cells: ["c crew, r robots", "c + r = 20", "10c + 6r = 152"] },
      { value: "c + r = 152 and 10c + 6r = 20", cells: ["c crew, r robots", "c + r = 152", "10c + 6r = 20"] },
      { value: "10c + 6r = 20 only", cells: ["c crew, r robots", "missing", "10c + 6r = 20"] },
      { value: "c + r = 20 and 16cr = 152", cells: ["c crew, r robots", "c + r = 20", "16cr = 152"] },
    ],
  ),
  "g9-radical-operations": table(
    "Two signal channels contribute 2√3 and 5√3 units. Which row combines them correctly?",
    "2√3 + 5√3 = 7√3",
    "The radical parts match, so add only the coefficients.",
    ["Like part", "Coefficient move", "Result"],
    [
      { value: "2√3 + 5√3 = 7√3", cells: ["√3 and √3", "2 + 5 = 7", "7√3"] },
      { value: "2√3 + 5√3 = 10√9", cells: ["multiply both parts", "2 × 5 and 3 × 3", "10√9"] },
      { value: "2√3 + 5√3 = 10√3", cells: ["√3 and √3", "2 × 5 = 10", "10√3"] },
      { value: "2√3 + 5√3 = 7√6", cells: ["add radicands", "3 + 3 = 6", "7√6"] },
    ],
  ),
  "g9-multiply-binomials": table(
    "A rectangular solar panel has side lengths x + 3 and x + 2. Which row accounts for every area piece?",
    "x² + 5x + 6",
    "Multiply every term in the first binomial by every term in the second, then combine like terms.",
    ["Area pieces", "Combine", "Product"],
    [
      { value: "x² + 5x + 6", cells: ["x², 2x, 3x, 6", "2x + 3x = 5x", "x² + 5x + 6"] },
      { value: "x² + 6", cells: ["x², 6", "omit side strips", "x² + 6"] },
      { value: "x² + 6x + 6", cells: ["x², 3x, 3x, 6", "3x + 3x = 6x", "x² + 6x + 6"] },
      { value: "2x² + 5x + 6", cells: ["2x², 2x, 3x, 6", "2x + 3x = 5x", "2x² + 5x + 6"] },
    ],
  ),
  "g9-difference-squares": table(
    "A square hatch loses a 7-by-7 corner pattern, giving x² − 49. Which row factors the difference completely?",
    "(x − 7)(x + 7)",
    "A² − B² factors as (A − B)(A + B).",
    ["Recognize", "Factors", "Expansion check"],
    [
      { value: "(x − 7)(x + 7)", cells: ["x² − 7²", "(x − 7)(x + 7)", "x² − 49"] },
      { value: "(x − 7)²", cells: ["x² − 7²", "(x − 7)(x − 7)", "x² − 14x + 49"] },
      { value: "(x − 49)(x + 1)", cells: ["x² − 49", "(x − 49)(x + 1)", "x² − 48x − 49"] },
      { value: "x(x − 49)", cells: ["common x", "x(x − 49)", "x² − 49x"] },
    ],
  ),
  "g9-build-quadratic-models": graph(
    "A solar bridge touches the deck at x = 1 and x = 5 and reaches a maximum above the deck halfway between. Choose its graph.",
    "downward arc with zeros 1 and 5",
    "The zeros are symmetric around x = 3, and a maximum means the parabola opens downward.",
    { xMin: -1, xMax: 7, yMin: -3, yMax: 6 },
    [
      { value: "downward arc with zeros 1 and 5", optionLabel: "Bridge A", label: "Bridge A, a downward parabola with vertex at 3 comma 4 and zeros at 1 and 5", kind: "quadratic", a: -1, h: 3, k: 4 },
      { value: "upward arc with zeros 1 and 5", optionLabel: "Bridge B", label: "Bridge B, an upward parabola with vertex at 3 comma negative 4 and zeros at 1 and 5", kind: "quadratic", a: 1, h: 3, k: -4 },
      { value: "downward arc centered at 1", optionLabel: "Bridge C", label: "Bridge C, a downward parabola with vertex at 1 comma 4", kind: "quadratic", a: -1, h: 1, k: 4 },
      { value: "straight route through the deck", optionLabel: "Bridge D", label: "Bridge D, a straight descending line", kind: "linear", a: -1, b: 5 },
    ],
  ),
  "g9-linear-vs-exponential": graph(
    "An energy cell starts at 1 unit and doubles after every cycle. Choose its output graph.",
    "doubling curve",
    "Repeated multiplication by 2 creates an exponential curve through (0, 1).",
    { xMin: -2, xMax: 4, yMin: -1, yMax: 10 },
    [
      { value: "doubling curve", optionLabel: "Model A", label: "Model A, an exponential curve through 0 comma 1 that doubles each step", kind: "exponential", a: 1, b: 2 },
      { value: "constant-addition line", optionLabel: "Model B", label: "Model B, a straight line through the origin rising by 2 each step", kind: "linear", a: 2, b: 0 },
      { value: "halving curve", optionLabel: "Model C", label: "Model C, an exponential decay curve through 0 comma 1", kind: "exponential", a: 1, b: .5 },
      { value: "square-growth curve", optionLabel: "Model D", label: "Model D, an upward parabola through the origin", kind: "quadratic", a: 1 },
    ],
  ),
  "g9-correlation-residuals": table(
    "A model predicts 20 signal units, but the sensor records 18. Which row calculates and interprets the residual?",
    "18 − 20 = −2, model overpredicted",
    "Residual equals observed minus predicted; a negative residual means the prediction was too high.",
    ["Calculation", "Residual", "Interpretation"],
    [
      { value: "18 − 20 = −2, model overpredicted", cells: ["18 − 20", "−2", "model predicted 2 too high"] },
      { value: "20 − 18 = 2, model underpredicted", cells: ["20 − 18", "2", "model predicted 2 too low"] },
      { value: "18 + 20 = 38, strong fit", cells: ["18 + 20", "38", "strong fit"] },
      { value: "18 ÷ 20 = 0.9, no residual", cells: ["18 ÷ 20", "0.9", "residual is a ratio"] },
    ],
  ),
};

export const grade89VisualInteractionLessonSlugs = Object.keys(visualEnrichmentBySlug);

function appendEnrichment(practice: PracticeQuestion[], spec: EnrichmentQuestion) {
  const id = `q${practice.length + 1}`;
  if (practice.some((question) => question.prompt === spec.prompt)) return practice;
  return [...practice, buildPracticeQuestion({ id, ...spec })];
}

export function enrichGrade79Curriculum(regions: RegionDefinition[]): RegionDefinition[] {
  return regions.map((region) => ({
    ...region,
    lessons: region.lessons.map((lesson) => {
      const enrichment = enrichmentBySlug[lesson.slug];
      const visualEnrichment = visualEnrichmentBySlug[lesson.slug];
      let practice = lesson.practice;
      if (enrichment) practice = appendEnrichment(practice, enrichment);
      if (visualEnrichment) practice = appendEnrichment(practice, visualEnrichment);
      return practice === lesson.practice ? lesson : { ...lesson, practice };
    }),
  }));
}
