import type { Accent } from "@/lib/curriculum";
import { getTopicIconSpec } from "@/lib/topic-icons";

type TopicIconSize = "sm" | "md" | "lg" | "xl";

type TopicIconProps = {
  visual: string;
  accent?: Accent;
  size?: TopicIconSize;
  label?: string;
};

export function TopicIcon({ visual, accent = "blue", size = "md", label }: TopicIconProps) {
  const spec = getTopicIconSpec(visual);
  return (
    <span
      className={`topic-icon topic-icon-${spec.kind} topic-icon-${size} accent-${accent}`}
      data-visual={visual}
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
