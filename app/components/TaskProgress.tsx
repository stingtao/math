import { useId, type ReactNode } from "react";

type TaskProgressProps = {
  label: string;
  completed: number;
  total: number;
  detail?: ReactNode;
  accent?: "blue" | "teal" | "coral" | "violet" | "gold";
};

export function TaskProgress({ label, completed, total, detail, accent = "blue" }: TaskProgressProps) {
  const safeTotal = Math.max(1, total);
  const safeCompleted = Math.min(Math.max(0, completed), safeTotal);
  const percent = Math.round(safeCompleted / safeTotal * 100);

  return (
    <div
      className={`task-progress accent-${accent}`}
    >
      <div><span>{label}</span><strong>{safeCompleted} of {total} complete</strong></div>
      <span
        className="task-progress-track"
        role="progressbar"
        aria-label={`${label}: ${safeCompleted} of ${total} complete`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={safeCompleted}
      ><i style={{ width: `${percent}%` }} /></span>
      {detail && <div className="task-progress-detail">{detail}</div>}
    </div>
  );
}

export function MemoryReturnCue({ count }: { count: number }) {
  const tooltipId = useId();
  const label = `${count} ${count === 1 ? "idea returns" : "ideas return"} for a quick memory check.`;
  return (
    <button className="memory-return-cue" type="button" aria-label="Memory check scheduled" aria-describedby={tooltipId}>
      <span className="memory-return-icon" aria-hidden="true">↻</span>
      <span className="memory-return-tooltip" id={tooltipId} role="tooltip">{label}</span>
    </button>
  );
}
