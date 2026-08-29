import type { Accent, LessonDefinition, PracticeQuestion, RegionDefinition } from "./curriculum.ts";
import { buildPracticeQuestion } from "./question-interactions.ts";

type Drill = [prompt: string, answer: string, choices?: string[]];
type LessonSpec = { slug: string; title: string; goal: string; key: string; example: string; standard: string; visual: string; drills: Drill[] };
const accents: Accent[] = ["violet", "blue", "teal", "coral", "gold"];

function makeLesson(regionId: number, order: number, accent: Accent, spec: LessonSpec): LessonDefinition {
  const practice: PracticeQuestion[] = spec.drills.map(([prompt, answer, choices], index) => buildPracticeQuestion({ id: `q${index + 1}`, prompt, answer, choices, hint: spec.key }));
  return {
    id: `g9-r${regionId}-l${order}`,
    grade: 9,
    slug: `g9-${spec.slug}`,
    regionId,
    order,
    title: spec.title,
    goal: spec.goal,
    keyIdea: spec.key,
    example: spec.example,
    exampleSteps: ["Identify the structure.", spec.key, `Substitute back to check: ${spec.example}.`],
    standard: spec.standard,
    accent,
    visual: spec.visual,
    practice,
  };
}

function makeRegion(order: number, title: string, subtitle: string, standard: string, specs: LessonSpec[]): RegionDefinition {
  const id = 900 + order;
  const accent = accents[(order - 1) % accents.length];
  return { id, grade: 9, order, slug: `g9-${specs[0].slug}`, title, subtitle, standard, accent, lessons: specs.map((spec, index) => makeLesson(id, index + 1, accents[(order + index - 1) % accents.length], spec)) };
}

export const grade9Regions: RegionDefinition[] = [
  makeRegion(1, "Algebra Foundations", "Use structure, notation, and properties with confidence.", "HSA.SSE.A · HSA.CED.A", [
    { slug: "algebraic-structure", title: "Structure in Expressions", goal: "Read expressions as meaningful parts.", key: "Treat a repeated or grouped expression as one object before expanding it.", example: "3(x + 2)² has factor 3 and repeated object (x + 2)", standard: "HSA.SSE.A.1", visual: "expression", drills: [
      ["In 5(x − 3), what is the outside factor?", "5"], ["How many terms are in 4x² − 7x + 2?", "3"], ["In (a + b)², what expression is squared?", "a+b|(a+b)"], ["Factor 6x + 12.", "6(x+2)", ["6(x + 2)", "6(x + 12)", "3(x + 4)", "2(x + 6)"]], ["Which is a quadratic expression?", "x^2+3x|x²+3x", ["2x+1", "x²+3x", "5/x"]],
    ] },
    { slug: "evaluate-formulas", title: "Evaluate Formulas", goal: "Substitute values carefully into formulas.", key: "Use parentheses around every replacement, especially a negative value.", example: "f(x)=x²−2x at x=−3 gives 15", standard: "HSA.SSE.A.1", visual: "substitute", drills: [
      ["Evaluate 2x² + 3 when x = 4.", "35"], ["Evaluate a² − 4a when a = −2.", "12"], ["For A = πr², find exact A when r = 5.", "25pi|25π"], ["For d = rt, find d when r = 60 and t = 2.5.", "150"], ["Evaluate |2x − 7| when x = 1.", "5"],
    ] },
    { slug: "properties-real-numbers", title: "Properties of Real Numbers", goal: "Use algebraic properties to justify steps.", key: "Commutative changes order, associative changes grouping, and distributive multiplies across a sum.", example: "4(x + 3) = 4x + 12", standard: "HSN.RN.B.3", visual: "distribute", drills: [
      ["Name the property: a + b = b + a.", "commutative|commutative property"], ["Name the property: (ab)c = a(bc).", "associative|associative property"], ["Expand 7(2x − 1).", "14x-7"], ["Simplify 3x + 5 + 2x − 1.", "5x+4|4+5x"], ["What is the additive identity?", "0|zero"],
    ] },
    { slug: "literal-equations", title: "Literal Equations", goal: "Rearrange a formula for a chosen variable.", key: "Treat other letters as known values and use inverse operations.", example: "A = lw → w = A/l", standard: "HSA.CED.A.4", visual: "formula", drills: [
      ["Solve A = lw for w.", "w=A/l|A/l"], ["Solve y = mx + b for b.", "b=y-mx|y-mx"], ["Solve d = rt for t.", "t=d/r|d/r"], ["Solve P = 2l + 2w for l.", "l=(P-2w)/2|(P-2w)/2"], ["Solve C = (5/9)(F − 32) for F.", "F=9C/5+32|9C/5+32"],
    ] },
    { slug: "quantities-units-precision", title: "Quantities, Units, and Precision", goal: "Choose quantities, units, scales, and precision that keep a model meaningful.", key: "Define what each quantity measures, carry units through the model, and round only as far as the measurement supports.", example: "A sensor reading 18.37°C reported to the nearest tenth is 18.4°C", standard: "HSN.Q.A.1–3", visual: "formula", drills: [
      ["Which unit best describes a rover's average speed?", "kilometers per hour", ["kilometers per hour", "kilometers", "hours", "square kilometers"]],
      ["A sensor reads 18.37°C. Report it to the nearest tenth.", "18.4°C|18.4", ["18.0°C", "18.3°C", "18.4°C", "18.37°C"]],
      ["A graph tracks battery charge over time. Which axis setup is meaningful?", "time on x; charge on y", ["time on x; charge on y", "charge on x; time on y", "time on both axes", "charge on both axes"]],
      ["Which equation keeps units consistent for distance?", "distance = speed × time", ["distance = speed × time", "distance = speed ÷ time", "distance = time ÷ speed", "distance = speed + time"]],
      ["A panel is measured as 2.4 m. Which report invents unsupported precision?", "2.4000 m", ["2.4 m", "2 m", "3 m", "2.4000 m"]],
    ] },
  ]),
  makeRegion(2, "Linear Equations and Inequalities", "Solve, explain, and model one-variable relationships.", "HSA.REI.A–B", [
    { slug: "multi-step-linear-equations", title: "Multi-Step Linear Equations", goal: "Solve equations with variables and constants on both sides.", key: "Simplify, move variable terms to one side, then isolate the variable.", example: "5x − 3 = 2x + 12 → x = 5", standard: "HSA.REI.A.1", visual: "balance", drills: [
      ["Solve 5x − 3 = 2x + 12.", "5"], ["Solve 4(x + 2) = 28.", "5"], ["Solve 7 − 3x = 2x + 22.", "-3"], ["Solve x/3 + 5 = 9.", "12"], ["Solve 0.4x − 1.2 = 2.8.", "10"],
    ] },
    { slug: "equation-solution-cases", title: "One, None, or Infinitely Many", goal: "Classify equations by their solution set.", key: "A true statement gives infinitely many solutions; a false statement gives no solution.", example: "2(x+3)=2x+6 becomes 6=6, so all real numbers work", standard: "HSA.REI.A.1", visual: "equation-steps", drills: [
      ["Solve 3x + 4 = 3x + 4. How many solutions?", "infinitely many|all real numbers"], ["Solve 2x + 1 = 2x + 5. How many solutions?", "none|no solution"], ["Solve 4x = 20. How many solutions?", "one|one solution"], ["2(x + 3) = 2x + 6 has what solution set?", "all real numbers|infinitely many"], ["5(x − 1) = 5x + 2 has what solution set?", "no solution|none"],
    ] },
    { slug: "linear-inequalities-g9", title: "Linear Inequalities", goal: "Solve and represent inequality solutions.", key: "Reverse the inequality when multiplying or dividing by a negative value.", example: "−3x ≤ 12 → x ≥ −4", standard: "HSA.REI.B.3", visual: "inequality-line", drills: [
      ["Solve 4x − 3 > 9.", "x>3|>3"], ["Solve −3x ≤ 12.", "x>=-4|x≥-4|≥-4"], ["Solve 2(x + 1) < 10.", "x<4|<4"], ["Solve 5 − x ≥ 8.", "x<=-3|x≤-3|≤-3"], ["Which value satisfies 3x + 2 ≤ 11?", "3", ["4", "5", "3", "6"]],
    ] },
    { slug: "absolute-value-equations", title: "Absolute Value Equations", goal: "Solve equations that describe distance from zero.", key: "If |u| = a with a ≥ 0, then u = a or u = −a.", example: "|x − 2| = 5 → x = 7 or x = −3", standard: "HSA.REI.B.3", visual: "number-line", drills: [
      ["Solve |x| = 6. Give both values.", "-6,6|6,-6|-6 and 6"], ["Solve |x − 2| = 5. Give both values.", "-3,7|7,-3|-3 and 7"], ["Solve |2x| = 10. Give both values.", "-5,5|5,-5|-5 and 5"], ["Does |x + 1| = −4 have a solution?", "no|no solution"], ["Solve |x| = 0.", "0"],
    ] },
    { slug: "absolute-value-functions", title: "Absolute Value Functions", goal: "Read and graph the vertex, direction, and shift of a V-shaped function.", key: "In y = a|x − h| + k, the vertex is (h,k); the sign and size of a control direction and steepness.", example: "y = |x − 3| − 2 has vertex (3,−2)", standard: "HSF.IF.C.7b · HSF.BF.B.3", visual: "curve-line", drills: [
      ["What is the vertex of y = |x − 3| − 2?", "(3, −2)|(3,-2)", ["(3, −2)", "(−3, −2)", "(3, 2)", "(−2, 3)"]],
      ["How does y = −|x| open?", "down", ["up", "down", "left", "right"]],
      ["Compared with y = |x|, what does y = |x| + 4 do?", "shifts up 4", ["shifts up 4", "shifts down 4", "shifts right 4", "gets 4 times steeper"]],
      ["Which point lies on y = |x − 1| + 2?", "(3, 4)|(3,4)", ["(3, 4)", "(3, 2)", "(1, 0)", "(0, 0)"]],
      ["What is the range of y = |x + 2| − 5?", "y ≥ −5|y>=-5", ["y ≥ −5", "y ≤ −5", "y ≥ 2", "all real y"]],
    ] },
    { slug: "absolute-value-inequalities", title: "Absolute Value Inequalities", goal: "Translate distance limits into intervals and number-line graphs.", key: "A distance less than a value stays between two boundaries; a distance greater than a value lies outside them.", example: "|x − 3| < 5 means −2 < x < 8", standard: "HSA.CED.A.1 · HSA.REI.B.3", visual: "inequality-line", drills: [
      ["Solve |x| < 4.", "−4 < x < 4|-4<x<4", ["−4 < x < 4", "x < −4 or x > 4", "x < 4", "x > −4"]],
      ["Solve |x − 3| < 5.", "−2 < x < 8|-2<x<8", ["−2 < x < 8", "x < −2 or x > 8", "−5 < x < 5", "3 < x < 8"]],
      ["Solve |x + 1| ≥ 3.", "x ≤ −4 or x ≥ 2|x<=-4 or x>=2", ["x ≤ −4 or x ≥ 2", "−4 ≤ x ≤ 2", "x ≥ −2", "−3 ≤ x ≤ 3"]],
      ["The rule |x − 10| ≤ 2 describes which interval?", "8 ≤ x ≤ 12|8<=x<=12", ["8 ≤ x ≤ 12", "x ≤ 8 or x ≥ 12", "−2 ≤ x ≤ 2", "10 ≤ x ≤ 12"]],
      ["Which phrase matches |x − 6| > 4?", "more than 4 units from 6", ["more than 4 units from 6", "within 4 units of 6", "exactly 4 units from 6", "at most 6 units from 4"]],
    ] },
  ]),
  makeRegion(3, "Linear Functions", "Connect slope, intercepts, tables, equations, and graphs.", "HSF.IF.B–C · HSF.LE.A", [
    { slug: "slope-from-points", title: "Slope from Points", goal: "Find and interpret a constant rate of change.", key: "Slope m = (y₂ − y₁)/(x₂ − x₁).", example: "From (1,2) to (4,8): m = 6/3 = 2", standard: "HSF.IF.B.6", visual: "slope", drills: [
      ["Find slope through (1, 2) and (4, 8).", "2"], ["Find slope through (−2, 5) and (2, 1).", "-1"], ["Find slope of a horizontal line.", "0"], ["What is the slope of a vertical line?", "undefined"], ["A line rises 9 and runs 3. Slope?", "3"],
    ] },
    { slug: "linear-equation-forms", title: "Forms of a Line", goal: "Move among slope-intercept, point-slope, and standard form.", key: "Choose the form that matches what you know, then rearrange if needed.", example: "Point (2,5), slope 3 → y − 5 = 3(x − 2)", standard: "HSA.CED.A.2", visual: "line-graph", drills: [
      ["Slope 2, y-intercept −3. Write the equation.", "y=2x-3"], ["Point (2,5), slope 3. Write point-slope form.", "y-5=3(x-2)"], ["Rewrite 2x + y = 7 in slope-intercept form.", "y=-2x+7|y=7-2x"], ["In 4x − 2y = 8, find the y-intercept.", "-4|(0,-4)"], ["Which form is Ax + By = C?", "standard form|standard"],
    ] },
    { slug: "graph-linear-functions", title: "Graph Linear Functions", goal: "Graph a line from slope and intercept.", key: "Plot the y-intercept first, then use rise over run for more points.", example: "y = −2x + 3 starts at (0,3) and falls 2 for each step right", standard: "HSF.IF.C.7", visual: "line-graph", drills: [
      ["For y = 3x − 2, what is the y-intercept?", "-2|(0,-2)"], ["For y = −x + 4, what is the slope?", "-1"], ["Does (2,5) lie on y = 2x + 1?", "yes"], ["Find x-intercept of y = x − 6.", "6|(6,0)"], ["A line with positive slope rises or falls left to right?", "rises|rise"],
    ] },
    { slug: "arithmetic-sequences", title: "Arithmetic Sequences", goal: "Model repeated addition with a linear rule.", key: "An arithmetic sequence has constant difference d and rule aₙ = a₁ + (n − 1)d.", example: "4, 7, 10,… has aₙ = 4 + 3(n−1)", standard: "HSF.BF.A.2", visual: "sequence", drills: [
      ["Find the common difference: 5, 9, 13, …", "4"], ["Find the 6th term of 2, 5, 8, …", "17"], ["Write a rule for 10, 7, 4, …", "a_n=10-3(n-1)|an=10-3(n-1)"], ["Is 3, 6, 12, 24 arithmetic?", "no"], ["The 1st term is 8 and d = 5. Find the 10th term.", "53"],
    ] },
  ]),
  makeRegion(4, "Systems of Equations", "Find where two linear conditions are true at once.", "HSA.REI.C–D", [
    { slug: "systems-by-graphing-g9", title: "Systems by Graphing", goal: "Use the intersection of two graphs as a solution.", key: "A solution is an ordered pair that lies on both lines.", example: "y=x+1 and y=−x+5 meet at (2,3)", standard: "HSA.REI.C.6", visual: "systems", drills: [
      ["Solve y = x + 1 and y = −x + 5.", "(2,3)|2,3"], ["Parallel distinct lines have how many solutions?", "none|no solution"], ["The same line graphed twice has how many solutions?", "infinitely many|all points"], ["Does (1,4) solve y=2x+2 and y=−x+5?", "yes"], ["What graph feature represents a system solution?", "intersection|point of intersection"],
    ] },
    { slug: "systems-substitution-g9", title: "Systems by Substitution", goal: "Replace one variable with an equal expression.", key: "Solve one equation for a variable, substitute, then back-substitute.", example: "y=2x, x+y=9 → 3x=9 → (3,6)", standard: "HSA.REI.C.6", visual: "substitute", drills: [
      ["Solve y = 2x and x + y = 9.", "(3,6)|3,6"], ["Solve x = y + 1 and x + y = 7.", "(4,3)|4,3"], ["Solve y = x − 4 and 2x + y = 11.", "(5,1)|5,1"], ["Solve x = 3 and y = 2x + 1.", "(3,7)|3,7"], ["After finding x, what step completes the ordered pair?", "back-substitute|substitute to find y"],
    ] },
    { slug: "systems-elimination-g9", title: "Systems by Elimination", goal: "Add equations to remove one variable.", key: "First make one pair of coefficients opposites, then add the equations.", example: "x+y=7 and x−y=1 → 2x=8 → (4,3)", standard: "HSA.REI.C.6", visual: "equation-steps", drills: [
      ["Solve x + y = 7 and x − y = 1.", "(4,3)|4,3"], ["Solve 2x + y = 8 and 2x − y = 4.", "(3,2)|3,2"], ["Solve x + 2y = 9 and 3x − 2y = 7.", "(4,2)|4,2"], ["What should coefficients be before direct elimination?", "opposites|opposite"], ["If adding equations gives 0 = 5, how many solutions?", "none|no solution"],
    ] },
    { slug: "system-models", title: "Model with Systems", goal: "Use two equations to model two unknown quantities.", key: "Define both unknowns and write one equation for each independent condition.", example: "Adults + students = 20 and 10a + 6s = 152 → a=8, s=12", standard: "HSA.CED.A.3", visual: "model", drills: [
      ["20 tickets: adult $10, student $6, total $152. Adults?", "8"], ["Two numbers sum to 18 and differ by 4. Larger number?", "11"], ["3 pens and 2 notebooks cost $13; pen $1. Notebook price?", "5|$5"], ["A farm has 12 heads and 34 legs (chickens/rabbits). Rabbits?", "5"], ["Why are two independent equations needed for two unknowns?", "to determine one solution|one equation is not enough|find both unknowns"],
    ] },
    { slug: "graph-linear-inequalities", title: "Graph Linear Inequalities", goal: "Turn a two-variable inequality into a boundary and a shaded half-plane.", key: "Graph the boundary line, use solid for ≤ or ≥ and dashed for < or >, then test which side satisfies the inequality.", example: "y > 2x − 1 uses a dashed boundary and shades above the line", standard: "HSA.REI.D.12", visual: "line-graph", drills: [
      ["For y > 2x − 1, which boundary should be drawn?", "dashed y = 2x − 1", ["dashed y = 2x − 1", "solid y = 2x − 1", "dashed x = 2y − 1", "solid x = 2y − 1"]],
      ["For y ≤ −x + 4, which side is shaded?", "below the line", ["below the line", "above the line", "left of the y-axis", "right of the y-axis"]],
      ["Does (0, 0) satisfy y ≥ 3x − 2?", "yes"],
      ["Which point satisfies y < x + 1?", "(2, 1)|(2,1)", ["(2, 1)", "(0, 2)", "(1, 3)", "(−1, 2)"]],
      ["Why is the boundary solid for 2x + y ≥ 6?", "equality is included", ["equality is included", "the slope is positive", "the y-intercept is 6", "every point is a solution"]],
    ] },
    { slug: "systems-linear-inequalities", title: "Systems of Linear Inequalities", goal: "Find the region where several constraints are true at the same time.", key: "Graph each half-plane; the solution is their overlap, and a viable point must satisfy every inequality.", example: "x ≥ 0, y ≥ 0, and x + y ≤ 6 form a triangular feasible region", standard: "HSA.CED.A.3 · HSA.REI.D.12", visual: "systems", drills: [
      ["What represents the solution to a system of inequalities?", "the overlapping shaded region", ["the overlapping shaded region", "either boundary line", "the x-intercept only", "every unshaded point"]],
      ["Which point satisfies x ≥ 0, y ≥ 0, and x + y ≤ 6?", "(2, 3)|(2,3)", ["(2, 3)", "(−1, 2)", "(4, 4)", "(3, −1)"]],
      ["A point lies in one shaded region but not the other. Is it a solution to the system?", "no"],
      ["For x + y ≤ 10 and x ≥ 4, which point is viable?", "(6, 3)|(6,3)", ["(6, 3)", "(3, 6)", "(8, 5)", "(2, 2)"]],
      ["If two required half-planes never overlap, the system has what result?", "no solution", ["no solution", "one solution", "all points", "one boundary line"]],
    ] },
  ]),
  makeRegion(5, "Exponents and Radicals", "Use exponent laws and connect powers with roots.", "HSN.RN.A · HSA.SSE.B", [
    { slug: "integer-exponents-g9", title: "Integer Exponents", goal: "Simplify powers with positive, zero, and negative exponents.", key: "Add exponents when multiplying, subtract when dividing, and move a negative exponent across the fraction bar.", example: "x³/x⁵ = x⁻² = 1/x²", standard: "HSN.RN.A.1", visual: "exponent-blocks", drills: [
      ["Simplify x⁴ · x³.", "x^7|x⁷"], ["Simplify a⁹/a⁴.", "a^5|a⁵"], ["Simplify (m³)².", "m^6|m⁶"], ["Rewrite y⁻³ with positive exponents.", "1/y^3|1/y³"], ["Evaluate 5⁰.", "1"],
    ] },
    { slug: "rational-exponents", title: "Rational Exponents", goal: "Connect fractional exponents with roots.", key: "a^(1/n) is the nth root of a; a^(m/n) means root then power.", example: "27^(2/3) = (∛27)² = 9", standard: "HSN.RN.A.1", visual: "root-tiles", drills: [
      ["Evaluate 16^(1/2).", "4"], ["Evaluate 27^(1/3).", "3"], ["Evaluate 27^(2/3).", "9"], ["Rewrite x^(1/2) as a radical.", "sqrt(x)|√x"], ["Evaluate 81^(3/4).", "27"],
    ] },
    { slug: "simplify-radicals", title: "Simplify Radicals", goal: "Factor perfect powers out of a radical.", key: "Split the radicand into a perfect square factor and what remains.", example: "√72 = √(36·2) = 6√2", standard: "HSN.RN.A.2", visual: "root-tiles", drills: [
      ["Simplify √12.", "2sqrt(3)|2√3"], ["Simplify √50.", "5sqrt(2)|5√2"], ["Simplify √72.", "6sqrt(2)|6√2"], ["Simplify 3√8.", "6sqrt(2)|6√2"], ["Which perfect square factor is useful in √45?", "9"],
    ] },
    { slug: "radical-operations", title: "Radical Operations", goal: "Combine like radicals and multiply radicals.", key: "Only like radicals combine by addition; multiply coefficients and radicands separately.", example: "2√3 + 5√3 = 7√3", standard: "HSN.RN.A.2", visual: "root-tiles", drills: [
      ["Simplify 2√3 + 5√3.", "7sqrt(3)|7√3"], ["Simplify √5 · √20.", "10"], ["Simplify 4√2 − √2.", "3sqrt(2)|3√2"], ["Simplify √3 · √6.", "3sqrt(2)|3√2"], ["Can √2 and √3 combine by addition?", "no"],
    ] },
  ]),
  makeRegion(6, "Polynomials", "Add, subtract, and multiply expressions built from powers.", "HSA.APR.A.1", [
    { slug: "polynomial-vocabulary", title: "Polynomial Vocabulary", goal: "Classify polynomials by terms and degree.", key: "The degree is the greatest exponent after like terms are combined.", example: "4x³ − 2x + 1 is a cubic trinomial", standard: "HSA.SSE.A.1", visual: "expression", drills: [
      ["What is the degree of 5x⁴ − 2x + 1?", "4"], ["How many terms are in x² + 3x − 7?", "3"], ["Classify 2x + 5 by number of terms.", "binomial"], ["What is the leading coefficient of −3x² + x?", "-3"], ["Is 4/x a polynomial?", "no"],
    ] },
    { slug: "add-subtract-polynomials", title: "Add and Subtract Polynomials", goal: "Combine polynomial terms with matching variables and exponents.", key: "Distribute subtraction to every term, then combine like terms.", example: "(3x²+x)−(x²−4x)=2x²+5x", standard: "HSA.APR.A.1", visual: "like-terms", drills: [
      ["Add (2x² + 3x) + (5x² − x).", "7x^2+2x|7x²+2x"], ["Subtract (4x + 7) − (x − 2).", "3x+9"], ["Add (x² − 4) + (3x² + 6).", "4x^2+2|4x²+2"], ["Subtract (5a² − a) − (2a² + 3a).", "3a^2-4a|3a²-4a"], ["Which terms are like terms?", "3x^2 and -5x^2|3x² and −5x²", ["3x and 3x²", "3x² and −5x²", "x and y"]],
    ] },
    { slug: "multiply-monomials", title: "Multiply Monomials", goal: "Multiply coefficients and combine powers.", key: "Multiply coefficients and add exponents of identical bases.", example: "(3x²)(−2x³)=−6x⁵", standard: "HSA.APR.A.1", visual: "exponent-blocks", drills: [
      ["Multiply (3x²)(4x³).", "12x^5|12x⁵"], ["Multiply (−2a)(5a⁴).", "-10a^5|-10a⁵"], ["Multiply (6m²n)(2mn³).", "12m^3n^4|12m³n⁴"], ["Square 3x².", "9x^4|9x⁴"], ["Multiply x⁵ · x.", "x^6|x⁶"],
    ] },
    { slug: "multiply-binomials", title: "Multiply Binomials", goal: "Distribute every term across every term.", key: "Use an area model or double distribution, then combine the middle terms.", example: "(x+3)(x+2)=x²+5x+6", standard: "HSA.APR.A.1", visual: "area-model", drills: [
      ["Expand (x + 3)(x + 2).", "x^2+5x+6|x²+5x+6"], ["Expand (x − 4)(x + 1).", "x^2-3x-4|x²-3x-4"], ["Expand (2x + 3)(x − 5).", "2x^2-7x-15|2x²-7x-15"], ["Expand (x + 6)².", "x^2+12x+36|x²+12x+36"], ["Expand (x − 2)(x + 2).", "x^2-4|x²-4"],
    ] },
  ]),
  makeRegion(7, "Factoring", "Reverse multiplication to expose polynomial structure.", "HSA.SSE.B.3 · HSA.APR.B.3", [
    { slug: "greatest-common-factor", title: "Greatest Common Factor", goal: "Factor out the greatest shared monomial.", key: "Take the GCF of coefficients and the smallest shared power of each variable.", example: "12x³ + 8x² = 4x²(3x + 2)", standard: "HSA.SSE.B.3", visual: "factor", drills: [
      ["Factor 6x + 18.", "6(x+3)", ["6(x + 3)", "6(x + 18)", "3(x + 6)", "2(3x + 3)"]], ["Factor 12x³ + 8x².", "4x^2(3x+2)|4x²(3x+2)", ["4x²(3x + 2)", "4x²(3x + 8)", "2x²(6x + 2)", "4x(3x + 2)"]], ["Factor 15a²b − 10ab².", "5ab(3a-2b)", ["5ab(3a − 2b)", "5ab(3a − 2)", "5ab(3 − 2b)", "5a(3a − 2b)"]], ["What is the GCF of 18x² and 24x³?", "6x^2|6x²"], ["Factor −3x² + 12x.", "-3x(x-4)|3x(4-x)", ["−3x(x − 4)", "−3(x² − 4)", "−3x(x + 4)", "3x(x − 4)"]],
    ] },
    { slug: "factor-trinomials", title: "Factor Trinomials", goal: "Factor x² + bx + c into two binomials.", key: "Find two numbers whose product is c and whose sum is b.", example: "x²+7x+12=(x+3)(x+4)", standard: "HSA.SSE.B.3", visual: "area-model", drills: [
      ["Factor x² + 7x + 12.", "(x+3)(x+4)|(x+4)(x+3)", ["(x + 3)(x + 4)", "(x + 2)(x + 6)", "(x − 3)(x − 4)", "(x + 1)(x + 12)"]], ["Factor x² − x − 12.", "(x-4)(x+3)|(x+3)(x-4)", ["(x − 4)(x + 3)", "(x − 3)(x + 4)", "(x − 6)(x + 2)", "(x + 4)(x + 3)"]], ["Factor x² + 10x + 25.", "(x+5)^2|(x+5)(x+5)", ["(x + 5)²", "(x + 25)(x + 1)", "(x − 5)²", "(x + 10)(x + 5)"]], ["Factor x² − 9x + 20.", "(x-5)(x-4)|(x-4)(x-5)", ["(x − 5)(x − 4)", "(x + 5)(x + 4)", "(x − 10)(x + 2)", "(x − 20)(x + 1)"]], ["For x² + 5x + 6, the needed pair is?", "2 and 3|2,3"],
    ] },
    { slug: "difference-squares", title: "Difference of Squares", goal: "Recognize and factor a² − b².", key: "A difference of squares factors as (a − b)(a + b).", example: "x² − 25 = (x − 5)(x + 5)", standard: "HSA.SSE.B.3", visual: "area-model", drills: [
      ["Factor x² − 25.", "(x-5)(x+5)|(x+5)(x-5)", ["(x − 5)(x + 5)", "(x − 5)²", "(x + 5)²", "(x − 25)(x + 1)"]], ["Factor 4a² − 9.", "(2a-3)(2a+3)|(2a+3)(2a-3)", ["(2a − 3)(2a + 3)", "(4a − 3)(a + 3)", "(2a − 3)²", "(4a − 9)(a + 1)"]], ["Factor 49y² − 1.", "(7y-1)(7y+1)|(7y+1)(7y-1)", ["(7y − 1)(7y + 1)", "(49y − 1)(y + 1)", "(7y − 1)²", "(49y − 1)(49y + 1)"]], ["Is x² + 16 a difference of squares over the reals?", "no"], ["Expand (m − 6)(m + 6).", "m^2-36|m²-36"],
    ] },
    { slug: "factoring-completely", title: "Factor Completely", goal: "Use more than one factoring step when needed.", key: "Always check for a GCF first, then look for a remaining pattern.", example: "2x²−18=2(x²−9)=2(x−3)(x+3)", standard: "HSA.SSE.B.3", visual: "factor-tree", drills: [
      ["Factor completely 2x² − 18.", "2(x-3)(x+3)|2(x+3)(x-3)", ["2(x − 3)(x + 3)", "2(x − 9)(x + 1)", "(2x − 3)(x + 3)", "2(x − 3)²"]], ["Factor completely 3x² + 15x + 18.", "3(x+2)(x+3)|3(x+3)(x+2)", ["3(x + 2)(x + 3)", "3(x + 1)(x + 6)", "3(x − 2)(x − 3)", "(3x + 2)(x + 3)"]], ["Factor completely 5x³ − 20x.", "5x(x-2)(x+2)|5x(x+2)(x-2)", ["5x(x − 2)(x + 2)", "5x(x − 2)²", "5(x − 2)(x + 2)", "5x(x − 4)(x + 1)"]], ["What should you check before other patterns?", "greatest common factor|gcf"], ["Factor completely x³ − 9x.", "x(x-3)(x+3)|x(x+3)(x-3)", ["x(x − 3)(x + 3)", "x(x − 3)²", "(x − 3)(x + 3)", "x(x − 9)(x + 1)"]],
    ] },
  ]),
  makeRegion(8, "Quadratic Equations", "Solve and interpret equations with a squared variable.", "HSA.REI.B.4 · HSF.IF.C.7", [
    { slug: "solve-by-square-roots", title: "Solve by Square Roots", goal: "Solve a quadratic when the squared expression is isolated.", key: "After taking a square root, include both positive and negative roots unless context restricts them.", example: "(x−2)²=9 → x=5 or x=−1", standard: "HSA.REI.B.4", visual: "root-tiles", drills: [
      ["Solve x² = 49.", "-7,7|7,-7|-7 and 7"], ["Solve (x − 2)² = 9.", "-1,5|5,-1|-1 and 5"], ["Solve 3x² = 75.", "-5,5|5,-5|-5 and 5"], ["Solve x² + 4 = 4.", "0"], ["How many real solutions has x² = −9?", "0|none|no real solutions"],
    ] },
    { slug: "solve-by-factoring", title: "Solve by Factoring", goal: "Use zero products to solve a quadratic.", key: "Set the equation equal to zero, factor, then set each factor equal to zero.", example: "x²−5x+6=0 → (x−2)(x−3)=0 → x=2,3", standard: "HSA.REI.B.4", visual: "factor", drills: [
      ["Solve x² − 5x + 6 = 0.", "2,3|3,2|2 and 3"], ["Solve x² − 16 = 0.", "-4,4|4,-4|-4 and 4"], ["Solve x² + 7x = 0.", "-7,0|0,-7|-7 and 0"], ["Solve 2x² − 10x = 0.", "0,5|5,0|0 and 5"], ["What property turns ab = 0 into a = 0 or b = 0?", "zero product property|zero product"],
    ] },
    { slug: "quadratic-formula", title: "The Quadratic Formula", goal: "Solve any quadratic equation in standard form.", key: "For ax²+bx+c=0, x = (−b ± √(b²−4ac))/(2a).", example: "x²−2x−3=0 → x=3 or −1", standard: "HSA.REI.B.4", visual: "formula", drills: [
      ["For 2x² + 3x − 5 = 0, what is a?", "2"], ["For x² − 2x − 3 = 0, find the discriminant.", "16"], ["Solve x² − 2x − 3 = 0.", "-1,3|3,-1|-1 and 3"], ["If the discriminant is 0, how many distinct real roots?", "1|one"], ["If the discriminant is negative, how many real roots?", "0|none|no real roots"],
    ] },
    { slug: "quadratic-graphs", title: "Graphs of Quadratics", goal: "Read vertices, intercepts, and direction from a parabola.", key: "The vertex is the turning point; the sign of a tells whether the parabola opens up or down.", example: "y=(x−3)²−4 has vertex (3,−4)", standard: "HSF.IF.C.7", visual: "parabola", drills: [
      ["Find the vertex of y = (x − 3)² − 4.", "(3,-4)|3,-4"], ["Does y = −2x² + 1 open up or down?", "down"], ["Find the y-intercept of y = x² − 5x + 6.", "6|(0,6)"], ["Find the x-intercepts of y = (x − 2)(x + 1).", "-1,2|2,-1"], ["What line divides a parabola symmetrically?", "axis of symmetry|symmetry axis"],
    ] },
    { slug: "build-quadratic-models", title: "Build Quadratic Models", goal: "Choose a quadratic form from the information a situation gives you.", key: "Use factored form for zeros, vertex form for a maximum or minimum, and a known point to determine the scale factor.", example: "Zeros 1 and 5 with point (3,8) give y = −2(x − 1)(x − 5)", standard: "HSF.BF.A.1 · HSF.IF.C.8a", visual: "parabola", drills: [
      ["A parabola has zeros 2 and 7. Which form exposes them?", "y = a(x − 2)(x − 7)", ["y = a(x − 2)(x − 7)", "y = a(x + 2)(x + 7)", "y = a(x − 2) + 7", "y = ax + 9"]],
      ["A projectile reaches its highest point at (4, 18). Which form starts with that vertex?", "y = a(x − 4)² + 18", ["y = a(x − 4)² + 18", "y = a(x + 4)² − 18", "y = a(x − 18)² + 4", "y = ax + 18"]],
      ["Zeros 1 and 5 with point (3, 8) give which model?", "y = −2(x − 1)(x − 5)", ["y = −2(x − 1)(x − 5)", "y = 2(x − 1)(x − 5)", "y = −2(x + 1)(x + 5)", "y = (x − 3)² + 8"]],
      ["In h(t) = −5(t − 2)² + 20, what does 20 represent?", "maximum height", ["maximum height", "launch time", "horizontal speed", "time on the ground"]],
      ["Which feature is easiest to read from y = 3(x + 2)(x − 6)?", "the zeros", ["the zeros", "the vertex y-value", "the axis scale", "the average rate"]],
    ] },
  ]),
  makeRegion(9, "Exponential Functions", "Model repeated multiplication, growth, and decay.", "HSF.LE.A–B", [
    { slug: "geometric-sequences", title: "Geometric Sequences", goal: "Recognize and extend repeated multiplication.", key: "A geometric sequence has a constant ratio r and rule aₙ = a₁r^(n−1).", example: "3, 6, 12,… has ratio 2", standard: "HSF.BF.A.2", visual: "sequence", drills: [
      ["Find the common ratio: 4, 12, 36, …", "3"], ["Find the 5th term of 2, 6, 18, …", "162"], ["Is 5, 10, 15, 20 geometric?", "no"], ["Write a rule for 8, 4, 2, …", "a_n=8(1/2)^(n-1)|an=8(1/2)^(n-1)"], ["A first term is 3 and ratio 4. Third term?", "48"],
    ] },
    { slug: "exponential-growth", title: "Exponential Growth", goal: "Model a quantity multiplied by the same factor over equal intervals.", key: "Growth uses y = a(1 + r)^t with r written as a decimal.", example: "100 grows 5% yearly → 100(1.05)^t", standard: "HSF.LE.A.1–2", visual: "growth", drills: [
      ["A starts at 200 and grows 10% once. New value?", "220"], ["Write the growth factor for 7% growth.", "1.07"], ["For y = 50(1.2)^t, what is the initial value?", "50"], ["For y = 50(1.2)^t, what is the percent growth?", "20%|20"], ["A population doubles from 300 once. New population?", "600"],
    ] },
    { slug: "exponential-decay", title: "Exponential Decay", goal: "Model a quantity that loses the same percent repeatedly.", key: "Decay uses y = a(1 − r)^t; the multiplier stays between 0 and 1.", example: "500 loses 12% yearly → 500(0.88)^t", standard: "HSF.LE.A.1–2", visual: "decay", drills: [
      ["A $400 item loses 25% once. New value?", "300|$300"], ["Write the decay factor for 8% loss.", "0.92"], ["For y = 80(0.6)^t, what percent is lost each step?", "40%|40"], ["A quantity halves twice from 120. Final value?", "30"], ["Does y = 5(1.1)^t show growth or decay?", "growth"],
    ] },
    { slug: "linear-vs-exponential", title: "Linear vs. Exponential", goal: "Distinguish constant differences from constant ratios.", key: "Linear patterns add the same amount; exponential patterns multiply by the same factor.", example: "2,5,8 is linear; 2,6,18 is exponential", standard: "HSF.LE.A.1", visual: "curve-line", drills: [
      ["Is 3, 7, 11, 15 linear or exponential?", "linear"], ["Is 3, 9, 27, 81 linear or exponential?", "exponential"], ["A quantity adds 5 each year. Which model?", "linear"], ["A quantity grows 5% each year. Which model?", "exponential"], ["Which eventually grows faster with positive rates: linear or exponential?", "exponential"],
    ] },
  ]),
  makeRegion(10, "Data and Modeling", "Use functions and statistics to describe real patterns.", "HSS.ID.A–C", [
    { slug: "one-variable-data", title: "One-Variable Data", goal: "Choose displays and summaries that fit a data set.", key: "Describe shape, center, spread, and unusual values together.", example: "A right-skewed set is often better summarized by median and IQR", standard: "HSS.ID.A.1–3", visual: "data-line", drills: [
      ["Which center is resistant to outliers?", "median"], ["Which spread pairs with the median?", "iqr|interquartile range"], ["A long right tail means the data are skewed which way?", "right|right-skewed"], ["Find the mean of 4, 6, 8, 10.", "7"], ["For Q1=12 and Q3=19, find IQR.", "7"],
    ] },
    { slug: "scatter-models-g9", title: "Scatter Plots and Lines of Fit", goal: "Describe association and use a fitted line for prediction.", key: "Use a line of fit within the data range; correlation does not prove causation.", example: "y = 2.5x + 4 predicts 29 when x = 10", standard: "HSS.ID.B.6", visual: "scatter", drills: [
      ["Points rise left to right. Association?", "positive|positive association"], ["For y = 2.5x + 4, predict y at x = 10.", "29"], ["Actual 31, predicted 29. Residual actual − predicted?", "2"], ["Does correlation prove causation?", "no"], ["A point far from the pattern is called?", "outlier|an outlier"],
    ] },
    { slug: "correlation-residuals", title: "Correlation and Residuals", goal: "Judge how well a linear model fits.", key: "Small, patternless residuals support a linear model; visible residual patterns suggest another model.", example: "Residuals around zero with no curve indicate a reasonable line", standard: "HSS.ID.B.6", visual: "residual", drills: [
      ["Residual = actual 14 − predicted 11. Find it.", "3"], ["Residual = actual 8 − predicted 10. Find it.", "-2"], ["Good linear residuals show a clear curve or no pattern?", "no pattern"], ["A correlation near −1 is strong or weak?", "strong"], ["What does a positive residual mean?", "actual is above predicted|actual value is greater than predicted"],
    ] },
    { slug: "modeling-decisions", title: "Choose and Interpret a Model", goal: "Select a linear, quadratic, or exponential model from context and data.", key: "Look for constant difference, constant second difference, or constant ratio.", example: "Constant second differences point to a quadratic model", standard: "HSS.ID.B.6 · HSF.LE.B.5", visual: "model", drills: [
      ["Constant first differences suggest which model?", "linear"], ["Constant second differences suggest which model?", "quadratic"], ["Constant ratios suggest which model?", "exponential"], ["A projectile height over time is commonly modeled by?", "quadratic|a quadratic"], ["A fixed monthly increase is commonly modeled by?", "linear|a linear model"],
    ] },
  ]),
];
