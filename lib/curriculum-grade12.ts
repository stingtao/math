import type { Accent, LessonDefinition, PracticeQuestion, RegionDefinition } from "./curriculum.ts";
import { buildPracticeQuestion } from "./question-interactions.ts";

type Drill = [prompt: string, answer: string, choices?: string[]];
type LessonSpec = { slug: string; title: string; goal: string; key: string; example: string; steps?: string[]; standard: string; visual: string; drills: Drill[] };
const accents: Accent[] = ["gold", "violet", "blue", "coral", "teal"];

function makeLesson(regionId: number, order: number, accent: Accent, spec: LessonSpec): LessonDefinition {
  const practice: PracticeQuestion[] = spec.drills.map(([prompt, answer, choices], index) => buildPracticeQuestion({ id: `q${index + 1}`, prompt, answer, choices, hint: spec.key }));
  return { id: `g12-r${regionId}-l${order}`, grade: 12, slug: `g12-${spec.slug}`, regionId, order, title: spec.title, goal: spec.goal, keyIdea: spec.key, example: spec.example, exampleSteps: spec.steps ?? ["Represent the problem with a function, diagram, or distribution.", spec.key, `Interpret and check the result: ${spec.example}.`], standard: spec.standard, accent, visual: spec.visual, practice };
}

function makeRegion(order: number, title: string, subtitle: string, standard: string, specs: LessonSpec[]): RegionDefinition {
  const id = 1200 + order;
  const accent = accents[(order - 1) % accents.length];
  return { id, grade: 12, order, slug: `g12-${specs[0].slug}`, title, subtitle, standard, accent, lessons: specs.map((spec, index) => makeLesson(id, index + 1, accents[(order + index - 1) % accents.length], spec)) };
}

export const grade12Regions: RegionDefinition[] = [
  makeRegion(1, "Advanced Functions", "Compose, invert, transform, and model with functions.", "HSF.BF · HSF.IF", [
    { slug: "function-composition", title: "Function Composition", goal: "Build one function by applying another function first.", key: "(f∘g)(x)=f(g(x)); work from the inside function outward and track domain restrictions.", example: "f(x)=2x+1, g(x)=x² → (f∘g)(3)=19", standard: "HSF.BF.A.1", visual: "mapping", drills: [
      ["f(x)=2x+1, g(x)=x². Find (f∘g)(3).", "19"], ["For the same functions, find (g∘f)(2).", "25"], ["Write (f∘g)(x) in words.", "f of g of x|apply g then f"], ["Is composition always commutative?", "no"], ["If f(x)=x−4 and g(x)=3x, find f(g(x)).", "3x-4"],
    ] },
    { slug: "inverse-functions", title: "Inverse Functions", goal: "Find and verify a function that reverses another.", key: "Swap x and y, solve for y, then verify f(f⁻¹(x))=x; one-to-one functions pass the horizontal line test.", example: "f(x)=3x−6 → f⁻¹(x)=(x+6)/3", standard: "HSF.BF.B.4", visual: "mapping", drills: [
      ["Inverse of f(x)=x+5?", "x-5|f^-1(x)=x-5"], ["Inverse of f(x)=2x?", "x/2|f^-1(x)=x/2"], ["Inverse of f(x)=3x−6?", "(x+6)/3|f^-1(x)=(x+6)/3"], ["What graph test checks whether an inverse is a function?", "horizontal line test"], ["Graphs of inverse functions reflect across what line?", "y=x"],
    ] },
    { slug: "function-transformations-g12", title: "Function Transformations", goal: "Predict shifts, reflections, and stretches from an equation.", key: "In y=a f(b(x−h))+k: h shifts horizontally, k vertically, and signs or magnitudes of a and b reflect or scale.", example: "y=−2f(x−3)+1 shifts right 3, stretches by 2, reflects, then up 1", standard: "HSF.BF.B.3", visual: "transform", drills: [
      ["y=f(x−4) shifts which direction?", "right 4|4 right"], ["y=f(x)+3 shifts?", "up 3|3 up"], ["y=−f(x) reflects across which axis?", "x-axis|x axis"], ["y=f(−x) reflects across which axis?", "y-axis|y axis"], ["y=3f(x) is a vertical stretch by?", "3"],
    ] },
    { slug: "model-selection-g12", title: "Choose a Function Model", goal: "Match data and context to a useful function family.", key: "Use constant first differences for linear, constant ratios for exponential, and constant second differences for quadratic patterns.", example: "Second differences 6 suggest a quadratic model", standard: "HSF.LE.A.1 · HSS.ID.B.6", visual: "compare", drills: [
      ["Constant first differences suggest what model?", "linear"], ["Constant ratios suggest what model?", "exponential"], ["Constant second differences suggest what model?", "quadratic"], ["Periodic data suggest what model family?", "trigonometric|sinusoidal"], ["A model with residual pattern is likely appropriate?", "no"],
    ] },
  ]),
  makeRegion(2, "Limits and Continuity", "Describe function behavior near a point and across an interval.", "Calculus readiness · LIM", [
    { slug: "limit-from-table-graph", title: "Limits from Tables and Graphs", goal: "Estimate a value a function approaches from both sides.", key: "A limit describes nearby outputs, not necessarily the function value at the point; compare left- and right-hand behavior.", example: "If outputs approach 4 from both sides, lim f(x)=4", standard: "AP.CALC.LIM.1", visual: "curve-line", drills: [
      ["If f(x) approaches 3 from both sides of x=2, the limit is?", "3"], ["Can a limit exist when f(a) is undefined?", "yes"], ["If left limit is 2 and right limit is 5, does the two-sided limit exist?", "no"], ["A filled point gives the function value or always the limit?", "function value"], ["A hole in a graph may still have a limit?", "yes"],
    ] },
    { slug: "limit-laws", title: "Limit Laws", goal: "Evaluate limits algebraically when direct substitution is valid.", key: "Limits distribute over sums, differences, products, and quotients when the denominator limit is nonzero.", example: "lim(x²+3x) as x→2 = 10", standard: "AP.CALC.LIM.2", visual: "formula", drills: [
      ["Find lim x→3 of (2x+1).", "7"], ["Find lim x→2 of (x²+3x).", "10"], ["Find lim x→1 of (x³−1)/(x−1).", "3"], ["Direct substitution into a polynomial is valid?", "yes"], ["A quotient limit law requires denominator limit not equal to?", "0"],
    ] },
    { slug: "indeterminate-limits", title: "Resolve 0/0 Limits", goal: "Factor, rationalize, or simplify before evaluating.", key: "The form 0/0 signals that more algebra is needed; simplify the expression for nearby x, then take the limit.", example: "(x²−9)/(x−3)=x+3 nearby, so the limit at 3 is 6", standard: "AP.CALC.LIM.3", visual: "factor", drills: [
      ["lim x→3 (x²−9)/(x−3)?", "6"], ["lim x→2 (x²−4)/(x−2)?", "4"], ["What does 0/0 mean: answer 0 or indeterminate?", "indeterminate"], ["lim x→0 sin x/x?", "1"], ["After canceling a factor for a limit, may x equal the canceled point in the original?", "no"],
    ] },
    { slug: "continuity", title: "Continuity", goal: "Check whether a function is continuous at a point.", key: "Continuity at a requires f(a) exists, lim f(x) exists, and the limit equals f(a).",
      example: "A removable hole can be filled by defining f(a) equal to the limit", standard: "AP.CALC.LIM.4", visual: "curve-line", drills: [
      ["How many conditions define continuity at a point?", "3"], ["If lim f(x)=5 but f(a)=2, continuous at a?", "no"], ["Polynomials are continuous on what domain?", "all real numbers|all reals"], ["A jump discontinuity has matching one-sided limits?", "no"], ["Can redefining one point repair a removable discontinuity?", "yes"],
    ] },
  ]),
  makeRegion(3, "Derivatives", "Measure instantaneous change and build derivative rules.", "AP.CALC.FUN · DIF", [
    { slug: "derivative-meaning", title: "Derivative as Rate and Slope", goal: "Interpret a derivative as instantaneous rate of change.", key: "The derivative f′(a) is the limit of secant slopes and equals the tangent-line slope at x=a.", example: "Position derivative is instantaneous velocity", standard: "AP.CALC.DIF.1", visual: "slope", drills: [
      ["The derivative at a point gives the slope of what line?", "tangent line|the tangent"], ["Derivative of position with respect to time?", "velocity"], ["Average rate uses a secant or tangent line?", "secant"], ["Instantaneous rate uses a secant or tangent line?", "tangent"], ["Units of derivative are output units per what?", "input unit|input units"],
    ] },
    { slug: "basic-derivative-rules", title: "Basic Derivative Rules", goal: "Differentiate powers, sums, and constant multiples.", key: "d/dx[xⁿ]=nx^(n−1); differentiate sums term by term and keep constant factors.", example: "d/dx(3x⁴−2x)=12x³−2", standard: "AP.CALC.DIF.2", visual: "powers", drills: [
      ["Derivative of x⁵?", "5x^4|5x⁴"], ["Derivative of 7x³?", "21x^2|21x²"], ["Derivative of 4x−9?", "4"], ["Derivative of a constant 12?", "0"], ["Derivative of x²+3x?", "2x+3"],
    ] },
    { slug: "product-quotient-rules", title: "Product and Quotient Rules", goal: "Differentiate products and quotients of functions.", key: "Product: (uv)′=u′v+uv′. Quotient: (u/v)′=(u′v−uv′)/v².", example: "d/dx[x²(x+1)]=2x(x+1)+x²", standard: "AP.CALC.DIF.2", visual: "formula", drills: [
      ["Product rule for uv?", "u'v+uv'|u prime v plus u v prime"], ["Derivative of x(x²+1)?", "3x^2+1|3x²+1"], ["Derivative of 1/x?", "-1/x^2|-1/x²"], ["In the quotient rule, what is the denominator?", "v^2|v²"], ["Derivative of x²/x for x≠0?", "1"],
    ] },
    { slug: "chain-rule", title: "The Chain Rule", goal: "Differentiate a function inside another function.", key: "Differentiate the outside while keeping the inside, then multiply by the derivative of the inside.", example: "d/dx(3x+1)⁵=5(3x+1)⁴·3", standard: "AP.CALC.DIF.3", visual: "mapping", drills: [
      ["Derivative of (2x+1)³?", "6(2x+1)^2|6(2x+1)²"], ["Derivative of sin(3x)?", "3cos(3x)"], ["Derivative of e^(5x)?", "5e^(5x)|5e^5x"], ["Derivative of √(x²+1)?", "x/sqrt(x^2+1)|x/√(x²+1)"], ["The chain rule multiplies by the derivative of the?", "inside function|inner function|inside"],
    ] },
  ]),
  makeRegion(4, "Applications of Derivatives", "Use derivatives to understand motion, shape, and optimization.", "AP.CALC.DIF.C–E", [
    { slug: "tangent-lines", title: "Tangent-Line Approximation", goal: "Write a tangent line and use local linearity.", key: "At x=a, tangent line is L(x)=f(a)+f′(a)(x−a).",
      example: "For f=x² at a=2, L(x)=4+4(x−2)", standard: "AP.CALC.DIF.4", visual: "line-graph", drills: [
      ["For f=x² at x=3, tangent slope?", "6"], ["For f=x² at x=2, tangent line?", "y=4x-4|y-4=4(x-2)"], ["A tangent-line approximation is best near or far from a?", "near"], ["L(a) equals what function value?", "f(a)"], ["If f′(a)=0, tangent line is?", "horizontal"],
    ] },
    { slug: "motion", title: "Motion with Derivatives", goal: "Connect position, velocity, acceleration, and direction.", key: "Velocity is s′(t), acceleration is v′(t)=s″(t), and speed is |v(t)|.", example: "s=t²−4t gives v=2t−4 and a=2", standard: "AP.CALC.DIF.4", visual: "curve-line", drills: [
      ["If s=t³, velocity?", "3t^2|3t²"], ["If v=4t−6, acceleration?", "4"], ["If velocity is negative, motion is in which direction?", "negative direction|backward|left"], ["Speed equals what expression?", "absolute value of velocity|magnitude of velocity"], ["At rest means velocity equals?", "0"],
    ] },
    { slug: "increasing-extrema-concavity", title: "Shape from Derivatives", goal: "Use derivative signs to describe a graph.", key: "f′>0 means increasing; f′ changes + to − at a local maximum; f″>0 means concave up.", example: "f′ changes negative to positive at a local minimum", standard: "AP.CALC.DIF.5", visual: "curve-line", drills: [
      ["If f′>0, f is?", "increasing"], ["If f′<0, f is?", "decreasing"], ["f′ changes + to − at a local?", "maximum|max"], ["f′ changes − to + at a local?", "minimum|min"], ["If f″>0, the graph is concave?", "up"],
    ] },
    { slug: "optimization", title: "Optimization", goal: "Maximize or minimize a quantity under constraints.", key: "Write the objective in one variable, find critical points and endpoints, then interpret the best feasible value.", example: "A fixed-perimeter rectangle has maximum area when it is a square", standard: "AP.CALC.DIF.5", visual: "area-model", drills: [
      ["A rectangle with perimeter 20 has maximum area at what dimensions?", "5 by 5|5x5"], ["Critical points occur where f′=0 or f′ is?", "undefined"], ["Must endpoints be checked on a closed interval?", "yes"], ["The quantity to maximize or minimize is the?", "objective function|objective"], ["Constraints reduce the model to how many main variables when possible?", "1|one"],
    ] },
  ]),
  makeRegion(5, "Integrals", "Accumulate change and connect area with antiderivatives.", "AP.CALC.INT", [
    { slug: "antiderivatives", title: "Antiderivatives", goal: "Reverse basic derivative rules.", key: "For n≠−1, ∫xⁿdx=x^(n+1)/(n+1)+C; include +C for an indefinite integral.", example: "∫3x²dx=x³+C", standard: "AP.CALC.INT.1", visual: "powers", drills: [
      ["Find ∫x² dx.", "x^3/3+C|x³/3+C"], ["Find ∫4x³ dx.", "x^4+C|x⁴+C"], ["Find ∫5 dx.", "5x+C"], ["Why include +C?", "constant of integration|all constants have derivative zero"], ["An antiderivative of 2x is?", "x^2+C|x²+C"],
    ] },
    { slug: "definite-integrals", title: "Definite Integrals and Area", goal: "Interpret net signed area and accumulated change.", key: "A definite integral adds signed slices: area above the axis is positive and below is negative.", example: "∫₀² x dx=2", standard: "AP.CALC.INT.2", visual: "area", drills: [
      ["Find ∫₀² x dx.", "2"], ["Find ∫₀³ 2 dx.", "6"], ["Area below the x-axis contributes what sign?", "negative"], ["A definite integral always equals geometric area without sign?", "no"], ["Units of ∫ velocity dt are units of?", "position|distance|displacement"],
    ] },
    { slug: "fundamental-theorem", title: "Fundamental Theorem of Calculus", goal: "Connect definite integrals and derivatives.", key: "If F′=f, then ∫ₐᵇf(x)dx=F(b)−F(a); differentiating an accumulation function returns its integrand.", example: "∫₁³2x dx=[x²]₁³=8", standard: "AP.CALC.INT.3", visual: "formula", drills: [
      ["Find ∫₁³ 2x dx.", "8"], ["If F′=f, ∫ₐᵇf equals?", "F(b)-F(a)"], ["d/dx of ∫₀ˣ t²dt?", "x^2|x²"], ["Find ∫₀¹ 3x²dx.", "1"], ["The theorem links differentiation with what operation?", "integration"],
    ] },
    { slug: "integral-applications", title: "Applications of Integrals", goal: "Use accumulation for displacement, area, and average value.", key: "Choose the quantity being accumulated, keep units, and use average value (1/(b−a))∫ₐᵇf.", example: "Average of f(x)=x on [0,4] is 2", standard: "AP.CALC.INT.4", visual: "area", drills: [
      ["Average value of f(x)=x on [0,4]?", "2"], ["Integrating a rate over time gives?", "total change|accumulated change"], ["Displacement uses integral of what?", "velocity"], ["Total distance may require integrating what?", "speed|absolute value of velocity"], ["Area between curves uses top minus?", "bottom"],
    ] },
  ]),
  makeRegion(6, "Vectors, Parametric, and Polar", "Represent motion and curves beyond y=f(x).", "HSN.VM · Precalculus", [
    { slug: "vector-dot-product", title: "Dot Product and Angles", goal: "Measure alignment and test perpendicularity.", key: "a·b=a₁b₁+a₂b₂=|a||b|cos θ; a zero dot product means perpendicular nonzero vectors.", example: "⟨1,2⟩·⟨2,−1⟩=0", standard: "HSN.VM.B.4", visual: "coordinate", drills: [
      ["⟨3,4⟩·⟨2,1⟩?", "10"], ["⟨1,2⟩·⟨2,−1⟩?", "0"], ["Zero dot product means vectors are?", "perpendicular|orthogonal"], ["Dot product of ⟨a,b⟩ with itself?", "a^2+b^2|a²+b²"], ["Positive dot product suggests an acute or obtuse angle?", "acute"],
    ] },
    { slug: "parametric-equations", title: "Parametric Equations", goal: "Describe x and y through a shared parameter.", key: "A parametric curve gives x(t) and y(t); eliminate t when possible and track direction as t increases.", example: "x=t, y=2t+1 traces y=2x+1", standard: "Precalculus · PAR", visual: "curve-line", drills: [
      ["x=t, y=3t−2. Eliminate t.", "y=3x-2"], ["x=2t, y=t². Eliminate t.", "y=x^2/4|y=x²/4"], ["At t=3 for x=t+1,y=2t, point?", "(4,6)|4,6"], ["The parameter is usually written as?", "t"], ["Parametric equations can show direction along a curve?", "yes"],
    ] },
    { slug: "polar-coordinates", title: "Polar Coordinates", goal: "Locate points by radius and angle.", key: "Polar (r,θ) converts by x=r cos θ and y=r sin θ; multiple polar pairs can name the same point.", example: "(2,π/2) polar becomes (0,2)", standard: "Precalculus · POL", visual: "circle", drills: [
      ["Convert polar (3,0) to Cartesian.", "(3,0)|3,0"], ["Convert polar (2,π/2) to Cartesian.", "(0,2)|0,2"], ["Formula for x from polar?", "x=r cos(theta)|x=r cos θ"], ["Formula for y from polar?", "y=r sin(theta)|y=r sin θ"], ["Cartesian (−2,0) can be polar with r=2 and θ=?", "pi|π"],
    ] },
    { slug: "complex-plane", title: "Complex Numbers in the Plane", goal: "Use magnitude and angle to represent complex numbers.", key: "a+bi corresponds to (a,b); modulus is √(a²+b²), and multiplication adds arguments in polar form.", example: "3+4i has modulus 5", standard: "HSN.CN.B.4–5", visual: "coordinate", drills: [
      ["Plot 2−3i as what ordered pair?", "(2,-3)|2,−3"], ["Modulus of 3+4i?", "5"], ["Conjugate of 5−2i?", "5+2i"], ["i² equals?", "-1"], ["Multiply i·i.", "-1"],
    ] },
  ]),
  makeRegion(7, "Probability Distributions", "Model random variables, expected value, and sampling behavior.", "HSS.MD · HSS.IC", [
    { slug: "random-variables", title: "Random Variables", goal: "Assign numerical values and probabilities to outcomes.", key: "A discrete random variable has countable values whose probabilities are nonnegative and sum to 1.", example: "X=number of heads in two flips takes 0,1,2", standard: "HSS.MD.A.1–2", visual: "probability", drills: [
      ["Possible X=#heads in two flips?", "0,1,2"], ["Probabilities in a distribution must sum to?", "1"], ["Can a probability be negative?", "no"], ["Is height usually discrete or continuous?", "continuous"], ["Number of messages received is discrete or continuous?", "discrete"],
    ] },
    { slug: "expected-value", title: "Expected Value", goal: "Find a long-run average payoff or outcome.", key: "Expected value E(X)=ΣxP(x); it is a long-run mean and need not be a possible single outcome.", example: "Win $4 with P=.25, else $0 → E=$1", standard: "HSS.MD.A.2 · B.5", visual: "table", drills: [
      ["Win $10 with P=0.2, else $0. Expected value?", "2|$2"], ["X=1 with P=.5, X=3 with P=.5. E(X)?", "2"], ["Must expected value be a possible outcome?", "no"], ["A fair game has expected net value?", "0"], ["Expected value is best interpreted over one play or many plays?", "many plays|long run"],
    ] },
    { slug: "binomial-distribution", title: "Binomial Distribution", goal: "Model a fixed number of independent success/failure trials.", key: "Binomial conditions: fixed n, independent trials, two outcomes, constant p; P(X=k)=C(n,k)p^k(1−p)^(n−k).",
      example: "For n=3,p=.5, P(exactly 2)=3/8", standard: "HSS.MD.A.3–4", visual: "trials", drills: [
      ["Three fair flips: P(exactly 2 heads)?", "3/8|0.375"], ["Binomial trials need a constant what?", "probability of success|p"], ["Binomial trials have how many outcomes per trial?", "2|two"], ["Mean of Binomial(n,p)?", "np|n*p"], ["For n=20,p=.3, mean?", "6"],
    ] },
    { slug: "sampling-distributions", title: "Sampling Distributions", goal: "Understand how sample statistics vary across samples.", key: "Sample means center at the population mean; their standard error shrinks like 1/√n, and large samples often yield an approximately normal distribution.", example: "Quadrupling n halves the standard error", standard: "HSS.IC.A.1–2", visual: "data-line", drills: [
      ["Sample means center around the population?", "mean"], ["Increasing sample size makes standard error larger or smaller?", "smaller"], ["Quadrupling sample size changes standard error by factor?", "1/2|0.5"], ["The Central Limit Theorem concerns the distribution of sample?", "means|sample means"], ["A statistic varies from sample to sample?", "yes"],
    ] },
    { slug: "decision-strategies", title: "Expected Value and Decision Strategies", goal: "Compare repeated strategies by combining outcomes, probabilities, costs, and limits.", key: "Expected value ranks long-run averages, but a sound decision also states risk, assumptions, and whether the model fits a one-time or repeated choice.", example: "A sure $5 has EV $5; a 20% chance of $20 has EV $4, so the sure option has the higher long-run value", steps: ["Compute the sure option: 1.00 × $5 = $5 expected value.", "Compute the risky option: 0.20 × $20 + 0.80 × $0 = $4 expected value.", "For repeated choices the sure option has the higher long-run value; for one high-stakes choice, state risk as well."], standard: "HSS.MD.B.5–7", visual: "decision-table", drills: [
      ["Option A pays $5 for sure. Option B pays $20 with probability 0.2 and $0 otherwise. Which has higher expected value?", "Option A", ["Option A", "Option B", "they are equal", "not enough information"]],
      ["A game costs $3 and pays $12 with probability 0.25. What is the expected net value?", "$0", ["−$3", "$0", "$3", "$9"]],
      ["Which statement best describes expected value?", "a long-run average across repeated trials", ["a long-run average across repeated trials", "the guaranteed result of one trial", "the largest possible prize", "the probability of losing"]],
      ["Two strategies have the same expected value, but one has much wider outcomes. What differs?", "risk", ["risk", "expected value", "sample-space size only", "the definition of probability"]],
      ["When is expected value alone least sufficient?", "a one-time high-stakes decision", ["a one-time high-stakes decision", "many low-stakes repeated trials", "comparing fair coins", "checking probabilities sum to 1"]],
    ] },
  ]),
  makeRegion(8, "Inference, Finance, and Discrete Models", "Make evidence-based decisions and plan quantitative futures.", "HSS.IC · HSF.LE · Discrete math", [
    { slug: "hypothesis-testing", title: "Hypothesis Testing", goal: "Compare observed evidence with a null model.", key: "A small p-value means the observed result would be unusual if the null hypothesis were true; it is not the probability that the null is true.", example: "p=.02 gives evidence against the null at α=.05", standard: "HSS.IC.A–B", visual: "estimate", drills: [
      ["If p=.02 and α=.05, reject the null?", "yes"], ["If p=.20 and α=.05, reject the null?", "no"], ["A p-value is computed assuming which hypothesis?", "null hypothesis|the null"], ["Does p=.03 mean a 3% chance the null is true?", "no"], ["Smaller p-values give stronger evidence against the?", "null hypothesis|null"],
    ] },
    { slug: "compound-interest", title: "Compound Interest", goal: "Model growth under periodic or continuous compounding.", key: "Periodic: A=P(1+r/n)^(nt). Continuous: A=Pe^(rt). Match rate and time units.", example: "$1000 at 6% annually for 2 years → 1000(1.06)²", standard: "HSF.LE.B.5", visual: "growth", drills: [
      ["Write annual-compound model for $500 at 4% for t years.", "500(1.04)^t|A=500(1.04)^t"], ["In A=P(1+r/n)^(nt), what is P?", "principal|initial amount"], ["Monthly compounding has n=?", "12"], ["Continuous compounding uses what constant?", "e"], ["At positive rate, compound interest is linear or exponential?", "exponential"],
    ] },
    { slug: "loans-and-annuities", title: "Loans and Annuities", goal: "Interpret recurring payments, balances, and total cost.", key: "Separate principal, interest, payment timing, and number of periods; compare total paid with amount borrowed.", example: "$250 monthly for 48 months totals $12,000 before other fees", standard: "Financial literacy · FIN", visual: "table", drills: [
      ["$300 monthly for 24 months totals?", "7200|$7,200"], ["Borrow $10,000 and repay $12,400. Total interest?", "2400|$2,400"], ["A lower interest rate generally lowers total loan cost?", "yes"], ["An annuity is a sequence of what kind of payments?", "regular|equal periodic"], ["Should APR and fees both be compared?", "yes"],
    ] },
    { slug: "networks-and-algorithms", title: "Networks and Algorithms", goal: "Use graphs, paths, and step-by-step rules to solve discrete problems.", key: "A network has vertices and edges; an algorithm is a finite, precise procedure whose correctness and efficiency can be analyzed.", example: "A shortest-path algorithm finds the least-cost route through a network", standard: "Discrete math · NET", visual: "tree", drills: [
      ["Points in a network are called?", "vertices|nodes"], ["Connections in a network are called?", "edges"], ["A route that uses each edge exactly once is an Euler what?", "path|trail"], ["A finite precise procedure is an?", "algorithm"], ["Shortest-path problems minimize total what?", "weight|cost|distance"],
    ] },
  ]),
];
