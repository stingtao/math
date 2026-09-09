import test from "node:test";
import assert from "node:assert/strict";
import { round2AdvancedDepthPacks } from "../lib/curriculum-depth-round2-advanced.ts";

// Recompute from the mathematical givens; do not submit stored answers to the grader.
const q = (slug, n) => round2AdvancedDepthPacks.find((p) => p.lessonSlug === slug).questions.find((item) => item.id === `d2-q${n}`);
const normalize = (s) => s.replaceAll("−", "-");
const firstNumber = (s) => Number(normalize(s).match(/-?\d+(?:\.\d+)?/)[0]);
const fraction = (s) => { const [a, b = 1] = normalize(s).split("/").map(Number); return a / b; };
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const numberAnswer = (slug, n, expected) => near(firstNumber(q(slug, n).answer), expected);
const assertTable = (slug, n, predicate) => {
  const question = q(slug, n);
  const matches = question.interactionConfig.rows.filter((row) => predicate(row.cells));
  assert.equal(matches.length, 1, `${slug}/${n}: expected one mathematically valid table row`);
  assert.equal(question.answer, matches[0].value);
};

test("round 2 similarity ratios give correct lengths and unique similar candidates", () => {
  numberAnswer("g10-similarity-proofs", 1, 20 * 6 / 15);
  numberAnswer("g10-similarity-proofs", 2, 21 * 8 / 12);
  for (const [n, reference] of [[3, [6, 9, 12]], [4, [5, 7, 8]]]) {
    assertTable("g10-similarity-proofs", n, (cells) => {
      const sides = cells.map(Number);
      assert.ok(sides[0] + sides[1] > sides[2]);
      const ratios = sides.map((side, i) => side / reference[i]);
      return ratios.every((r) => Math.abs(r - ratios[0]) < 1e-10);
    });
  }
  near(4 / 6, 6 / 9);
  assert.notEqual(3 / 5, 6 / 9);
  assert.match(q("g10-similarity-proofs", 5).answer, /^Yes:/);
  assert.match(q("g10-similarity-proofs", 6).answer, /^No:/);
});

test("round 2 conditional probabilities use the updated or restricted sample space", () => {
  for (const [n, favorable, other] of [[1, 5, 3], [2, 6, 4]]) {
    near(fraction(q("g10-conditional-probability", n).answer), (favorable - 1) / (favorable + other - 1));
  }
  for (const [n, target] of [[3, 3 / 5], [4, 2 / 3]]) {
    assertTable("g10-conditional-probability", n, (cells) => Math.abs(Number(cells[1]) / Number(cells[2]) - target) < 1e-10);
  }
  for (const [n, failedFirst, failedSecond, originalFirst, originalTotal] of [[5, 6, 2, 60, 100], [6, 4, 2, 80, 100]]) {
    const posterior = failedFirst / (failedFirst + failedSecond);
    near(fraction(q("g10-conditional-probability", n).answer), posterior);
    assert.notEqual(posterior, originalFirst / originalTotal, "The prior proportion must not accidentally solve reverse conditioning");
  }
});

test("round 2 independence uses the product overlap and distinguishes disjointness", () => {
  for (const [n, a, b] of [[1, 0.4, 0.3], [2, 0.6, 0.2]]) numberAnswer("g10-independence", n, a + b - a * b);
  for (const n of [3, 4]) {
    assertTable("g10-independence", n, (cells) => {
      const [a, b, both] = cells.map(Number);
      assert.ok(both >= Math.max(0, a + b - 1) && both <= Math.min(a, b));
      return Math.abs(a * b - both) < 1e-10;
    });
  }
  assert.notEqual(0, 0.2 * 0.3);
  assert.notEqual(0, 0.5 * 0.5);
  assert.match(q("g10-independence", 5).answer, /^No:/);
  assert.match(q("g10-independence", 6).answer, /dependent/);
});

test("round 2 categorical comparisons normalize by each group before ranking", () => {
  numberAnswer("g10-categorical-data", 1, 100 * (18 / 30 - 20 / 50));
  numberAnswer("g10-categorical-data", 2, 100 * (24 / 40 - 45 / 60));
  for (const n of [3, 4]) {
    const rows = q("g10-categorical-data", n).interactionConfig.rows;
    const rates = rows.map((r) => Number(r.cells[1]) / (Number(r.cells[1]) + Number(r.cells[2])));
    const maximum = Math.max(...rates);
    assertTable("g10-categorical-data", n, (cells) => Number(cells[1]) / (Number(cells[1]) + Number(cells[2])) === maximum);
  }
});

test("round 2 rational roots satisfy original quotients and retain restrictions", () => {
  const x1 = firstNumber(q("g11-rational-equations", 1).answer);
  assert.notEqual(x1, 0); near(3 / x1 + 1 / 2, 5 / 4);
  const x2 = firstNumber(q("g11-rational-equations", 2).answer);
  assert.notEqual(x2, 1); near(4 / (x2 - 1) + 1 / 3, 1);
  for (const [n, excluded, leftNum, rightNum] of [[3, 1, (x) => x + 1, 3], [4, 3, (x) => 2 * x + 1, 9]]) {
    assertTable("g11-rational-equations", n, (cells) => {
      const x = Number(cells[0]);
      near(Number(normalize(cells[1])), x - excluded);
      if (x === excluded) { assert.equal(cells[2], "undefined"); assert.equal(cells[3], "undefined"); return false; }
      near(fraction(cells[2]), leftNum(x) / (x - excluded));
      near(fraction(cells[3]), rightNum / (x - excluded));
      return Math.abs(leftNum(x) - rightNum) < 1e-10;
    });
  }
  for (const [n, a, rhs] of [[5, 2, 4], [6, 3, 6]]) {
    const candidate = rhs - a; // (x²-a²)/(x-a) = x+a only when x≠a.
    assert.equal(candidate, a);
    assert.match(q("g11-rational-equations", n).answer, /no solution/i);
  }
});

test("round 2 exponential solutions and logarithmic domains are independently checked", () => {
  for (const [n, multiplier, rate, target] of [[1, 5, 0.4, 20], [2, 3, 0.5, 12]]) {
    const exactTime = Math.log(target / multiplier) / rate;
    numberAnswer("g11-exponential-log-equations", n, Number(exactTime.toFixed(2)));
    near(multiplier * Math.exp(rate * exactTime), target);
  }
  for (const [n, firstShift, secondShift] of [[3, 1, 3], [4, 0, 2]]) {
    assertTable("g11-exponential-log-equations", n, (cells) => {
      const [x, first, second, product] = cells.map((s) => Number(normalize(s)));
      near(first, x - firstShift); near(second, x - secondShift); near(product, first * second);
      return first > 0 && second > 0 && Math.abs(Math.log2(first) + Math.log2(second) - 3) < 1e-10;
    });
  }
  near(Math.log2(4 + 4), 3); near(Math.log2(4) + 2, 4);
  assert.notEqual(Math.log(3 + 3) / Math.log(3), Math.log(3) / Math.log(3) + 1);
});

const graphValue = (plot, x) => plot.a * (plot.kind === "sine" ? Math.sin(plot.b * x + (plot.c || 0)) : Math.cos(plot.b * x + (plot.c || 0))) + (plot.k || 0);
test("round 2 sinusoidal plots uniquely satisfy their stated features", () => {
  numberAnswer("g11-trig-graphs", 1, 2 * Math.PI / (4 * Math.PI));
  numberAnswer("g11-trig-graphs", 2, 2 * Math.PI / (Math.PI / 2));
  for (const [n, amplitude, period, midline, atMaximum] of [[3, 2, Math.PI, 1, false], [4, 3, 2 * Math.PI, -1, true]]) {
    const question = q("g11-trig-graphs", n);
    const matches = question.interactionConfig.plots.filter((plot) => {
      assert.ok(plot.label.length > 30 && plot.optionLabel.length === 1);
      const rightAmplitude = Math.abs(plot.a) === amplitude;
      const rightPeriod = Math.abs(2 * Math.PI / Math.abs(plot.b) - period) < 1e-10;
      const rightMidline = plot.k === midline;
      const rightStart = atMaximum ? Math.abs(graphValue(plot, 0) - (midline + amplitude)) < 1e-10 : Math.abs(graphValue(plot, 0) - midline) < 1e-10 && graphValue(plot, 0.001) > graphValue(plot, 0);
      return rightAmplitude && rightPeriod && rightMidline && rightStart;
    });
    assert.equal(matches.length, 1); assert.equal(question.answer, matches[0].value);
  }
  for (const [n, frequency] of [[5, Math.PI / 6], [6, Math.PI / 4]]) numberAnswer("g11-trig-graphs", n, Math.PI / frequency);
});

test("round 2 normal problems standardize model-specific cutoffs before taking areas", () => {
  numberAnswer("g11-normal-distributions", 1, 50 + 1.5 * 8);
  numberAnswer("g11-normal-distributions", 2, 100 - 1.25 * 12);
  for (const [n, targetZ] of [[3, 1], [4, -2]]) {
    assertTable("g11-normal-distributions", n, (cells) => {
      const [mean, sd, cutoff] = cells.map(Number);
      return Math.abs((cutoff - mean) / sd - targetZ) < 1e-10;
    });
  }
  const cases = [[5, 70, 5, 65, 80, -1, 2, 0.1587, 0.9772], [6, 100, 10, 85, 110, -1.5, 1, 0.0668, 0.8413]];
  for (const [n, mean, sd, lower, upper, zLower, zUpper, cdfLower, cdfUpper] of cases) {
    near((lower - mean) / sd, zLower); near((upper - mean) / sd, zUpper);
    numberAnswer("g11-normal-distributions", n, cdfUpper - cdfLower);
  }
});

test("round 2 continuity parameters and all three profile conditions hold", () => {
  for (const [n, point, offset, rightValue] of [[1, 2, 1, 2 ** 2 - 1], [2, 3, -2, 3 ** 2 + 1]]) {
    const a = firstNumber(q("g12-continuity", n).answer);
    near(a * point + offset, rightValue);
  }
  for (const n of [3, 4]) {
    assertTable("g12-continuity", n, (cells) => {
      const values = cells.map((s) => Number(normalize(s)));
      return values.every(Number.isFinite) && values.every((v) => v === values[0]);
    });
  }
  for (const [leftValue, rightValue] of [[-2, 5], [4, -1]]) assert.ok(leftValue * rightValue < 0);
  assert.match(q("g12-continuity", 5).answer, /At least one/);
  assert.match(q("g12-continuity", 6).answer, /at least one/);
});

test("round 2 chain rules multiply derivatives at the specified composition input", () => {
  for (const [n, coefficient, constant, power, x] of [[1, 1, 1, 3, 1], [2, 2, 3, 4, 1]]) {
    const inner = coefficient * x ** 2 + constant;
    numberAnswer("g12-chain-rule", n, power * inner ** (power - 1) * 2 * coefficient * x);
  }
  for (const [n, target] of [[3, -12], [4, 18]]) assertTable("g12-chain-rule", n, (cells) => Number(normalize(cells[2])) * Number(normalize(cells[3])) === target);
  numberAnswer("g12-chain-rule", 5, -0.006 * (2 * 100 * 2));
  numberAnswer("g12-chain-rule", 6, -0.01 * (2 * 50 * 3));
  assert.match(q("g12-chain-rule", 5).answer, /°C\/min/);
  assert.match(q("g12-chain-rule", 6).answer, /kPa\/min/);
});

test("round 2 integrals preserve endpoint order, interval width, and signed motion", () => {
  const antiderivative1 = (x) => x ** 3 - 2 * x;
  const antiderivative2 = (x) => x ** 2 - 5 * x;
  numberAnswer("g12-definite-integrals", 1, antiderivative1(2) - antiderivative1(0));
  numberAnswer("g12-definite-integrals", 2, antiderivative2(3) - antiderivative2(1));
  for (const n of [3, 4]) {
    const rows = q("g12-definite-integrals", n).interactionConfig.rows;
    const contribution = (cells) => (Number(cells[1]) - Number(cells[0])) * Number(normalize(cells[2]));
    const maximum = Math.max(...rows.map((row) => contribution(row.cells)));
    assertTable("g12-definite-integrals", n, (cells) => contribution(cells) === maximum);
  }
  for (const [n, v1, t1, v2, t2] of [[5, 3, 2, -2, 3], [6, 4, 3, -1, 2]]) {
    const answerNumbers = q("g12-definite-integrals", n).answer.match(/\d+/g).map(Number);
    assert.deepEqual(answerNumbers, [v1 * t1 + v2 * t2, Math.abs(v1) * t1 + Math.abs(v2) * t2]);
  }
});

test("round 2 sampling distributions use the mean's SE in both design and probability", () => {
  for (const [n, mean, sd, size] of [[1, 80, 12, 36], [2, 120, 24, 64]]) {
    const answerNumbers = q("g12-sampling-distributions", n).answer.match(/\d+/g).map(Number);
    assert.deepEqual(answerNumbers, [mean, sd / Math.sqrt(size)]);
  }
  for (const [n, targetSE] of [[3, 2], [4, 3]]) assertTable("g12-sampling-distributions", n, (cells) => Number(cells[0]) / Math.sqrt(Number(cells[1])) === targetSE);
  near((54 - 50) / (12 / Math.sqrt(36)), 2);
  numberAnswer("g12-sampling-distributions", 5, 1 - 0.9772);
  near((94 - 100) / (20 / Math.sqrt(25)), -1.5);
  numberAnswer("g12-sampling-distributions", 6, 0.0668);
});
