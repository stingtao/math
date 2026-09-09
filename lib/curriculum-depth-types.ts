import type { PracticeQuestion } from "./curriculum.ts";

export type CognitiveDemand = "concept" | "procedure" | "representation" | "reasoning" | "application";
export type QuestionEvidence = {
  objectiveId: string;
  demand: CognitiveDemand;
  representation: "symbolic" | "verbal" | "table" | "graph" | "diagram";
  difficulty: 1 | 2 | 3;
  misconception: string;
  variantFamily: string;
};
export type DepthQuestion = PracticeQuestion & {
  evidence: QuestionEvidence;
  explanation: string;
};
export type DepthObjective = {
  id: string;
  description: string;
  requiredDemands: CognitiveDemand[];
};
export type LessonDepthPack = {
  lessonSlug: string;
  objectives: DepthObjective[];
  /** Only map an original question when it actually assesses this objective. */
  legacyObjectives: Record<string, string>;
  example: string;
  exampleSteps: string[];
  questions: DepthQuestion[];
  /** Scope still requiring content; presence of a pack is not full-course coverage. */
  remainingGaps: string[];
};
