export type LearnerMode = "account" | "demo" | "signed-out";

export function chooseLearnerMode(accountAvailable: boolean, demoRequested: boolean): LearnerMode {
  if (accountAvailable) return "account";
  return demoRequested ? "demo" : "signed-out";
}
