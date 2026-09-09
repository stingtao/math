import assert from "node:assert/strict";
import test from "node:test";
import { middleDepthPacks } from "../lib/curriculum-depth-middle.ts";

const question = (slug, n) => middleDepthPacks.find((pack) => pack.lessonSlug === slug).questions.find((item) => item.id === `d1-q${n}`);
const numericAnswer = (item) => {
  const parts = item.answer.split("|")[0].split("/").map(Number);
  return parts.length === 1 ? parts[0] : parts[0] / parts[1];
};
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const mad = (values) => mean(values.map((value) => Math.abs(value - mean(values))));
const range = (values) => Math.max(...values) - Math.min(...values);
const slope = ([x1, y1], [x2, y2]) => (y2 - y1) / (x2 - x1);
const surfaceArea = (length, width, height) => 2 * (length * width + length * height + width * height);
const intersect = (m1, b1, m2, b2) => {
  const x = (b2 - b1) / (m1 - m2);
  return [x, m1 * x + b1];
};
const parsePoint = (answer) => answer.match(/-?\d+(?:\.\d+)?/g).map(Number);

test("middle-grade numeric answers agree with independent calculations from the problem data", () => {
  const cases = [
    ["g7-proportional-tables", 1, 21 * (8 / 12)], ["g7-proportional-tables", 2, 8 * (7.5 / 5)],
    ["g7-equation-word-models", 1, (58 - 9) / 7], ["g7-equation-word-models", 2, (42 - 6) / 4],
    ["g7-equation-word-models", 6, Math.floor((30 - 7) / 4)],
    ["g7-surface-area", 1, surfaceArea(6, 4, 3)], ["g7-surface-area", 2, surfaceArea(8, 3, 2)],
    ["g7-surface-area", 6, surfaceArea(8, 5, 3) - 8 * 5],
    ["g7-compare-distributions", 1, mad([2, 4, 6, 8])], ["g7-compare-distributions", 2, mad([5, 5, 9, 9])],
    ["slope-rate", 1, slope([-2, 7], [4, -5])], ["slope-rate", 2, slope([-3, -4], [5, 2])],
    ["systems-graphing", 1, intersect(3, -2, -1, 6)[0]], ["systems-graphing", 2, intersect(2, 5, -1, -1)[1]],
    ["dilations-similarity", 1, 14 * (12 / 8)], ["dilations-similarity", 2, 20 * (9 / 15)],
    ["scatter-plots", 1, 20 - (3 * 4 + 2)], ["scatter-plots", 2, (2 * 6 + 5) - 11],
    ["g9-graph-linear-inequalities", 1, Math.ceil(2 * 3 + 1) - 1], ["g9-graph-linear-inequalities", 2, Math.floor((14 - 3 * 2) / 2)],
    ["g9-build-quadratic-models", 1, 8 / ((1 + 1) * (1 - 3))], ["g9-build-quadratic-models", 2, -16 / ((0 + 2) * (0 - 4))],
    ["g9-system-models", 1, (380 - 40 * 7) / (12 - 7)], ["g9-system-models", 2, (50 - 18 * 2) / (4 - 2)],
    ["g9-interpret-linear-models", 1, 23 - (2.5 * 4 + 10)], ["g9-interpret-linear-models", 2, 25 - (-1.5 * 8 + 40)],
  ];
  for (const [slug, n, calculated] of cases) assert.equal(numericAnswer(question(slug, n)), calculated, `${slug}/d1-q${n}`);
});

test("coordinate answers are the independently solved intersections and dilated images", () => {
  const cases = [
    ["systems-graphing", 3, intersect(1, 2, -1, 4)],
    ["systems-graphing", 4, intersect(2, 1, -1, -5)],
    ["dilations-similarity", 3, [-2, 1].map((coordinate) => coordinate * 2)],
    ["dilations-similarity", 4, [6, -4].map((coordinate) => coordinate / 2)],
  ];
  for (const [slug, n, point] of cases) {
    const item = question(slug, n);
    assert.deepEqual(parsePoint(item.answer), point);
    assert.ok(point[0] >= item.interactionConfig.xMin && point[0] <= item.interactionConfig.xMax);
    assert.ok(point[1] >= item.interactionConfig.yMin && point[1] <= item.interactionConfig.yMax);
  }
});

function evaluatePlot(plot, x) {
  if (plot.kind === "linear") return plot.a * x + plot.b;
  if (plot.kind === "quadratic") return plot.a * (x - plot.h) ** 2 + plot.k;
  throw new Error(`Unexpected graph family ${plot.kind}`);
}

test("graph choices uniquely satisfy their authored coordinates and vertex constraints", () => {
  const cases = [
    ["slope-rate", 3, [[0, 3], [2, 2], [4, 1]]],
    ["slope-rate", 4, [[0, -2], [2, 1], [4, 4]]],
    ["g9-graph-linear-inequalities", 3, [[0, 4], [2, 0]]],
    ["g9-graph-linear-inequalities", 4, [[0, 2], [4, 4]]],
    ["g9-build-quadratic-models", 3, [[2, 9], [0, 1]], [2, 9]],
    ["g9-build-quadratic-models", 4, [[-1, -4], [1, 4]], [-1, -4]],
  ];
  for (const [slug, n, points, vertex] of cases) {
    const item = question(slug, n);
    const matches = item.interactionConfig.plots.filter((plot) =>
      points.every(([x, y]) => Math.abs(evaluatePlot(plot, x) - y) < 1e-9)
      && (!vertex || plot.h === vertex[0] && plot.k === vertex[1]));
    assert.equal(matches.length, 1, `${slug}/d1-q${n} needs one geometrically correct graph`);
    assert.equal(item.answer, matches[0].value);
  }
});

const selectedRows = (slug, n, predicate) => {
  const item = question(slug, n);
  const rows = item.interactionConfig.rows.filter(predicate);
  assert.equal(rows.length, 1, `${slug}/d1-q${n} needs one mathematically correct row`);
  assert.equal(item.answer, rows[0].value);
};

test("proportion, budget, and face tables are validated from their displayed data", () => {
  for (const [n, xs] of [[3, [2, 4, 6]], [4, [1, 3, 5]]]) {
    selectedRows("g7-proportional-tables", n, (row) => {
      const ratios = row.cells.slice(1).map((cell, index) => Number(cell) / xs[index]);
      return ratios.every((ratio) => Math.abs(ratio - ratios[0]) < 1e-9);
    });
  }
  for (const [n, fee, perItem, budget] of [[3, 5, 3, 22], [4, 4, 2.5, 17]]) {
    const item = question("g7-equation-word-models", n);
    for (const row of item.interactionConfig.rows) assert.equal(Number(row.cells[1].replace("$", "")), fee + perItem * Number(row.cells[0]));
    const maximum = Math.floor((budget - fee) / perItem);
    selectedRows("g7-equation-word-models", n, (row) => Number(row.cells[0]) === maximum);
  }
  for (const [n, expected] of [[3, [5 * 4, 5 * 2, 4 * 2]], [4, [2 * 7 * 3, 2 * 7 * 4, 2 * 3 * 4]]]) {
    selectedRows("g7-surface-area", n, (row) => row.cells.slice(1).every((cell, index) => Number(cell) === expected[index]));
  }
});

test("distribution and association tables have one correct data-based comparison", () => {
  for (const n of [3, 4]) {
    selectedRows("g7-compare-distributions", n, (row) => {
      const a = row.cells[1].split(",").map(Number);
      const b = row.cells[2].split(",").map(Number);
      return (n === 3 ? mean(b) > mean(a) : mean(b) < mean(a)) && range(b) < range(a);
    });
  }
  const correlation = (ys) => {
    const xs = [1, 2, 3, 4];
    const dx = xs.map((x) => x - mean(xs));
    const dy = ys.map((y) => y - mean(ys));
    const denominator = Math.sqrt(dx.reduce((s, x) => s + x * x, 0) * dy.reduce((s, y) => s + y * y, 0));
    return denominator ? dx.reduce((sum, x, i) => sum + x * dy[i], 0) / denominator : 0;
  };
  for (const [n, direction] of [[3, 1], [4, -1]]) selectedRows("scatter-plots", n, (row) => Math.abs(correlation(row.cells.slice(1).map(Number)) - direction) < 1e-9);
  for (const [n, xs, a, b] of [[3, [0, 2, 4], 3, 2], [4, [1, 3, 5], -2, 18]]) {
    selectedRows("g9-interpret-linear-models", n, (row) => row.cells.slice(1).every((cell, index) => Number(cell) === a * xs[index] + b));
  }
});

test("inequality choices obey strictness and contextual resource constraints", () => {
  const strict = question("g9-graph-linear-inequalities", 5);
  const included = (x, y) => y > -x + 2;
  const truths = [included(0, 3), !included(1, 1), !included(3, 0), included(0, 0)];
  const computed = strict.choices.filter((_, index) => truths[index]);
  assert.deepEqual(strict.answer.split(" ; ").sort(), computed.sort());
  const budget = question("g9-graph-linear-inequalities", 6);
  const feasible = (x, y) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && 4 * x + 3 * y <= 24;
  const budgetTruths = [feasible(5, 2), feasible(3, 4) && 4 * 3 + 3 * 4 === 24, !feasible(0, 8), feasible(2, 3) && 4 * 2 + 3 * 3 < 24];
  assert.deepEqual(budget.answer.split(" ; ").sort(), budget.choices.filter((_, index) => budgetTruths[index]).sort());
  const inventory = question("g9-system-models", 6);
  const validInventory = inventory.choices.filter((choice) => {
    const [bicycles, carts] = choice.match(/\d+/g).map(Number);
    return bicycles + carts === 10 && 2 * bicycles + 4 * carts === 34;
  });
  assert.deepEqual(validInventory, [inventory.answer]);
  const possibleRevenues = Array.from({ length: 6 }, (_, expensiveCount) => 7 * expensiveCount + 4 * (5 - expensiveCount));
  assert.ok(!possibleRevenues.includes(24));
  assert.match(question("g9-system-models", 5).answer, /4\/3/);
});

test("middle packs preserve paired, distinct evidence and documented scope limits", () => {
  assert.equal(middleDepthPacks.length, 12);
  assert.equal(middleDepthPacks.reduce((total, pack) => total + pack.questions.length, 0), 72);
  for (const pack of middleDepthPacks) {
    assert.equal(pack.objectives.length, 3);
    assert.equal(new Set(pack.questions.map((item) => item.prompt)).size, 6);
    assert.equal(new Set(pack.questions.map((item) => item.hint)).size, 6);
    assert.equal(new Set(pack.questions.map((item) => item.explanation)).size, 6);
    assert.ok(pack.remainingGaps.length >= 1);
    for (const objective of pack.objectives) {
      const variants = pack.questions.filter((item) => item.evidence.objectiveId === objective.id);
      assert.equal(variants.length, 2);
      assert.equal(new Set(variants.map((item) => item.evidence.variantFamily)).size, 1);
    }
  }
});
