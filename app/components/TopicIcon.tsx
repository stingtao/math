import type { Accent } from "@/lib/curriculum";

type TopicIconSize = "sm" | "md" | "lg" | "xl";

type TopicIconProps = {
  visual: string;
  accent?: Accent;
  size?: TopicIconSize;
  label?: string;
};

function iconSpec(visual: string) {
  const name = visual.toLowerCase();
  const has = (...parts: string[]) => parts.some((part) => name.includes(part));

  if (has("percent")) return { kind: "parts", glyph: "%" };
  if (has("fraction")) return { kind: "parts", glyph: "¾" };
  if (has("decimal", "place-value", "repeating")) return { kind: "parts", glyph: ".5" };
  if (has("ratio", "rate", "scale")) return { kind: "ratio", glyph: "2:3" };
  if (has("probability", "trials", "tree")) return { kind: "chance", glyph: "P" };
  if (has("scatter", "data", "residual", "box-plot", "sample", "table")) return { kind: "data", glyph: "••" };
  if (has("coordinate", "slope", "line", "systems", "curve", "growth", "decay", "parabola", "sequence")) return { kind: "graph", glyph: "↗" };
  if (has("triangle", "angle", "distance", "transform", "congruence", "dilation")) return { kind: "shape", glyph: "△" };
  if (has("cylinder", "cone", "sphere", "solid", "circle", "prism", "net", "cross-section", "area")) return { kind: "solid", glyph: "π" };
  if (has("root", "irrational", "estimate")) return { kind: "power", glyph: "√" };
  if (has("power", "exponent", "scientific", "parentheses")) return { kind: "power", glyph: "x²" };
  if (has("equation", "balance", "substitute", "expression", "distribute", "like-term", "factor", "formula", "model")) return { kind: "algebra", glyph: "x" };
  if (has("symbol")) return { kind: "number", glyph: "≠" };
  if (has("number", "sign", "inequality")) return { kind: "number", glyph: "±" };
  if (has("step")) return { kind: "steps", glyph: "1·2" };
  return { kind: "algebra", glyph: "fx" };
}

export function TopicIcon({ visual, accent = "blue", size = "md", label }: TopicIconProps) {
  const spec = iconSpec(visual);
  return (
    <span
      className={`topic-icon topic-icon-${spec.kind} topic-icon-${size} accent-${accent}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="topic-icon-grid"><i /><i /><i /></span>
      <strong>{spec.glyph}</strong>
      <em><i /><i /><i /></em>
    </span>
  );
}
