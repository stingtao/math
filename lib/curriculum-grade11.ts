import type { Accent, LessonDefinition, PracticeQuestion, RegionDefinition } from "./curriculum.ts";
import { buildPracticeQuestion } from "./question-interactions.ts";

type Drill = [prompt: string, answer: string, choices?: string[]];
type LessonSpec = { slug: string; title: string; goal: string; key: string; example: string; steps?: string[]; standard: string; visual: string; drills: Drill[] };
const accents: Accent[] = ["violet", "blue", "gold", "teal", "coral"];

function makeLesson(regionId: number, order: number, accent: Accent, spec: LessonSpec): LessonDefinition {
  const practice: PracticeQuestion[] = spec.drills.map(([prompt, answer, choices], index) => buildPracticeQuestion({ id: `q${index + 1}`, prompt, answer, choices, hint: spec.key }));
  return { id: `g11-r${regionId}-l${order}`, grade: 11, slug: `g11-${spec.slug}`, regionId, order, title: spec.title, goal: spec.goal, keyIdea: spec.key, example: spec.example, exampleSteps: spec.steps ?? ["Identify the function family or structure.", spec.key, `Verify with the original relationship: ${spec.example}.`], standard: spec.standard, accent, visual: spec.visual, practice };
}

function makeRegion(order: number, title: string, subtitle: string, standard: string, specs: LessonSpec[]): RegionDefinition {
  const id = 1100 + order;
  const accent = accents[(order - 1) % accents.length];
  return { id, grade: 11, order, slug: `g11-${specs[0].slug}`, title, subtitle, standard, accent, lessons: specs.map((spec, index) => makeLesson(id, index + 1, accents[(order + index - 1) % accents.length], spec)) };
}

export const grade11Regions: RegionDefinition[] = [
  makeRegion(1, "Polynomial Functions", "Analyze, divide, factor, and graph higher-degree functions.", "HSA.APR · HSF.IF", [
    { slug: "polynomial-features", title: "Polynomial Features", goal: "Use degree and leading coefficient to predict end behavior.", key: "The leading term controls end behavior; zeros and multiplicities control how the graph meets the x-axis.", example: "−2x³ rises left and falls right", standard: "HSF.IF.C.7", visual: "curve-line", drills: [
      ["Degree of 4x⁵−x²+7?", "5"], ["Leading coefficient of −3x⁴+2x?", "-3"], ["An even degree with positive leading coefficient ends?", "up on both ends|both ends up"], ["A zero of odd multiplicity usually crosses or touches?", "crosses"], ["A zero of even multiplicity usually crosses or touches?", "touches"],
    ] },
    { slug: "polynomial-division", title: "Polynomial Division", goal: "Divide polynomials and interpret remainders.", key: "Arrange descending powers and include zero coefficients for missing terms before dividing.", example: "(x²−1)/(x−1)=x+1", standard: "HSA.APR.D.6", visual: "steps", drills: [
      ["Divide x²−9 by x−3.", "x+3"], ["Divide x²+5x+6 by x+2.", "x+3"], ["Remainder when x²+1 is divided by x−1?", "2"], ["What placeholder is needed for x³+2x−1?", "0x^2|0x²"], ["If division has remainder 0, the divisor is a?", "factor"],
    ] },
    { slug: "remainder-factor-theorems", title: "Remainder and Factor Theorems", goal: "Evaluate a polynomial to test a possible factor.", key: "The remainder from division by x−a is f(a); x−a is a factor exactly when f(a)=0.", example: "f(2)=0 means x−2 is a factor", standard: "HSA.APR.B.2", visual: "factor", drills: [
      ["If f(3)=0, which is a factor?", "x-3"], ["For f(x)=x²−4, find f(2).", "0"], ["Remainder dividing f(x) by x+1 equals?", "f(-1)|f(−1)"], ["Is x−1 a factor of x²+1?", "no"], ["If f(−2)=0, which is a factor?", "x+2"],
    ] },
    { slug: "polynomial-roots", title: "Polynomial Roots", goal: "Find real and complex zeros using structure.", key: "Factor when possible, use the quadratic formula for quadratic factors, and remember nonreal roots occur in conjugate pairs for real coefficients.", example: "x³−4x=x(x−2)(x+2), so zeros are −2,0,2", standard: "HSA.APR.B.3", visual: "factor-chain", drills: [
      ["Zeros of x(x−5)(x+2)?", "-2,0,5|0,5,-2"], ["Solve x³−9x=0.", "-3,0,3|0,3,-3"], ["If 2+i is a zero of a real polynomial, another zero is?", "2-i|2−i"], ["Maximum number of real zeros of degree 4?", "4"], ["A repeated factor (x−3)² gives zero 3 with multiplicity?", "2"],
    ] },
    { slug: "complex-arithmetic", title: "Complex Number Arithmetic", goal: "Add, multiply, and conjugate complex numbers using i² = −1.", key: "Combine real and imaginary parts separately; distribute when multiplying, then replace every i² with −1.", example: "(3+2i)(1−i)=3−3i+2i−2i²=5−i", steps: ["Distribute each term: 3 − 3i + 2i − 2i².", "Replace i² with −1, so −2i² becomes +2.", "Combine real and imaginary parts to get 5 − i."], standard: "HSN.CN.A.1–3", visual: "complex-plane", drills: [
      ["Add (2+3i)+(4−i).", "6+2i", ["6+2i", "6+4i", "−2+2i", "8i"]],
      ["Multiply i(3+2i).", "−2+3i", ["−2+3i", "2+3i", "−3+2i", "3+2i"]],
      ["Simplify (1+i)².", "2i", ["2i", "2", "1+i", "−2i"]],
      ["What is the conjugate of 4−7i?", "4+7i", ["4+7i", "−4+7i", "−4−7i", "7+4i"]],
      ["Solve x² = −9 over the complex numbers.", "x = ±3i", ["x = ±3i", "x = ±9i", "x = 3", "no solution"]],
    ] },
    { slug: "complex-polynomial-solutions", title: "Complex Polynomial Solutions", goal: "Use conjugate pairs and complex roots to factor and solve real-coefficient polynomials.", key: "A degree-n polynomial has n complex roots counting multiplicity; nonreal roots of a real-coefficient polynomial occur in conjugate pairs.", example: "x²+4=0 → x=±2i", steps: ["Isolate the square: x² = −4.", "Use √−1 = i to write x = ±√4 · i.", "The conjugate pair x = 2i and x = −2i gives both roots of the quadratic."], standard: "HSN.CN.C.7–9", visual: "complex-plane", drills: [
      ["Solve x²+16=0.", "x = ±4i", ["x = ±4i", "x = ±8i", "x = ±4", "no roots"]],
      ["If 3+2i is a root of a real-coefficient polynomial, which root must also occur?", "3−2i", ["3−2i", "−3+2i", "−3−2i", "2+3i"]],
      ["Which polynomial has roots 2, i, and −i?", "(x−2)(x²+1)", ["(x−2)(x²+1)", "(x+2)(x²−1)", "(x−2)(x²−1)", "x²+2"]],
      ["Counting multiplicity, how many complex roots does a quadratic have?", "2", ["1", "2", "3", "infinitely many"]],
      ["Solve x²−6x+13=0.", "x = 3 ± 2i", ["x = 3 ± 2i", "x = −3 ± 2i", "x = 6 ± i", "x = 3 ± 4i"]],
    ] },
    { slug: "polynomial-identities", title: "Polynomial Identities", goal: "Prove and use identities that remain true for every allowed value.", key: "Expand both sides or use a geometric area model; an identity is true for all values, not just one solution.", example: "(x+3)²=x²+6x+9", steps: ["Partition an (x+3)-by-(x+3) square into x-by-x, two x-by-3 rectangles, and a 3-by-3 square.", "Add the four areas: x² + 3x + 3x + 9.", "Combine the middle terms to prove (x+3)² = x² + 6x + 9 for every x."], standard: "HSA.APR.C.4–5", visual: "area-model", drills: [
      ["Expand (x+3)².", "x²+6x+9", ["x²+6x+9", "x²+9", "x²+3x+9", "x²−6x+9"]],
      ["Which identity factors x²−25?", "(x−5)(x+5)", ["(x−5)(x+5)", "(x−5)²", "(x+5)²", "x(x−25)"]],
      ["Expand (a−b)².", "a²−2ab+b²", ["a²−2ab+b²", "a²−b²", "a²+2ab+b²", "a²−2b²"]],
      ["Factor x³+8 as a sum of cubes.", "(x+2)(x²−2x+4)", ["(x+2)(x²−2x+4)", "(x+2)(x²+2x+4)", "(x−2)(x²+2x+4)", "(x+8)(x²+1)"]],
      ["What makes an equation a polynomial identity?", "it is true for every allowed value", ["it is true for every allowed value", "it has exactly one solution", "both sides have one term", "it contains no variables"]],
    ] },
  ]),
  makeRegion(2, "Rational and Radical Functions", "Control domains, asymptotes, radicals, and inverse operations.", "HSA.APR.D · HSF.BF", [
    { slug: "rational-expressions", title: "Rational Expressions", goal: "Simplify rational expressions while preserving restrictions.", key: "Factor first, cancel common factors, and keep every value excluded by the original denominator.", example: "(x²−9)/(x−3)=x+3, x≠3", standard: "HSA.APR.D.6–7", visual: "reciprocal", drills: [
      ["Simplify (x²−4)/(x−2).", "x+2"], ["What restriction comes from denominator x−5?", "x!=5|x≠5"], ["Simplify (x²+3x)/x.", "x+3"], ["Can a canceled restriction be ignored?", "no"], ["Simplify (x²−1)/(x²+x).", "(x-1)/x"],
    ] },
    { slug: "rational-equations", title: "Rational Equations", goal: "Solve equations with variables in denominators.", key: "State restrictions, multiply by the least common denominator, solve, then reject excluded or extraneous values.", example: "1/x=1/4 → x=4", standard: "HSA.REI.A.2", visual: "equation-steps", drills: [
      ["Solve 3/x=1/4.", "12"], ["Solve 1/x+1/2=1.", "2"], ["Solve 2/(x−1)=1.", "3"], ["What value is excluded in 1/(x+5)?", "-5"], ["Must rational-equation answers be checked?", "yes"],
    ] },
    { slug: "radical-functions", title: "Radical Functions", goal: "Analyze square-root and cube-root graphs and domains.", key: "An even root needs a nonnegative radicand over the reals; an odd root accepts every real input.", example: "f(x)=√(x−2) has domain x≥2", standard: "HSF.IF.B.5", visual: "root-line", drills: [
      ["Domain of √(x−5)?", "x>=5|x≥5|[5,infinity)"], ["Domain of ∛x?", "all real numbers|all reals"], ["Evaluate √(16−7).", "3"], ["Starting point of y=√(x+3)?", "(-3,0)|−3,0"], ["Range of y=√x?", "y>=0|y≥0"],
    ] },
    { slug: "radical-equations", title: "Radical Equations", goal: "Isolate a radical, undo it, and check for extraneous roots.", key: "Isolate the radical before raising powers; squaring can create extraneous solutions, so check in the original equation.", example: "√(x+1)=4 → x=15", standard: "HSA.REI.A.2", visual: "root-tiles", drills: [
      ["Solve √(x+4)=5.", "21"], ["Solve ∛(x−1)=3.", "28"], ["Solve √(2x)=6.", "18"], ["Why check after squaring?", "extraneous solutions|to reject extraneous solutions"], ["Does x=−1 solve √x=−1?", "no"],
    ] },
  ]),
  makeRegion(3, "Exponential and Logarithmic Functions", "Model repeated multiplication and use logarithms as inverse exponents.", "HSF.LE · HSF.BF", [
    { slug: "exponential-models", title: "Exponential Models", goal: "Build growth and decay functions from rates.", key: "Use A=A₀(1+r)^t for growth and A=A₀(1−r)^t for decay.", example: "500 growing 6% per year → 500(1.06)^t", standard: "HSF.LE.A–B", visual: "growth", drills: [
      ["Write a model for 200 growing 5% per year.", "200(1.05)^t|y=200(1.05)^t"], ["Write a model for 800 decaying 12% per year.", "800(0.88)^t|y=800(0.88)^t"], ["Growth factor for 3%?", "1.03"], ["Decay factor for 25%?", "0.75"], ["In A₀b^t, what is A₀?", "initial value|starting value"],
    ] },
    { slug: "logarithm-meaning", title: "What a Logarithm Means", goal: "Translate between exponential and logarithmic form.", key: "log_b(a)=c means exactly b^c=a, with b>0, b≠1, and a>0.", example: "log₂(8)=3 because 2³=8", standard: "HSF.BF.B.5", visual: "powers", drills: [
      ["Evaluate log₂(8).", "3"], ["Evaluate log₁₀(1000).", "3"], ["Rewrite 3⁴=81 in logarithmic form.", "log_3(81)=4|log3(81)=4"], ["Rewrite log₅(25)=2 exponentially.", "5^2=25|5²=25"], ["Can the input of a real logarithm be negative?", "no"],
    ] },
    { slug: "log-properties", title: "Logarithm Properties", goal: "Expand and condense logarithmic expressions.", key: "Products become sums, quotients become differences, and powers become coefficients.", example: "log(x²y)=2log x+log y", standard: "HSF.BF.B.5", visual: "term-groups", drills: [
      ["Expand log(ab).", "log(a)+log(b)|log a+log b"], ["Expand log(a/b).", "log(a)-log(b)|log a-log b"], ["Expand log(x³).", "3log(x)|3log x"], ["Condense log x + log y.", "log(xy)"], ["Condense 2log x.", "log(x^2)|log(x²)"],
    ] },
    { slug: "exponential-log-equations", title: "Exponential and Log Equations", goal: "Use common bases or logarithms to isolate a variable.", key: "Rewrite with a common base when possible; otherwise take a logarithm of both sides and check domain restrictions.", example: "2^(x+1)=16=2⁴ → x=3", standard: "HSA.REI.A.1", visual: "equation-steps", drills: [
      ["Solve 2^x=32.", "5"], ["Solve 3^(x+1)=27.", "2"], ["Solve log₂(x)=4.", "16"], ["Solve log₁₀(x−1)=2.", "101"], ["Does x=0 satisfy log x=0?", "no"],
    ] },
  ]),
  makeRegion(4, "Sequences and Series", "Describe ordered patterns and finite or infinite sums.", "HSF.BF.A · HSA.SSE.B", [
    { slug: "arithmetic-sequences", title: "Arithmetic Sequences", goal: "Use a constant difference to write an explicit or recursive rule.", key: "For first term a₁ and difference d, aₙ=a₁+(n−1)d.", example: "5,8,11,… → aₙ=5+3(n−1)", standard: "HSF.BF.A.2", visual: "sequence", drills: [
      ["Next term: 4, 9, 14, …", "19"], ["Common difference of 12, 8, 4, …?", "-4"], ["Find a₁₀ for a₁=3, d=2.", "21"], ["Explicit rule for 7,10,13,…?", "a_n=7+3(n-1)|an=7+3(n-1)"], ["Arithmetic sequences are linked to what function family?", "linear"],
    ] },
    { slug: "geometric-sequences", title: "Geometric Sequences", goal: "Use a constant ratio to write an explicit or recursive rule.", key: "For first term a₁ and ratio r, aₙ=a₁r^(n−1).",
      example: "3,6,12,… → aₙ=3·2^(n−1)", standard: "HSF.BF.A.2", visual: "sequence", drills: [
      ["Next term: 5,15,45,…", "135"], ["Common ratio of 64,32,16,…?", "1/2|0.5"], ["Find a₅ for a₁=2, r=3.", "162"], ["Explicit rule for 4,8,16,…?", "a_n=4*2^(n-1)|an=4*2^(n-1)"], ["Geometric sequences are linked to what function family?", "exponential"],
    ] },
    { slug: "finite-series", title: "Finite Series", goal: "Add arithmetic and geometric sequences efficiently.", key: "Arithmetic sum Sₙ=n(a₁+aₙ)/2; geometric sum Sₙ=a₁(1−rⁿ)/(1−r) for r≠1.", example: "1+2+…+10=10(1+10)/2=55", standard: "HSA.SSE.B.4", visual: "steps", drills: [
      ["Find 1+2+…+20.", "210"], ["Sum first 5 terms of 3,6,9,…", "45"], ["Find 1+2+4+8.", "15"], ["Arithmetic series has n=8, a₁=5, a₈=19. Sum?", "96"], ["A series is a sum or a list?", "sum"],
    ] },
    { slug: "infinite-geometric-series", title: "Infinite Geometric Series", goal: "Decide convergence and find a limiting sum.", key: "An infinite geometric series converges only when |r|<1, then S=a₁/(1−r).",
      example: "1+1/2+1/4+…=2", standard: "HSA.SSE.B.4", visual: "fraction-bars", drills: [
      ["Sum 1+1/2+1/4+…", "2"], ["Does 3+6+12+… converge?", "no"], ["Sum 4+2+1+…", "8"], ["Convergence requires |r| what relation to 1?", "<1|less than 1"], ["Sum 6−3+1.5−…", "4"],
    ] },
  ]),
  makeRegion(5, "Trigonometric Functions", "Use radians, the unit circle, graphs, and identities.", "HSF.TF.A–C", [
    { slug: "radians-unit-circle", title: "Radians and the Unit Circle", goal: "Connect angle measure to coordinates on the unit circle.", key: "On the unit circle, the point at angle θ is (cos θ, sin θ), and π radians equals 180°.", example: "θ=π/2 gives (0,1)", standard: "HSF.TF.A.1–2", visual: "circle", drills: [
      ["Convert 180° to radians.", "pi|π"], ["Convert 90° to radians.", "pi/2|π/2"], ["Convert π/3 to degrees.", "60|60°"], ["Unit-circle coordinates at 0?", "(1,0)|1,0"], ["At angle θ, the y-coordinate equals?", "sin(theta)|sin θ|sine"],
    ] },
    { slug: "exact-trig-values", title: "Exact Trigonometric Values", goal: "Recall exact sine and cosine values for special angles.", key: "Use unit-circle coordinates and quadrant signs instead of decimal approximations.", example: "cos(π/3)=1/2 and sin(π/3)=√3/2", standard: "HSF.TF.A.2", visual: "circle", drills: [
      ["sin(π/6)?", "1/2|0.5"], ["cos(π/3)?", "1/2|0.5"], ["sin(π/2)?", "1"], ["cos(π)?", "-1"], ["tan(π/4)?", "1"],
    ] },
    { slug: "trig-graphs", title: "Graphs of Sine and Cosine", goal: "Read amplitude, period, and vertical shift.", key: "For y=A sin(Bx)+D, amplitude is |A|, period is 2π/|B|, and midline is y=D.", example: "y=3sin(2x)+1 has amplitude 3, period π, midline y=1", standard: "HSF.TF.B.5", visual: "curve-line", drills: [
      ["Amplitude of y=4sin x?", "4"], ["Period of y=sin(2x)?", "pi|π"], ["Midline of y=cos x−3?", "y=-3|-3"], ["Amplitude of y=−5cos x?", "5"], ["Period of y=cos(x/2)?", "4pi|4π"],
    ] },
    { slug: "trig-identities-equations", title: "Trig Identities and Equations", goal: "Use identities to simplify and solve basic equations.", key: "The Pythagorean identity sin²θ+cos²θ=1 links sine and cosine; check all solutions in the requested interval.", example: "sin θ=1/2 on [0,2π) gives π/6 and 5π/6", standard: "HSF.TF.C.8–9", visual: "formula", drills: [
      ["Complete: sin²θ+cos²θ=?", "1"], ["If sin θ=3/5 in quadrant I, cos θ?", "4/5|0.8"], ["Solve sin θ=0 on [0,2π).", "0,pi|0,π"], ["Solve cos θ=1 on [0,2π).", "0"], ["If tan θ=sin θ/cos θ, when is tan undefined?", "when cos theta=0|cos θ=0"],
    ] },
  ]),
  makeRegion(6, "Conic Sections", "Recognize and analyze parabolas, circles, ellipses, and hyperbolas.", "HSG.GPE.A", [
    { slug: "parabolas-as-conics", title: "Parabolas", goal: "Connect focus, directrix, vertex, and quadratic form.", key: "A parabola contains points equidistant from a focus and directrix; (x−h)²=4p(y−k) opens vertically.", example: "x²=8y has p=2 and focus (0,2)", standard: "HSG.GPE.A.2", visual: "parabola", drills: [
      ["For x²=12y, find p.", "3"], ["Focus of x²=8y?", "(0,2)|0,2"], ["Vertex of (x−3)²=4(y+1)?", "(3,-1)|3,−1"], ["If p>0 in (x−h)²=4p(y−k), the parabola opens?", "up"], ["A parabola is equidistant from a focus and a?", "directrix"],
    ] },
    { slug: "ellipses", title: "Ellipses", goal: "Read center, vertices, axes, and foci.", key: "An ellipse is a stretched circle; the larger denominator lies under the major-axis variable.", example: "x²/25+y²/9=1 has horizontal major axis and vertices (±5,0)", standard: "HSG.GPE.A.3", visual: "circle", drills: [
      ["Center of (x−2)²/16+(y+1)²/9=1?", "(2,-1)|2,−1"], ["Major-axis length of x²/25+y²/9=1?", "10"], ["Vertices of x²/16+y²/4=1 on major axis?", "(-4,0),(4,0)|(±4,0)"], ["For an ellipse, is c²=a²−b² or a²+b²?", "a^2-b^2|a²−b²"], ["A circle is a special ellipse with axes that are?", "equal|the same length"],
    ] },
    { slug: "hyperbolas", title: "Hyperbolas", goal: "Read center, branches, vertices, and asymptotes.", key: "A hyperbola uses subtraction; the positive term identifies whether branches open horizontally or vertically.", example: "x²/9−y²/4=1 opens left and right", standard: "HSG.GPE.A.3", visual: "curve-line", drills: [
      ["Does x²/9−y²/4=1 open horizontally or vertically?", "horizontally|horizontal"], ["Center of (x−1)²/4−(y+2)²/9=1?", "(1,-2)|1,−2"], ["Vertices of x²/16−y²/9=1?", "(-4,0),(4,0)|(±4,0)"], ["A hyperbola equation has addition or subtraction?", "subtraction"], ["Do hyperbola branches cross their asymptotes?", "no"],
    ] },
    { slug: "conic-classification", title: "Classify Conics", goal: "Identify conic type from an equation or defining property.", key: "One squared variable suggests a parabola; same-sign squared terms give ellipse/circle; opposite signs give hyperbola.", example: "4x²+9y²=36 is an ellipse", standard: "HSG.GPE.A.1–3", visual: "compare", drills: [
      ["Classify y=x².", "parabola"], ["Classify x²+y²=16.", "circle"], ["Classify 4x²+9y²=36.", "ellipse"], ["Classify x²−y²=1.", "hyperbola"], ["Which conic has exactly one squared variable in standard orientation?", "parabola"],
    ] },
  ]),
  makeRegion(7, "Matrices and Vectors", "Represent systems, transformations, and directed quantities.", "HSN.VM · HSA.REI", [
    { slug: "matrix-operations", title: "Matrix Operations", goal: "Add, scale, and multiply compatible matrices.", key: "Add matching entries; for products, multiply row by column; dimensions must be compatible.", example: "[1,2]+[3,4]=[4,6]", standard: "HSN.VM.C.6–8", visual: "table", drills: [
      ["Add [1,2] and [3,5].", "[4,7]|4,7"], ["Multiply 3[2,−1].", "[6,-3]|6,-3"], ["A 2×3 matrix times a 3×4 matrix gives what dimensions?", "2x4|2×4"], ["Can a 2×3 multiply a 2×2 in that order?", "no"], ["What entry sits in row 2, column 1?", "a21|a_21"],
    ] },
    { slug: "determinants-inverses", title: "Determinants and Inverses", goal: "Use a 2×2 determinant to test invertibility.", key: "For [[a,b],[c,d]], det=ad−bc; an inverse exists exactly when the determinant is nonzero.", example: "[[2,1],[3,4]] has determinant 8−3=5", standard: "HSN.VM.C.10", visual: "formula", drills: [
      ["Determinant of [[2,1],[3,4]]?", "5"], ["Determinant of [[1,2],[2,4]]?", "0"], ["Does a matrix with determinant 0 have an inverse?", "no"], ["Determinant of identity matrix [[1,0],[0,1]]?", "1"], ["A nonzero determinant means the matrix is?", "invertible"],
    ] },
    { slug: "matrix-systems", title: "Systems with Matrices", goal: "Represent and solve linear systems as AX=B.", key: "Put coefficients in A, variables in X, constants in B; if A is invertible, X=A⁻¹B.", example: "2x+y=5 and x−y=1 becomes [[2,1],[1,−1]][x,y]=[5,1]", standard: "HSA.REI.C.8–9", visual: "systems", drills: [
      ["Solve 2x+y=5 and x−y=1. Find x.", "2"], ["For the same system, find y.", "1"], ["In AX=B, which matrix contains constants?", "B"], ["A zero determinant suggests a unique solution?", "no"], ["A coefficient matrix has one row per what?", "equation"],
    ] },
    { slug: "vectors", title: "Vectors", goal: "Find magnitude, components, sums, and scalar multiples.", key: "A vector records direction and magnitude; add components and use √(a²+b²) for magnitude.", example: "⟨3,4⟩ has magnitude 5", standard: "HSN.VM.A–B", visual: "coordinate", drills: [
      ["Magnitude of ⟨3,4⟩?", "5"], ["Add ⟨2,−1⟩+⟨3,5⟩.", "<5,4>|5,4"], ["Find 2⟨−1,3⟩.", "<-2,6>|−2,6"], ["Vector from A(1,2) to B(5,7)?", "<4,5>|4,5"], ["A unit vector has magnitude?", "1"],
    ] },
  ]),
  makeRegion(8, "Statistics and Inference", "Use distributions, samples, and uncertainty to support decisions.", "HSS.ID · HSS.IC", [
    { slug: "normal-distributions", title: "Normal Distributions", goal: "Interpret z-scores and areas under a normal curve.", key: "A z-score tells how many standard deviations a value lies from the mean: z=(x−μ)/σ.", example: "x=70, μ=60, σ=5 gives z=2", standard: "HSS.ID.A.4", visual: "data-line", drills: [
      ["x=80, mean 70, SD 5. z-score?", "2"], ["A z-score of −1 is how many SD below the mean?", "1"], ["About what percent lies within 1 SD in a normal model?", "68%|68"], ["A z-score of 0 corresponds to the?", "mean"], ["Higher z-score means a relatively higher or lower value?", "higher"],
    ] },
    { slug: "sampling-and-bias", title: "Sampling and Bias", goal: "Design a representative study and spot common bias.", key: "Random selection supports generalization; random assignment supports causal comparison; biased methods cannot be fixed by sample size alone.", example: "Randomly sample IDs, not volunteers from one club", standard: "HSS.IC.B.3–4", visual: "sample", drills: [
      ["A voluntary online poll may have what bias?", "voluntary response bias|selection bias"], ["Random selection supports generalizing to the?", "population"], ["Random assignment supports a claim about?", "causation|cause and effect"], ["Does a huge biased sample remove bias?", "no"], ["Sampling every 20th name after a random start is what sample?", "systematic sample|systematic"],
    ] },
    { slug: "confidence-intervals", title: "Confidence Intervals", goal: "Interpret an estimate together with its margin of error.", key: "A confidence interval gives a plausible range for a population parameter; confidence describes the long-run method, not a probability that a fixed parameter moves.", example: "52%±3% gives 49% to 55%", standard: "HSS.IC.B.4", visual: "estimate", drills: [
      ["Estimate 60% with margin 4%. Interval?", "56% to 64%|[56%,64%]"], ["A smaller margin of error means more or less precision?", "more"], ["A larger random sample usually makes the interval?", "narrower"], ["What is the midpoint of [42,50]?", "46"], ["Margin of error for [30,38]?", "4"],
    ] },
    { slug: "statistical-decisions", title: "Statistical Decisions", goal: "Judge whether evidence is meaningful and practically useful.", key: "Consider study design, variability, effect size, uncertainty, and context—not only one statistic.", example: "A tiny difference can be statistically detectable yet not practically important", standard: "HSS.IC.B.5–6", visual: "compare", drills: [
      ["Correlation from an observational study proves causation?", "no"], ["An effect may be statistically significant but practically?", "unimportant|small|not important"], ["A conclusion beyond the sampled population is called?", "generalization"], ["Which reduces random sampling error: larger or smaller sample?", "larger"], ["Should a decision report uncertainty?", "yes"],
    ] },
  ]),
];
