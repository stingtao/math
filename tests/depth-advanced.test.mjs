import test from "node:test";
import assert from "node:assert/strict";
import { advancedDepthPacks } from "../lib/curriculum-depth-advanced.ts";

// These checks recompute results from the mathematical givens rather than
// submitting each stored answer back to the answer-grading implementation.
const pack = (slug) => advancedDepthPacks.find((p) => p.lessonSlug.endsWith(slug));
const question = (slug, n) => pack(slug).questions.find((q) => q.id === `d1-q${n}`);
const normalize = (s) => s.replaceAll("−", "-");
const numeric = (s) => Number(normalize(s).replaceAll("$", "").replaceAll("π", ""));
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
const answerNumber = (slug, n, expected) => near(numeric(question(slug, n).answer), expected);
const selectedCells = (slug, n) => {
  const q = question(slug, n);
  return q.interactionConfig.rows.find((r) => r.value === q.answer).cells;
};
const intervalNumbers = (s) => normalize(s).match(/\[([^\]]+)\]/)[1].split(",").map(Number);
const assertInterval = (slug, n, expected, digits) => {
  const actual = intervalNumbers(question(slug, n).answer);
  assert.deepEqual(actual, expected.map((v) => Number(v.toFixed(digits))));
};
const multiply = (a, b) => a.map((row) => b[0].map((_, col) => row.reduce((sum, value, k) => sum + value * b[k][col], 0)));

test("construction distances and perpendicular lines follow Euclidean geometry", () => {
  for (const [n, length, radius] of [[1, 8, 5], [2, 12, 10]]) {
    answerNumber("geometric-constructions", n, Math.sqrt(radius ** 2 - (length / 2) ** 2));
  }
  for (const [n, a, b, p, q] of [
    [3, [-4, 0], [4, 0], [0, 3], [0, -3]],
    [4, [0, -3], [0, 3], [4, 0], [-4, 0]],
  ]) {
    const midpoint = a.map((v, i) => (v + b[i]) / 2);
    const dot = (b[0] - a[0]) * (q[0] - p[0]) + (b[1] - a[1]) * (q[1] - p[1]);
    assert.equal(dot, 0);
    near(Math.hypot(p[0] - a[0], p[1] - a[1]), Math.hypot(p[0] - b[0], p[1] - b[1]));
    const line = p[0] === q[0] ? `x=${p[0]}` : `y=${p[1]}`;
    assert.deepEqual(selectedCells("geometric-constructions", n), [`(${midpoint.join(",")})`, line, "90°"]);
  }
});

test("midpoint proof variables satisfy both given segment expressions", () => {
  for (const [n, a, b, c, d] of [[1, 3, -2, 1, 6], [2, 5, -3, 2, 15]]) {
    const x = (d - b) / (a - c);
    answerNumber("proof-structure", n, x);
    near(a * x + b, c * x + d);
    assert.ok(a * x + b > 0);
  }
});

test("Venn regions conserve the population and conditional denominators", () => {
  for (const [n, total, a, b, both] of [[1, 40, 22, 18, 8], [2, 60, 35, 28, 15]]) {
    answerNumber("sets-and-venn-diagrams", n, total - (a + b - both));
  }
  for (const [n, total, a, b, both] of [[3, 50, 26, 21, 9], [4, 80, 44, 36, 20]]) {
    const values = selectedCells("sets-and-venn-diagrams", n).map(Number);
    assert.deepEqual(values, [a - both, both, b - both, total - a - b + both]);
    assert.equal(values.reduce((x, y) => x + y, 0), total);
  }
  for (const [n, intersection, condition] of [[5, 12, 30], [6, 18, 45]]) {
    const [num, den] = question("sets-and-venn-diagrams", n).answer.split("/").map(Number);
    assert.equal(num, intersection);
    assert.equal(den, condition);
  }
});

test("rotated rectangle volumes and spherical sections use the correct radii", () => {
  answerNumber("cross-sections-and-rotations", 1, 4 ** 2 * 7);
  answerNumber("cross-sections-and-rotations", 2, 5 ** 2 * 9);
  for (const [n, radius, distance] of [[3, 5, 3], [4, 13, 5]]) {
    const sliceRadius = Math.sqrt(radius ** 2 - distance ** 2);
    const cells = selectedCells("cross-sections-and-rotations", n).map(numeric);
    assert.deepEqual(cells, [distance, sliceRadius, sliceRadius ** 2]);
  }
  for (const [n, short, long] of [[5, 2, 6], [6, 3, 12]]) {
    answerNumber("cross-sections-and-rotations", n, (long ** 2 * short) / (short ** 2 * long));
  }
});

test("matrix answers are recomputed with row-by-column products", () => {
  for (const [n, a, b] of [
    [1, [[1, 2], [3, 4]], [[2, 0], [-1, 3]]],
    [2, [[2, -1], [0, 3]], [[1, 4], [2, -2]]],
  ]) {
    assert.deepEqual(JSON.parse(normalize(question("matrix-operations", n).answer)), multiply(a, b));
  }
  for (const [n, quantities, prices] of [
    [3, [[2, 1], [1, 3]], [[4], [5]]],
    [4, [[1, 4], [3, 2]], [[6], [2]]],
  ]) {
    assert.deepEqual(selectedCells("matrix-operations", n).map(numeric), multiply(quantities, prices).flat());
  }
  for (const [n, a, b] of [
    [5, [[2, 0], [0, 1]], [[1, 1], [0, 1]]],
    [6, [[1, 0], [0, 3]], [[1, 0], [1, 1]]],
  ]) {
    const answer = question("matrix-operations", n).answer;
    const matrices = answer.match(/\[\[[^\]]+\],\[[^\]]+\]\]/g).map(JSON.parse);
    assert.deepEqual(matrices, [multiply(a, b), multiply(b, a)]);
    assert.notDeepEqual(matrices[0], matrices[1]);
  }
});

const piAngle = (s) => {
  const parts = s.match(/^(\d*)π(?:\/(\d+))?$/);
  assert.ok(parts, s);
  return Number(parts[1] || 1) * Math.PI / Number(parts[2] || 1);
};
const fraction = (s) => {
  const [n, d = 1] = normalize(s).split("/").map(Number);
  return n / d;
};
test("trig solutions satisfy equations, quadrant signs, and ratio identities", () => {
  for (const [n, fn, expected] of [[1, Math.sin, 0.5], [2, Math.cos, -0.5]]) {
    const angles = question("trig-identities-equations", n).answer.slice(1, -1).split(",").map(piAngle);
    assert.equal(angles.length, 2);
    for (const theta of angles) { assert.ok(theta >= 0 && theta < 2 * Math.PI); near(fn(theta), expected); }
    assert.notEqual(angles[0], angles[1]);
  }
  const [sin3, cos3, tan3] = selectedCells("trig-identities-equations", 3).map(fraction);
  assert.ok(sin3 < 0 && cos3 < 0 && tan3 > 0);
  near(sin3 ** 2 + cos3 ** 2, 1); near(sin3 / cos3, tan3); near(sin3, -3 / 5);
  const [cos4, sin4, tan4] = selectedCells("trig-identities-equations", 4).map(fraction);
  assert.ok(sin4 > 0 && cos4 < 0 && tan4 < 0);
  near(sin4 ** 2 + cos4 ** 2, 1); near(sin4 / cos4, tan4); near(cos4, -5 / 13);
});

test("rational models respect units, reciprocal invariants, and integer minima", () => {
  for (const [n, fixed, variable, size] of [[1, 180, 4, 30], [2, 240, 3, 40]]) {
    answerNumber("rational-function-models", n, (fixed + variable * size) / size);
  }
  for (const [n, distance, speeds] of [[3, 180, [30, 60, 90]], [4, 240, [40, 60, 80]]]) {
    const times = selectedCells("rational-function-models", n).map((s) => Number(s.replace(" h", "")));
    times.forEach((t, i) => near(t * speeds[i], distance));
  }
  for (const [n, fixed, variable, target] of [[5, 180, 4, 7], [6, 250, 3, 9]]) {
    const minimum = Math.ceil(fixed / (target - variable));
    answerNumber("rational-function-models", n, minimum);
    assert.ok(fixed / minimum + variable <= target);
    assert.ok(fixed / (minimum - 1) + variable > target);
  }
});

test("confidence calculations reproduce endpoints and sample-size scaling", () => {
  for (const [n, estimate, critical, se] of [[1, 50, 1.96, 2], [2, 120, 1.645, 4]]) {
    assertInterval("confidence-intervals", n, [estimate - critical * se, estimate + critical * se], 2);
  }
  for (const [n, lower, upper] of [[3, 38, 50], [4, 112, 128]]) {
    const [center, margin] = selectedCells("confidence-intervals", n).map(Number);
    near(center - margin, lower); near(center + margin, upper);
  }
  for (const [n, oldN, oldMargin, newMargin] of [[5, 100, 6, 3], [6, 225, 4, 2]]) {
    answerNumber("confidence-intervals", n, oldN * (oldMargin / newMargin) ** 2);
  }
});

test("proportion tests use null SE and difference intervals use the difference center", () => {
  for (const [n, successes, size, nullP] of [[1, 60, 100, 0.5], [2, 184, 400, 0.5]]) {
    const nullSE = Math.sqrt(nullP * (1 - nullP) / size);
    answerNumber("inference-for-proportions", n, (successes / size - nullP) / nullSE);
    assert.ok(size * nullP >= 10 && size * (1 - nullP) >= 10);
  }
  for (const [n, pValue, alpha] of [[3, 0.0228, 0.05], [4, 0.0668, 0.05]]) {
    const [p, decision] = selectedCells("inference-for-proportions", n);
    near(Number(p), pValue);
    assert.equal(decision, pValue < alpha ? "Reject H₀" : "Do not reject H₀");
  }
  for (const [n, a, b, se, digits] of [[5, 0.6, 0.45, 0.04, 4], [6, 0.48, 0.4, 0.05, 3]]) {
    assertInterval("inference-for-proportions", n, [a - b - 1.96 * se, a - b + 1.96 * se], digits);
  }
});

test("mean statistics and paired intervals use one difference per pair", () => {
  for (const [n, size, mean, sd, nullMean] of [[1, 16, 52, 4, 50], [2, 25, 97, 10, 100]]) {
    answerNumber("inference-for-means", n, (mean - nullMean) / (sd / Math.sqrt(size)));
  }
  for (const [n, size, mean, sd, critical] of [[5, 16, -4, 4, 2.131], [6, 25, 1, 5, 2.064]]) {
    const margin = critical * sd / Math.sqrt(size);
    assertInterval("inference-for-means", n, [mean - margin, mean + margin], 2);
  }
});

test("series checks recompute factorial coefficients, open endpoints, and omitted terms", () => {
  for (const [n, x] of [[1, 0.2], [2, 0.3]]) {
    let factorial = 1;
    let value = 0;
    for (let k = 0; k <= 3; k++) { if (k) factorial *= k; value += x ** k / factorial; }
    answerNumber("infinite-series", n, Number(value.toFixed(4)));
  }
  for (const [n, center, radius] of [[3, 2, 3], [4, -1, 2]]) {
    const cells = selectedCells("infinite-series", n);
    assert.equal(Number(cells[0]), radius);
    assert.equal(normalize(cells[1]), `(${center - radius},${center + radius})`);
    for (const x of [center - radius, center + radius]) {
      assert.equal(Math.abs((x - center) / radius), 1);
      assert.equal(Math.abs(((x - center) / radius) ** 100), 1);
    }
  }
  for (const [n, terms] of [[5, 4], [6, 9]]) {
    const denominator = Number(question("infinite-series", n).answer.match(/≤1\/(\d+)$/)[1]);
    assert.equal(denominator, terms + 1);
    let partial = 0;
    for (let k = 1; k <= terms; k++) partial += (-1) ** (k + 1) / k;
    assert.ok(Math.abs(Math.log(2) - partial) <= 1 / denominator);
  }
});

test("differential solutions satisfy their IVPs and Euler updates recompute every slope", () => {
  const digitMap = { "⁻": "-", "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5" };
  for (const [n, expectedA, expectedK] of [[1, 3, 2], [2, 5, -3]]) {
    const match = question("differential-equations", n).answer.match(/^y=(\d+)e([⁻⁰¹²³⁴⁵]+)ˣ$/);
    const a = Number(match[1]);
    const k = Number([...match[2]].map((c) => digitMap[c]).join(""));
    near(a, expectedA);
    for (const x of [-0.5, 0, 0.5]) near(a * k * Math.exp(k * x), expectedK * a * Math.exp(k * x));
  }
  for (const [n, points, fn] of [
    [3, [[0, 1], [1, 1], [2, 1]], (x, y) => x - y],
    [4, [[0, -1], [1, -1], [2, -1]], (x, y) => 2 * x + y],
  ]) assert.deepEqual(selectedCells("differential-equations", n).map((s) => Number(normalize(s))), points.map(([x, y]) => fn(x, y)));
  for (const [n, initial, fn] of [[5, 1, (x, y) => x + y], [6, 2, (x, y) => x - y]]) {
    let x = 0; let y = initial; const h = 0.5;
    for (let step = 0; step < 2; step++) { y += h * fn(x, y); x += h; }
    assert.equal(x, 1);
    answerNumber("differential-equations", n, y);
  }
});
