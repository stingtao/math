# Curriculum coverage baseline

This document records the audited Algebra I scope that must remain covered across the Grade 7–12 learning path. It is a product coverage contract, not a claim that the United States has one federally prescribed course sequence.

## Standards boundary

Education and curriculum decisions in the United States are primarily state and local responsibilities. This project therefore uses the [Common Core State Standards for Mathematics](https://corestandards.org/mathematics-standards/) as a public, auditable baseline and treats local course order as configurable. The Common Core document itself defines mathematical outcomes but does not mandate one high-school course sequence.

The attached course table was checked against the current lesson bank and these official high-school strands:

- [Number and Quantity](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf): real numbers, quantities, units, graph scales, and measurement precision.
- [Algebra and Functions](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf): expressions, equations, inequalities, systems, multiple representations, and linear, quadratic, and exponential models.
- [Statistics and Probability](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf): numerical data, categorical data, two-way relative frequencies, events, unions, intersections, and complements.

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

The first curriculum model treated one lesson with one standard label as evidence for an entire topic. That created false coverage: a sample-space lesson stood in for Venn reasoning; one-variable inequalities stood in for two-variable half-planes; quadratic graph reading stood in for building a model; and a two-way table in Grade 8 stood in for high-school conditional relative frequency.

The repair changes the definition of coverage:

1. A standard label alone is not evidence.
2. Distinct representations and decisions need named lesson objectives.
3. Each named lesson needs five reviewed questions and an answer interaction suited to the response.
4. Symbolically fragile responses use authored choices unless an equivalence-aware editor exists.
5. Every requested strand is listed in `lib/curriculum-coverage.ts`; validation fails if a required lesson disappears or its standard mapping drifts.
6. New content is appended inside an existing region so saved lesson IDs do not change.

## Maintenance gate

When adding or reorganizing curriculum, review standards at the cluster and individual-standard level, then test concept, representation, procedure, modeling, and interpretation separately. Do not count a neighboring topic, repeated title, or broad domain code as complete coverage.
