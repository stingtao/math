import type { LessonDefinition, PracticeQuestion, RegionDefinition } from "./curriculum.ts";
import { getDepthPack, getQuestionBank } from "./curriculum-depth.ts";
import { ASSESSMENT_VERSION, assessmentVersionForId, isDepthAssessment, type DepthVersion } from "./assessment-version.ts";
export { ASSESSMENT_VERSION, assessmentVersionForId, createAssessmentId, isDepthAssessment, isDepthVersion } from "./assessment-version.ts";
export type { DepthVersion } from "./assessment-version.ts";


function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return result >>> 0;
}
function ranked<T>(items: T[], seed: string, key: (item: T) => string): T[] {
  return [...items].sort((a, b) => hash(`${seed}:${key(a)}`) - hash(`${seed}:${key(b)}`) || key(a).localeCompare(key(b)));
}
const visualInteractions = new Set(["graph-choice", "table-choice", "coordinate-grid", "number-line", "multi-select"]);
export const isReasoningQuestion = (question: PracticeQuestion) => visualInteractions.has(question.interaction) || ["reasoning", "application", "representation"].includes(question.evidence?.demand ?? "");

/** Published pools and ordering stay immutable; future content needs a new version. */
export function selectLessonQuestions(lesson: LessonDefinition, runId: string): PracticeQuestion[] {
  const version = assessmentVersionForId(runId);
  const pack = version && getDepthPack(lesson.slug, version);
  if (!pack) return version ? getQuestionBank(lesson, version) : lesson.practice;
  const extension = pack.objectives.map((objective) => ranked(pack.questions.filter((question) => question.evidence.objectiveId === objective.id), `${runId}:${lesson.id}`, (q) => q.id)[0]).filter(Boolean);
  const foundationIds = new Set(lesson.practice.map((question) => question.id));
  const foundationBank = getQuestionBank(lesson, version).filter((question) => foundationIds.has(question.id));
  const foundation = ranked(foundationBank, `${runId}:foundation`, (question) => question.id).slice(0, 3);
  return [...foundation.slice(0, 2), ...extension, ...foundation.slice(2)];
}

export type BossQuestion = PracticeQuestion & { lessonId: string; lesson: string };
function fromLesson(lesson: LessonDefinition, question: PracticeQuestion): BossQuestion {
  return { ...question, lessonId: lesson.id, lesson: lesson.title };
}
export function selectBossQuestions(region: RegionDefinition, attemptId: string): BossQuestion[] {
  if (!isDepthAssessment(attemptId)) return [
    ...region.lessons.map((lesson) => fromLesson(lesson, lesson.practice[0])),
    fromLesson(region.lessons[0], region.lessons[0].practice[1]),
  ];
  const version = assessmentVersionForId(attemptId)!;
  const demands = ["procedure", "representation", "reasoning", "application", "concept"];
  const result = region.lessons.map((lesson, index) => {
    const bank = getQuestionBank(lesson, version);
    const matching = bank.filter((q) => q.evidence?.demand === demands[index % demands.length]);
    return fromLesson(lesson, ranked(matching.length ? matching : bank, `${attemptId}:${lesson.id}`, (q) => q.id)[0]);
  });
  const pool = region.lessons.flatMap((lesson) => getQuestionBank(lesson, version).map((q) => fromLesson(lesson, q)));
  const key = (q: BossQuestion) => `${q.lessonId}:${q.id}`;
  const selected = new Set(result.map(key));
  const unused = pool.filter((q) => !selected.has(key(q)));
  const transfer = unused.filter(isReasoningQuestion);
  result.push(ranked(transfer.length ? transfer : unused, `${attemptId}:transfer`, key)[0]);
  if (!result.some(isReasoningQuestion)) {
    const rich = ranked(pool.filter(isReasoningQuestion), `${attemptId}:representation`, key)[0];
    if (rich) result[region.lessons.findIndex((lesson) => lesson.id === rich.lessonId)] = rich;
  }
  return result;
}

function objectiveFor(lesson: LessonDefinition, question: PracticeQuestion, version: DepthVersion) {
  return question.evidence?.objectiveId ?? getDepthPack(lesson.slug, version)?.legacyObjectives[question.id];
}
export function selectBossRepairQuestions(region: RegionDefinition, attemptId: string, failedIndex: number): PracticeQuestion[] {
  if (!isDepthAssessment(attemptId)) {
    const lesson = region.lessons[Math.min(Math.max(0, failedIndex), region.lessons.length - 1)];
    return lesson.practice.slice(2, 4);
  }
  const version = assessmentVersionForId(attemptId)!;
  const failed = selectBossQuestions(region, attemptId)[failedIndex];
  const lesson = region.lessons.find((item) => item.id === failed?.lessonId) ?? region.lessons[0];
  const objective = failed ? objectiveFor(lesson, failed, version) : undefined;
  const alternatives = getQuestionBank(lesson, version).filter((q) => q.id !== failed?.id);
  const matching = objective ? alternatives.filter((q) => objectiveFor(lesson, q, version) === objective) : [];
  const preferred = ranked(matching, `${attemptId}:repair`, (q) => q.id);
  return [...preferred, ...ranked(alternatives.filter((q) => !preferred.includes(q)), `${attemptId}:repair`, (q) => q.id)].slice(0, 2);
}

export type DueReviewItem = { lesson_id: string; question_id: string; stage: number };
export type ReviewQuestion = Omit<PracticeQuestion, "id" | "answer"> & {
  lessonId: string;
  lessonTitle: string;
  questionId: string;
  sourceQuestionId: string;
  role: "repair" | "transfer";
  answer?: string;
};
function reviewQuestion(lesson: LessonDefinition, question: PracticeQuestion, sourceQuestionId: string, role: "repair" | "transfer"): ReviewQuestion {
  const { id, ...content } = question;
  return { ...content, lessonId: lesson.id, lessonTitle: lesson.title, questionId: id, sourceQuestionId, role };
}

/** Preserve the original due item; transfer questions never replace its repair evidence. */
export function buildReviewQuestions(due: DueReviewItem[], sourceLessons: LessonDefinition[], seed: string = ASSESSMENT_VERSION, version: DepthVersion = ASSESSMENT_VERSION): ReviewQuestion[] {
  const byId = new Map(sourceLessons.map((lesson) => [lesson.id, lesson]));
  const originals = due.slice(0, 3).flatMap((item) => {
    const lesson = byId.get(item.lesson_id);
    const question = lesson && getQuestionBank(lesson, version).find((q) => q.id === item.question_id);
    return lesson && question ? [{ item, lesson, question }] : [];
  });
  const used = new Set(originals.map(({ lesson, question }) => `${lesson.id}:${question.id}`));
  const result: ReviewQuestion[] = [];
  let transfers = 0;
  for (const { item, lesson, question } of originals) {
    result.push(reviewQuestion(lesson, question, question.id, "repair"));
    const objective = objectiveFor(lesson, question, version);
    if (!objective || transfers >= 2) continue;
    const variants = getQuestionBank(lesson, version).filter((candidate) => objectiveFor(lesson, candidate, version) === objective && !used.has(`${lesson.id}:${candidate.id}`));
    const variant = ranked(variants, `${seed}:${lesson.id}:${question.id}:${item.stage}`, (q) => q.id)[0];
    if (variant) {
      result.push(reviewQuestion(lesson, variant, question.id, "transfer"));
      used.add(`${lesson.id}:${variant.id}`);
      transfers += 1;
    }
  }
  return result;
}

export function buildDemoReviewQuestions(sourceLessons: LessonDefinition[], seed: string, version: DepthVersion = ASSESSMENT_VERSION): ReviewQuestion[] {
  const unique = [...new Map(sourceLessons.map((lesson) => [lesson.id, lesson])).values()];
  const selected = ranked(unique, seed, (lesson) => lesson.id).slice(0, 3);
  const due = selected.map((lesson) => {
    const pool = getQuestionBank(lesson, version);
    const rich = pool.filter(isReasoningQuestion);
    const question = ranked(rich.length ? rich : pool, `${seed}:${lesson.id}`, (q) => q.id)[0];
    return { lesson_id: lesson.id, question_id: question.id, stage: 0 };
  });
  const result = buildReviewQuestions(due, selected, seed, version);
  const used = new Set(result.map((q) => `${q.lessonId}:${q.questionId}`));
  // A single demo lesson still provides a short, non-repeating set.
  for (const lesson of selected) {
    for (const question of ranked(getQuestionBank(lesson, version), seed, (q) => q.id)) {
      if (result.length >= 5) break;
      if (used.has(`${lesson.id}:${question.id}`)) continue;
      result.push(reviewQuestion(lesson, question, question.id, "repair"));
      used.add(`${lesson.id}:${question.id}`);
    }
  }
  return result;
}
