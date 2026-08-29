import { isResponseComplete, ORDERING_SEPARATOR, type QuestionInteraction } from "@/lib/question-interactions";
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
  if (question.interaction === "ordering" && choices) {
    const selected = value ? value.split(ORDERING_SEPARATOR) : [];
    return (
      <div className="ordering-response question-response question-response-ordering" data-question-type="ordering">
        <div className="ordering-sequence" aria-live="polite">
          <span>Build the order</span>
          <strong>{selected.length ? selected.map((choice, index) => `${index + 1}. ${choice}`).join("  →  ") : "Choose the first step"}</strong>
        </div>
        <div className="choice-grid ordering-choice-grid">
          {choices.map((choice) => {
            const position = selected.indexOf(choice);
            return (
              <button
                className={position >= 0 ? "selected" : ""}
                type="button"
                key={choice}
                aria-pressed={position >= 0}
                aria-label={position >= 0 ? `${choice}, position ${position + 1}. Remove from order.` : `Add ${choice} as step ${selected.length + 1}`}
                aria-keyshortcuts={isResponseComplete(question, value) ? "Enter" : undefined}
                disabled={disabled}
                onClick={() => onChange((position >= 0 ? selected.filter((item) => item !== choice) : [...selected, choice]).join(ORDERING_SEPARATOR))}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.nativeEvent.isComposing || !isResponseComplete(question, value)) return;
                  event.preventDefault();
                  onSubmit();
                }}
              >
                {position >= 0 && <span className="ordering-position" aria-hidden="true">{position + 1}</span>}
                {choice}
              </button>
            );
          })}
        </div>
        <button className="ordering-reset" type="button" disabled={disabled || selected.length === 0} onClick={() => onChange("")}>Reset order</button>
      </div>
    );
  }

  if (question.interaction !== "fill-in" && choices) {
    return (
      <div className={`choice-grid question-response question-response-${question.interaction}`} data-question-type={question.interaction}>
        {choices.map((choice) => (
          <button
            className={value === choice ? "selected" : ""}
            type="button"
            key={choice}
            aria-pressed={value === choice}
            aria-keyshortcuts={value === choice ? "Enter" : undefined}
            disabled={disabled}
            onClick={() => onChange(choice)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing || value !== choice) return;
              event.preventDefault();
              onSubmit();
            }}
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
        aria-keyshortcuts="Enter"
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.nativeEvent.isComposing || !isResponseComplete(question, value)) return;
          event.preventDefault();
          onSubmit();
        }}
        placeholder="Type your answer"
        autoFocus
      />
    </label>
  );
}
