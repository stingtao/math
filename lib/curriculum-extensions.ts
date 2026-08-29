import type { Accent, LessonDefinition, PracticeQuestion, RegionDefinition } from "./curriculum.ts";
import { buildPracticeQuestion } from "./question-interactions.ts";

type Grade = LessonDefinition["grade"];
type Drill = [prompt: string, answer: string, choices?: string[]];

type CoverageLesson = {
  grade: Grade;
  regionOrder: number;
  slug: string;
  title: string;
  goal: string;
  keyIdea: string;
  example: string;
  exampleSteps: string[];
  standard: string;
  visual: string;
  drills: Drill[];
};

const accents: Accent[] = ["blue", "teal", "coral", "violet", "gold"];

const coverageLessons: CoverageLesson[] = [
  {
    grade: 7,
    regionOrder: 4,
    slug: "percent-decision-chains",
    title: "Multi-Step Percent Decisions",
    goal: "Compare plans that apply several percent changes.",
    keyIdea: "Apply each percent to the amount at that step; successive percents do not simply add.",
    example: "$100 with 20% off, then 8% tax → $80 × 1.08 = $86.40",
    exampleSteps: ["Apply the discount to the original price.", "Use the discounted price as the new base for tax.", "Compare final prices, not isolated percentages."],
    standard: "7.RP.A.3 · MYP modeling",
    visual: "percent-grid",
    drills: [
      ["A $100 jacket is 20% off, then taxed 8%. Final price?", "86.4|$86.40"],
      ["A value rises 10%, then falls 10%. Is it back at the start?", "no", ["yes", "no"]],
      ["Plan A is $50 with 10% off. Plan B is $44 plus a $2 fee. Which is cheaper?", "Plan A", ["Plan A", "Plan B", "same price", "not enough information"]],
      ["A $200 device is marked up 25%, then discounted 20%. Final price?", "200|$200"],
      ["Order the steps for a discount-and-tax decision.", "Find the discount → Subtract it from the original → Find tax on the sale price → Add the tax → Compare final prices", ["Compare final prices", "Find tax on the sale price", "Find the discount", "Add the tax", "Subtract it from the original"]],
    ],
  },
  {
    grade: 8,
    regionOrder: 10,
    slug: "composed-transformations",
    title: "Sequences of Transformations",
    goal: "Track a figure through more than one transformation.",
    keyIdea: "Transformation order matters; update every point after each move before applying the next rule.",
    example: "Reflect (2,1) over the y-axis, then move right 5 → (3,1)",
    exampleSteps: ["Apply the first rule to every coordinate.", "Use that image as the input to the next rule.", "Check which lengths, angles, and orientation stayed fixed."],
    standard: "8.G.A.1–4 · MYP spatial reasoning",
    visual: "coordinate-transform",
    drills: [
      ["Reflect (2,1) over the y-axis, then translate right 5. Final point?", "(3,1)|3,1"],
      ["Rotate (1,3) 180° about the origin, then move up 2. Final point?", "(-1,-1)|(−1,−1)"],
      ["Does a reflection followed by a translation preserve lengths?", "yes", ["yes", "no"]],
      ["Which sequence can reverse orientation?", "reflection then translation", ["translation then rotation", "rotation then translation", "reflection then translation", "two translations"]],
      ["Order the work for a transformation sequence.", "Copy the original coordinates → Apply the first rule → Record the image → Apply the next rule → Check the final figure", ["Apply the next rule", "Check the final figure", "Apply the first rule", "Copy the original coordinates", "Record the image"]],
    ],
  },
  {
    grade: 9,
    regionOrder: 4,
    slug: "linear-quadratic-systems",
    title: "Linear–Quadratic Systems",
    goal: "Find where a line and parabola meet.",
    keyIdea: "Substitute the line expression into the quadratic, solve for every x-value, then recover each matching y-value.",
    example: "y=x+2 and y=x² meet where x²=x+2 → x=−1 or 2",
    exampleSteps: ["Set the two expressions for y equal.", "Solve the resulting quadratic equation.", "Substitute each x back to get both intersection points."],
    standard: "HSA.REI.C.7 · NY Algebra I",
    visual: "systems",
    drills: [
      ["For y=x+2 and y=x², which equation finds the intersection x-values?", "x²=x+2", ["x²=x+2", "x²=x−2", "x+2=0", "x²+2=0"]],
      ["Solve the intersection equation x²=x+2 for x.", "-1,2|2,-1"],
      ["How many intersections can a line and parabola have?", "0, 1, or 2", ["exactly 1", "0 or 1", "0, 1, or 2", "always 2"]],
      ["Does y=0 intersect y=x²+1 over the real numbers?", "no", ["yes", "no"]],
      ["Order a substitution solution.", "Choose one equation for y → Substitute into the other equation → Solve the quadratic → Find each matching y-value → Check both ordered pairs", ["Check both ordered pairs", "Solve the quadratic", "Choose one equation for y", "Find each matching y-value", "Substitute into the other equation"]],
    ],
  },
  {
    grade: 10,
    regionOrder: 5,
    slug: "circle-theorem-proofs",
    title: "Prove Circle Theorems",
    goal: "Explain why angle, chord, and tangent relationships work.",
    keyIdea: "Connect radii, isosceles triangles, and intercepted arcs in a short chain of justified statements.",
    example: "A radius to a tangent point is perpendicular to the tangent line",
    exampleSteps: ["Name the given radius or equal radii.", "Use a triangle or arc relationship to establish the needed angle.", "State the circle theorem with a complete geometric reason."],
    standard: "HSG.C.A.1–4 · IB proof",
    visual: "circle",
    drills: [
      ["Why are two radii in the same circle congruent?", "definition of a circle", ["definition of a circle", "vertical angles", "parallel lines", "alternate interior angles"]],
      ["An angle inscribed in a semicircle is what type?", "right angle", ["acute", "right angle", "obtuse", "reflex"]],
      ["A tangent and radius at the point of tangency form what angle?", "90°|90|right angle"],
      ["Congruent chords in one circle intercept arcs that are?", "congruent|equal"],
      ["Order a circle-proof chain.", "Mark equal radii → Identify an isosceles triangle → Match its base angles → Use the angle sum → State the circle conclusion", ["Use the angle sum", "State the circle conclusion", "Identify an isosceles triangle", "Mark equal radii", "Match its base angles"]],
    ],
  },
  {
    grade: 11,
    regionOrder: 2,
    slug: "rational-function-models",
    title: "Rational Function Models",
    goal: "Use reciprocal behavior to model rates and constraints.",
    keyIdea: "Restrictions come from the context and denominator; intercepts and asymptotes describe what the model can approach or reach.",
    example: "Time for a fixed trip is t=120/v, with v>0",
    exampleSteps: ["Define the input and its allowed values.", "Build the numerator and denominator from the rate relationship.", "Interpret asymptotes and check the result in context."],
    standard: "HSF.IF.C.7d · HSF.BF.A · IB functions",
    visual: "curve-line",
    drills: [
      ["For t=120/v, what value of v is excluded?", "0"],
      ["If speed doubles for a fixed distance, travel time is multiplied by?", "1/2|0.5"],
      ["In y=1/(x−3), the vertical asymptote is?", "x=3"],
      ["Can a real-world rational model use every algebraically allowed input?", "no", ["yes", "no"]],
      ["Order a rational-model analysis.", "Define the quantities → State domain restrictions → Build the rational rule → Find key graph features → Interpret and check", ["Build the rational rule", "Interpret and check", "Define the quantities", "Find key graph features", "State domain restrictions"]],
    ],
  },
  {
    grade: 11,
    regionOrder: 5,
    slug: "inverse-trigonometric-functions",
    title: "Inverse Trigonometric Functions",
    goal: "Recover an angle from a trigonometric ratio.",
    keyIdea: "Inverse trig returns a principal angle; use the unit circle and the requested interval to find any additional solutions.",
    example: "arcsin(1/2)=π/6, while sin θ=1/2 on [0,2π) also has θ=5π/6",
    exampleSteps: ["Identify the trig ratio and reference angle.", "Use the inverse function for the principal value.", "Use signs and the interval to list every required solution."],
    standard: "HSF.TF.B–C · Precalculus · IB AA",
    visual: "circle",
    drills: [
      ["Find arcsin(1/2) in its principal range.", "pi/6|π/6|30°|30"],
      ["Find arctan(1) in its principal range.", "pi/4|π/4|45°|45"],
      ["Does arcsin(sin θ) equal θ for every real θ?", "no", ["yes", "no"]],
      ["Solve cos θ=0 on [0,2π).", "pi/2,3pi/2|π/2,3π/2"],
      ["Order an inverse-trig solution.", "Identify the ratio → Find the reference angle → Check the sign → Choose quadrants in the interval → Verify every angle", ["Verify every angle", "Find the reference angle", "Choose quadrants in the interval", "Identify the ratio", "Check the sign"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 3,
    slug: "implicit-differentiation",
    title: "Implicit and Inverse Differentiation",
    goal: "Differentiate relationships that do not isolate y.",
    keyIdea: "Differentiate both sides with respect to x, attach y′ to every differentiated y-term, then solve for y′.",
    example: "x²+y²=25 → 2x+2yy′=0 → y′=−x/y",
    exampleSteps: ["Differentiate every term with respect to x.", "Use the chain rule on terms containing y.", "Collect y′ terms and solve, then evaluate if a point is given."],
    standard: "AP Calculus AB Unit 3",
    visual: "formula",
    drills: [
      ["For x²+y²=25, find dy/dx.", "-x/y|−x/y"],
      ["When differentiating y³ with respect to x, the result is?", "3y²y'|3y^2y'"],
      ["For xy=6, find dy/dx.", "-y/x|−y/x"],
      ["At (3,4) on x²+y²=25, tangent slope?", "-3/4|-0.75"],
      ["Order implicit differentiation.", "Differentiate both sides → Apply chain and product rules → Collect every y′ term → Solve for y′ → Substitute the point", ["Substitute the point", "Collect every y′ term", "Differentiate both sides", "Solve for y′", "Apply chain and product rules"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 4,
    slug: "related-rates",
    title: "Related Rates",
    goal: "Connect quantities that change together over time.",
    keyIdea: "Write one relationship before differentiating with respect to time, then substitute values with their units and signs.",
    example: "A circle with dr/dt=2 has dA/dt=2πr·2=4πr",
    exampleSteps: ["Draw and label changing quantities.", "Write an equation relating them before inserting numbers.", "Differentiate with respect to time and solve for the requested rate."],
    standard: "AP Calculus AB Unit 4",
    visual: "formula",
    drills: [
      ["If A=πr², what is dA/dt?", "2pi r dr/dt|2πr dr/dt"],
      ["A radius grows at 2 cm/s. When r=3, find dA/dt.", "12pi|12π"],
      ["Should changing values usually be substituted before or after differentiating?", "after", ["before", "after"]],
      ["A falling height has a positive or negative dh/dt?", "negative", ["positive", "negative"]],
      ["Order a related-rates model.", "Draw and label variables → Write one relationship → Differentiate with respect to time → Substitute current values → Solve with units and signs", ["Substitute current values", "Solve with units and signs", "Write one relationship", "Draw and label variables", "Differentiate with respect to time"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 5,
    slug: "numerical-integration",
    title: "Numerical Integration",
    goal: "Estimate accumulation from tables and graphs.",
    keyIdea: "Left, right, midpoint, and trapezoidal sums approximate signed area using widths and sampled heights.",
    example: "On [0,2] with two equal intervals, the trapezoidal sum is (1/2)(f(0)+2f(1)+f(2))",
    exampleSteps: ["Partition the interval and find every width.", "Choose the required left, right, midpoint, or trapezoid height.", "Add signed slice estimates and keep units."],
    standard: "AP Calculus AB Unit 6",
    visual: "area",
    drills: [
      ["Two equal subintervals cover [0,6]. What is each width?", "3"],
      ["For one interval of width 2 with endpoint heights 3 and 5, trapezoid area?", "8"],
      ["A midpoint sum samples the function at which points?", "midpoints|the midpoints"],
      ["Can a numerical integral estimate total change from a rate table?", "yes", ["yes", "no"]],
      ["Order a numerical integral.", "Partition the interval → Find each width → Select sample points → Multiply widths by heights → Add signed contributions", ["Add signed contributions", "Select sample points", "Partition the interval", "Multiply widths by heights", "Find each width"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 5,
    slug: "differential-equations",
    title: "Differential Equations",
    goal: "Model change with slope fields and separable equations.",
    keyIdea: "A differential equation specifies a rate; use an initial condition to select one solution from a family.",
    example: "dy/dx=2x and y(0)=3 → y=x²+3",
    exampleSteps: ["Interpret the rate rule or slope field.", "Separate and integrate when possible.", "Use the initial condition, then check by differentiation."],
    standard: "AP Calculus AB Unit 7",
    visual: "curve-line",
    drills: [
      ["Solve dy/dx=2x in general form.", "y=x²+C|x²+C"],
      ["For dy/dx=2x and y(0)=3, find y.", "y=x²+3|x²+3"],
      ["What does a slope-field segment show?", "local slope|the local slope"],
      ["An initial condition determines the value of what constant?", "C|constant of integration"],
      ["Order a separable-equation solution.", "Separate the variables → Integrate both sides → Include the constant → Apply the initial condition → Differentiate to check", ["Differentiate to check", "Apply the initial condition", "Integrate both sides", "Separate the variables", "Include the constant"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 5,
    slug: "infinite-series",
    title: "Infinite Sequences and Series",
    goal: "Decide whether an infinite sum converges and estimate it.",
    keyIdea: "A series can converge only if its terms approach zero; choose a convergence test that matches its structure.",
    example: "1+1/2+1/4+… converges to 2",
    exampleSteps: ["Check whether terms approach zero.", "Recognize geometric, p-series, alternating, or comparable structure.", "Apply a valid test and state convergence or divergence."],
    standard: "AP Calculus BC Unit 10",
    visual: "sequence",
    drills: [
      ["Find 1+1/2+1/4+…", "2"],
      ["A geometric series with |r|<1 converges or diverges?", "converges", ["converges", "diverges"]],
      ["If series terms do not approach 0, the series must?", "diverge"],
      ["Does the harmonic series 1+1/2+1/3+… converge?", "no|diverges", ["yes", "no"]],
      ["Order a convergence check.", "Write the general term → Test whether terms approach zero → Identify the series structure → Apply a matching test → State and justify the conclusion", ["Apply a matching test", "State and justify the conclusion", "Test whether terms approach zero", "Write the general term", "Identify the series structure"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 6,
    slug: "parametric-polar-calculus",
    title: "Parametric and Polar Calculus",
    goal: "Differentiate and accumulate along non-Cartesian curves.",
    keyIdea: "For parametric curves dy/dx=(dy/dt)/(dx/dt); polar area uses one half the integral of r².",
    example: "x=t², y=t³ → dy/dx=3t²/(2t)=3t/2",
    exampleSteps: ["Identify the parameter or polar radius.", "Differentiate or integrate with the matching formula.", "Interpret direction, slope, speed, or area on the curve."],
    standard: "AP Calculus BC Unit 9",
    visual: "curve-line",
    drills: [
      ["For x=t² and y=t³, find dy/dx for t≠0.", "3t/2|1.5t"],
      ["For x=cos t and y=sin t, speed is?", "1"],
      ["Polar area uses one half the integral of what?", "r²|r^2"],
      ["If dx/dt=0 and dy/dt≠0, the parametric tangent is usually?", "vertical"],
      ["Order a parametric-slope calculation.", "Differentiate x with respect to t → Differentiate y with respect to t → Form (dy/dt)/(dx/dt) → Simplify → Evaluate at the parameter", ["Evaluate at the parameter", "Differentiate y with respect to t", "Simplify", "Differentiate x with respect to t", "Form (dy/dt)/(dx/dt)"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 7,
    slug: "study-design",
    title: "Study Design and Data Collection",
    goal: "Match sampling and experiments to the claim being made.",
    keyIdea: "Random sampling supports population generalization; random assignment supports cause-and-effect conclusions.",
    example: "Randomly sample students to estimate preference; randomly assign treatments to test causation",
    exampleSteps: ["Name the population and response variable.", "Choose random sampling, random assignment, or both for the claim.", "Identify bias, confounding, and the limits of the conclusion."],
    standard: "AP Statistics Unit 2 · HSS.IC.B.3",
    visual: "sample",
    drills: [
      ["Which supports a cause-and-effect conclusion?", "random assignment", ["random sampling", "random assignment", "a large graph", "voluntary response"]],
      ["Which supports generalizing from a sample to a population?", "random sampling", ["random sampling", "random assignment only", "convenience sampling", "no response"]],
      ["A variable related to both treatment and response may be a?", "confounder|confounding variable"],
      ["Is a voluntary online poll likely to have selection bias?", "yes", ["yes", "no"]],
      ["Order a study-design review.", "State the research question → Define population and variables → Choose sampling and assignment → Identify bias or confounding → Limit the conclusion", ["Identify bias or confounding", "Limit the conclusion", "Choose sampling and assignment", "State the research question", "Define population and variables"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 8,
    slug: "inference-for-proportions",
    title: "Inference for Proportions",
    goal: "Estimate and test population proportions.",
    keyIdea: "Use the correct standard error, verify independence and success-failure conditions, then interpret the interval or test in context.",
    example: "A 95% confidence interval gives plausible values for the population proportion, not individual outcomes",
    exampleSteps: ["Identify one proportion, two proportions, or paired data.", "Check randomization, independence, and large-count conditions.", "Calculate and interpret the interval or p-value in context."],
    standard: "AP Statistics Unit 5 · HSS.IC.B.4–6",
    visual: "estimate",
    drills: [
      ["A sample has 72 successes out of 120. What is p-hat?", "0.6|60%"],
      ["A confidence interval estimates a sample or population parameter?", "population parameter", ["sample statistic", "population parameter"]],
      ["Does 95% confidence mean a 95% chance this fixed interval contains p after it is computed?", "no", ["yes", "no"]],
      ["A two-proportion procedure compares what?", "two population proportions|population proportions"],
      ["Order a proportion inference.", "Name the parameter → Check conditions → Calculate the statistic and standard error → Build the interval or test → Interpret in context", ["Interpret in context", "Calculate the statistic and standard error", "Name the parameter", "Build the interval or test", "Check conditions"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 8,
    slug: "inference-for-means",
    title: "Inference for Means",
    goal: "Estimate and test population means with t-procedures.",
    keyIdea: "Use a t-distribution when population standard deviation is unknown, with procedure choice driven by one sample, paired data, or two independent groups.",
    example: "Before-and-after measurements on the same people use a paired t-procedure on differences",
    exampleSteps: ["Identify the mean parameter and data structure.", "Check randomization, independence, and distribution conditions.", "Use the matching t-procedure and interpret the result."],
    standard: "AP Statistics Unit 5 · HSS.IC.B.4–6",
    visual: "data-line",
    drills: [
      ["Before-and-after measurements on the same people are paired or independent?", "paired", ["paired", "independent"]],
      ["When population σ is unknown, mean inference usually uses which distribution?", "t|t-distribution"],
      ["For a one-sample t procedure, degrees of freedom are usually?", "n-1|n−1"],
      ["A smaller standard error makes an interval wider or narrower?", "narrower", ["wider", "narrower"]],
      ["Order a mean inference.", "Name the mean parameter → Identify one-sample paired or two-sample data → Check conditions → Calculate the t result → Interpret in context", ["Calculate the t result", "Check conditions", "Interpret in context", "Name the mean parameter", "Identify one-sample paired or two-sample data"]],
    ],
  },
  {
    grade: 12,
    regionOrder: 8,
    slug: "regression-inference",
    title: "Regression Inference",
    goal: "Test and estimate a population linear relationship.",
    keyIdea: "Inference for slope requires a linear model with independent observations, roughly constant residual spread, and approximately normal residuals.",
    example: "A slope interval entirely above zero supports a positive population association",
    exampleSteps: ["Define the population slope in context.", "Check linearity, independence, residual normality, and equal spread.", "Use the slope estimate and standard error to test or build an interval."],
    standard: "AP Statistics Unit 5 · HSS.ID.C.9",
    visual: "scatter",
    drills: [
      ["In regression inference, the main parameter is the population?", "slope"],
      ["Residual spread should be roughly constant across x?", "yes", ["yes", "no"]],
      ["A slope confidence interval entirely above 0 supports what direction?", "positive", ["positive", "negative", "no linear", "causal"]],
      ["Does a significant slope alone prove causation?", "no", ["yes", "no"]],
      ["Order a regression inference.", "Define the population slope → Inspect scatterplot and residuals → Check model conditions → Calculate the slope test or interval → Interpret association without claiming causation", ["Check model conditions", "Interpret association without claiming causation", "Define the population slope", "Calculate the slope test or interval", "Inspect scatterplot and residuals"]],
    ],
  },
];

function buildLesson(region: RegionDefinition, spec: CoverageLesson): LessonDefinition {
  const order = region.lessons.length + 1;
  const practice: PracticeQuestion[] = spec.drills.map(([prompt, answer, choices], index) => buildPracticeQuestion({
    id: `q${index + 1}`,
    prompt,
    answer,
    choices,
    hint: spec.keyIdea,
  }));

  return {
    id: `g${spec.grade}-r${region.id}-l${order}`,
    grade: spec.grade,
    slug: `g${spec.grade}-${spec.slug}`,
    regionId: region.id,
    order,
    title: spec.title,
    goal: spec.goal,
    keyIdea: spec.keyIdea,
    example: spec.example,
    exampleSteps: spec.exampleSteps,
    standard: spec.standard,
    accent: accents[(region.order + order - 2) % accents.length],
    visual: spec.visual,
    practice,
  };
}

export function applyCoverageExtensions(regions: RegionDefinition[]): RegionDefinition[] {
  return regions.map((region) => {
    const additions = coverageLessons.filter((lesson) => lesson.grade === region.grade && lesson.regionOrder === region.order);
    if (!additions.length) return region;

    let lessons = [...region.lessons];
    for (const addition of additions) {
      const currentRegion = { ...region, lessons };
      lessons = [...lessons, buildLesson(currentRegion, addition)];
    }
    return { ...region, lessons };
  });
}

export const expandedCoverageLessonSlugs = coverageLessons.map(({ grade, slug }) => `g${grade}-${slug}`);
