import type { PracticeQuestion } from "./curriculum.ts";

export type RecoveryGuidance = {
  label: string;
  title: string;
  explanation: string;
  nextMove: string;
  selfCheck: string;
  modelAnswer?: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase().replaceAll("−", "-").replaceAll(" ", "").replaceAll(",", "");
}

function firstAcceptedAnswer(answer: string) {
  return answer.split("|")[0].trim();
}

function numericValue(value: string) {
  const normalized = normalize(value).replace(/%$/, "");
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function coordinateValue(value: string) {
  const match = value.replaceAll("−", "-").match(/^\s*\(?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)?\s*$/);
  return match ? [Number(match[1]), Number(match[2])] as const : null;
}

function fractionValue(value: string) {
  const match = normalize(value).match(/^(-?\d+)\/(-?\d+)$/);
  return match ? [Number(match[1]), Number(match[2])] as const : null;
}

export function recoveryGuidance(question: PracticeQuestion, response: string, failedAttempts: number): RecoveryGuidance {
  const accepted = firstAcceptedAnswer(question.answer);
  const responseCoordinate = coordinateValue(response);
  const acceptedCoordinate = coordinateValue(accepted);
  const responseNumber = numericValue(response);
  const acceptedNumber = numericValue(accepted);
  const responseFraction = fractionValue(response);
  const acceptedFraction = fractionValue(accepted);
  const revealModel = failedAttempts >= 3 ? accepted : undefined;

  if (responseCoordinate && acceptedCoordinate && responseCoordinate[0] === acceptedCoordinate[1] && responseCoordinate[1] === acceptedCoordinate[0]) {
    return {
      label: "ORDER CHECK",
      title: "The coordinates are reversed.",
      explanation: `You entered (${responseCoordinate[0]}, ${responseCoordinate[1]}). An ordered pair always records the horizontal x-value before the vertical y-value.`,
      nextMove: question.hint,
      selfCheck: "Point to x first, then y, before typing the pair again.",
      modelAnswer: revealModel,
    };
  }

  if (responseNumber !== null && acceptedNumber !== null && responseNumber !== acceptedNumber && Math.abs(responseNumber) === Math.abs(acceptedNumber)) {
    return {
      label: "SIGN CHECK",
      title: "The size is right; the direction sign changed.",
      explanation: "Your magnitude matches the target, so focus only on whether the situation moves positive or negative.",
      nextMove: question.hint,
      selfCheck: "Say the direction or sign rule aloud before recalculating.",
      modelAnswer: revealModel,
    };
  }

  if (responseNumber !== null && acceptedNumber !== null && responseNumber !== acceptedNumber && (Math.abs(responseNumber * 100 - acceptedNumber) < 1e-9 || Math.abs(responseNumber / 100 - acceptedNumber) < 1e-9)) {
    return {
      label: "SCALE CHECK",
      title: "The digits are useful, but the scale is off by 100.",
      explanation: "This often happens when moving between a decimal and a percent. Check whether the percent sign changes the place value.",
      nextMove: question.hint,
      selfCheck: "Write decimal → percent or percent → decimal above your next step.",
      modelAnswer: revealModel,
    };
  }

  if (responseFraction && acceptedFraction && responseFraction[0] === acceptedFraction[1] && responseFraction[1] === acceptedFraction[0]) {
    return {
      label: "FRACTION CHECK",
      title: "The numerator and denominator traded places.",
      explanation: "The two numbers are relevant, but their roles are different. Re-read what counts the parts and what counts the equal groups.",
      nextMove: question.hint,
      selfCheck: "Name what the top and bottom numbers represent before retrying.",
      modelAnswer: revealModel,
    };
  }

  if (question.choices?.includes(response)) {
    return {
      label: failedAttempts >= 2 ? "COMPARE THE CHOICES" : "RELATIONSHIP CHECK",
      title: failedAttempts >= 2 ? "Test the choice against the question, not by appearance." : "That choice uses a nearby idea, but not this relationship.",
      explanation: "Substitute or describe what the selected choice would mean, then compare it with every condition in the prompt.",
      nextMove: question.hint,
      selfCheck: "Cross out each choice that fails one condition, then retry.",
      modelAnswer: revealModel,
    };
  }

  return {
    label: failedAttempts >= 2 ? "BREAK IT INTO ONE STEP" : "METHOD CHECK",
    title: failedAttempts >= 2 ? "Pause the full calculation and rebuild one step." : "Your answer does not match the relationship yet.",
    explanation: failedAttempts >= 2
      ? "Repeated misses usually mean one operation or representation needs attention—not that the whole idea is missing."
      : "Keep the useful work, identify the next operation, and change only that step.",
    nextMove: question.hint,
    selfCheck: "Estimate what kind of answer should be reasonable before typing again.",
    modelAnswer: revealModel,
  };
}

export function remixedChoices(choices: string[] | undefined, remix: boolean) {
  if (!choices || !remix || choices.length < 2) return choices;
  return [...choices.slice(1), choices[0]];
}
