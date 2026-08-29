type TaskProgressProps = {
  label: string;
  completed: number;
  total: number;
  detail?: string;
  accent?: "blue" | "teal" | "coral" | "violet" | "gold";
};

export function TaskProgress({ label, completed, total, detail, accent = "blue" }: TaskProgressProps) {
  const safeTotal = Math.max(1, total);
  const safeCompleted = Math.min(Math.max(0, completed), safeTotal);
  const percent = Math.round(safeCompleted / safeTotal * 100);

  return (
    <div
      className={`task-progress accent-${accent}`}
      role="progressbar"
      aria-label={`${label}: ${safeCompleted} of ${total} complete`}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={safeCompleted}
    >
      <div><span>{label}</span><strong>{safeCompleted} of {total} complete</strong></div>
      <span className="task-progress-track" aria-hidden="true"><i style={{ width: `${percent}%` }} /></span>
      {detail && <small>{detail}</small>}
    </div>
  );
}
