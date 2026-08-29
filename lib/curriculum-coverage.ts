export type CurriculumCoverageStrand = {
  topic: string;
  standards: string[];
  lessonSlugs: string[];
};

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
