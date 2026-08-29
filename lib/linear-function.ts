export type LinearFunction = {
  slope: number;
  intercept: number;
  equation: string;
};

export type GraphPoint = { x: number; y: number };

const MAX_COEFFICIENT = 20;

function numberFromToken(token: string) {
  if (token.includes("/")) {
    const [numerator, denominator] = token.split("/").map(Number);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
    return numerator / denominator;
  }
  const value = Number(token);
  return Number.isFinite(value) ? value : null;
}

function coefficientFromToken(token: string) {
  if (token === "" || token === "+") return 1;
  if (token === "-") return -1;
  return numberFromToken(token);
}

function tidyNumber(value: number) {
  const rounded = Math.round(value * 1_000) / 1_000;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function formatEquation(slope: number, intercept: number) {
  const slopeText = slope === 1 ? "x" : slope === -1 ? "−x" : `${tidyNumber(slope)}x`;
  if (intercept === 0) return `y = ${slopeText}`;
  return `y = ${slopeText} ${intercept > 0 ? "+" : "−"} ${tidyNumber(Math.abs(intercept))}`;
}

export function parseLinearFunction(input: string): LinearFunction | null {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, "")
    .replace(/\*+/g, "*");
  if (!normalized.startsWith("y=")) return null;
  const expression = normalized.slice(2);

  const constant = numberFromToken(expression);
  if (constant !== null && Math.abs(constant) <= MAX_COEFFICIENT) {
    return { slope: 0, intercept: constant, equation: `y = ${tidyNumber(constant)}` };
  }

  const match = expression.match(/^([+-]?(?:(?:\d+(?:\.\d+)?)|(?:\d+\/\d+))?)\*?x(?:([+-])((?:\d+(?:\.\d+)?)|(?:\d+\/\d+)))?$/);
  if (!match) return null;
  const slope = coefficientFromToken(match[1]);
  const interceptMagnitude = match[3] ? numberFromToken(match[3]) : 0;
  if (slope === null || interceptMagnitude === null) return null;
  const intercept = match[2] === "-" ? -interceptMagnitude : interceptMagnitude;
  if (Math.abs(slope) > MAX_COEFFICIENT || Math.abs(intercept) > MAX_COEFFICIENT) return null;
  return { slope, intercept, equation: formatEquation(slope, intercept) };
}

export function valueAt(line: LinearFunction, x: number) {
  return Math.round((line.slope * x + line.intercept) * 1_000) / 1_000;
}

export function clippedLinePoints(line: LinearFunction, bound = 5): [GraphPoint, GraphPoint] | null {
  const candidates: GraphPoint[] = [];
  const add = (x: number, y: number) => {
    if (x < -bound - 1e-9 || x > bound + 1e-9 || y < -bound - 1e-9 || y > bound + 1e-9) return;
    if (!candidates.some((point) => Math.abs(point.x - x) < 1e-9 && Math.abs(point.y - y) < 1e-9)) candidates.push({ x, y });
  };

  add(-bound, valueAt(line, -bound));
  add(bound, valueAt(line, bound));
  if (line.slope !== 0) {
    add((-bound - line.intercept) / line.slope, -bound);
    add((bound - line.intercept) / line.slope, bound);
  }
  if (candidates.length < 2) return null;

  let pair: [GraphPoint, GraphPoint] = [candidates[0], candidates[1]];
  let greatestDistance = -1;
  for (let first = 0; first < candidates.length; first += 1) {
    for (let second = first + 1; second < candidates.length; second += 1) {
      const dx = candidates[first].x - candidates[second].x;
      const dy = candidates[first].y - candidates[second].y;
      const distance = dx * dx + dy * dy;
      if (distance > greatestDistance) {
        greatestDistance = distance;
        pair = [candidates[first], candidates[second]];
      }
    }
  }
  return pair;
}
