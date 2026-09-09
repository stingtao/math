import assert from "node:assert/strict";
import type { LessonDefinition } from "../lib/curriculum.ts";
import { depthPacks, firstDepthPacks, round2DepthPacks, round3DepthPacks, getQuestionBank, lessonCoverage } from "../lib/curriculum-depth.ts";

export const firstTargetedLessonSlugs = [
  "g7-proportional-tables", "g7-equation-word-models", "g7-surface-area", "g7-compare-distributions",
  "slope-rate", "systems-graphing", "dilations-similarity", "scatter-plots",
  "g9-graph-linear-inequalities", "g9-build-quadratic-models", "g9-system-models", "g9-interpret-linear-models",
  "g10-geometric-constructions", "g10-proof-structure", "g10-sets-and-venn-diagrams", "g10-cross-sections-and-rotations",
  "g11-matrix-operations", "g11-trig-identities-equations", "g11-rational-function-models", "g11-confidence-intervals",
  "g12-inference-for-proportions", "g12-inference-for-means", "g12-infinite-series", "g12-differential-equations",
];

export const secondTargetedLessonSlugs = [
  "g7-percent-change", "g7-constructing-triangles", "g7-random-samples", "g7-compound-events",
  "function-representations", "comparing-functions", "pythagorean-theorem", "two-way-tables",
  "g9-quantities-units-precision", "g9-absolute-value-inequalities", "g9-linear-quadratic-systems", "g9-modeling-decisions",
  "g10-similarity-proofs", "g10-conditional-probability", "g10-independence", "g10-categorical-data",
  "g11-rational-equations", "g11-exponential-log-equations", "g11-trig-graphs", "g11-normal-distributions",
  "g12-continuity", "g12-chain-rule", "g12-definite-integrals", "g12-sampling-distributions",
];
export const thirdTargetedLessonSlugs = [
  "g7-scale-drawings", "g7-rational-word-problems", "g7-inequalities-g7", "g7-informal-inference",
  "scientific-operations", "systems-algebra", "g8-composed-transformations", "lines-of-fit",
  "g9-systems-linear-inequalities", "g9-factoring-completely", "g9-linear-vs-exponential", "g9-correlation-residuals",
  "g10-triangle-congruence", "g10-coordinate-proofs", "g10-circle-theorem-proofs", "g10-modeling-with-geometry",
  "g11-polynomial-roots", "g11-infinite-geometric-series", "g11-radians-unit-circle", "g11-matrix-systems",
  "g12-limit-from-table-graph", "g12-optimization", "g12-fundamental-theorem", "g12-study-design",
];
export const targetedLessonSlugs = [...firstTargetedLessonSlugs, ...secondTargetedLessonSlugs, ...thirdTargetedLessonSlugs];

export function validateDepthCurriculum(lessons: LessonDefinition[]) {
  assert.deepEqual(firstDepthPacks.map((pack) => pack.lessonSlug).sort(), [...firstTargetedLessonSlugs].sort(), "Preserve the 24 first-round lesson slices");
  assert.deepEqual(round2DepthPacks.map((pack) => pack.lessonSlug).sort(), [...secondTargetedLessonSlugs].sort(), "Keep the 24 second-round lesson slices");
  assert.deepEqual(round3DepthPacks.map((pack) => pack.lessonSlug).sort(), [...thirdTargetedLessonSlugs].sort(), "Keep the 24 third-round lesson slices");
  assert.equal(new Set(depthPacks.map((pack) => pack.lessonSlug)).size, 72, "Each pack audits a different lesson");
  for (const pack of depthPacks) {
    const lesson = lessons.find((item) => item.slug === pack.lessonSlug);
    assert.ok(lesson, `Missing ${pack.lessonSlug}`);
    assert.equal(pack.questions.length, 6, `${pack.lessonSlug} needs six reviewed additions`);
    assert.equal(pack.objectives.length, 3, `${pack.lessonSlug} needs three bounded objectives`);
    assert.equal(new Set(pack.objectives.map((o) => o.id)).size, 3);
    assert.equal(new Set(getQuestionBank(lesson).map((q) => q.id)).size, getQuestionBank(lesson).length);
    assert.ok(pack.exampleSteps.length >= 3 && pack.exampleSteps.every((step) => step.length >= 12));
    assert.ok(pack.remainingGaps.length > 0, "Distinguish the audited slice from full pathway coverage");
    for (const [id, objectiveId] of Object.entries(pack.legacyObjectives)) {
      assert.ok(lesson.practice.some((q) => q.id === id), `${pack.lessonSlug}: old question ${id} no longer exists`);
      assert.ok(pack.objectives.some((objective) => objective.id === objectiveId));
    }
    for (const objective of pack.objectives) {
      const evidence = pack.questions.filter((q) => q.evidence.objectiveId === objective.id);
      assert.equal(evidence.length, 2, `${pack.lessonSlug}/${objective.id} needs a pair of transfer variants`);
      assert.equal(new Set(evidence.map((q) => q.evidence.variantFamily)).size, 1);
      assert.equal(new Set(evidence.map((q) => q.prompt)).size, 2);
      assert.ok(objective.requiredDemands.length > 0);
      assert.ok(objective.requiredDemands.every((demand) => evidence.some((q) => q.evidence.demand === demand)));
    }
    const demands = new Set(pack.questions.map((q) => q.evidence.demand));
    assert.ok(demands.has("procedure") && demands.has("representation") && (demands.has("reasoning") || demands.has("application")), `${pack.lessonSlug} must assess doing, representing, and reasoning/applying`);
    for (const question of pack.questions) {
      assert.match(question.id, firstDepthPacks.includes(pack) ? /^d1-q[1-6]$/ : round2DepthPacks.includes(pack) ? /^d2-q[1-6]$/ : /^d3-q[1-6]$/);
      assert.ok(question.explanation.length >= 20 && question.hint.length >= 12);
      assert.notEqual(question.explanation, question.hint, "A hint and a worked answer have different jobs");
      assert.ok(question.evidence.misconception.length >= 10);
      assert.ok([1, 2, 3].includes(question.evidence.difficulty));
      if (question.evidence.representation === "table") assert.equal(question.interactionConfig?.kind, "table-choice");
      if (question.evidence.representation === "graph") assert.ok(["graph-choice", "coordinate-grid", "number-line"].includes(question.interaction));
      if (!firstDepthPacks.includes(pack) && question.interactionConfig?.kind === "graph-choice") {
        assert.ok(question.interactionConfig.plots.every((plot) => plot.label.length >= 20 && plot.optionLabel), "New graphs need descriptive accessible names and short visible labels");
      }
    }
    assert.ok(lessonCoverage(lesson).objectives.every((objective) => objective.status === "practiced"));
  }
  return { lessons: depthPacks.length, objectives: depthPacks.reduce((n, pack) => n + pack.objectives.length, 0), questions: depthPacks.reduce((n, pack) => n + pack.questions.length, 0) };
}
