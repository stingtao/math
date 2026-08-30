export type QuestionInteraction =
  | "fill-in"
  | "yes-no"
  | "true-false"
  | "two-choice"
  | "three-choice"
  | "four-choice"
  | "ordering"
  | "multi-select"
  | "coordinate-grid"
  | "number-line"
  | "graph-choice"
  | "table-choice";

export type GraphChoicePlot = {
  value: string;
  label: string;
  optionLabel?: string;
  kind: "linear" | "quadratic" | "absolute" | "exponential" | "sine" | "cosine" | "circle" | "ellipse";
  a?: number;
  b?: number;
  c?: number;
  h?: number;
  k?: number;
  r?: number;
  rx?: number;
  ry?: number;
  shadeToAxis?: boolean;
};

export type TableChoiceRow = {
  value: string;
  cells: string[];
};

export type QuestionInteractionConfig =
  | { kind: "multi-select"; requiredSelections: number }
  | { kind: "coordinate-grid"; xMin: number; xMax: number; yMin: number; yMax: number; step?: number }
  | { kind: "number-line"; min: number; max: number; step?: number }
  | { kind: "graph-choice"; xMin: number; xMax: number; yMin: number; yMax: number; plots: GraphChoicePlot[] }
  | { kind: "table-choice"; columns: string[]; rows: TableChoiceRow[] };

export const ORDERING_SEPARATOR = " → ";
export const MULTI_SELECT_SEPARATOR = " ; ";

export type BuiltPracticeQuestion = {
  id: string;
  prompt: string;
  answer: string;
  hint: string;
  interaction: QuestionInteraction;
  interactionConfig?: QuestionInteractionConfig;
  choices?: string[];
};

function normalizedValues(values: string[] | undefined) {
  return values?.map((value) => value.trim().toLowerCase()) ?? [];
}

function answerVariants(answer: string) {
  return answer.split("|").map((value) => value.trim().toLowerCase());
}

export function inferQuestionInteraction(answer: string, choices?: string[]): QuestionInteraction {
  const accepted = answerVariants(answer);
  const options = normalizedValues(choices);
  if (accepted.some((value) => value === "true" || value === "false") || options.length === 2 && options.every((value) => value === "true" || value === "false")) return "true-false";
  if (accepted.some((value) => value === "yes" || value === "no") || options.length === 2 && options.every((value) => value === "yes" || value === "no")) return "yes-no";
  if (!choices) return "fill-in";
  if (choices.length === 2) return "two-choice";
  if (choices.length === 3) return "three-choice";
  if (choices.length === 4) return "four-choice";
  if (choices.length === 5) return "ordering";
  throw new Error(`Unsupported ${choices.length}-choice question. Define a new interaction type before adding this content.`);
}

export function isResponseComplete(question: Pick<BuiltPracticeQuestion, "interaction" | "interactionConfig" | "choices">, value: string) {
  if (question.interaction === "multi-select") {
    const selected = value ? value.split(MULTI_SELECT_SEPARATOR) : [];
    const requiredSelections = question.interactionConfig?.kind === "multi-select" ? question.interactionConfig.requiredSelections : 2;
    return selected.length === requiredSelections && new Set(selected).size === selected.length;
  }
  if (question.interaction !== "ordering") return Boolean(value.trim());
  const selected = value ? value.split(ORDERING_SEPARATOR) : [];
  return Boolean(question.choices?.length) && selected.length === question.choices?.length && new Set(selected).size === selected.length;
}

type PracticeQuestionInput = Omit<BuiltPracticeQuestion, "interaction"> & { interaction?: QuestionInteraction };

export function buildPracticeQuestion({ id, prompt, answer, hint, choices, interaction: explicitInteraction, interactionConfig }: PracticeQuestionInput): BuiltPracticeQuestion {
  const interaction = explicitInteraction ?? inferQuestionInteraction(answer, choices);
  const resolvedChoices = interaction === "yes-no"
    ? ["Yes", "No"]
    : interaction === "true-false"
      ? ["True", "False"]
      : choices;
  return { id, prompt, answer, hint, interaction, interactionConfig, choices: resolvedChoices };
}
