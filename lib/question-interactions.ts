export type QuestionInteraction = "fill-in" | "yes-no" | "true-false" | "two-choice" | "three-choice" | "four-choice" | "ordering";

export const ORDERING_SEPARATOR = " → ";

export type BuiltPracticeQuestion = {
  id: string;
  prompt: string;
  answer: string;
  hint: string;
  interaction: QuestionInteraction;
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

export function isResponseComplete(question: Pick<BuiltPracticeQuestion, "interaction" | "choices">, value: string) {
  if (question.interaction !== "ordering") return Boolean(value.trim());
  const selected = value ? value.split(ORDERING_SEPARATOR) : [];
  return Boolean(question.choices?.length) && selected.length === question.choices?.length && new Set(selected).size === selected.length;
}

export function buildPracticeQuestion({ id, prompt, answer, hint, choices }: Omit<BuiltPracticeQuestion, "interaction">): BuiltPracticeQuestion {
  const interaction = inferQuestionInteraction(answer, choices);
  const resolvedChoices = interaction === "yes-no"
    ? ["Yes", "No"]
    : interaction === "true-false"
      ? ["True", "False"]
      : choices;
  return { id, prompt, answer, hint, interaction, choices: resolvedChoices };
}
