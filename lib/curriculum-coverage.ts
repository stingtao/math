export type CurriculumCoverageStrand = {
  topic: string;
  standards: string[];
  lessonSlugs: string[];
};

export type CoreClusterCoverage = {
  cluster: string;
  gradeBand: "7" | "8" | "high-school";
  lessonSlugs: string[];
};

// Common Core is a state-led baseline rather than a federal curriculum. This
// cluster-level contract is deliberately more precise than checking whether a
// broad domain appears somewhere. It prevents a missing cluster from hiding
// behind a neighboring lesson in the same domain.
export const grade7To12CoreCoverage: CoreClusterCoverage[] = [
  { cluster: "7.RP.A", gradeBand: "7", lessonSlugs: ["g7-unit-rates", "g7-proportional-tables", "g7-percent-change"] },
  { cluster: "7.NS.A", gradeBand: "7", lessonSlugs: ["g7-add-rational-numbers", "g7-multiply-divide-rationals", "g7-rational-word-problems"] },
  { cluster: "7.EE.A", gradeBand: "7", lessonSlugs: ["g7-equivalent-expressions"] },
  { cluster: "7.EE.B", gradeBand: "7", lessonSlugs: ["g7-multi-step-equations-g7", "g7-equation-word-models"] },
  { cluster: "7.G.A", gradeBand: "7", lessonSlugs: ["g7-scale-drawings", "g7-constructing-triangles", "g7-cross-sections"] },
  { cluster: "7.G.B", gradeBand: "7", lessonSlugs: ["g7-circle-measures", "g7-angle-equations", "g7-composite-area"] },
  { cluster: "7.SP.A", gradeBand: "7", lessonSlugs: ["g7-random-samples", "g7-informal-inference"] },
  { cluster: "7.SP.B", gradeBand: "7", lessonSlugs: ["g7-center-spread", "g7-compare-distributions"] },
  { cluster: "7.SP.C", gradeBand: "7", lessonSlugs: ["g7-probability-scale", "g7-experimental-probability", "g7-compound-events"] },

  { cluster: "8.NS.A", gradeBand: "8", lessonSlugs: ["repeating-decimals", "rational-irrational", "approximating-irrationals"] },
  { cluster: "8.EE.A", gradeBand: "8", lessonSlugs: ["powers", "square-cube-roots", "scientific-notation"] },
  { cluster: "8.EE.B", gradeBand: "8", lessonSlugs: ["coordinate-plane", "slope-rate", "graphing-lines"] },
  { cluster: "8.EE.C", gradeBand: "8", lessonSlugs: ["one-step-equations", "solution-types", "systems-graphing"] },
  { cluster: "8.F.A", gradeBand: "8", lessonSlugs: ["function-rules", "function-representations", "comparing-functions"] },
  { cluster: "8.F.B", gradeBand: "8", lessonSlugs: ["linear-nonlinear"] },
  { cluster: "8.G.A", gradeBand: "8", lessonSlugs: ["rigid-transformations", "congruence", "dilations-similarity", "angle-relationships"] },
  { cluster: "8.G.B", gradeBand: "8", lessonSlugs: ["pythagorean-theorem", "coordinate-distance"] },
  { cluster: "8.G.C", gradeBand: "8", lessonSlugs: ["cylinder-volume", "cone-volume", "sphere-volume"] },
  { cluster: "8.SP.A", gradeBand: "8", lessonSlugs: ["scatter-plots", "lines-of-fit", "two-way-tables"] },

  { cluster: "HSN.RN.A", gradeBand: "high-school", lessonSlugs: ["g9-integer-exponents-g9", "g9-rational-exponents"] },
  { cluster: "HSN.RN.B", gradeBand: "high-school", lessonSlugs: ["g9-properties-real-numbers"] },
  { cluster: "HSN.Q.A", gradeBand: "high-school", lessonSlugs: ["g9-quantities-units-precision"] },
  { cluster: "HSN.CN.A", gradeBand: "high-school", lessonSlugs: ["g11-complex-arithmetic"] },
  { cluster: "HSN.CN.B", gradeBand: "high-school", lessonSlugs: ["g12-complex-plane"] },
  { cluster: "HSN.CN.C", gradeBand: "high-school", lessonSlugs: ["g11-complex-polynomial-solutions"] },
  { cluster: "HSN.VM.A", gradeBand: "high-school", lessonSlugs: ["g11-vectors"] },
  { cluster: "HSN.VM.B", gradeBand: "high-school", lessonSlugs: ["g11-vectors", "g12-vector-dot-product"] },
  { cluster: "HSN.VM.C", gradeBand: "high-school", lessonSlugs: ["g11-matrix-operations", "g11-determinants-inverses"] },
  { cluster: "HSA.SSE.A", gradeBand: "high-school", lessonSlugs: ["g9-algebraic-structure", "g9-polynomial-vocabulary"] },
  { cluster: "HSA.SSE.B", gradeBand: "high-school", lessonSlugs: ["g9-factor-trinomials", "g11-finite-series"] },
  { cluster: "HSA.APR.A", gradeBand: "high-school", lessonSlugs: ["g9-add-subtract-polynomials", "g9-multiply-binomials"] },
  { cluster: "HSA.APR.B", gradeBand: "high-school", lessonSlugs: ["g11-remainder-factor-theorems", "g11-polynomial-roots"] },
  { cluster: "HSA.APR.C", gradeBand: "high-school", lessonSlugs: ["g11-polynomial-identities"] },
  { cluster: "HSA.APR.D", gradeBand: "high-school", lessonSlugs: ["g11-polynomial-division", "g11-rational-expressions"] },
  { cluster: "HSA.CED.A", gradeBand: "high-school", lessonSlugs: ["g9-absolute-value-inequalities", "g9-linear-equation-forms", "g9-system-models", "g9-literal-equations"] },
  { cluster: "HSA.REI.A", gradeBand: "high-school", lessonSlugs: ["g9-multi-step-linear-equations", "g11-rational-equations"] },
  { cluster: "HSA.REI.B", gradeBand: "high-school", lessonSlugs: ["g9-linear-inequalities-g9", "g9-quadratic-formula"] },
  { cluster: "HSA.REI.C", gradeBand: "high-school", lessonSlugs: ["g9-systems-substitution-g9", "g11-matrix-systems"] },
  { cluster: "HSA.REI.D", gradeBand: "high-school", lessonSlugs: ["g9-graph-linear-inequalities", "g9-systems-linear-inequalities"] },
  { cluster: "HSF.IF.A", gradeBand: "high-school", lessonSlugs: ["g10-function-notation-review"] },
  { cluster: "HSF.IF.B", gradeBand: "high-school", lessonSlugs: ["g9-slope-from-points", "g11-radical-functions"] },
  { cluster: "HSF.IF.C", gradeBand: "high-school", lessonSlugs: ["g9-graph-linear-functions", "g9-quadratic-graphs", "g10-piecewise-functions"] },
  { cluster: "HSF.BF.A", gradeBand: "high-school", lessonSlugs: ["g9-build-quadratic-models", "g9-geometric-sequences"] },
  { cluster: "HSF.BF.B", gradeBand: "high-school", lessonSlugs: ["g9-absolute-value-functions", "g11-logarithm-meaning", "g12-inverse-functions"] },
  { cluster: "HSF.LE.A", gradeBand: "high-school", lessonSlugs: ["g9-exponential-growth", "g9-linear-vs-exponential"] },
  { cluster: "HSF.LE.B", gradeBand: "high-school", lessonSlugs: ["g9-modeling-decisions", "g12-compound-interest"] },
  { cluster: "HSF.TF.A", gradeBand: "high-school", lessonSlugs: ["g11-radians-unit-circle", "g11-exact-trig-values"] },
  { cluster: "HSF.TF.B", gradeBand: "high-school", lessonSlugs: ["g11-trig-graphs"] },
  { cluster: "HSF.TF.C", gradeBand: "high-school", lessonSlugs: ["g11-trig-identities-equations"] },
  { cluster: "HSG.CO.A", gradeBand: "high-school", lessonSlugs: ["g10-rigid-transformations"] },
  { cluster: "HSG.CO.B", gradeBand: "high-school", lessonSlugs: ["g10-triangle-congruence", "g10-cpctc"] },
  { cluster: "HSG.CO.C", gradeBand: "high-school", lessonSlugs: ["g10-logic-and-conditionals", "g10-angle-proofs", "g10-proof-structure"] },
  { cluster: "HSG.CO.D", gradeBand: "high-school", lessonSlugs: ["g10-geometric-constructions"] },
  { cluster: "HSG.SRT.A", gradeBand: "high-school", lessonSlugs: ["g10-similarity-transformations", "g10-triangle-similarity"] },
  { cluster: "HSG.SRT.B", gradeBand: "high-school", lessonSlugs: ["g10-similarity-proofs"] },
  { cluster: "HSG.SRT.C", gradeBand: "high-school", lessonSlugs: ["g10-right-triangle-trig", "g10-special-right-triangles"] },
  { cluster: "HSG.SRT.D", gradeBand: "high-school", lessonSlugs: ["g10-laws-of-sines-and-cosines"] },
  { cluster: "HSG.C.A", gradeBand: "high-school", lessonSlugs: ["g10-circle-angle-theorems", "g10-chords-and-tangents"] },
  { cluster: "HSG.C.B", gradeBand: "high-school", lessonSlugs: ["g10-arc-length-sector-area"] },
  { cluster: "HSG.GPE.A", gradeBand: "high-school", lessonSlugs: ["g10-circle-equations", "g11-parabolas-as-conics", "g11-ellipses"] },
  { cluster: "HSG.GPE.B", gradeBand: "high-school", lessonSlugs: ["g10-distance-midpoint", "g10-coordinate-proofs", "g10-partition-segments"] },
  { cluster: "HSG.GMD.A", gradeBand: "high-school", lessonSlugs: ["g10-volume-and-scaling"] },
  { cluster: "HSG.GMD.B", gradeBand: "high-school", lessonSlugs: ["g10-cross-sections-and-rotations"] },
  { cluster: "HSG.MG.A", gradeBand: "high-school", lessonSlugs: ["g10-area-and-similarity", "g10-density-and-units", "g10-modeling-with-geometry"] },
  { cluster: "HSS.ID.A", gradeBand: "high-school", lessonSlugs: ["g9-one-variable-data", "g10-data-displays", "g11-normal-distributions"] },
  { cluster: "HSS.ID.B", gradeBand: "high-school", lessonSlugs: ["g9-scatter-models-g9", "g10-categorical-data"] },
  { cluster: "HSS.ID.C", gradeBand: "high-school", lessonSlugs: ["g9-interpret-linear-models"] },
  { cluster: "HSS.IC.A", gradeBand: "high-school", lessonSlugs: ["g12-sampling-distributions", "g12-hypothesis-testing"] },
  { cluster: "HSS.IC.B", gradeBand: "high-school", lessonSlugs: ["g11-sampling-and-bias", "g11-confidence-intervals", "g11-statistical-decisions"] },
  { cluster: "HSS.CP.A", gradeBand: "high-school", lessonSlugs: ["g10-sets-and-sample-spaces", "g10-independence"] },
  { cluster: "HSS.CP.B", gradeBand: "high-school", lessonSlugs: ["g10-addition-rule", "g10-conditional-probability"] },
  { cluster: "HSS.MD.A", gradeBand: "high-school", lessonSlugs: ["g12-random-variables", "g12-expected-value", "g12-binomial-distribution"] },
  { cluster: "HSS.MD.B", gradeBand: "high-school", lessonSlugs: ["g12-decision-strategies"] },
];

// This contract turns the requested Algebra I scope into a regression-checked
// curriculum requirement. A topic is covered only when its distinct
// representations have named lessons; a broad neighboring lesson is not enough.
export const algebraCourseCoverage: CurriculumCoverageStrand[] = [
  { topic: "Sets and Venn diagrams", standards: ["HSS.CP.A.1"], lessonSlugs: ["g10-sets-and-venn-diagrams"] },
  { topic: "Real numbers and real-world quantities", standards: ["HSN.RN.B.3", "HSN.Q.A.1–3"], lessonSlugs: ["g9-properties-real-numbers", "g9-quantities-units-precision"] },
  { topic: "Linear equations and inequalities in one variable", standards: ["HSA.REI.A.1", "HSA.REI.B.3"], lessonSlugs: ["g9-multi-step-linear-equations", "g9-linear-inequalities-g9"] },
  { topic: "Linear equations in two variables", standards: ["HSA.CED.A.2", "HSF.IF.C.7"], lessonSlugs: ["g9-linear-equation-forms", "g9-graph-linear-functions"] },
  { topic: "Linear functions and models", standards: ["HSF.IF.B.6", "HSA.CED.A.2"], lessonSlugs: ["g9-slope-from-points", "g9-linear-equation-forms", "g9-graph-linear-functions"] },
  { topic: "Relationships among function representations", standards: ["8.F.A.2", "HSF.LE.A.1"], lessonSlugs: ["function-representations", "comparing-functions", "g9-linear-vs-exponential", "g9-modeling-decisions"] },
  { topic: "Systems of linear equations", standards: ["HSA.REI.C.6", "HSA.CED.A.3"], lessonSlugs: ["g9-systems-by-graphing-g9", "g9-systems-substitution-g9", "g9-systems-elimination-g9", "g9-system-models"] },
  { topic: "Linear inequalities in two variables", standards: ["HSA.REI.D.12"], lessonSlugs: ["g9-graph-linear-inequalities", "g9-systems-linear-inequalities"] },
  { topic: "Categorical data", standards: ["HSS.ID.B.5"], lessonSlugs: ["g10-categorical-data"] },
  { topic: "Numerical data", standards: ["HSS.ID.A.1–3"], lessonSlugs: ["g9-one-variable-data", "g10-data-displays"] },
  { topic: "Absolute value functions and inequalities", standards: ["HSF.IF.C.7b", "HSA.CED.A.1"], lessonSlugs: ["g9-absolute-value-functions", "g9-absolute-value-inequalities"] },
  { topic: "Polynomial addition, subtraction, and multiplication", standards: ["HSA.APR.A.1"], lessonSlugs: ["g9-add-subtract-polynomials", "g9-multiply-monomials", "g9-multiply-binomials"] },
  { topic: "Solve quadratic equations by graphing and factoring", standards: ["HSA.REI.B.4", "HSF.IF.C.7"], lessonSlugs: ["g9-solve-by-factoring", "g9-quadratic-graphs"] },
  { topic: "Solve quadratic equations by square roots", standards: ["HSA.REI.B.4"], lessonSlugs: ["g9-solve-by-square-roots"] },
  { topic: "Build quadratic functions and models", standards: ["HSF.BF.A.1", "HSF.IF.C.8a"], lessonSlugs: ["g9-build-quadratic-models"] },
  { topic: "Exponential functions", standards: ["HSF.LE.A.1–2"], lessonSlugs: ["g9-exponential-growth", "g9-exponential-decay", "g9-linear-vs-exponential"] },
];
