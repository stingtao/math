import { getComboSpec } from "@/lib/combo";

type MomentumRunProps = {
  label: string;
  current: number;
  best: number;
  total: number;
  tone: "focus" | "memory";
  justLinked?: boolean;
};

export function MomentumRun({ label, current, best, total, tone, justLinked = false }: MomentumRunProps) {
  const full = current >= total;
  const combo = getComboSpec(current);
  const title = full ? "Full chain connected!" : current > 0 ? `${current} clean ${current === 1 ? "step" : "steps"} linked` : "Ready for a clean spark";
  const nextCopy = full ? "Every step landed on the first try." : `${total - current} ${total - current === 1 ? "link" : "links"} to a full chain`;

  return (
    <div className={`momentum-run momentum-${tone} combo-${combo.tier} ${justLinked ? "just-linked" : ""}`} role="group" aria-live="off" aria-label={`${label}: current combo ${current}, best combo ${best}, out of ${total}`}>
      <span className="momentum-run-emblem" aria-hidden="true"><strong>{current > 1 ? `×${current}` : combo.motif}</strong><small>{combo.tier === "signal" ? "READY" : combo.tier.toUpperCase()}</small></span>
      <div className="momentum-run-copy"><span>{label}</span><strong>{title}</strong><small>{nextCopy}</small></div>
      <div className="momentum-run-links" aria-hidden="true">{Array.from({ length: total }, (_, index) => <i className={index < current ? "linked" : index === current ? "next" : ""} key={index}>{index < current ? "✓" : index + 1}</i>)}</div>
      <b>BEST ×{best}</b>
      <p>{current > 1 ? combo.label : "Clean answers build a combo"} · corrections still advance.</p>
    </div>
  );
}
