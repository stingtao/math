import type { PracticeQuestion } from "@/lib/curriculum";
import { recoveryGuidance } from "@/lib/practice-recovery";

export function RecoveryCoach({ question, response, failedAttempts, memoryCheck }: { question: PracticeQuestion; response: string; failedAttempts: number; memoryCheck: boolean }) {
  const guidance = recoveryGuidance(question, response, failedAttempts);
  const hasMoreSpecificKeyIdea = guidance.clue !== question.hint;
  return (
    <div id="lesson-answer-feedback" className="recovery-coach" role="status" aria-live="polite">
      <header><span aria-hidden="true">↻</span><div><small>{guidance.label}</small><strong>{guidance.title}</strong></div></header>
      <p className="recovery-clue">{guidance.clue}</p>
      {hasMoreSpecificKeyIdea && <details className="recovery-key-idea">
        <summary>Review the key idea</summary>
        <p>{question.hint}</p>
      </details>}
      {guidance.modelAnswer && <div className="recovery-model-answer"><span>ONE ACCEPTED FORM</span><strong>{guidance.modelAnswer}</strong></div>}
      <footer><span aria-hidden="true">✓</span><strong>{memoryCheck ? "Retry to finish the recall." : "Full credit is still available."}</strong></footer>
    </div>
  );
}
