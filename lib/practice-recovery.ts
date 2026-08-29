import type { PracticeQuestion } from "./curriculum.ts";

export type RecoveryGuidance = {
  label: string;
  title: string;
  clue: string;
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
      label: "CHECK ORDER",
      title: "Use x before y.",
      clue: `You entered (${responseCoordinate[0]}, ${responseCoordinate[1]}). Read the horizontal value first.`,
      modelAnswer: revealModel,
    };
  }

  if (responseNumber !== null && acceptedNumber !== null && responseNumber !== acceptedNumber && Math.abs(responseNumber) === Math.abs(acceptedNumber)) {
    return {
      label: "CHECK THE SIGN",
      title: "The size is right.",
      clue: "Decide whether the direction is positive or negative.",
      modelAnswer: revealModel,
    };
  }

  if (responseNumber !== null && acceptedNumber !== null && responseNumber !== acceptedNumber && (Math.abs(responseNumber * 100 - acceptedNumber) < 1e-9 || Math.abs(responseNumber / 100 - acceptedNumber) < 1e-9)) {
    return {
      label: "CHECK THE SCALE",
      title: "The value is off by 100.",
      clue: "Use the percent sign to decide between ×100 and ÷100.",
      modelAnswer: revealModel,
    };
  }

  if (responseFraction && acceptedFraction && responseFraction[0] === acceptedFraction[1] && responseFraction[1] === acceptedFraction[0]) {
    return {
      label: "CHECK THE FRACTION",
      title: "Top and bottom are reversed.",
      clue: "Name what each number counts, then switch only if needed.",
      modelAnswer: revealModel,
    };
  }

  if (question.choices?.includes(response)) {
    return {
      label: "CHECK THE CHOICE",
      title: failedAttempts >= 2 ? "Test one condition." : "That choice misses the relationship.",
      clue: "Compare the choice with every condition in the question.",
      modelAnswer: revealModel,
    };
  }

  return {
    label: "TRY AGAIN",
    title: failedAttempts >= 2 ? "Change one step." : "Check the relationship.",
    clue: failedAttempts >= 2 ? "Keep the useful work. Change one operation." : "Use the key idea, then retry.",
    modelAnswer: revealModel,
  };
}

export function remixedChoices(choices: string[] | undefined, remix: boolean) {
  if (!choices || !remix || choices.length < 2) return choices;
  return [...choices.slice(1), choices[0]];
}
