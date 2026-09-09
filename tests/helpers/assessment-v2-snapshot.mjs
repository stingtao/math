import { lessons, regions } from "../../lib/curriculum.ts";
import { getDepthPack, getQuestionBank } from "../../lib/curriculum-depth.ts";
import { buildDemoReviewQuestions, buildReviewQuestions, selectBossQuestions, selectBossRepairQuestions, selectLessonQuestions } from "../../lib/assessment-selection.ts";
import { digest } from "./assessment-v1-snapshot.mjs";

// This baseline deliberately stays on v2 even after the application default changes.
// Complete question objects protect text, answers, diagrams, hints, and evidence.
export function captureV2Snapshot(seeds, packSlugs) {
  const version = "depth-v2";
  const bankById = new Map(lessons.map((lesson) => [lesson.id, getQuestionBank(lesson, version)]));
  const allDue = lessons.flatMap((lesson) => bankById.get(lesson.id).map((question, index) => ({ lesson_id: lesson.id, question_id: question.id, stage: index % 6 })));
  const banks = Object.fromEntries(lessons.map((lesson) => [lesson.id, digest(bankById.get(lesson.id))]));
  const packs = Object.fromEntries(packSlugs.map((slug) => [slug, digest(getDepthPack(slug, version))]));
  const runs = Object.fromEntries(seeds.map((seed) => {
    const lessonSets = Object.fromEntries(lessons.map((lesson) => [lesson.id, digest(selectLessonQuestions(lesson, seed))]));
    const bosses = Object.fromEntries(regions.map((region) => {
      const questions = selectBossQuestions(region, seed);
      return [region.id, { questions: digest(questions), repairs: digest(questions.map((_, index) => selectBossRepairQuestions(region, seed, index))) }];
    }));
    const reviews = Object.fromEntries(lessons.map((lesson) => [lesson.id, digest(bankById.get(lesson.id).map((question, index) => buildReviewQuestions([{ lesson_id: lesson.id, question_id: question.id, stage: index % 6 }], [lesson], seed, version)))]));
    const batches = [];
    for (let index = 0; index < allDue.length; index += 3) batches.push(buildReviewQuestions(allDue.slice(index, index + 5), lessons, seed, version));
    const demoLessons = Object.fromEntries(lessons.map((lesson) => [lesson.id, digest(buildDemoReviewQuestions([lesson], seed, version))]));
    const demoRegions = Object.fromEntries(regions.map((region) => [region.id, digest(buildDemoReviewQuestions([...region.lessons, region.lessons[0]], seed, version))]));
    return [seed, { lessonSets, bosses, reviews, reviewBatches: digest(batches), demoLessons, demoRegions }];
  }));
  return { format: 1, version, hash: "sha256 over complete canonical question objects", lessonCount: lessons.length, regionCount: regions.length, questionCount: [...bankById.values()].reduce((sum, bank) => sum + bank.length, 0), packSlugs, seeds, banks, packs, runs };
}
