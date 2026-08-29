export type PublicTextPrivacyIssue = "email address" | "phone number" | "social handle";

export function publicTextPrivacyIssue(value: string): PublicTextPrivacyIssue | null {
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value)) return "email address";
  if (/(?:^|\s)@[a-z0-9_]{2,}\b/i.test(value)) return "social handle";
  const phoneLike = value.match(/(?:\+?\d[\d\s().-]{5,}\d)/g) ?? [];
  if (phoneLike.some((candidate) => candidate.replace(/\D/g, "").length >= 7)) return "phone number";
  return null;
}
