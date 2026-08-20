import type { AvatarSpec } from "@/lib/learner-state";

const glyphs: Record<string, string> = {
  compass: "✦",
  orbit: "◉",
  spark: "✧",
  summit: "▲",
  wave: "≈",
  prism: "◆",
};

export function Avatar({ avatar, size = "md", label }: { avatar: AvatarSpec; size?: "sm" | "md" | "lg"; label?: string }) {
  return (
    <span className={`avatar avatar-${avatar.tone} avatar-${size} frame-${avatar.frame}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {glyphs[avatar.glyph] ?? "✦"}
    </span>
  );
}
