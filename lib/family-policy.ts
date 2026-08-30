export const FAMILY_AGREEMENT_VERSION = "family-colearning-v2";
export const FAMILY_SESSION_PREFIX = "family-v2.";
export const PARENT_SESSION_COOKIE = "math_parent_session";
export const FAMILY_DATA_RETENTION_MONTHS = 4;
export const FAMILY_ACCOUNT_RETENTION_MONTHS = 6;

export const FAMILY_STORAGE_SUMMARY = [
  "a protected link to the parent’s Google account, consent time, last sign-in, and deletion dates",
  "one shared family learning record with a random symbol, appearance, progress, answer results, hints, review timing, and private rewards",
  "parent feedback posts and replies when the parent chooses to use the feedback board",
  "hashed session tokens and random request de-duplication keys used to protect saved changes",
] as const;
