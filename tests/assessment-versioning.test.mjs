import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { lessons, regions } from "../lib/curriculum.ts";
import { getDepthPacks, getDepthPack, getQuestionBank } from "../lib/curriculum-depth.ts";
import { ASSESSMENT_VERSION, assessmentVersionForId, isDepthVersion, createAssessmentId, isDepthAssessment, buildDemoReviewQuestions, buildReviewQuestions, selectLessonQuestions, selectBossQuestions, selectBossRepairQuestions } from "../lib/assessment-selection.ts";
import { captureV1Snapshot } from "./helpers/assessment-v1-snapshot.mjs";
import { captureV2Snapshot } from "./helpers/assessment-v2-snapshot.mjs";

const frozen = [
  { fixture: JSON.parse(readFileSync(new URL("./fixtures/assessment-v1.json", import.meta.url), "utf8")), capture: captureV1Snapshot },
  { fixture: JSON.parse(readFileSync(new URL("./fixtures/assessment-v2.json", import.meta.url), "utf8")), capture: captureV2Snapshot },
];
const versions = ["depth-v1", "depth-v2", "depth-v3"];
const legacyId = "550e8400-e29b-41d4-a716-446655440000";
const v3SelfContainedPrompts = {
  "g11-matrix-systems:q2": { before: "For the same system, find y.", after: "Solve 2x+y=5 and x−y=1. Find y." },
  "g10-piecewise-functions:q2": { before: "For the same f, find f(3).", after: "f(x)=x+1 for x<0 and x² for x≥0. Find f(3)." },
  "g10-piecewise-functions:q3": { before: "At x=0, which rule includes equality?", after: "For f(x)=x+1 when x<0 and x² when x≥0, which rule applies at x=0?" },
  "g12-function-composition:q2": { before: "For the same functions, find (g∘f)(2).", after: "f(x)=2x+1 and g(x)=x². Find (g∘f)(2)." },
};
const lessonFor = (slug) => lessons.find((lesson) => lesson.slug === slug);
const prefixFor = (version) => `d${versions.indexOf(version) + 1}`;
function introducedPacks(version) {
  const previous = new Set(versions.indexOf(version) > 0 ? getDepthPacks(versions[versions.indexOf(version) - 1]).map((pack) => pack.lessonSlug) : []);
  return getDepthPacks(version).filter((pack) => !previous.has(pack.lessonSlug));
}

for (const { fixture, capture } of frozen) {
  test(`${fixture.version} content, lessons, every Boss repair, Review, and Demo match the immutable release snapshot`, () => {
    const actual = capture(fixture.seeds, fixture.packSlugs);
    for (const field of ["format", "version", "hash", "lessonCount", "regionCount", "questionCount", "packSlugs", "seeds"]) assert.deepEqual(actual[field], fixture[field], `${fixture.version} metadata: ${field}`);
    for (const group of ["banks", "packs"]) {
      assert.deepEqual(Object.keys(actual[group]), Object.keys(fixture[group]), `${fixture.version} ${group} membership`);
      for (const [key, expected] of Object.entries(fixture[group])) assert.equal(actual[group][key], expected, `${fixture.version} ${group}: ${key}`);
    }
    for (const seed of fixture.seeds) {
      for (const group of ["lessonSets", "reviews", "demoLessons", "demoRegions"]) {
        for (const [key, expected] of Object.entries(fixture.runs[seed][group])) assert.equal(actual.runs[seed][group][key], expected, `${fixture.version} ${group}: ${key}, ${seed}`);
      }
      assert.equal(actual.runs[seed].reviewBatches, fixture.runs[seed].reviewBatches, `${fixture.version} mixed review batches: ${seed}`);
      for (const [regionId, expected] of Object.entries(fixture.runs[seed].bosses)) {
        for (const field of ["questions", "repairs"]) assert.equal(actual.runs[seed].bosses[regionId][field], expected[field], `${fixture.version} Boss ${regionId} ${field}: ${seed}`);
      }
    }
  });
}

test("new IDs default to v3 while all saved IDs retain their original assessment version", () => {
  assert.equal(ASSESSMENT_VERSION, "depth-v3");
  assert.match(createAssessmentId(), /^d3-[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/);
  for (const version of versions) {
    const id = `${prefixFor(version)}-version-test`;
    assert.equal(isDepthAssessment(id), true);
    assert.equal(assessmentVersionForId(id), version);
    assert.equal(isDepthVersion(version), true);
  }
  assert.equal(isDepthAssessment(legacyId), false);
  assert.ok(!assessmentVersionForId(legacyId), "Unversioned saved attempts stay on the legacy path");
  for (const value of [undefined, null, "", "depth-v4", "v1", 1]) assert.equal(isDepthVersion(value), false);
});

test("each release adds 24 disjoint packs only to its own and later banks", () => {
  for (const [index, version] of versions.entries()) {
    assert.equal(getDepthPacks(version).length, (index + 1) * 24);
    assert.equal(lessons.reduce((sum, lesson) => sum + getQuestionBank(lesson, version).length, 0), 1346 + (index + 1) * 144);
    const added = introducedPacks(version);
    assert.equal(added.length, 24);
    for (const pack of added) {
      const lesson = lessonFor(pack.lessonSlug);
      const idPrefix = index === 0 ? "d1" : prefixFor(version);
      assert.deepEqual(pack.questions.map((question) => question.id).sort(), [1, 2, 3, 4, 5, 6].map((n) => `${idPrefix}-q${n}`));
      for (const earlier of versions.slice(0, index)) {
        assert.equal(getDepthPack(lesson.slug, earlier), undefined);
        assert.deepEqual(getQuestionBank(lesson, earlier), lesson.practice);
        for (let seed = 0; seed < 16; seed += 1) assert.deepEqual(selectLessonQuestions(lesson, `${prefixFor(earlier)}-version-bank-${seed}`), lesson.practice);
      }
      for (const current of versions.slice(index)) {
        assert.equal(getDepthPack(lesson.slug, current), pack);
        assert.equal(getQuestionBank(lesson, current).length, lesson.practice.length + 6);
        for (let seed = 0; seed < 16; seed += 1) assert.ok(selectLessonQuestions(lesson, `${prefixFor(current)}-version-bank-${seed}`).some((question) => question.id.startsWith(`${idPrefix}-`)), `${current}: authored questions must be reachable`);
      }
    }
  }
  for (const lesson of lessons) {
    const latest = getQuestionBank(lesson, "depth-v3");
    assert.deepEqual(getQuestionBank(lesson), latest);
    assert.equal(new Set(latest.map((question) => question.id)).size, latest.length, `${lesson.slug}: colliding question IDs`);
    for (const version of versions.slice(0, -1)) for (const question of getQuestionBank(lesson, version)) {
      const current = latest.find((candidate) => candidate.id === question.id);
      const promptCorrection = v3SelfContainedPrompts[`${lesson.slug}:${question.id}`];
      if (promptCorrection) {
        assert.equal(question.prompt, promptCorrection.before, `${version}: saved ${lesson.slug}:${question.id} prompt must stay frozen`);
        assert.deepEqual(current, { ...question, prompt: promptCorrection.after }, `${lesson.slug}:${question.id}: only the v3 prompt may change; its original rules and all other fields must stay intact`);
      } else {
        assert.deepEqual(current, question, `${lesson.slug}: latest bank changed old content`);
      }
    }
    assert.deepEqual(selectLessonQuestions(lesson, legacyId), lesson.practice);
  }
});

test("all three Boss versions and every repair index use only their saved version's bank", () => {
  for (const version of versions) for (const region of regions) for (let seed = 0; seed < 4; seed += 1) {
    const attemptId = `${prefixFor(version)}-version-boss-${seed}`;
    const selected = selectBossQuestions(region, attemptId);
    for (let index = 0; index < selected.length; index += 1) {
      const question = selected[index];
      const lesson = region.lessons.find((item) => item.id === question.lessonId);
      const bank = getQuestionBank(lesson, version);
      assert.deepEqual(question, { ...bank.find((item) => item.id === question.id), lessonId: lesson.id, lesson: lesson.title }, `${version}: Boss source bank`);
      for (const repair of selectBossRepairQuestions(region, attemptId, index)) assert.deepEqual(bank.find((item) => item.id === repair.id), repair, `${version}: repair source bank`);
    }
  }
});

test("Review and Demo preserve version boundaries, original questions, and same-objective transfers", () => {
  for (const [index, introduced] of versions.entries()) for (const pack of introducedPacks(introduced)) {
    const lesson = lessonFor(pack.lessonSlug);
    for (const original of pack.questions) {
      const due = [{ lesson_id: lesson.id, question_id: original.id, stage: 2 }];
      const seed = `review-version-${original.id}`;
      for (const earlier of versions.slice(0, index)) assert.deepEqual(buildReviewQuestions(due, [lesson], seed, earlier), [], `${earlier}: cannot expose a future question`);
      for (const version of versions.slice(index)) {
        const plan = buildReviewQuestions(due, [lesson], seed, version);
        assert.equal(plan[0].questionId, original.id);
        assert.equal(plan[0].role, "repair");
        assert.equal(plan[1].role, "transfer");
        assert.notEqual(plan[1].questionId, original.id);
        assert.equal(plan[1].sourceQuestionId, original.id);
        assert.equal(plan[1].evidence?.objectiveId ?? getDepthPack(lesson.slug, version).legacyObjectives[plan[1].questionId], original.evidence.objectiveId);
      }
      assert.deepEqual(buildReviewQuestions(due, [lesson], seed), buildReviewQuestions(due, [lesson], seed, "depth-v3"));
    }
    const oldDue = lesson.practice.map((question) => ({ lesson_id: lesson.id, question_id: question.id, stage: 0 }));
    for (const earlier of versions.slice(0, index)) {
      const plan = buildReviewQuestions(oldDue, [lesson], earlier, earlier);
      assert.equal(plan.length, 3);
      assert.ok(plan.every((question) => question.role === "repair"), "Future objective mappings must not change old Review sets");
    }
    for (let seed = 0; seed < 8; seed += 1) {
      for (const version of versions) {
        const selected = buildDemoReviewQuestions([lesson], `demo-version-${seed}`, version);
        const bank = getQuestionBank(lesson, version);
        assert.equal(selected.length, 5);
        assert.equal(new Set(selected.map((question) => question.questionId)).size, selected.length);
        for (const question of selected) {
          const authored = bank.find((item) => item.id === question.questionId);
          assert.ok(authored, `${version}: Demo cannot use a future question`);
          assert.equal(question.answer, authored.answer);
          assert.equal(question.prompt, authored.prompt);
        }
      }
      assert.deepEqual(buildDemoReviewQuestions([lesson], `demo-version-${seed}`), buildDemoReviewQuestions([lesson], `demo-version-${seed}`, "depth-v3"));
    }
  }
});
