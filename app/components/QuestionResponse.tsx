import { isResponseComplete, MULTI_SELECT_SEPARATOR, ORDERING_SEPARATOR, type QuestionInteraction, type QuestionInteractionConfig } from "@/lib/question-interactions";
import { mathInputMode } from "@/lib/math-input";

type QuestionResponseProps = {
  question: { answer?: string; interaction: QuestionInteraction; interactionConfig?: QuestionInteractionConfig; choices?: string[] };
  value: string;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  choices?: string[];
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function QuestionResponse({ question, value, disabled, invalid, describedBy, choices = question.choices, onChange, onSubmit }: QuestionResponseProps) {
  if (question.interaction === "coordinate-grid" && question.interactionConfig?.kind === "coordinate-grid") {
    return <CoordinateGridResponse config={question.interactionConfig} value={value} disabled={disabled} invalid={invalid} describedBy={describedBy} onChange={onChange} onSubmit={onSubmit} />;
  }

  if (question.interaction === "number-line" && question.interactionConfig?.kind === "number-line") {
    return <NumberLineResponse config={question.interactionConfig} value={value} disabled={disabled} invalid={invalid} describedBy={describedBy} onChange={onChange} onSubmit={onSubmit} />;
  }

  if (question.interaction === "multi-select" && choices) {
    const selected = value ? value.split(MULTI_SELECT_SEPARATOR) : [];
    const requiredSelections = question.interactionConfig?.kind === "multi-select" ? question.interactionConfig.requiredSelections : 2;
    return (
      <div className="question-response question-response-multi-select" data-question-type="multi-select" aria-describedby={describedBy}>
        <p className="multi-select-instruction">Choose {requiredSelections}. <span>{selected.length}/{requiredSelections}</span></p>
        <div className="choice-grid multi-select-grid">
          {choices.map((choice) => {
            const active = selected.includes(choice);
            return <button
              className={active ? "selected" : ""}
              type="button"
              key={choice}
              aria-pressed={active}
              disabled={disabled || !active && selected.length >= requiredSelections}
              onClick={() => {
                const next = active ? selected.filter((item) => item !== choice) : [...selected, choice];
                const sourceOrder = question.choices ?? choices;
                onChange(next.sort((a, b) => sourceOrder.indexOf(a) - sourceOrder.indexOf(b)).join(MULTI_SELECT_SEPARATOR));
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.nativeEvent.isComposing || !isResponseComplete(question, value)) return;
                event.preventDefault();
                onSubmit();
              }}
            ><span className="multi-select-check" aria-hidden="true">{active ? "✓" : ""}</span>{choice}</button>;
          })}
        </div>
      </div>
    );
  }

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

function inclusiveValues(min: number, max: number, step = 1) {
  const count = Math.floor((max - min) / step + .000001);
  return Array.from({ length: count + 1 }, (_, index) => Number((min + index * step).toFixed(4)));
}

function CoordinateGridResponse({ config, value, disabled, invalid, describedBy, onChange, onSubmit }: {
  config: Extract<QuestionInteractionConfig, { kind: "coordinate-grid" }>;
  value: string;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const step = config.step ?? 1;
  const xs = inclusiveValues(config.xMin, config.xMax, step);
  const ys = inclusiveValues(config.yMin, config.yMax, step);
  const width = 520;
  const height = 330;
  const pad = 42;
  const plotWidth = width - pad * 2;
  const plotHeight = height - pad * 2;
  const xPosition = (x: number) => pad + ((x - config.xMin) / Math.max(step, config.xMax - config.xMin)) * plotWidth;
  const yPosition = (y: number) => height - pad - ((y - config.yMin) / Math.max(step, config.yMax - config.yMin)) * plotHeight;
  const selectedMatch = value.match(/^\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)$/);
  const selectedX = selectedMatch ? Number(selectedMatch[1]) : null;
  const selectedY = selectedMatch ? Number(selectedMatch[2]) : null;
  const choose = (x: number, y: number) => onChange(`(${x}, ${y})`);
  return <div className={`coordinate-response question-response ${invalid ? "invalid" : ""}`} data-question-type="coordinate-grid" aria-describedby={describedBy}>
    <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Coordinate plane. Choose one point.">
      <rect x="1" y="1" width={width - 2} height={height - 2} rx="22" className="coordinate-board" />
      <g className="coordinate-grid-lines" aria-hidden="true">
        {xs.map((x) => <line key={`x-${x}`} x1={xPosition(x)} y1={pad} x2={xPosition(x)} y2={height - pad} />)}
        {ys.map((y) => <line key={`y-${y}`} x1={pad} y1={yPosition(y)} x2={width - pad} y2={yPosition(y)} />)}
      </g>
      <g className="coordinate-axes" aria-hidden="true">
        {config.yMin <= 0 && config.yMax >= 0 && <line x1={pad} y1={yPosition(0)} x2={width - pad} y2={yPosition(0)} />}
        {config.xMin <= 0 && config.xMax >= 0 && <line x1={xPosition(0)} y1={pad} x2={xPosition(0)} y2={height - pad} />}
        {xs.map((x) => <text key={`xl-${x}`} x={xPosition(x)} y={height - 14} textAnchor="middle">{x}</text>)}
        {ys.map((y) => <text key={`yl-${y}`} x="25" y={yPosition(y) + 5} textAnchor="middle">{y}</text>)}
        <text x={width - 18} y={yPosition(0) - 9}>x</text><text x={xPosition(0) + 10} y="22">y</text>
      </g>
      <g className="coordinate-hit-points">
        {ys.flatMap((y) => xs.map((x) => {
          const selected = selectedX === x && selectedY === y;
          return <circle
            key={`${x},${y}`}
            cx={xPosition(x)}
            cy={yPosition(y)}
            r={selected ? 11 : 8}
            className={selected ? "selected" : ""}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Point ${x}, ${y}`}
            aria-pressed={selected}
            onClick={() => !disabled && choose(x, y)}
            onKeyDown={(event) => {
              if (disabled || event.nativeEvent.isComposing) return;
              if (event.key === " " || event.key === "Enter" && !selected) { event.preventDefault(); choose(x, y); return; }
              if (event.key === "Enter" && selected) { event.preventDefault(); onSubmit(); }
            }}
          />;
        }))}
      </g>
    </svg>
    <p className="plot-selection" aria-live="polite">{value ? `Selected ${value}` : "Choose a point on the grid."}</p>
  </div>;
}

function NumberLineResponse({ config, value, disabled, invalid, describedBy, onChange, onSubmit }: {
  config: Extract<QuestionInteractionConfig, { kind: "number-line" }>;
  value: string;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const values = inclusiveValues(config.min, config.max, config.step ?? 1);
  return <div className={`number-line-response question-response ${invalid ? "invalid" : ""}`} data-question-type="number-line" aria-describedby={describedBy}>
    <div className="number-line-track" role="group" aria-label="Number line. Choose one value.">
      {values.map((point) => {
        const selected = value === String(point);
        return <button key={point} className={selected ? "selected" : ""} type="button" aria-pressed={selected} disabled={disabled} onClick={() => onChange(String(point))} onKeyDown={(event) => {
          if (event.key !== "Enter" || event.nativeEvent.isComposing || !selected) return;
          event.preventDefault();
          onSubmit();
        }}><i aria-hidden="true" /><span>{point}</span></button>;
      })}
    </div>
    <p className="plot-selection" aria-live="polite">{value ? `Selected ${value}` : "Choose a value on the number line."}</p>
  </div>;
}
