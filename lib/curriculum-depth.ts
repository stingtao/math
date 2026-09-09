import type { LessonDefinition, RegionDefinition } from "./curriculum.ts";
import { middleDepthPacks } from "./curriculum-depth-middle.ts";
import { advancedDepthPacks } from "./curriculum-depth-advanced.ts";
import { round2MiddleDepthPacks } from "./curriculum-depth-round2-middle.ts";
import { round2AdvancedDepthPacks } from "./curriculum-depth-round2-advanced.ts";
import { round3MiddleDepthPacks } from "./curriculum-depth-round3-middle.ts";
import { round3AdvancedDepthPacks } from "./curriculum-depth-round3-advanced.ts";
import { ASSESSMENT_VERSION, type DepthVersion } from "./assessment-version.ts";

export const firstDepthPacks = [...middleDepthPacks, ...advancedDepthPacks];
export const round2DepthPacks = [...round2MiddleDepthPacks, ...round2AdvancedDepthPacks];
export const round3DepthPacks = [...round3MiddleDepthPacks, ...round3AdvancedDepthPacks];
const secondDepthPacks = [...firstDepthPacks, ...round2DepthPacks];
export const depthPacks = [...secondDepthPacks, ...round3DepthPacks];
const firstDepthPackBySlug = new Map(firstDepthPacks.map((pack) => [pack.lessonSlug, pack]));
const secondDepthPackBySlug = new Map(secondDepthPacks.map((pack) => [pack.lessonSlug, pack]));
export const depthPackBySlug = new Map(depthPacks.map((pack) => [pack.lessonSlug, pack]));
const packsByVersion = { "depth-v1": firstDepthPacks, "depth-v2": secondDepthPacks, "depth-v3": depthPacks };
const mapsByVersion = { "depth-v1": firstDepthPackBySlug, "depth-v2": secondDepthPackBySlug, "depth-v3": depthPackBySlug };
// These original questions can be sampled alone in v3 Lesson, Boss, or Review.
// Restate their givens without changing their identities, answers, or old versions.
const v3FoundationPrompts: Record<string, Record<string, string>> = {
  "g11-matrix-systems": { q2: "Solve 2x+y=5 and x−y=1. Find y." },
  "g10-piecewise-functions": {
    q2: "f(x)=x+1 for x<0 and x² for x≥0. Find f(3).",
    q3: "For f(x)=x+1 when x<0 and x² when x≥0, which rule applies at x=0?",
  },
  "g12-function-composition": { q2: "f(x)=2x+1 and g(x)=x². Find (g∘f)(2)." },
};

export function getDepthPacks(version: DepthVersion = ASSESSMENT_VERSION) {
  return packsByVersion[version];
}

export function getDepthPack(slug: string, version: DepthVersion = ASSESSMENT_VERSION) {
  return mapsByVersion[version].get(slug);
}

export function applyDepthPacks(regions: RegionDefinition[]): RegionDefinition[] {
  return regions.map((region) => ({
    ...region,
    lessons: region.lessons.map((lesson) => {
      const pack = depthPackBySlug.get(lesson.slug);
      const prompts = v3FoundationPrompts[lesson.slug];
      if (!pack && !prompts) return lesson;
      const foundation = prompts
        ? lesson.practice.map((question) => prompts[question.id] ? { ...question, prompt: prompts[question.id] } : question)
        : lesson.practice;
      return { ...lesson, example: pack?.example ?? lesson.example, exampleSteps: pack?.exampleSteps ?? lesson.exampleSteps, questionBank: [...foundation, ...(pack?.questions ?? [])] };
    }),
  }));
}
export function getQuestionBank(lesson: LessonDefinition, version: DepthVersion = ASSESSMENT_VERSION) {
  if (version !== ASSESSMENT_VERSION) {
    const pack = getDepthPack(lesson.slug, version);
    return pack ? [...lesson.practice, ...pack.questions] : lesson.practice;
  }
  return lesson.questionBank ?? lesson.practice;
}

/** Content evidence only. This does not infer that a learner has mastered an objective. */
export function lessonCoverage(lesson: LessonDefinition) {
  const pack = depthPackBySlug.get(lesson.slug);
  return {
    lessonId: lesson.id,
    lessonSlug: lesson.slug,
    grade: lesson.grade,
    introducedIn: pack ? firstDepthPackBySlug.has(lesson.slug) ? "depth-v1" : secondDepthPackBySlug.has(lesson.slug) ? "depth-v2" : "depth-v3" : null,
    status: pack ? "audited-slice" as const : "baseline-only" as const,
    objectives: (pack?.objectives ?? []).map((objective) => {
      const questions = (pack?.questions ?? []).filter((question) => question.evidence.objectiveId === objective.id);
      const demands = new Set(questions.map((question) => question.evidence.demand));
      return {
        ...objective,
        questionIds: questions.map((question) => question.id),
        status: questions.length >= 2 && objective.requiredDemands.every((demand) => demands.has(demand)) ? "practiced" as const : questions.length ? "partial" as const : "missing" as const,
      };
    }),
    remainingGaps: pack?.remainingGaps ?? ["Individual objectives and question evidence have not yet been audited for this lesson."],
  };
}
