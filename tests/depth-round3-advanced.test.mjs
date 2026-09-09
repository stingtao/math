import test from "node:test";
import assert from "node:assert/strict";
import { round3AdvancedDepthPacks } from "../lib/curriculum-depth-round3-advanced.ts";

// Recompute mathematical evidence from givens, without using the answer grader.
const q = (slug, n) => round3AdvancedDepthPacks.find((p) => p.lessonSlug === slug).questions.find((item) => item.id === `d3-q${n}`);
const norm = (text) => text.replaceAll("−", "-");
const numbers = (text) => norm(text).match(/-?\d+(?:\.\d+)?/g).map(Number);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} ≠ ${b}`);
const numericAnswer = (slug, n, expected) => near(numbers(q(slug, n).answer)[0], expected);
const tableMatch = (slug, n, predicate) => {
  const question = q(slug, n);
  const matches = question.interactionConfig.rows.filter((row) => predicate(row.cells));
  assert.equal(matches.length, 1, `${slug}/${n}: one mathematically valid record required`);
  assert.equal(question.answer, matches[0].value);
};
const squaredDistance = (a, b) => a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0);

test("round 3 congruence checks corresponding equations, SAS records, and scale counterexamples", () => {
  for (const [n, coefficient, constant, length] of [[1, 3, -2, 13], [2, 2, 5, 19]]) numericAnswer("g10-triangle-congruence", n, (length - constant) / coefficient);
  for (const [n, firstSide, secondSide, angle] of [[3, 5, 7, 60], [4, 6, 9, 50]]) {
    tableMatch("g10-triangle-congruence", n, (cells) => numbers(cells[0])[0] === firstSide && numbers(cells[1])[0] === secondSide && numbers(cells[2])[0] === angle);
  }
  for (const [n, a, b] of [[5, [3, 4, 5], [6, 8, 10]], [6, [5, 5, 6], [10, 10, 12]]]) {
    const cosine = (s) => (s[0] ** 2 + s[1] ** 2 - s[2] ** 2) / (2 * s[0] * s[1]);
    near(cosine(a), cosine(b));
    assert.ok(a.every((value, i) => b[i] / value === 2));
    assert.notDeepEqual(a, b);
    assert.match(q("g10-triangle-congruence", n).answer, /similar/);
  }
});

test("round 3 coordinate conclusions follow displacements, perpendicularity, and diagonal evidence", () => {
  for (const [n, a, b, c] of [[1, [1, 2], [5, 3], [7, 7]], [2, [-2, 1], [3, 2], [4, 6]]]) {
    assert.deepEqual(numbers(q("g10-coordinate-proofs", n).answer), a.map((v, i) => v + c[i] - b[i]));
  }
  for (const n of [3, 4]) tableMatch("g10-coordinate-proofs", n, (cells) => {
    const [dx1, dy1, dx2, dy2] = cells.map((v) => Number(norm(v)));
    assert.notEqual(dx1 * dy2 - dy1 * dx2, 0, "All records must describe nondegenerate parallelograms");
    return dx1 * dx2 + dy1 * dy2 === 0;
  });
  for (const [n, a, b, c, d] of [[5, [-3, 0], [3, 0], [2, 2], [-2, 2]], [6, [-4, 0], [4, 0], [2, 3], [-2, 3]]]) {
    near(squaredDistance(a, c), squaredDistance(b, d));
    const slopeBC = (c[1] - b[1]) / (c[0] - b[0]);
    const slopeAD = (d[1] - a[1]) / (d[0] - a[0]);
    assert.notEqual(slopeBC, slopeAD);
    assert.match(q("g10-coordinate-proofs", n).answer, /No:|proof fails/);
  }
});

test("round 3 circle answers satisfy right-triangle lengths and same-arc relationships", () => {
  for (const [n, radius, distance] of [[1, 5, 13], [2, 7, 25]]) numericAnswer("g10-circle-theorem-proofs", n, Math.sqrt(distance ** 2 - radius ** 2));
  for (const n of [3, 4]) tableMatch("g10-circle-theorem-proofs", n, (cells) => numbers(cells[0])[0] === 2 * numbers(cells[1])[0]);
  // Coordinate realizations independently verify the shared-hypotenuse/equal-leg
  // geometry used by the two general HL proofs; the proof logic is also reviewed.
  for (const [n, r, d] of [[5, 5, 13], [6, 8, 17]]) {
    const tangentX = r ** 2 / d;
    const tangentY = r * Math.sqrt(d ** 2 - r ** 2) / d;
    const a = [tangentX, tangentY], b = [tangentX, -tangentY], p = [d, 0];
    near(squaredDistance([0, 0], a), r ** 2);
    near(a[0] * (p[0] - a[0]) + a[1] * (p[1] - a[1]), 0);
    near(squaredDistance(a, p), squaredDistance(b, p));
    assert.match(q("g10-circle-theorem-proofs", n).answer, /HL/);
  }
});

test("round 3 geometric models combine volumes, convert capacity, and square radius scaling", () => {
  for (const [n, radius, height] of [[1, 3, 4], [2, 6, 2]]) numericAnswer("g10-modeling-with-geometry", n, radius ** 2 * height + 2 * radius ** 3 / 3);
  for (const [n, liters] of [[3, 3], [4, 6]]) tableMatch("g10-modeling-with-geometry", n, (cells) => cells.map(Number).reduce((a, b) => a * b, 1) / 1000 === liters);
  for (const [n, multiplier] of [[5, 1.1], [6, 1.2]]) {
    const percentage = Number(q("g10-modeling-with-geometry", n).answer.match(/(\d+)%/)[1]);
    near(percentage, 100 * (multiplier ** 2 - 1));
  }
});

const factor = (text) => {
  const match = norm(text).match(/^\(x([+-])(\d+)\)(²)?$/);
  assert.ok(match, text);
  return { root: (match[1] === "+" ? -1 : 1) * Number(match[2]), multiplicity: match[3] ? 2 : 1 };
};
test("round 3 polynomial roots are independently substituted and conjugates evaluated", () => {
  for (const [n, root, constant] of [[1, 2, -6], [2, -2, 10]]) {
    const k = numbers(q("g11-polynomial-roots", n).answer)[0];
    near(root ** 3 + k * root + constant, 0);
  }
  for (const [n, repeated, simple] of [[3, -2, 5], [4, 3, -1]]) tableMatch("g11-polynomial-roots", n, (cells) => {
    const factors = cells.map(factor);
    return factors.some((f) => f.root === repeated && f.multiplicity === 2) && factors.some((f) => f.root === simple && f.multiplicity === 1);
  });
  for (const [n, real, imaginary] of [[5, 1, 2], [6, 3, -1]]) {
    const question = q("g11-polynomial-roots", n);
    const matches = question.choices.filter((candidate) => {
      const match = norm(candidate).match(/^x²([+-]\d+)x([+-]\d+)$/);
      const b = Number(match[1]), c = Number(match[2]);
      const realValue = real ** 2 - imaginary ** 2 + b * real + c;
      const imaginaryValue = 2 * real * imaginary + b * imaginary;
      return Math.abs(realValue) < 1e-10 && Math.abs(imaginaryValue) < 1e-10;
    });
    assert.equal(matches.length, 1); assert.equal(question.answer, matches[0]);
  }
});

test("round 3 infinite geometric sums enforce convergence and count bounce travel correctly", () => {
  for (const [n, a, r] of [[1, 12, -0.5], [2, 15, 1 / 3]]) numericAnswer("g11-infinite-geometric-series", n, a / (1 - r));
  for (const [n, target] of [[3, 4], [4, 10]]) tableMatch("g11-infinite-geometric-series", n, (cells) => {
    const [a, r] = cells.map((s) => Number(norm(s)));
    return Math.abs(r) < 1 && Math.abs(a / (1 - r) - target) < 1e-10;
  });
  for (const [n, height, ratio] of [[5, 10, 0.5], [6, 12, 0.25]]) {
    const expected = height + 2 * height * ratio / (1 - ratio);
    numericAnswer("g11-infinite-geometric-series", n, expected);
    let finiteTravel = height;
    for (let bounce = 1; bounce <= 100; bounce++) finiteTravel += 2 * height * ratio ** bounce;
    near(finiteTravel, expected);
  }
});

const radicalFraction = (text) => {
  const [numerator, denominator = "1"] = norm(text).split("/");
  const sign = numerator.startsWith("-") ? -1 : 1;
  const value = numerator.replace("-", "");
  return sign * (value.startsWith("√") ? Math.sqrt(Number(value.slice(1))) : Number(value)) / Number(denominator);
};
test("round 3 radian measures match arc lengths, circle points, and full-turn equivalence", () => {
  numericAnswer("g11-radians-unit-circle", 1, 6 * 5 / 6);
  numericAnswer("g11-radians-unit-circle", 2, 8 * 3 / 4);
  for (const [n, theta] of [[3, 5 * Math.PI / 6], [4, 7 * Math.PI / 4]]) tableMatch("g11-radians-unit-circle", n, (cells) => {
    const [x, y] = cells.map(radicalFraction); near(x ** 2 + y ** 2, 1);
    return Math.abs(x - Math.cos(theta)) < 1e-10 && Math.abs(y - Math.sin(theta)) < 1e-10;
  });
  for (const [n, original, turns, result] of [[5, 13 * Math.PI / 6, -1, Math.PI / 6], [6, -5 * Math.PI / 4, 1, 3 * Math.PI / 4]]) {
    near(original + turns * 2 * Math.PI, result);
    near(Math.cos(original), Math.cos(result)); near(Math.sin(original), Math.sin(result));
    assert.ok(result >= 0 && result < 2 * Math.PI);
    assert.match(q("g11-radians-unit-circle", n).answer, /full turn/);
  }
});

test("round 3 matrix systems satisfy both equations and preserve augmented constants", () => {
  for (const [n, rows] of [[1, [[2, 1, 11], [1, -1, 1]]], [2, [[3, -1, 7], [1, 1, 5]]]]) {
    const [x, y] = numbers(q("g11-matrix-systems", n).answer);
    for (const [a, b, c] of rows) near(a * x + b * y, c);
  }
  for (const [n, rows] of [[3, [[2, -3, 7], [4, 1, 5]]], [4, [[3, 2, 8], [-1, 5, 4]]]]) tableMatch("g11-matrix-systems", n, (cells) => cells.every((cell, i) => JSON.stringify(numbers(cell)) === JSON.stringify(rows[i])));
  for (const [n, firstConstant] of [[5, 6], [6, 8]]) {
    const coefficients = [[2, 4], [1, 2]];
    assert.equal(coefficients[0][0] * coefficients[1][1] - coefficients[0][1] * coefficients[1][0], 0);
    const residual = firstConstant - 2 * 3;
    assert.match(q("g11-matrix-systems", n).answer, residual === 0 ? /Infinitely many/ : /No solution/);
    if (residual === 0) for (const y of [-3, 0, 2, 5]) near(2 * (3 - 2 * y) + 4 * y, firstConstant);
    else assert.notEqual(residual, 0);
  }
});

test("round 3 nearby values and two-sided numerical estimates are internally consistent", () => {
  for (const [n, center, input] of [[1, 2, 1.9], [2, 3, 2.99]]) numericAnswer("g12-limit-from-table-graph", n, (input ** 2 - center ** 2) / (input - center));
  for (const [n, target] of [[3, 5], [4, -2]]) tableMatch("g12-limit-from-table-graph", n, (cells) => {
    const [leftFar, leftNear, rightNear, rightFar] = cells.map((s) => Number(norm(s)));
    return Math.abs(leftNear - target) < 0.05 && Math.abs(rightNear - target) < 0.05 && Math.abs(leftNear - target) < Math.abs(leftFar - target) && Math.abs(rightNear - target) < Math.abs(rightFar - target);
  });
  for (const [n, a, slope, intercept, isolated] of [[5, 1, 1, 4, 20], [6, 2, 2, -1, -7]]) {
    const limit = slope * a + intercept;
    assert.notEqual(limit, isolated);
    for (const delta of [0.01, 0.001]) near((slope * (a - delta) + intercept + slope * (a + delta) + intercept) / 2, limit);
    assert.match(q("g12-limit-from-table-graph", n).answer, new RegExp(`limit (?:is )?${limit}`));
  }
});

test("round 3 optimization independently evaluates feasible critical points and endpoints", () => {
  for (const [n, fence] of [[1, 48], [2, 80]]) {
    const width = fence / 4, length = fence - 2 * width;
    near(fence - 4 * width, 0);
    numericAnswer("g12-optimization", n, width * length);
  }
  for (const [n, coefficient, lower, upper, direction] of [[3, 3, -2, 3, "max"], [4, 12, -3, 4, "min"]]) {
    const critical = Math.sqrt(coefficient / 3);
    const candidates = [lower, -critical, critical, upper];
    const value = (x) => x ** 3 - coefficient * x;
    const target = Math[direction](...candidates.map(value));
    tableMatch("g12-optimization", n, (cells) => {
      const [x, derivative, output] = cells.map((s) => Number(norm(s)));
      assert.ok(candidates.includes(x)); near(derivative, 3 * x ** 2 - coefficient); near(output, value(x));
      return output === target;
    });
  }
  for (const [n, side] of [[5, 12], [6, 18]]) {
    const cut = side / 6;
    const volume = cut * (side - 2 * cut) ** 2;
    assert.deepEqual(numbers(q("g12-optimization", n).answer), [cut, volume]);
    const derivative = (x) => (side - 2 * x) * (side - 6 * x);
    near(derivative(cut), 0); assert.ok(derivative(cut / 2) > 0 && derivative(cut * 1.5) < 0);
  }
});

test("round 3 FTC uses the endpoint chain factor and correct antiderivative differences", () => {
  numericAnswer("g12-fundamental-theorem", 1, ((2 ** 2) ** 3 + 1) * (2 * 2));
  numericAnswer("g12-fundamental-theorem", 2, ((3 * 1) ** 2 - 2) * 3);
  for (const [n, target] of [[3, 6], [4, -5]]) tableMatch("g12-fundamental-theorem", n, (cells) => Number(norm(cells[3])) - Number(norm(cells[2])) === target);
  // Representative antiderivatives make the derivative-sign argument explicit.
  for (const [n, point, sign] of [[5, 2, -1], [6, 4, 1]]) {
    const integrand = (x) => sign * (x - point);
    const accumulation = (x) => sign * (x - point) ** 2 / 2;
    assert.equal(Math.sign(integrand(point - 0.1)), -sign);
    assert.equal(Math.sign(integrand(point + 0.1)), sign);
    assert.equal(Math.sign(accumulation(point + 0.1) - accumulation(point)), sign);
    assert.match(q("g12-fundamental-theorem", n).answer, sign < 0 ? /local maximum/ : /local minimum/);
  }
});

test("round 3 study allocation preserves each block and protocols separate sampling from assignment", () => {
  for (const [n, blocks, treatmentParts, controlParts] of [[1, [18, 30], 2, 1], [2, [24, 36], 1, 2]]) {
    const treatment = blocks.map((size) => size * treatmentParts / (treatmentParts + controlParts));
    assert.deepEqual(numbers(q("g12-study-design", n).answer), treatment);
    treatment.forEach((count, i) => { assert.ok(Number.isInteger(count)); near(count / (blocks[i] - count), treatmentParts / controlParts); });
  }
  for (const n of [3, 4]) tableMatch("g12-study-design", n, (cells) => /^Random(?:ly)? sample/.test(cells[0]) && /^Random(?:ly assign| allocation)/.test(cells[1]));
  for (const n of [5, 6]) {
    assert.match(q("g12-study-design", n).answer, /random/i);
    assert.match(q("g12-study-design", n).answer, /within each block|within each time-of-day block/);
  }
});
