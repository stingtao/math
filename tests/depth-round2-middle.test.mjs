import assert from "node:assert/strict";
import test from "node:test";
import { round2MiddleDepthPacks } from "../lib/curriculum-depth-round2-middle.ts";

const question = (slug, number) => round2MiddleDepthPacks.find((pack) => pack.lessonSlug === slug).questions.find((item) => item.id === `d2-q${number}`);
const numbers = (text) => text.replaceAll("−", "-").match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
const numericAnswer = (item) => {
  const first = item.answer.split("|")[0];
  const fraction = first.split("/").map(Number);
  return fraction.length === 2 ? fraction[0] / fraction[1] : Number(first);
};
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} versus ${expected}`);
const integerCount = (testValue) => Array.from({ length: 201 }, (_, index) => index - 100).filter(testValue).length;
const linearInitial = ([x1, y1], [x2, y2]) => y1 - x1 * (y2 - y1) / (x2 - x1);
const crossover = (m1, b1, m2, b2) => (b2 - b1) / (m1 - m2);
const nextQuadraticOutput = (outputs) => {
  const [a, b, c, d] = outputs;
  const secondDifference = (c - b) - (b - a);
  assert.equal((d - c) - (c - b), secondDifference);
  return d + (d - c) + secondDifference;
};

test("round two middle has 12 complete packs with two questions for each precise objective", () => {
  assert.equal(round2MiddleDepthPacks.length, 12);
  assert.equal(new Set(round2MiddleDepthPacks.map((pack) => pack.lessonSlug)).size, 12);
  for (const pack of round2MiddleDepthPacks) {
    assert.equal(pack.objectives.length, 3, pack.lessonSlug);
    assert.deepEqual(pack.questions.map((item) => item.id), [1, 2, 3, 4, 5, 6].map((n) => `d2-q${n}`));
    assert.ok(pack.exampleSteps.length >= 3);
    assert.ok(pack.remainingGaps.length >= 1);
    assert.deepEqual(pack.legacyObjectives, {}, "No unverified mapping from earlier questions is claimed.");
    for (const objective of pack.objectives) {
      const items = pack.questions.filter((item) => item.evidence.objectiveId === objective.id);
      assert.equal(items.length, 2, objective.id);
      assert.equal(new Set(items.map((item) => item.evidence.variantFamily)).size, 1, objective.id);
      for (const demand of objective.requiredDemands) assert.ok(items.some((item) => item.evidence.demand === demand), `${objective.id}: ${demand}`);
    }
    assert.equal(new Set(pack.questions.map((item) => item.hint)).size, 6);
    assert.equal(new Set(pack.questions.map((item) => item.explanation)).size, 6);
    for (const item of pack.questions) {
      assert.ok(item.hint.length > 25 && item.explanation.length > 50 && item.evidence.misconception.length > 25, `${pack.lessonSlug}/${item.id}`);
      if (item.evidence.representation === "table") {
        assert.equal(item.interactionConfig?.kind, "table-choice");
        for (const row of item.interactionConfig.rows) assert.equal(row.cells.length, item.interactionConfig.columns.length);
      }
      if (item.choices) assert.equal(new Set(item.choices).size, item.choices.length, "All distractors have distinct text.");
    }
  }
});

test("round two numerical answers agree with independent calculations from the stated input data", () => {
  const cases = [
    ["g7-percent-change", 1, 68 / (1 - 0.15)], ["g7-percent-change", 2, 126 / (1 + 0.05)],
    ["g7-constructing-triangles", 1, integerCount((x) => x > 0 && Math.abs(7 - 4) < x && x < 7 + 4)],
    ["g7-constructing-triangles", 2, integerCount((x) => x > 0 && Math.abs(10 - 6) < x && x < 10 + 6)],
    ["g7-random-samples", 1, 50 * 240 / 600], ["g7-random-samples", 2, 75 * 360 / 900],
    ["g7-compound-events", 1, (3 / 5) * (2 / 4)], ["g7-compound-events", 2, (4 / 6) * (3 / 5)],
    ["g7-compound-events", 6, 1 - (1 - 0.8) ** 2],
    ["function-representations", 1, linearInitial([2, 11], [6, 23])],
    ["function-representations", 2, linearInitial([3, 4], [9, 16])],
    ["comparing-functions", 1, crossover(3, 12, 5, 2)], ["comparing-functions", 2, crossover(4, 6, 2, 22)],
    ["pythagorean-theorem", 1, Math.hypot(8, 6, 24)], ["pythagorean-theorem", 2, Math.hypot(3, 4, 12)],
    ["two-way-tables", 1, (30 - 12) / 45], ["two-way-tables", 2, (44 - 26) / 40],
    ["g9-quantities-units-precision", 1, 18 * 1000 / 3600 * 40],
    ["g9-quantities-units-precision", 2, 2.4 * 75 / 60],
    ["g9-absolute-value-inequalities", 1, integerCount((x) => Math.abs(2 * x - 6) <= 8)],
    ["g9-absolute-value-inequalities", 2, integerCount((x) => Math.abs(3 * x + 3) < 12)],
    ["g9-modeling-decisions", 1, nextQuadraticOutput([2, 5, 12, 23])],
    ["g9-modeling-decisions", 2, nextQuadraticOutput([1, 6, 15, 28])],
  ];
  for (const [slug, n, result] of cases) close(numericAnswer(question(slug, n)), result, `${slug}/d2-q${n}`);
});

const selectUniqueRow = (slug, n, predicate) => {
  const item = question(slug, n);
  const rows = item.interactionConfig.rows.filter(predicate);
  assert.equal(rows.length, 1, `${slug}/d2-q${n}: unique correct row`);
  assert.equal(item.answer, rows[0].value);
};
const selectMaximumRow = (slug, n, score, eligible = () => true) => {
  const item = question(slug, n);
  const maximum = Math.max(...item.interactionConfig.rows.filter(eligible).map(score));
  selectUniqueRow(slug, n, (row) => eligible(row) && Math.abs(score(row) - maximum) < 1e-10);
};

test("percentage and sampling tables require comparing proportions from the displayed counts", () => {
  for (const n of [3, 4]) {
    selectMaximumRow("g7-percent-change", n, (row) => {
      const [, before, after] = row.cells;
      return (Number(after) - Number(before)) / Number(before);
    });
  }
  for (const [n, populationProportion] of [[3, 0.6], [4, 0.5]]) {
    selectMaximumRow("g7-random-samples", n, (row) => Math.abs(Number(row.cells[2]) / Number(row.cells[1]) - populationProportion));
  }
});

test("triangle-design tables satisfy strict geometry and material bounds simultaneously", () => {
  for (const [n, maximumPerimeter] of [[3, 20], [4, 30]]) {
    selectUniqueRow("g7-constructing-triangles", n, (row) => {
      const sides = row.cells.slice(1).map(Number).sort((a, b) => a - b);
      return sides[0] > 0 && sides[0] + sides[1] > sides[2] && sides.reduce((a, b) => a + b) <= maximumPerimeter;
    });
  }
});

test("joint-outcome tables exclude same-category outcomes before comparing empirical frequencies", () => {
  for (const n of [3, 4]) {
    selectMaximumRow("g7-compound-events", n, (row) => Number(row.cells[2]), (row) => row.cells[0] !== row.cells[1]);
  }
  const outcomes = ["H", "T"].flatMap((first) => ["H", "T"].map((second) => first + second));
  const excluded = outcomes.filter((outcome) => !outcome.includes("H"));
  const item = question("g7-compound-events", 5);
  assert.equal(excluded.length, 1);
  assert.ok(item.answer.includes(excluded[0]));
  const fraction = item.answer.match(/(\d+)\/(\d+)/);
  close(Number(fraction[1]) / Number(fraction[2]), excluded.length / outcomes.length, "Coin complement probability");
});

const evaluatePlot = (plot, x) => {
  if (plot.kind === "linear") return plot.a * x + plot.b;
  if (plot.kind === "quadratic") return plot.a * (x - plot.h) ** 2 + plot.k;
  if (plot.kind === "absolute") return plot.a * Math.abs(x - plot.h) + plot.k;
  throw new Error(`Unexpected graph type ${plot.kind}`);
};
const selectUniquePlot = (slug, n, predicate) => {
  const item = question(slug, n);
  const matches = item.interactionConfig.plots.filter(predicate);
  assert.equal(matches.length, 1, `${slug}/d2-q${n}: unique graph satisfies all conditions`);
  assert.equal(item.answer, matches[0].value);
  for (const plot of item.interactionConfig.plots) {
    assert.match(plot.optionLabel, /^Graph [A-D]$/);
    assert.ok(plot.label.length > 30, "Accessible graph labels describe shape and coordinates.");
  }
};

test("function graphs uniquely match all input-output observations or both comparison conditions", () => {
  for (const [n, points] of [[3, [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]]], [4, [[-1, 4], [0, 3], [1, 2], [2, 3], [3, 4]]]]) {
    selectUniquePlot("function-representations", n, (plot) => points.every(([x, y]) => Math.abs(evaluatePlot(plot, x) - y) < 1e-10));
  }
  selectUniquePlot("comparing-functions", 3, (plot) => evaluatePlot(plot, 0) < 4 && evaluatePlot(plot, 1) - evaluatePlot(plot, 0) > 2);
  selectUniquePlot("comparing-functions", 4, (plot) => evaluatePlot(plot, 0) > 5 && evaluatePlot(plot, 1) - evaluatePlot(plot, 0) < -1);
});

test("space-diagonal and conditional-rate tables have one mathematically correct choice", () => {
  for (const [n, diagonal] of [[3, 13], [4, 17]]) {
    selectUniqueRow("pythagorean-theorem", n, (row) => Math.abs(Math.hypot(...row.cells.slice(1).map(Number)) - diagonal) < 1e-10);
  }
  for (const n of [3, 4]) selectMaximumRow("two-way-tables", n, (row) => Number(row.cells[1]) / (Number(row.cells[1]) + Number(row.cells[2])));
});

test("mixed-unit table comparisons use dimensionally correct conversion factors", () => {
  const metersPerUnit = { cm: 0.01, m: 1, mm: 0.001, km: 1000 };
  const litersPerUnit = { mL: 0.001, L: 1, "m³": 1000, "cm³": 0.001 };
  selectMaximumRow("g9-quantities-units-precision", 3, (row) => Number(row.cells[1]) * metersPerUnit[row.cells[2]]);
  selectMaximumRow("g9-quantities-units-precision", 4, (row) => Number(row.cells[1]) * litersPerUnit[row.cells[2]]);
});

test("rounding intervals use half a stated step and the correct midpoint inclusion", () => {
  for (const [n, reported, step] of [[5, 2.4, 0.1], [6, 8, 0.2]]) {
    const item = question("g9-quantities-units-precision", n);
    const low = reported - step / 2;
    const high = reported + step / 2;
    const matches = item.choices.filter((choice) => {
      const endpoints = numbers(choice);
      return endpoints.length === 2 && Math.abs(endpoints[0] - low) < 1e-10 && Math.abs(endpoints[1] - high) < 1e-10 && /≤ [xm] </.test(choice);
    });
    assert.equal(matches.length, 1);
    assert.equal(item.answer, matches[0]);
    // Integer hundredths avoid floating-point midpoint artifacts in the rounding check.
    const roundHundredths = (value) => Math.floor((value * 100 + step * 50 + 1e-8) / (step * 100)) * step;
    close(roundHundredths(low), reported, "Included lower midpoint");
    close(roundHundredths(high), reported + step, "Excluded upper midpoint");
  }
});

test("absolute-value endpoints and the complete integer solution sets satisfy the original inequalities", () => {
  for (const [n, center, radius, direction] of [[3, 2, 3, 1], [4, -1, 4, -1]]) {
    const item = question("g9-absolute-value-inequalities", n);
    const endpoint = center + direction * radius;
    assert.equal(numericAnswer(item), endpoint);
    assert.ok(endpoint >= item.interactionConfig.min && endpoint <= item.interactionConfig.max);
    assert.equal(Math.abs(endpoint - center), radius);
  }
  assert.ok(2 * 0 + 3 >= 1, "The minimum of the q5 left side prevents the strict upper bound.");
  assert.ok(3 * 0 - 5 >= -8, "The minimum of the q6 left side satisfies the required lower bound.");
});

const parsePairs = (text) => [...text.replaceAll("−", "-").matchAll(/\((-?\d+),\s*(-?\d+)\)/g)].map((match) => [Number(match[1]), Number(match[2])]);
const quadraticRoots = (a, b, c) => {
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  if (discriminant === 0) return [-b / (2 * a)];
  return [(-b - Math.sqrt(discriminant)) / (2 * a), (-b + Math.sqrt(discriminant)) / (2 * a)];
};

test("linear-quadratic choices contain all valid pairs and tangent points are solved independently", () => {
  for (const [n, slope, intercept] of [[1, 1, 6], [2, 2, 3]]) {
    const item = question("g9-linear-quadratic-systems", n);
    const roots = quadraticRoots(1, -slope, -intercept);
    const matches = item.choices.filter((choice) => {
      const pairs = parsePairs(choice);
      return pairs.length === roots.length && new Set(pairs.map(([x]) => x)).size === roots.length && pairs.every(([x, y]) => y === x * x && y === slope * x + intercept);
    });
    assert.equal(matches.length, 1);
    assert.equal(item.answer, matches[0]);
  }
  for (const [n, parabolaB, parabolaC, slope, intercept] of [[3, 0, 0, 4, -4], [4, 2, 1, -2, -3]]) {
    const item = question("g9-linear-quadratic-systems", n);
    const roots = quadraticRoots(1, parabolaB - slope, parabolaC - intercept);
    assert.equal(roots.length, 1);
    const point = [roots[0], slope * roots[0] + intercept];
    assert.deepEqual(parsePairs(item.answer), [point]);
    assert.ok(point[0] >= item.interactionConfig.xMin && point[0] <= item.interactionConfig.xMax);
    assert.ok(point[1] >= item.interactionConfig.yMin && point[1] <= item.interactionConfig.yMax);
  }
  for (const [n, a, b, c, levels] of [[5, 1, -2, 3, [1, 2, 5]], [6, -1, -4, 5, [5, 9, 10]]]) {
    const counts = levels.map((level) => quadraticRoots(a, b, c - level).length);
    assert.deepEqual(numbers(question("g9-linear-quadratic-systems", n).answer), counts);
  }
});

test("model tables distinguish exponential ratios from additive, quadratic, and constant distractors", () => {
  for (const [n, growth] of [[3, true], [4, false]]) {
    selectUniqueRow("g9-modeling-decisions", n, (row) => {
      const values = row.cells.slice(1).map(Number);
      const ratios = values.slice(1).map((value, index) => value / values[index]);
      return values.every((value) => value > 0) && ratios.every((ratio) => Math.abs(ratio - ratios[0]) < 1e-10) && (growth ? ratios[0] > 1 : ratios[0] > 0 && ratios[0] < 1);
    });
  }
});

test("quantitative reasoning choices agree with independently calculated net changes and rates", () => {
  for (const [n, start, change] of [[5, 100, 0.2], [6, 160, 0.25]]) {
    const result = start * (1 + change) * (1 - change);
    const percentDecrease = (start - result) / start * 100;
    const item = question("g7-percent-change", n);
    const matches = item.choices.filter((choice) => {
      const amount = choice.match(/\$(\d+(?:\.\d+)?)/);
      const rate = choice.match(/(\d+(?:\.\d+)?)% decrease/);
      return amount && rate && Math.abs(Number(amount[1]) - result) < 1e-10 && Math.abs(Number(rate[1]) - percentDecrease) < 1e-10;
    });
    assert.deepEqual(matches, [item.answer]);
  }
  for (const [n, successesA, totalA, successesB, totalB] of [[5, 30, 50, 60, 100], [6, 24, 40, 12, 20]]) {
    close(successesA / totalA, successesB / totalB, "Observed conditional rates agree");
    close(numbers(question("two-way-tables", n).answer)[0] / 100, successesA / totalA, "Reported rate");
  }
  assert.equal(numbers(question("pythagorean-theorem", 6).answer)[0], Math.sqrt(10 ** 2 - 8 ** 2));
  const posterTie = crossover(2, 20, 4, 4);
  assert.equal(numbers(question("comparing-functions", 5).answer)[0], posterTie);
  assert.ok(question("comparing-functions", 5).answer.includes("greater than "));
  assert.ok(20 + 2 * (posterTie + 1) < 4 + 4 * (posterTie + 1));
  const rentalTie = crossover(4, 6, 2, 18);
  assert.deepEqual(numbers(question("comparing-functions", 6).answer), [rentalTie, rentalTie]);
  assert.ok(6 + 4 * (rentalTie - 1) < 18 + 2 * (rentalTie - 1));
  assert.ok(6 + 4 * (rentalTie + 1) > 18 + 2 * (rentalTie + 1));
});
