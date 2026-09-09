"use client";

export function QuestionExplanation({ explanation }: { explanation?: string }) {
  if (!explanation?.trim()) return null;

  return (
    <details className="recovery-key-idea question-explanation">
      <summary onKeyDown={(event) => {
        if (event.key === "Enter") event.stopPropagation();
      }}>Why this works</summary>
      <p>{explanation}</p>
    </details>
  );
}
