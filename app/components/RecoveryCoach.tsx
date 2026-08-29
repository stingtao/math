import type { PracticeQuestion } from "@/lib/curriculum";
import { recoveryGuidance } from "@/lib/practice-recovery";

export function RecoveryCoach({ question, response, failedAttempts, memoryCheck }: { question: PracticeQuestion; response: string; failedAttempts: number; memoryCheck: boolean }) {
  const guidance = recoveryGuidance(question, response, failedAttempts);
  return (
    <div id="lesson-answer-feedback" className="recovery-coach" role="status" aria-live="polite">
      <header><span aria-hidden="true">↻</span><div><small>FIX ONE MOVE · {guidance.label}</small><strong>{guidance.title}</strong><p>{guidance.explanation}</p></div></header>
      <div className="recovery-coach-steps">
        <article><b>1</b><div><small>SPOT IT</small><strong>Find the step to change</strong><p>{guidance.nextMove}</p></div></article>
        <i aria-hidden="true">→</i>
        <article><b>2</b><div><small>REBUILD</small><strong>Say why before you calculate</strong><p>{guidance.selfCheck}</p></div></article>
        <i aria-hidden="true">→</i>
        <article><b>3</b><div><small>RETRY</small><strong>{memoryCheck ? "Recall it correctly" : "Earn the same credit"}</strong><p>{memoryCheck ? "A clean recall will finish this repair." : "This idea will return once more after question 5."}</p></div></article>
      </div>
      {guidance.modelAnswer && <div className="recovery-model-answer"><span>STEP-UP SUPPORT</span><p>Study one accepted result: <strong>{guidance.modelAnswer}</strong>. Now hide it with your hand, explain why it works, and rebuild it yourself. It will still return in Memory Check.</p></div>}
      <footer><span aria-hidden="true">◇</span><p><strong>Your progress is safe.</strong> This miss creates a focused retry. It never removes points you already earned.</p></footer>
    </div>
  );
}
