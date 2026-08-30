import { buildPracticeQuestion, hasConstructibleMathAnswer, type BuiltPracticeQuestion } from "./question-interactions.ts";

type ChoiceUpgradeGroup = {
  keys: string[];
  distractors: string[];
};

const groups: ChoiceUpgradeGroup[] = [
  { keys: ["g7-percent-change:q5"], distractors: ["the final value", "the amount of change", "the percent rate"] },
  { keys: ["g7-simple-interest:q5", "g12-compound-interest:q2"], distractors: ["interest earned", "annual rate", "elapsed time"] },
  { keys: ["g7-surface-area:q5"], distractors: ["rectangular prism", "square pyramid", "triangular prism"] },
  { keys: ["g7-cross-sections:q1", "g7-cross-sections:q2", "g7-cross-sections:q3", "g7-cross-sections:q4"], distractors: ["triangle", "rectangle", "circle", "ellipse"] },
  { keys: ["g7-random-samples:q3", "g11-sampling-and-bias:q2"], distractors: ["sample", "variable", "statistic"] },
  { keys: ["g7-compare-distributions:q4"], distractors: ["the medians must be equal", "both spreads are zero", "the data sets are identical"] },
  { keys: ["g7-compare-distributions:q5"], distractors: ["small"] },
  { keys: ["g7-compound-events:q5"], distractors: ["add the probabilities", "subtract the probabilities", "divide the probabilities"] },
  { keys: ["g7-sample-spaces:q4"], distractors: ["to guarantee one outcome", "to remove randomness", "to replace all observed data"] },
  { keys: ["fractions:q1"], distractors: ["the number of selected parts", "the value of each part", "the result of dividing 3 by 5"] },

  { keys: [
    "solution-types:q1", "solution-types:q2", "solution-types:q4", "solution-types:q5",
    "g9-equation-solution-cases:q1", "g9-equation-solution-cases:q2", "g9-equation-solution-cases:q3",
    "g9-equation-solution-cases:q4", "g9-equation-solution-cases:q5", "g9-systems-by-graphing-g9:q2",
    "g9-systems-by-graphing-g9:q3", "g9-systems-elimination-g9:q5",
  ], distractors: ["none", "one", "infinitely many"] },
  { keys: ["coordinate-plane:q4", "g12-function-transformations-g12:q3", "g12-function-transformations-g12:q4"], distractors: ["x-axis", "y-axis", "origin", "neither axis"] },
  { keys: ["systems-graphing:q3", "systems-algebra:q5"], distractors: ["no solution", "one solution", "two solutions"] },
  { keys: ["systems-algebra:q4"], distractors: ["two $5 tickets", "two $3 tickets", "one $8 ticket"] },
  { keys: ["function-representations:q5"], distractors: ["a curved line", "separate points with no pattern", "a vertical line"] },
  { keys: ["linear-nonlinear:q5"], distractors: ["the output increases", "the output decreases", "the input is constant"] },
  { keys: ["rigid-transformations:q2", "rigid-transformations:q3"], distractors: ["translation", "reflection", "rotation", "dilation"] },
  { keys: ["angle-relationships:q4", "g10-angle-proofs:q4"], distractors: ["supplementary", "complementary", "unrelated"] },
  { keys: ["mixed-volume:q2"], distractors: ["cone", "cylinder", "sphere", "hemisphere"] },
  { keys: ["mixed-volume:q4"], distractors: ["cone", "they hold the same volume"] },
  { keys: ["mixed-volume:q5"], distractors: ["the sphere is larger", "the cylinder is larger"] },
  { keys: ["scatter-plots:q1", "scatter-plots:q2", "scatter-plots:q3", "g9-scatter-models-g9:q1"], distractors: ["positive", "negative", "none"] },
  { keys: ["scatter-plots:q4", "g9-scatter-models-g9:q5"], distractors: ["the point closest to the center", "the point on the line of fit", "the most common value"] },
  { keys: ["scatter-plots:q5", "g9-correlation-residuals:q4"], distractors: ["weak"] },
  { keys: ["lines-of-fit:q2"], distractors: ["y starts at 1.5 when x is 0", "x increases 1.5 for each y", "y decreases 1.5 for each x"] },
  { keys: ["two-way-tables:q3"], distractors: ["to make every group the same size", "to remove all variation", "to compare only raw totals"] },
  { keys: ["two-way-tables:q4"], distractors: ["marginal frequency", "conditional frequency", "relative frequency"] },

  { keys: ["g9-properties-real-numbers:q1", "g9-properties-real-numbers:q2"], distractors: ["commutative", "associative", "distributive", "identity"] },
  { keys: ["g9-slope-from-points:q4"], distractors: ["zero", "positive", "negative"] },
  { keys: ["g9-linear-equation-forms:q5"], distractors: ["slope-intercept form", "point-slope form", "vertex form"] },
  { keys: ["g9-graph-linear-functions:q5"], distractors: ["falls", "stays horizontal"] },
  { keys: ["g9-systems-by-graphing-g9:q5"], distractors: ["x-intercept", "y-intercept", "slope"] },
  { keys: ["g9-systems-substitution-g9:q5"], distractors: ["graph a third equation", "discard the first value", "average both equations"] },
  { keys: ["g9-systems-elimination-g9:q4"], distractors: ["equal with the same sign", "unrelated", "both zero"] },
  { keys: ["g9-system-models:q5"], distractors: ["to make both variables equal", "to remove every constraint", "to guarantee integer answers"] },
  { keys: ["g9-polynomial-vocabulary:q3"], distractors: ["monomial", "trinomial", "constant"] },
  { keys: ["g9-factoring-completely:q4"], distractors: ["difference of squares", "perfect-square trinomial", "quadratic formula"] },
  { keys: ["g9-solve-by-factoring:q5"], distractors: ["distributive property", "commutative property", "square root property"] },
  { keys: ["g9-quadratic-graphs:q2"], distractors: ["up"] },
  { keys: ["g9-quadratic-graphs:q5"], distractors: ["tangent line", "directrix", "x-axis"] },
  { keys: ["g9-exponential-decay:q5"], distractors: ["decay"] },
  { keys: [
    "g9-linear-vs-exponential:q1", "g9-linear-vs-exponential:q2", "g9-linear-vs-exponential:q3",
    "g9-linear-vs-exponential:q4", "g9-linear-vs-exponential:q5", "g9-modeling-decisions:q1",
    "g9-modeling-decisions:q2", "g9-modeling-decisions:q3", "g9-modeling-decisions:q4",
    "g9-modeling-decisions:q5", "g11-arithmetic-sequences:q5", "g11-geometric-sequences:q5",
    "g12-model-selection-g12:q1", "g12-model-selection-g12:q2", "g12-model-selection-g12:q3",
    "g12-model-selection-g12:q4", "g12-compound-interest:q5",
  ], distractors: ["linear", "quadratic", "exponential", "trigonometric"] },
  { keys: ["g9-one-variable-data:q1", "g10-data-displays:q1"], distractors: ["mean", "mode", "range"] },
  { keys: ["g9-one-variable-data:q2", "g10-data-displays:q2"], distractors: ["standard deviation", "range", "variance"] },
  { keys: ["g9-one-variable-data:q3", "g10-data-displays:q3"], distractors: ["left skew", "symmetric", "uniform"] },
  { keys: ["g9-correlation-residuals:q3"], distractors: ["a clear curve", "a steady upward trend", "a steady downward trend"] },
  { keys: ["g9-correlation-residuals:q5"], distractors: ["actual is below predicted", "actual equals predicted", "the slope is positive"] },

  { keys: ["g10-logic-and-conditionals:q2"], distractors: ["if p then q", "if not p then not q", "if not q then not p"] },
  { keys: ["g10-logic-and-conditionals:q4"], distractors: ["existential claim", "definition", "calculation"] },
  { keys: ["g10-definitions-and-postulates:q1", "g10-partition-segments:q4"], distractors: ["endpoint", "midpoint", "ray", "bisector"] },
  { keys: ["g10-definitions-and-postulates:q2", "g10-definitions-and-postulates:q3"], distractors: ["definition", "postulate", "theorem", "counterexample"] },
  { keys: ["g10-proof-structure:q1"], distractors: ["the conclusion only", "an unproved guess", "a diagram label only"] },
  { keys: ["g10-proof-structure:q2"], distractors: ["reflexive property", "symmetric property", "distributive property"] },
  { keys: ["g10-proof-structure:q3"], distractors: ["addition property of equality", "division property of equality", "transitive property"] },
  { keys: ["g10-proof-structure:q4"], distractors: ["vertical angles theorem", "alternate interior angles theorem", "triangle sum theorem"] },
  { keys: ["g10-proof-structure:q5"], distractors: ["a new assumption", "an unrelated example", "a second diagram"] },
  { keys: ["g10-triangle-congruence:q1", "g10-triangle-congruence:q2", "g10-triangle-congruence:q5", "g10-triangle-similarity:q2"], distractors: ["SSS", "SAS", "ASA", "AAS"] },
  { keys: ["g10-cpctc:q3"], distractors: ["corresponding points create two congruent triangles", "common parts combine to create triangles", "congruent polygons contain three congruent sides"] },
  { keys: ["g10-isosceles-triangles:q1"], distractors: ["A and B", "A and C", "all three angles"] },
  { keys: ["g10-isosceles-triangles:q4"], distractors: ["AB and AC", "AB and BC", "all three sides"] },
  { keys: ["g10-similarity-transformations:q4"], distractors: ["congruent", "parallel", "perpendicular"] },
  { keys: ["g10-special-right-triangles:q5"], distractors: ["long leg", "hypotenuse", "either leg"] },
  { keys: ["g10-parallel-perpendicular:q1", "g10-parallel-perpendicular:q5", "g10-coordinate-proofs:q1", "g10-coordinate-proofs:q4"], distractors: ["parallel", "perpendicular", "neither"] },
  { keys: ["g10-coordinate-proofs:q2"], distractors: ["acute angle", "obtuse angle", "reflex angle"] },
  { keys: ["g10-coordinate-proofs:q3", "g10-chords-and-tangents:q2", "g10-circle-theorem-proofs:q4"], distractors: ["parallel", "perpendicular", "proportional"] },
  { keys: ["g10-chords-and-tangents:q3", "g10-chords-and-tangents:q4", "g10-chords-and-tangents:q5"], distractors: ["radius", "diameter", "chord", "tangent"] },
  { keys: ["g10-density-and-units:q4"], distractors: ["distance squared", "time per distance", "mass per area"] },
  { keys: ["g10-modeling-with-geometry:q4"], distractors: ["to make the model exact", "to hide measurement error", "to avoid choosing units"] },
  { keys: ["g10-modeling-with-geometry:q5"], distractors: ["linear units", "square units", "unitless values"] },
  { keys: ["g10-sets-and-sample-spaces:q3"], distractors: ["population", "statistic", "complement"] },
  { keys: ["g10-sets-and-sample-spaces:q4"], distractors: ["must occur", "occurs twice", "has equal probability"] },
  { keys: ["g10-addition-rule:q4"], distractors: ["to count the overlap twice", "to make events independent", "to turn a union into an intersection"] },
  { keys: ["g10-independence:q4"], distractors: ["mutually exclusive", "dependent", "complementary"] },
  { keys: ["g10-piecewise-functions:q4"], distractors: ["continuous", "constant", "periodic"] },
  { keys: ["g10-regression-and-residuals:q4"], distractors: ["appropriate", "exact", "unbiased by definition"] },

  { keys: ["g11-polynomial-features:q3"], distractors: ["down on both ends", "up left and down right", "down left and up right"] },
  { keys: ["g11-polynomial-features:q4", "g11-polynomial-features:q5"], distractors: ["crosses", "touches"] },
  { keys: ["g11-polynomial-division:q5"], distractors: ["remainder", "coefficient", "constant term"] },
  { keys: ["g11-radical-functions:q2", "g12-continuity:q3"], distractors: ["nonnegative real numbers", "positive real numbers", "integers only"] },
  { keys: ["g11-radical-equations:q4"], distractors: ["complex solutions", "repeated roots", "rounding errors"] },
  { keys: ["g11-exponential-models:q5"], distractors: ["growth factor", "time", "final value"] },
  { keys: ["g11-finite-series:q5"], distractors: ["list"] },
  { keys: ["g11-parabolas-as-conics:q4"], distractors: ["down"] },
  { keys: ["g11-parabolas-as-conics:q5"], distractors: ["center", "asymptote", "vertex"] },
  { keys: ["g11-ellipses:q5"], distractors: ["perpendicular", "different lengths", "unbounded"] },
  { keys: ["g11-hyperbolas:q1"], distractors: ["vertically"] },
  { keys: ["g11-hyperbolas:q4"], distractors: ["addition"] },
  { keys: ["g11-conic-classification:q1", "g11-conic-classification:q2", "g11-conic-classification:q3", "g11-conic-classification:q4", "g11-conic-classification:q5"], distractors: ["parabola", "circle", "ellipse", "hyperbola"] },
  { keys: ["g11-determinants-inverses:q5"], distractors: ["singular", "non-square", "undefined"] },
  { keys: ["g11-matrix-systems:q5"], distractors: ["variable", "constant", "matrix column"] },
  { keys: ["g11-normal-distributions:q4"], distractors: ["median only", "standard deviation", "first quartile"] },
  { keys: ["g11-normal-distributions:q5"], distractors: ["lower"] },
  { keys: ["g11-sampling-and-bias:q1"], distractors: ["nonresponse bias", "measurement bias", "undercoverage only"] },
  { keys: ["g11-sampling-and-bias:q3"], distractors: ["association only", "population size", "sampling precision"] },
  { keys: ["g11-sampling-and-bias:q5"], distractors: ["simple random sample", "cluster sample", "stratified sample"] },
  { keys: ["g11-confidence-intervals:q2"], distractors: ["less"] },
  { keys: ["g11-confidence-intervals:q3"], distractors: ["wider", "unchanged"] },
  { keys: ["g11-statistical-decisions:q2"], distractors: ["important", "causal", "unbiased"] },
  { keys: ["g11-statistical-decisions:q3"], distractors: ["randomization", "replication", "blocking"] },
  { keys: ["g11-statistical-decisions:q4"], distractors: ["smaller"] },

  { keys: ["g12-inverse-functions:q4"], distractors: ["vertical line test", "slope test", "intercept test"] },
  { keys: ["g12-function-composition:q3"], distractors: ["apply f then g", "add f and g", "multiply f and g"] },
  { keys: ["g12-function-transformations-g12:q1"], distractors: ["left 4", "up 4", "down 4"] },
  { keys: ["g12-function-transformations-g12:q2"], distractors: ["down 3", "left 3", "right 3"] },
  { keys: ["g12-limit-from-table-graph:q4"], distractors: ["the limit only", "the derivative", "the average rate"] },
  { keys: ["g12-indeterminate-limits:q3"], distractors: ["0", "undefined in every case", "1"] },
  { keys: ["g12-derivative-meaning:q1"], distractors: ["secant line", "vertical line", "asymptote"] },
  { keys: ["g12-derivative-meaning:q3"], distractors: ["tangent", "vertical", "asymptote"] },
  { keys: ["g12-derivative-meaning:q4"], distractors: ["secant", "vertical", "asymptote"] },
  { keys: ["g12-derivative-meaning:q2"], distractors: ["position", "acceleration", "jerk"] },
  { keys: ["g12-derivative-meaning:q5"], distractors: ["output unit", "square input unit", "no unit"] },
  { keys: ["g12-chain-rule:q5"], distractors: ["outside function", "final constant", "original exponent only"] },
  { keys: ["g12-tangent-lines:q3"], distractors: ["far"] },
  { keys: ["g12-tangent-lines:q5"], distractors: ["vertical", "increasing", "decreasing"] },
  { keys: ["g12-motion:q3"], distractors: ["positive direction", "no direction", "increasing speed"] },
  { keys: ["g12-motion:q4"], distractors: ["signed velocity", "acceleration", "position"] },
  { keys: ["g12-increasing-extrema-concavity:q1", "g12-increasing-extrema-concavity:q2"], distractors: ["increasing", "decreasing", "constant"] },
  { keys: ["g12-increasing-extrema-concavity:q3", "g12-increasing-extrema-concavity:q4"], distractors: ["maximum", "minimum", "inflection point"] },
  { keys: ["g12-increasing-extrema-concavity:q5"], distractors: ["down"] },
  { keys: ["g12-optimization:q2"], distractors: ["positive", "constant", "equal to f"] },
  { keys: ["g12-optimization:q4"], distractors: ["constraint", "domain", "initial condition"] },
  { keys: ["g12-antiderivatives:q4"], distractors: ["limits of integration", "the product rule", "a rounding correction"] },
  { keys: ["g12-definite-integrals:q3"], distractors: ["positive", "zero", "undefined"] },
  { keys: ["g12-definite-integrals:q5"], distractors: ["velocity", "acceleration", "time squared"] },
  { keys: ["g12-fundamental-theorem:q5"], distractors: ["factoring", "matrix multiplication", "statistical inference"] },
  { keys: ["g12-integral-applications:q2"], distractors: ["instantaneous rate", "average input", "initial value only"] },
  { keys: ["g12-integral-applications:q3"], distractors: ["acceleration", "position", "jerk"] },
  { keys: ["g12-integral-applications:q4"], distractors: ["signed velocity", "acceleration", "position"] },
  { keys: ["g12-integral-applications:q5"], distractors: ["top plus bottom", "left minus right", "right minus left"] },
  { keys: ["g12-numerical-integration:q3"], distractors: ["left endpoints", "right endpoints", "zeros only"] },
  { keys: ["g12-differential-equations:q3"], distractors: ["local height", "global maximum", "area under the curve"] },
  { keys: ["g12-infinite-series:q3"], distractors: ["converge", "oscillate to one value", "be finite"] },
  { keys: ["g12-vector-dot-product:q3"], distractors: ["parallel", "equal", "opposite"] },
  { keys: ["g12-vector-dot-product:q5"], distractors: ["obtuse", "right", "undefined"] },
  { keys: ["g12-parametric-polar-calculus:q4"], distractors: ["horizontal", "undefined as a curve", "always diagonal"] },
  { keys: ["g12-random-variables:q4", "g12-random-variables:q5"], distractors: ["discrete", "continuous"] },
  { keys: ["g12-expected-value:q5"], distractors: ["one play", "the first play only", "the largest payoff"] },
  { keys: ["g12-sampling-distributions:q1"], distractors: ["population range", "sample size", "population maximum"] },
  { keys: ["g12-sampling-distributions:q2"], distractors: ["larger", "unchanged"] },
  { keys: ["g12-sampling-distributions:q4"], distractors: ["medians", "ranges", "individual values"] },
  { keys: ["g12-study-design:q3"], distractors: ["response variable", "placebo", "random sample"] },
  { keys: ["g12-hypothesis-testing:q3", "g12-hypothesis-testing:q5"], distractors: ["alternative hypothesis", "sample mean", "confidence level"] },
  { keys: ["g12-loans-and-annuities:q4"], distractors: ["random", "one-time", "continuously changing"] },
  { keys: ["g12-networks-and-algorithms:q1"], distractors: ["edges", "weights", "paths"] },
  { keys: ["g12-networks-and-algorithms:q2"], distractors: ["vertices", "weights", "regions"] },
  { keys: ["g12-networks-and-algorithms:q3"], distractors: ["cycle", "vertex", "weight"] },
  { keys: ["g12-networks-and-algorithms:q4"], distractors: ["estimate", "conjecture", "sample"] },
  { keys: ["g12-networks-and-algorithms:q5"], distractors: ["number of vertices", "largest single edge", "number of drawings"] },
  { keys: ["g12-inference-for-proportions:q4"], distractors: ["two sample means", "two sample sizes", "one population variance"] },
  { keys: ["g12-regression-inference:q1"], distractors: ["intercept", "residual", "sample size"] },
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(/\s+/g, "");
}

function orderedChoices(key: string, answer: string, distractors: string[]) {
  const accepted = new Set(answer.split("|").map(normalize));
  const correct = answer.split("|")[0].trim();
  const options = [correct, ...distractors.filter((choice) => !accepted.has(normalize(choice)))].slice(0, 4);
  const shift = [...key].reduce((total, character) => total + character.charCodeAt(0), 0) % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

const distractorsByKey = new Map<string, string[]>();
for (const group of groups) {
  for (const key of group.keys) {
    if (distractorsByKey.has(key)) throw new Error(`Duplicate text-choice upgrade for ${key}`);
    distractorsByKey.set(key, group.distractors);
  }
}

export const textChoiceUpgradeKeys = [...distractorsByKey.keys()];

type UpgradeRegion = {
  lessons: Array<{
    slug: string;
    practice: BuiltPracticeQuestion[];
  }>;
};

export function upgradeTextualResponses<T extends UpgradeRegion>(regions: T[]): T[] {
  return regions.map((region) => ({
    ...region,
    lessons: region.lessons.map((lesson) => ({
      ...lesson,
      practice: lesson.practice.map((question) => {
        const key = `${lesson.slug}:${question.id}`;
        const distractors = distractorsByKey.get(key);
        if (!distractors) return question;
        if (question.interaction !== "fill-in" || hasConstructibleMathAnswer(question.answer)) {
          throw new Error(`${key} no longer needs a text-choice upgrade; update the authored contract.`);
        }
        return buildPracticeQuestion({
          id: question.id,
          prompt: question.prompt,
          answer: question.answer,
          hint: question.hint,
          choices: orderedChoices(key, question.answer, distractors),
        });
      }),
    })),
  })) as T[];
}
