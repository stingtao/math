import assert from "node:assert/strict";
import test from "node:test";
import { round3MiddleDepthPacks } from "../lib/curriculum-depth-round3-middle.ts";

const question = (slug, n) => round3MiddleDepthPacks.find((pack) => pack.lessonSlug === slug).questions.find((item) => item.id === `d3-q${n}`);
const normalized = (text) => text.replaceAll("−", "-");
const numbers = (text) => normalized(text).match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
const asNumber = (text) => Number(normalized(text));
const numericAnswer = (item) => {
  const parts = item.answer.split("|")[0].split("/").map(asNumber);
  return parts.length === 1 ? parts[0] : parts[0] / parts[1];
};
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} versus ${expected}`);
const parsePoints = (text) => [...normalized(text).matchAll(/\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
const solveSystem = (a, b, c, d, e, f) => [(c * e - b * f) / (a * e - b * d), (a * f - c * d) / (a * e - b * d)];
const linePrediction = ([x1, y1], [x2, y2], x) => y1 + (x - x1) * (y2 - y1) / (x2 - x1);
const squaredError = (points, model) => points.reduce((sum, [x, y]) => sum + (y - model(x)) ** 2, 0);
const absoluteError = (points, model) => points.reduce((sum, [x, y]) => sum + Math.abs(y - model(x)), 0);
const countPairs = (predicate) => Array.from({ length: 11 }, (_, x) => Array.from({ length: 11 }, (_, y) => predicate(x, y) ? 1 : 0)).flat().reduce((a, b) => a + b, 0);

test("third-round middle packs contain 72 questions with bounded, paired objectives and honest scope", () => {
  assert.equal(round3MiddleDepthPacks.length, 12);
  assert.equal(new Set(round3MiddleDepthPacks.map((pack) => pack.lessonSlug)).size, 12);
  for (const pack of round3MiddleDepthPacks) {
    assert.equal(pack.objectives.length, 3);
    assert.deepEqual(pack.questions.map((q) => q.id), [1, 2, 3, 4, 5, 6].map((n) => `d3-q${n}`));
    assert.ok(pack.exampleSteps.length >= 3 && pack.remainingGaps.length >= 1);
    assert.deepEqual(pack.legacyObjectives, {}, "No unverified legacy skill mappings.");
    assert.equal(new Set(pack.questions.map((q) => q.hint)).size, 6);
    assert.equal(new Set(pack.questions.map((q) => q.explanation)).size, 6);
    for (const objective of pack.objectives) {
      const items = pack.questions.filter((q) => q.evidence.objectiveId === objective.id);
      assert.equal(items.length, 2, objective.id);
      assert.equal(new Set(items.map((q) => q.evidence.variantFamily)).size, 1);
      for (const demand of objective.requiredDemands) assert.ok(items.some((q) => q.evidence.demand === demand));
    }
    const demands = new Set(pack.questions.map((q) => q.evidence.demand));
    assert.ok(demands.has("procedure") && demands.has("representation") && (demands.has("reasoning") || demands.has("application")));
    for (const item of pack.questions) {
      assert.ok(item.hint.length > 25 && item.explanation.length > 50 && item.evidence.misconception.length > 25);
      if (item.evidence.representation === "table") {
        assert.equal(item.interactionConfig.kind, "table-choice");
        for (const row of item.interactionConfig.rows) assert.equal(row.cells.length, item.interactionConfig.columns.length);
      }
      if (item.choices) assert.equal(new Set(item.choices).size, item.choices.length);
      if (item.answer.includes("|")) assert.ok(item.answer.split("|").every((alias) => /^-?\d+(?:\.\d+)?(?:\/\d+)?$/.test(alias)), "Pipes are only numeric answer aliases.");
    }
  }
});

test("numerical answers use independent geometry, signed arithmetic, system solving, and residual formulas", () => {
  const cases = [
    ["g7-scale-drawings", 1, (6 * 200 / 100) * (4 * 200 / 100)],
    ["g7-scale-drawings", 2, (5 * 300 / 100) * (3 * 300 / 100)],
    ["g7-rational-word-problems", 1, -7.5 - (-2.25 + 1.5)],
    ["g7-rational-word-problems", 2, -3.25 - (-12.5 + 7.75)],
    ["g7-inequalities-g7", 1, Math.ceil((40 - 18) / 4.5)],
    ["g7-inequalities-g7", 2, Math.floor((35 - 8) / 3.5)],
    ["g7-informal-inference", 1, 2000 * (25 / 50 - 30 / 75)],
    ["g7-informal-inference", 2, 1500 * (18 / 40 - 28 / 80)],
    ["systems-algebra", 1, solveSystem(2, 3, 17, 3, -2, 6)[0]],
    ["systems-algebra", 2, solveSystem(3, 2, 4, 5, -3, 13)[1]],
    ["lines-of-fit", 1, linePrediction([2, 7], [6, 15], 4)],
    ["lines-of-fit", 2, linePrediction([1, 18], [5, 10], 3)],
    ["g9-systems-linear-inequalities", 1, countPairs((x, y) => x >= 0 && y >= 0 && x + y <= 3)],
    ["g9-systems-linear-inequalities", 2, countPairs((x, y) => x >= 1 && y >= 1 && x + y <= 4)],
    ["g9-linear-vs-exponential", 1, Math.sqrt(225 / 100)],
    ["g9-linear-vs-exponential", 2, Math.sqrt(45 / 80)],
    ["g9-correlation-residuals", 1, squaredError([[0, 2], [1, 2], [2, 7]], (x) => 2 * x + 1)],
    ["g9-correlation-residuals", 2, squaredError([[0, 4], [1, 6], [2, 1]], (x) => -x + 5)],
  ];
  for (const [slug, n, result] of cases) near(numericAnswer(question(slug, n)), result, `${slug}/d3-q${n}`);
});

const selectUniqueRow = (slug, n, predicate) => {
  const item = question(slug, n);
  const matches = item.interactionConfig.rows.filter(predicate);
  assert.equal(matches.length, 1, `${slug}/d3-q${n}: unique eligible row`);
  assert.equal(item.answer, matches[0].value);
};
const selectExtremeRow = (slug, n, score, minimum = false, eligible = () => true) => {
  const item = question(slug, n);
  const scores = item.interactionConfig.rows.filter(eligible).map(score);
  const extreme = minimum ? Math.min(...scores) : Math.max(...scores);
  selectUniqueRow(slug, n, (row) => eligible(row) && Math.abs(score(row) - extreme) < 1e-9);
};

test("scale-plan rows meet both specified dimensions and resized maps use inverse scale changes", () => {
  for (const [n, length, width, metersPerCm] of [[3, 12, 8, 2], [4, 15, 10, 2.5]]) {
    selectUniqueRow("g7-scale-drawings", n, (row) => Number(row.cells[1]) * metersPerCm === length && Number(row.cells[2]) * metersPerCm === width);
  }
  const fraction = question("g7-scale-drawings", 5).answer.match(/(\d+)\/(\d+)/);
  near(Number(fraction[1]) / Number(fraction[2]), 4 / 1.5, "Enlarged map scale");
  near(numbers(question("g7-scale-drawings", 6).answer)[0], 3 / 0.6, "Reduced map scale");
});

test("ledger tables use chronological accumulated changes and routes separate displacement from distance", () => {
  for (const [n, start, threshold] of [[3, 5.5, 0], [4, 3, -2]]) {
    const item = question("g7-rational-word-problems", n);
    let current = start;
    const crossing = item.interactionConfig.rows.find((row) => {
      current += asNumber(row.cells[1]);
      return current < threshold;
    });
    assert.ok(crossing);
    assert.equal(item.answer, crossing.value);
  }
  for (const [n, positions] of [[5, [-2.5, 4, 1]], [6, [-3, -8.5, -1]]]) {
    const displacement = positions[2] - positions[0];
    const distance = Math.abs(positions[1] - positions[0]) + Math.abs(positions[2] - positions[1]);
    assert.deepEqual(numbers(question("g7-rational-word-problems", n).answer), [displacement, distance]);
  }
});

test("inequality tables enforce both bounds and negative division choices match the original inequalities", () => {
  selectUniqueRow("g7-inequalities-g7", 3, (row) => Number(row.cells[1]) >= 2 && Number(row.cells[2]) <= 30);
  selectUniqueRow("g7-inequalities-g7", 4, (row) => Number(row.cells[1]) >= 2500 && Number(row.cells[2]) < 12);
  for (const [n, original] of [[5, (x) => 5 - 2 * x < 11], [6, (x) => 4 - 3 * x >= 19]]) {
    const item = question("g7-inequalities-g7", n);
    const candidates = item.choices.filter((choice) => {
      const [, operator, bound] = normalized(choice).match(/^x ([<>≤≥]) (-?\d+)/);
      const compare = (x) => operator === ">" ? x > Number(bound) : operator === "<" ? x < Number(bound) : operator === "≤" ? x <= Number(bound) : x >= Number(bound);
      return Array.from({ length: 81 }, (_, index) => (index - 40) / 4).every((x) => original(x) === compare(x));
    });
    assert.deepEqual(candidates, [item.answer]);
  }
});

test("repeated-sample ranges and threshold claims are calculated from the displayed evidence", () => {
  for (const n of [3, 4]) selectExtremeRow("g7-informal-inference", n, (row) => {
    const estimates = row.cells[2].split(",").map(Number);
    return Math.max(...estimates) - Math.min(...estimates);
  }, true);
  for (const [n, estimate, spread, threshold] of [[5, 52, 6, 50], [6, 47, 5, 50]]) {
    const interval = [estimate - spread, estimate + spread];
    assert.deepEqual(numbers(question("g7-informal-inference", n).answer).slice(0, 2), interval);
    assert.ok(interval[0] < threshold && interval[1] > threshold);
    assert.ok(question("g7-informal-inference", n).answer.startsWith("No;"));
  }
});

const scientificValue = (text) => {
  const match = text.match(/^(\d+(?:\.\d+)?) × 10\^(-?\d+)$/);
  assert.ok(match, `Unrecognized scientific-notation value ${text}`);
  return Number(match[1]) * 10 ** Number(match[2]);
};

test("scientific operations align powers, compare actual totals, and cancel rate units correctly", () => {
  for (const [n, value] of [[1, 4.2e5 + 6e4], [2, 7.1e-3 - 8e-4]]) {
    const item = question("scientific-operations", n);
    const matches = item.choices.filter((choice) => Math.abs(scientificValue(choice) - value) < 1e-10);
    assert.deepEqual(matches, [item.answer]);
    const coefficient = Number(item.answer.split(" × ")[0]);
    assert.ok(coefficient >= 1 && coefficient < 10);
  }
  for (const n of [3, 4]) selectExtremeRow("scientific-operations", n, (row) => scientificValue(row.cells[1]) * Number(row.cells[2]));
  for (const [n, quantity, rate] of [[5, 6e8, 2e6], [6, 8.4e8, 2.1e6]]) {
    near(numbers(question("scientific-operations", n).answer)[0], quantity / rate, "Quantity divided by rate");
    assert.match(question("scientific-operations", n).answer, /seconds/);
  }
});

const translate = ([x, y], [dx, dy]) => [x + dx, y + dy];
const reflectX = ([x, y]) => [x, -y];
const reflectY = ([x, y]) => [-x, y];
const ccw = ([x, y]) => [-y, x];
const clockwise = ([x, y]) => [y, -x];

test("algebraic system and composite-transformation coordinates are independently solved and within grids", () => {
  const cases = [
    ["systems-algebra", 3, solveSystem(2, 1, 8, 1, -2, -1)],
    ["systems-algebra", 4, solveSystem(3, -1, -7, 2, 3, 10)],
    ["g8-composed-transformations", 1, reflectY(translate([1, 3], [-5, 2]))],
    ["g8-composed-transformations", 2, clockwise(translate([-3, 2], [-2, 1]))],
    ["g8-composed-transformations", 3, ccw(reflectY([-2, 1]))],
    ["g8-composed-transformations", 4, translate(clockwise([1, -3]), [4, 2])],
  ];
  for (const [slug, n, point] of cases) {
    const item = question(slug, n);
    assert.deepEqual(parsePoints(item.answer), [point]);
    if (item.interactionConfig?.kind === "coordinate-grid") {
      assert.ok(point[0] >= item.interactionConfig.xMin && point[0] <= item.interactionConfig.xMax);
      assert.ok(point[1] >= item.interactionConfig.yMin && point[1] <= item.interactionConfig.yMax);
    }
  }
  for (const [n, first, second] of [
    [5, translate(reflectY([1, 2]), [2, 0]), reflectY(translate([1, 2], [2, 0]))],
    [6, reflectX(ccw([2, 1])), ccw(reflectX([2, 1]))],
  ]) {
    assert.notDeepEqual(first, second);
    const item = question("g8-composed-transformations", n);
    assert.deepEqual(item.choices.filter((choice) => JSON.stringify(parsePoints(choice)) === JSON.stringify([first, second])), [item.answer]);
  }
});

test("system classifications compare constants as well as variable coefficients", () => {
  const expanded = [[2, 2, 10, 4, 4, 24], [3, -6, 12, 6, -12, 24]];
  for (const [index, [a, b, c, d, e, f]] of expanded.entries()) {
    const determinant = a * e - b * d;
    assert.equal(determinant, 0);
    const equivalent = c * d === f * a && c * e === f * b;
    assert.ok(question("systems-algebra", index + 5).answer.startsWith(equivalent ? "Infinitely many solutions;" : "No solution;"));
  }
});

test("fitting tables compare signed record residuals and reasoning choices aggregate absolute error", () => {
  selectExtremeRow("lines-of-fit", 3, (row) => Number(row.cells[2]) - (2 * Number(row.cells[1]) + 1));
  selectExtremeRow("lines-of-fit", 4, (row) => Number(row.cells[2]) - (3 * Number(row.cells[1]) + 2), true);
  for (const [n, points, modelA, modelB] of [
    [5, [[0, 1], [1, 4], [2, 5]], (x) => 2 * x + 1, (x) => 3 * x + 1],
    [6, [[0, 6], [1, 4], [2, 3]], (x) => 6 - x, (x) => 6 - 2 * x],
  ]) {
    const a = absoluteError(points, modelA);
    const b = absoluteError(points, modelB);
    const item = question("lines-of-fit", n);
    assert.ok(item.answer.startsWith(a < b ? "A;" : "B;"));
    assert.deepEqual(numbers(item.answer), [Math.min(a, b), Math.max(a, b)]);
  }
});

test("inequality plan tables maximize the requested objective only among fully feasible rows", () => {
  const xy = (row) => row.cells.slice(1).map(Number);
  selectExtremeRow("g9-systems-linear-inequalities", 3, (row) => xy(row).reduce((a, b) => a + b), false, (row) => {
    const [x, y] = xy(row);
    return x >= 0 && y >= 0 && 2 * x + y <= 10 && x + 3 * y <= 12;
  });
  selectExtremeRow("g9-systems-linear-inequalities", 4, (row) => { const [x, y] = xy(row); return 4 * x + 3 * y; }, false, (row) => {
    const [x, y] = xy(row);
    return x >= 0 && y >= 0 && 3 * x + 2 * y <= 18 && x + y <= 7;
  });
  // Check both sides and the exact boundary, where strictness determines the overlap.
  for (const x of [-2, 0, 3]) {
    for (const offset of [-1, 0, 1]) {
      const y = x + 2 + offset;
      assert.equal(y > x + 2 && y <= x + 2, false);
      const z = 2 * x - 1 + offset;
      assert.equal(z >= 2 * x - 1 && z <= 2 * x - 1, offset === 0);
    }
  }
});

const multiplyPolynomials = (a, b) => {
  const result = Array(a.length + b.length - 1).fill(0);
  for (const [i, x] of a.entries()) for (const [j, y] of b.entries()) result[i + j] += x * y;
  return result;
};
const analyzeFactoredExpression = (text) => {
  const expression = normalized(text);
  let coefficients = [Number(expression.match(/^\d+/)?.[0] ?? 1)];
  let complete = true;
  const factors = [...expression.matchAll(/\(x(²)?\s*([+-])\s*(\d+)\)(²)?/g)];
  assert.ok(factors.length > 0);
  for (const factor of factors) {
    const constant = Number(factor[3]) * (factor[2] === "+" ? 1 : -1);
    let polynomial = factor[1] ? [constant, 0, 1] : [constant, 1];
    if (factor[1] && constant < 0 && Number.isInteger(Math.sqrt(-constant))) complete = false;
    if (factor[4]) polynomial = multiplyPolynomials(polynomial, polynomial);
    coefficients = multiplyPolynomials(coefficients, polynomial);
  }
  return { coefficients, complete };
};

test("complete factorizations have exact expanded coefficients and no remaining reducible quadratic", () => {
  for (const [n, coefficients] of [[1, [-32, 0, 0, 0, 2]], [2, [-243, 0, 0, 0, 3]]]) {
    const item = question("g9-factoring-completely", n);
    const correct = item.choices.filter((choice) => {
      const analyzed = analyzeFactoredExpression(choice);
      return analyzed.complete && JSON.stringify(analyzed.coefficients) === JSON.stringify(coefficients);
    });
    assert.deepEqual(correct, [item.answer]);
    assert.ok(item.choices.some((choice) => {
      const analyzed = analyzeFactoredExpression(choice);
      return !analyzed.complete && JSON.stringify(analyzed.coefficients) === JSON.stringify(coefficients);
    }), "A partial factorization is equivalent but fails the explicitly requested completeness criterion.");
  }
});

test("factored intercepts and lost zero solutions satisfy the original polynomial equations", () => {
  for (const [n, leading, linear, sign] of [[3, 1, -9, 1], [4, 2, -32, -1]]) {
    const item = question("g9-factoring-completely", n);
    const selectedRoot = sign * Math.sqrt(-linear / leading);
    assert.deepEqual(parsePoints(item.answer), [[selectedRoot, 0]]);
    assert.equal(leading * selectedRoot ** 3 + linear * selectedRoot, 0);
    assert.ok(selectedRoot >= item.interactionConfig.xMin && selectedRoot <= item.interactionConfig.xMax);
  }
  for (const [n, original, divided] of [[5, (x) => x * (x - 3) * (x + 3), (x) => (x - 3) * (x + 3)], [6, (x) => x * x * (x - 2), (x) => x - 2]]) {
    const missed = Array.from({ length: 11 }, (_, i) => i - 5).filter((x) => original(x) === 0 && divided(x) !== 0);
    assert.equal(missed.length, 1);
    assert.ok(numbers(question("g9-factoring-completely", n).answer).includes(missed[0]));
  }
});

const evaluatePlot = (plot, x) => plot.kind === "linear" ? plot.a * x + plot.b : plot.kind === "quadratic" ? plot.a * (x - (plot.h ?? 0)) ** 2 + (plot.k ?? 0) : plot.a * plot.b ** x;

test("uneven-time graph observations select one curve and integer crossovers are the first strict crossings", () => {
  for (const [n, points] of [[3, [[0, 2], [1, 4], [3, 16]]], [4, [[0, 16], [1, 8], [3, 2]]]]) {
    const item = question("g9-linear-vs-exponential", n);
    const matches = item.interactionConfig.plots.filter((plot) => points.every(([x, y]) => Math.abs(evaluatePlot(plot, x) - y) < 1e-9));
    assert.equal(matches.length, 1);
    assert.equal(item.answer, matches[0].value);
    for (const plot of item.interactionConfig.plots) assert.ok(plot.label.length > 30 && /^Graph [A-D]$/.test(plot.optionLabel));
    for (const [x, y] of points) assert.ok(x >= item.interactionConfig.xMin && x <= item.interactionConfig.xMax && y >= item.interactionConfig.yMin && y <= item.interactionConfig.yMax);
  }
  for (const [n, line, exponential] of [[5, (t) => 100 + 20 * t, (t) => 10 * 2 ** t], [6, (t) => 30 + 5 * t, (t) => 2 * 3 ** t]]) {
    const first = Array.from({ length: 20 }, (_, i) => i).find((t) => exponential(t) > line(t));
    assert.equal(numericAnswer(question("g9-linear-vs-exponential", n)), first);
    assert.ok(Array.from({ length: first }, (_, i) => i).every((t) => exponential(t) <= line(t)));
  }
});

const correlation = (points) => {
  const meanX = points.reduce((sum, [x]) => sum + x, 0) / points.length;
  const meanY = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
  const crossProduct = points.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
  const squareX = points.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0);
  const squareY = points.reduce((sum, [, y]) => sum + (y - meanY) ** 2, 0);
  assert.ok(squareX > 0 && squareY > 0, "The coefficient is defined, rather than undefined for a constant variable.");
  return crossProduct / Math.sqrt(squareX * squareY);
};

test("residual tables minimize squared error and zero-correlation examples have exact nonlinear relations", () => {
  for (const n of [3, 4]) selectExtremeRow("g9-correlation-residuals", n, (row) => row.cells.slice(1).map(asNumber).reduce((sum, residual) => sum + residual ** 2, 0), true);
  for (const [n, ys, model] of [[5, [4, 1, 0, 1, 4], (x) => x * x], [6, [5, 8, 9, 8, 5], (x) => 9 - x * x]]) {
    const points = [-2, -1, 0, 1, 2].map((x, index) => [x, ys[index]]);
    near(correlation(points), 0, "Pearson linear correlation");
    assert.ok(points.every(([x, y]) => model(x) === y));
    assert.ok(new Set(ys).size > 1);
    assert.ok(question("g9-correlation-residuals", n).answer.includes(n === 5 ? "y = x²" : "y = 9 − x²"));
  }
});
