# Curriculum coverage baseline

This document records the audited Grade 7–12 baseline and the attached Algebra course scope. It is a product coverage contract, not a claim that the United States has one federally prescribed course sequence.

## Standards boundary

Education and curriculum decisions in the United States are primarily state and local responsibilities. This project therefore uses the [Common Core State Standards for Mathematics](https://corestandards.org/mathematics-standards/) as a public, auditable baseline and treats local course order as configurable. The Common Core document itself defines mathematical outcomes but does not mandate one high-school course sequence.

The attached course table and the full lesson bank were checked against Grade 7, Grade 8, and all high-school Common Core clusters in these official strands:

- [Number and Quantity](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf): real numbers, quantities, units, graph scales, and measurement precision.
- [Algebra and Functions](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf): expressions, equations, inequalities, systems, multiple representations, and linear, quadratic, and exponential models.
- [Statistics and Probability](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf): numerical data, categorical data, two-way relative frequencies, events, unions, intersections, and complements.

The machine-readable contract currently contains all 73 clusters: 9 in Grade 7, 10 in Grade 8, and 54 high-school clusters. Grade 12 also includes precalculus, calculus, finance, and discrete-model extensions beyond the Common Core baseline. “Complete” in this document means every baseline cluster has named lesson evidence and reviewed questions; it does not mean every state, district, AP, IB, or local course sequence is identical.

The 2026 depth audit also compared official sources with different jobs:

- [California Mathematics Framework](https://www.cde.ca.gov/ci/ma/cf/) for coherent big ideas, investigations, modeling, and equitable access.
- [New York Next Generation Mathematics Standards](https://www.nysed.gov/sites/default/files/programs/standards-instruction/nys-next-generation-mathematics-p-12-standards.pdf) for explicit course-level Algebra I outcomes such as linear–quadratic systems.
- [AP Calculus AB and BC Course and Exam Description](https://apcentral.collegeboard.org/media/pdf/ap-calculus-ab-and-bc-course-and-exam-description.pdf) for the complete ten-unit Calculus pathway.
- [AP Statistics](https://apcentral.collegeboard.org/courses/ap-statistics) for study design, probability, and inference for proportions, means, and regression.
- [Cambridge International AS & A Level Mathematics 9709 syllabus (2026–2027)](https://www.cambridgeinternational.org/Images/697427-2026-2027-syllabus.pdf) for advanced pure mathematics, probability, and statistics expectations across functions, trigonometry, calculus, and distributions.
- [Kang Chiao Xiugang school profile](https://www.kcis.com.tw/file/KCIS_Profile2021-2022.pdf) and its public course listings: Grades 7–10 follow IB MYP, while Grades 11–12 branch into IB DP or AP options including Algebra II, Geometry, Precalculus, Calculus AB/BC, and Statistics.
- [IB Diploma Mathematics](https://ibo.org/programmes/diploma-programme/curriculum/mathematics/) for Analysis and Approaches / Applications and Interpretation expectations around inquiry, technology, proof, modeling, and interpretation.

Kang Chiao is therefore represented as a pathway constraint, not a single fixed Grade 7–12 syllabus. The product preserves one continuous sequence while adding the depth needed for later AP and IB choices.

Cambridge International is recorded as a separate comparison authority because it is not a U.S. grade-level standard. Its advanced function, trigonometry, calculus, discrete distribution, and sampling outcomes are mapped to existing Grade 11–12 lessons in the machine-readable contract rather than being used to relabel the U.S.-aligned sequence.

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

## 2026 state, AP, and Kang Chiao/IB depth repairs

| Gap found in the broader comparison | Added lesson evidence | Why it is distinct |
| --- | --- | --- |
| Multi-step proportional decisions | `g7-percent-decision-chains` | Successive percentages require a changing base and a modeling decision, not one percent calculation. |
| Composed transformations | `g8-composed-transformations` | Learners must preserve intermediate images and reason about order. |
| Linear–quadratic systems | `g9-linear-quadratic-systems` | A linear-only systems unit does not satisfy the Algebra I mixed-system outcome. |
| Circle theorem proof chains | `g10-circle-theorem-proofs` | Using a theorem is different from proving it from radii, triangles, arcs, and angles. |
| Rational models and inverse trig | `g11-rational-function-models`; `g11-inverse-trigonometric-functions` | Precalculus/IB pathways require domain interpretation and inverse-function reasoning beyond algebraic manipulation. |
| Implicit differentiation and related rates | `g12-implicit-differentiation`; `g12-related-rates` | Both require differentiating a relationship before isolating the requested rate. |
| Numerical integration and differential equations | `g12-numerical-integration`; `g12-differential-equations` | These cover table-based accumulation, slope fields, initial conditions, and separable models. |
| BC series and non-Cartesian calculus | `g12-infinite-series`; `g12-parametric-polar-calculus` | Precalculus representations alone do not cover BC convergence or calculus on parametric/polar curves. |
| Study design and procedure-specific inference | `g12-study-design`; `g12-inference-for-proportions`; `g12-inference-for-means`; `g12-regression-inference` | One generic hypothesis-testing lesson cannot cover design, conditions, procedure choice, and contextual conclusions. |

These 16 additions contribute 80 reviewed questions. Each new lesson includes one five-step ordering task so a learner must reconstruct a method, not only recognize a result.

## Grade 8–9 representation and story upgrade

The middle-grade review found that topic coverage was strong but representation coverage was uneven. Grade 8 used nine interaction families and Grade 9 used eight, while several regions still relied almost entirely on fill-in calculation. The lesson story also reused one grade-level image even when the current region was about a different mathematical decision.

The repair adds 23 authored visual-reasoning missions—one in every Grade 8–9 region—without changing lesson IDs:

- Grade 8 now uses 11 interaction families and Grade 9 uses 10;
- structured graph choices cover constant-rate motion, absolute-value functions, linear routes, quadratic models, and exponential growth;
- structured table choices cover operation order, percent equivalence, equation balance, scientific notation, systems, transformations, geometry, volume, polynomial structure, and residual interpretation;
- every wrong-answer hint names the specific mathematical move needed for the retry;
- every Grade 8–9 story now renders a lesson-matched comic SVG instead of repeating one grade-wide hero image, so the visible structure, route, number line, growth curve, or evidence display matches the current model.

The content validator now enforces all 23 lesson identities, regional coverage, at least ten interaction families per Grade 8–9 grade, structured plot/table integrity, and stable question IDs.

## Grade 10–12 representation upgrade

The advanced-course audit found a second kind of gap: topic names and calculations were present, but 72–82% of questions in each advanced grade still used free-form fill-in. That over-tested symbolic entry while under-testing the representations students must interpret in Geometry, Algebra II, Precalculus, Calculus, and Statistics.

The repair adds 26 authored visual-reasoning missions while preserving every existing lesson ID:

- every Grade 10–12 region now contains at least one advanced interaction mission;
- `graph-choice` renders selectable function, conic, trigonometric, derivative, and integral models from structured plot data;
- `table-choice` renders proof reasons, conditional denominators, sequences, limits, confidence statements, probability parameters, and study designs as selectable rows;
- coordinate plotting, number-line boundaries, and multi-select reasoning now appear in advanced lessons where those representations carry the concept;
- every advanced grade now uses at least nine interaction families, and the validator checks plot data, table shape, answer alignment, keyboard completion, and regional coverage.

Story coverage is also region-specific rather than one generic space wrapper. The 24 advanced regions now connect their own mathematics to a coherent decision—structural proof, crater rangefinding, signal phase, comet tracking, live velocity, resource accumulation, uncertainty, or network choice—and the accompanying SVG names the mathematical signals used in that decision.

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
5. Every one of the 73 baseline clusters, every requested Algebra strand, and each state/AP/Kang Chiao/IB extension is listed in `lib/curriculum-coverage.ts`; validation fails if required lesson evidence disappears.
6. New content is appended inside an existing region so saved lesson IDs do not change.

## Maintenance gate

When adding or reorganizing curriculum, review standards at the cluster and individual-standard level, then test concept, representation, procedure, modeling, and interpretation separately. Do not count a neighboring topic, repeated title, or broad domain code as complete coverage.
