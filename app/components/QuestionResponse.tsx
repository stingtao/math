import type { QuestionInteraction } from "@/lib/question-interactions";
import { mathInputMode } from "@/lib/math-input";

type QuestionResponseProps = {
  question: { answer?: string; interaction: QuestionInteraction; choices?: string[] };
  value: string;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  choices?: string[];
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function QuestionResponse({ question, value, disabled, invalid, describedBy, choices = question.choices, onChange, onSubmit }: QuestionResponseProps) {
  if (question.interaction !== "fill-in" && choices) {
    return (
      <div className={`choice-grid question-response question-response-${question.interaction}`} data-question-type={question.interaction}>
        {choices.map((choice) => (
          <button
            className={value === choice ? "selected" : ""}
            type="button"
            key={choice}
            aria-pressed={value === choice}
            disabled={disabled}
            onClick={() => onChange(choice)}
          >
            {choice}
          </button>
        ))}
      </div>
    );
  }

  return (
    <label className="answer-field" data-question-type="fill-in">
      <span>Your answer</span>
      <input
        value={value}
        inputMode={mathInputMode(question.answer)}
        enterKeyHint="done"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => { if (event.key === "Enter") onSubmit(); }}
        placeholder="Type your answer"
        autoFocus
      />
    </label>
  );
}
