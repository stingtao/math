# Curriculum coverage baseline

This document records the audited Grade 7–12 baseline and the attached Algebra course scope. It is a product coverage contract, not a claim that the United States has one federally prescribed course sequence.

## Standards boundary

Education and curriculum decisions in the United States are primarily state and local responsibilities. This project therefore uses the [Common Core State Standards for Mathematics](https://corestandards.org/mathematics-standards/) as a public, auditable baseline and treats local course order as configurable. The Common Core document itself defines mathematical outcomes but does not mandate one high-school course sequence.

The attached course table and the full lesson bank were checked against Grade 7, Grade 8, and all high-school Common Core clusters in these official strands:

- [Number and Quantity](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf): real numbers, quantities, units, graph scales, and measurement precision.
- [Algebra and Functions](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf): expressions, equations, inequalities, systems, multiple representations, and linear, quadratic, and exponential models.
- [Statistics and Probability](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf): numerical data, categorical data, two-way relative frequencies, events, unions, intersections, and complements.

The machine-readable contract currently contains all 73 clusters: 9 in Grade 7, 10 in Grade 8, and 54 high-school clusters. Grade 12 also includes precalculus, calculus, finance, and discrete-model extensions beyond the Common Core baseline. “Complete” in this document means every baseline cluster has named lesson evidence and reviewed questions; it does not mean every state, district, AP, IB, or local course sequence is identical.

## Full-bank audit repairs

| Previously missing cluster | New lesson evidence | Instructional representation |
| --- | --- | --- |
| HSS.ID.C · Interpret linear models | `g9-interpret-linear-models` | Fitted data, slope and intercept in context, association versus causation, extrapolation boundary. |
| HSG.CO.D · Geometric constructions | `g10-geometric-constructions` | Interactive compass-arc perpendicular and angle bisectors. |
| HSG.SRT.B · Similarity theorems | `g10-similarity-proofs` | Proportional side reasoning and similarity proof decisions. |
| HSG.SRT.D · Laws of Sines and Cosines | `g10-laws-of-sines-and-cosines` | Adjustable non-right triangle with side and area calculations. |
| HSG.GMD.B · Cross-sections and rotations | `g10-cross-sections-and-rotations` | Movable plane slicing a sphere and updating radius and area. |
| HSN.CN.A · Complex arithmetic | `g11-complex-arithmetic` | Complex-plane controls and multiplication-by-i rotation. |
| HSN.CN.C · Complex polynomial solutions | `g11-complex-polynomial-solutions` | Conjugate roots connected to the complex plane. |
| HSA.APR.C · Polynomial identities | `g11-polynomial-identities` | Adjustable area proof of `(x + 2)² = x² + 4x + 4`. |
| HSS.MD.B · Decision strategies | `g12-decision-strategies` | Interactive comparison of sure and risky expected values. |

## Audited topic map

| Requested topic | Coverage after audit | Lesson evidence |
| --- | --- | --- |
| Sets and Venn diagrams | Complete | `g10-sets-and-venn-diagrams` explicitly covers union, intersection, complement, subsets, and overlap counting. |
| Real numbers and real-world quantities | Complete | `g9-properties-real-numbers`; `g9-quantities-units-precision`. |
| Linear equations and inequalities in one variable | Complete | `g9-multi-step-linear-equations`; `g9-linear-inequalities-g9`. |
| Linear equations in two variables | Complete | `g9-linear-equation-forms`; `g9-graph-linear-functions`. |
| Linear functions and models | Complete | `g9-slope-from-points`; `g9-linear-equation-forms`; `g9-graph-linear-functions`. |
| Relationships among linear functions | Complete | `function-representations`; `comparing-functions`; `g9-linear-vs-exponential`; `g9-modeling-decisions`. |
| Systems of linear equations | Complete | Graphing, substitution, elimination, and modeling lessons in Grade 9. |
| Linear inequalities | Complete | One-variable inequalities plus `g9-graph-linear-inequalities` and `g9-systems-linear-inequalities` for half-planes and feasible regions. |
| Categorical data | Complete | `g10-categorical-data` covers joint, marginal, and conditional relative frequencies and group comparisons. |
| Numerical data | Complete | `g9-one-variable-data`; `g10-data-displays`. |
| Absolute value functions and inequalities | Complete | `g9-absolute-value-functions`; `g9-absolute-value-inequalities`. |
| Polynomial multiplication | Complete | `g9-multiply-monomials`; `g9-multiply-binomials`. |
| Polynomial addition and subtraction | Complete | `g9-add-subtract-polynomials`. |
| Solve quadratics by graphing and factoring | Complete | `g9-quadratic-graphs`; `g9-solve-by-factoring`. |
| Solve quadratics by square roots | Complete | `g9-solve-by-square-roots`. |
| Build quadratic functions and models | Complete | `g9-build-quadratic-models`. |
| Exponential functions | Complete | Grade 9 growth, decay, and linear-versus-exponential lessons, with later Grade 11 extension. |

## Why topics were missing

The first curriculum model treated one lesson with one standard label as evidence for an entire topic. That created false coverage: a sample-space lesson stood in for Venn reasoning; one-variable inequalities stood in for two-variable half-planes; quadratic graph reading stood in for building a model; and a broad geometry or statistics domain could appear while constructions, non-right-triangle laws, cross-sections, linear-model interpretation, or decision strategies were still absent.

The repair changes the definition of coverage:

1. A standard label alone is not evidence.
2. Distinct representations and decisions need named lesson objectives.
3. Each named lesson needs five reviewed questions and an answer interaction suited to the response.
4. Symbolically fragile responses use authored choices unless an equivalence-aware editor exists.
5. Every one of the 73 baseline clusters and every requested Algebra strand is listed in `lib/curriculum-coverage.ts`; validation fails if a required lesson disappears or its standard mapping drifts.
6. New content is appended inside an existing region so saved lesson IDs do not change.

## Maintenance gate

When adding or reorganizing curriculum, review standards at the cluster and individual-standard level, then test concept, representation, procedure, modeling, and interpretation separately. Do not count a neighboring topic, repeated title, or broad domain code as complete coverage.
