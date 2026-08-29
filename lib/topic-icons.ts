export type TopicIconKind = "parts" | "ratio" | "chance" | "data" | "graph" | "shape" | "solid" | "power" | "algebra" | "number" | "steps";

export type TopicIconSpec = {
  kind: TopicIconKind;
  glyph: string;
};

const topicIconSpecs: Record<string, TopicIconSpec> = {
  angles: { kind: "shape", glyph: "∠" },
  area: { kind: "shape", glyph: "A" },
  "area-model": { kind: "parts", glyph: "ab" },
  balance: { kind: "algebra", glyph: "=" },
  "box-plots": { kind: "data", glyph: "▭" },
  circle: { kind: "shape", glyph: "○" },
  compare: { kind: "graph", glyph: "≷" },
  cone: { kind: "solid", glyph: "V" },
  congruence: { kind: "shape", glyph: "≅" },
  coordinate: { kind: "graph", glyph: "xy" },
  "coordinate-transform": { kind: "graph", glyph: "↗" },
  "cross-section": { kind: "solid", glyph: "⌁" },
  "curve-line": { kind: "graph", glyph: "⌁" },
  cylinder: { kind: "solid", glyph: "V" },
  "data-line": { kind: "data", glyph: "x̄" },
  decay: { kind: "graph", glyph: "↘" },
  dilation: { kind: "shape", glyph: "k" },
  distance: { kind: "graph", glyph: "d" },
  distribute: { kind: "algebra", glyph: "a·" },
  elimination: { kind: "algebra", glyph: "⊖" },
  "equation-steps": { kind: "steps", glyph: "1·2" },
  estimate: { kind: "data", glyph: "≈" },
  "exponent-blocks": { kind: "power", glyph: "xⁿ" },
  expression: { kind: "algebra", glyph: "x+" },
  factor: { kind: "algebra", glyph: "( )" },
  "factor-chain": { kind: "steps", glyph: "×" },
  "factor-tree": { kind: "steps", glyph: "×" },
  "fit-line": { kind: "graph", glyph: "≈" },
  formula: { kind: "algebra", glyph: "ƒ" },
  "fraction-bars": { kind: "parts", glyph: "¾" },
  fractions: { kind: "parts", glyph: "a/b" },
  growth: { kind: "graph", glyph: "↗" },
  "inequality-line": { kind: "number", glyph: "≤" },
  "like-terms": { kind: "algebra", glyph: "2x" },
  "line-graph": { kind: "graph", glyph: "↗" },
  mapping: { kind: "graph", glyph: "→" },
  model: { kind: "algebra", glyph: "?" },
  "negative-distribute": { kind: "algebra", glyph: "−a" },
  net: { kind: "solid", glyph: "□" },
  "number-line": { kind: "number", glyph: "±" },
  "number-sets": { kind: "number", glyph: "ℝ" },
  parabola: { kind: "graph", glyph: "∪" },
  parentheses: { kind: "power", glyph: "( )" },
  "percent-grid": { kind: "parts", glyph: "%" },
  "place-value": { kind: "parts", glyph: ".5" },
  powers: { kind: "power", glyph: "x²" },
  prism: { kind: "solid", glyph: "V" },
  probability: { kind: "chance", glyph: "P" },
  "ratio-table": { kind: "ratio", glyph: "2:3" },
  reciprocal: { kind: "power", glyph: "1/x" },
  repeat: { kind: "parts", glyph: ".3̅" },
  representations: { kind: "graph", glyph: "↔" },
  residual: { kind: "data", glyph: "e" },
  "right-triangle": { kind: "shape", glyph: "△" },
  "root-line": { kind: "power", glyph: "√" },
  "root-tiles": { kind: "power", glyph: "√" },
  sample: { kind: "data", glyph: "n" },
  scale: { kind: "ratio", glyph: "k" },
  scatter: { kind: "data", glyph: "••" },
  scientific: { kind: "power", glyph: "10ⁿ" },
  "scientific-ops": { kind: "power", glyph: "×10" },
  sequence: { kind: "graph", glyph: "1,2" },
  "sign-grid": { kind: "number", glyph: "±" },
  slope: { kind: "graph", glyph: "m" },
  "solid-compare": { kind: "solid", glyph: "V?" },
  "solution-types": { kind: "algebra", glyph: "∞" },
  sphere: { kind: "solid", glyph: "○" },
  steps: { kind: "steps", glyph: "1·2" },
  substitute: { kind: "algebra", glyph: "x=" },
  symbols: { kind: "number", glyph: "≠" },
  systems: { kind: "graph", glyph: "×" },
  table: { kind: "data", glyph: "▦" },
  "term-groups": { kind: "algebra", glyph: "2x" },
  transform: { kind: "shape", glyph: "↻" },
  tree: { kind: "chance", glyph: "P" },
  trials: { kind: "chance", glyph: "n" },
  triangle: { kind: "shape", glyph: "△" },
  "two-way": { kind: "data", glyph: "2×2" },
  venn: { kind: "chance", glyph: "∪" },
};

export const topicIconVisuals = Object.freeze(Object.keys(topicIconSpecs));

export function hasSpecificTopicIcon(visual: string) {
  return Object.hasOwn(topicIconSpecs, visual.toLowerCase());
}

export function getTopicIconSpec(visual: string): TopicIconSpec {
  const name = visual.toLowerCase();
  const exact = topicIconSpecs[name];
  if (exact) return exact;

  if (name.includes("fraction") || name.includes("percent")) return { kind: "parts", glyph: "¾" };
  if (name.includes("graph") || name.includes("line")) return { kind: "graph", glyph: "↗" };
  if (name.includes("triangle") || name.includes("angle")) return { kind: "shape", glyph: "△" };
  if (name.includes("exponent") || name.includes("root")) return { kind: "power", glyph: "x²" };
  if (name.includes("number") || name.includes("sign")) return { kind: "number", glyph: "±" };
  return { kind: "algebra", glyph: "fx" };
}
