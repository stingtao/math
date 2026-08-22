export type MathInputMode = "decimal" | "text";

/**
 * Show a compact number keyboard only when at least one accepted answer is a
 * non-negative whole or decimal number. Fractions, negatives, coordinates,
 * equations, units, and words keep the full keyboard so required symbols stay
 * available on mobile.
 */
export function mathInputMode(expectedAnswer?: string): MathInputMode {
  if (!expectedAnswer) return "text";
  const variants = expectedAnswer.split("|").map((variant) => variant.trim());
  return variants.some((variant) => /^\d+(?:\.\d+)?$/.test(variant)) ? "decimal" : "text";
}
