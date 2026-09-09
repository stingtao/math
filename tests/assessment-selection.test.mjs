import assert from "node:assert/strict";
import test from "node:test";
import { lessons, lessonById, regions } from "../lib/curriculum.ts";
import { depthPacks, depthPackBySlug, getQuestionBank } from "../lib/curriculum-depth.ts";
import { checkReviewSubmission } from "../lib/review-assessment.ts";
import {
  buildDemoReviewQuestions,
  buildReviewQuestions,
  createAssessmentId,
  isDepthAssessment,
  isReasoningQuestion,
  selectBossQuestions,
  selectBossRepairQuestions,
  selectLessonQuestions,
} from "../lib/assessment-selection.ts";

const questionKey = (question) => `${question.lessonId}:${question.questionId ?? question.id}`;
const objectiveOf = (lesson, questionId) => {
  const question = getQuestionBank(lesson).find((item) => item.id === questionId);
  return question?.evidence?.objectiveId ?? depthPackBySlug.get(lesson.slug)?.legacyObjectives[questionId];
};

function assertValidReviewSet(questions, sourceLessons) {
  assert.ok(questions.length <= 5, "A review must stay within five questions");
  assert.equal(new Set(questions.map(questionKey)).size, questions.length, "A review must not repeat a question");
  for (const question of questions) {
    const lesson = sourceLessons.find((item) => item.id === question.lessonId);
    assert.ok(lesson, "Every review question must belong to a supplied lesson");
    const bankQuestion = getQuestionBank(lesson).find((item) => item.id === question.questionId);
    assert.ok(bankQuestion, "A review must use an authored question");
    assert.equal(question.prompt, bankQuestion.prompt);
    assert.equal(question.answer, bankQuestion.answer);
    if (question.role === "repair") {
      assert.equal(question.sourceQuestionId, question.questionId, "Repair must retain the original question identity");
    } else {
      assert.equal(question.role, "transfer");
      assert.notEqual(question.sourceQuestionId, question.questionId, "Transfer must use a different question");
      const original = questions.find((item) => item.role === "repair" && item.lessonId === question.lessonId && item.questionId === question.sourceQuestionId);
      assert.ok(original, "A transfer question must retain its original repair in the same set");
      const objective = objectiveOf(lesson, question.sourceQuestionId);
      assert.ok(objective, "Transfer needs an authored objective mapping");
      assert.equal(objectiveOf(lesson, question.questionId), objective, "Transfer must assess the same objective");
    }
  }
}

test("new assessment IDs are versioned and distinguish separate attempts", () => {
  const first = createAssessmentId();
  const second = createAssessmentId();
  assert.match(first, /^d3-[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/);
  assert.notEqual(first, second);
  assert.equal(isDepthAssessment(first), true);
  assert.equal(isDepthAssessment("550e8400-e29b-41d4-a716-446655440000"), false);
});

test("lesson sessions stay short, preserve every audited objective, and reach all authored variants", () => {
  assert.equal(depthPacks.length, 72, "The three deliveries audit 72 named lessons");
  const expectedNewKeys = new Set(depthPacks.flatMap((pack) => pack.questions.map((question) => `${pack.lessonSlug}:${question.id}`)));
  assert.equal(expectedNewKeys.size, 432, "The three deliveries contain 432 distinct new authored questions");
  const seenNewKeys = new Set();
  for (const lesson of lessons) {
    const pack = depthPackBySlug.get(lesson.slug);
    for (let seed = 0; seed < 128; seed += 1) {
      const runId = `d3-lesson-coverage-${seed}`;
      const selected = selectLessonQuestions(lesson, runId);
      assert.ok(selected.length >= 5 && selected.length <= 7, `${lesson.slug} must remain a short session`);
      assert.equal(new Set(selected.map((question) => question.id)).size, selected.length, `${lesson.slug} repeats a question`);
      assert.deepEqual(selectLessonQuestions(lesson, runId), selected, `${lesson.slug} changed within one attempt`);
      for (const question of selected) {
        assert.ok(getQuestionBank(lesson).some((candidate) => candidate.id === question.id), "The session must draw from its lesson bank");
        if (question.evidence) seenNewKeys.add(`${lesson.slug}:${question.id}`);
      }
      if (pack) {
        for (const objective of pack.objectives) {
          assert.equal(selected.filter((question) => question.evidence?.objectiveId === objective.id).length, 1, `${lesson.slug} must exercise ${objective.id} exactly once per session`);
        }
      }
    }
  }
  assert.deepEqual([...seenNewKeys].sort(), [...expectedNewKeys].sort(), "Every new variant must be reachable across attempts");
});

test("legacy lesson and Boss attempts retain their exact original question order", () => {
  const legacyId = "550e8400-e29b-41d4-a716-446655440000";
  for (const lesson of lessons) assert.deepEqual(selectLessonQuestions(lesson, legacyId), lesson.practice);
  for (const region of regions) {
    const actual = selectBossQuestions(region, legacyId);
    const expected = [...region.lessons.map((lesson) => ({ lessonId: lesson.id, questionId: lesson.practice[0].id })), { lessonId: region.lessons[0].id, questionId: region.lessons[0].practice[1].id }];
    assert.deepEqual(actual.map((question) => ({ lessonId: question.lessonId, questionId: question.id })), expected);
    assert.deepEqual(selectBossRepairQuestions(region, legacyId, actual.length - 1), region.lessons[region.lessons.length - 1].practice.slice(2, 4), "An in-flight legacy Boss keeps its original repair contract");
  }
});

test("every Boss covers its lessons and available reasoning with stable, non-repeating questions", () => {
  assert.equal(regions.length, 55);
  for (const region of regions) {
    const hasReasoning = region.lessons.some((lesson) => getQuestionBank(lesson).some(isReasoningQuestion));
    for (let seed = 0; seed < 32; seed += 1) {
      const attemptId = `d3-boss-coverage-${seed}`;
      const selected = selectBossQuestions(region, attemptId);
      assert.equal(selected.length, region.lessons.length + 1);
      assert.deepEqual(selectBossQuestions(region, attemptId), selected);
      assert.equal(new Set(selected.map(questionKey)).size, selected.length, `Boss ${region.id} repeats a question`);
      for (const lesson of region.lessons) assert.ok(selected.some((question) => question.lessonId === lesson.id), `Boss ${region.id} missed ${lesson.slug}`);
      if (hasReasoning) assert.ok(selected.some(isReasoningQuestion), `Boss ${region.id} omitted its available reasoning evidence`);
      for (const question of selected) {
        const lesson = region.lessons.find((item) => item.id === question.lessonId);
        assert.ok(lesson);
        assert.equal(question.lesson, lesson.title);
        assert.ok(getQuestionBank(lesson).some((item) => item.id === question.id));
      }
      for (const failedIndex of [0, selected.length - 1]) {
        const failed = selected[failedIndex];
        const failedLesson = lessonById.get(failed.lessonId);
        const repair = selectBossRepairQuestions(region, attemptId, failedIndex);
        assert.equal(repair.length, 2);
        assert.equal(new Set(repair.map((question) => question.id)).size, 2);
        assert.deepEqual(selectBossRepairQuestions(region, attemptId, failedIndex), repair);
        for (const question of repair) {
          assert.notEqual(question.id, failed.id, "Boss repair must use a fresh question");
          assert.ok(getQuestionBank(failedLesson).includes(question), "Even the extra Boss question must repair its actual source lesson");
        }
        const objective = objectiveOf(failedLesson, failed.id);
        if (objective) {
          const available = getQuestionBank(failedLesson).filter((question) => question.id !== failed.id && objectiveOf(failedLesson, question.id) === objective);
          assert.equal(repair.filter((question) => objectiveOf(failedLesson, question.id) === objective).length, Math.min(2, available.length), "Prefer all available repairs for the same objective before broadening");
        }
      }
    }
  }
});

test("review keeps due originals and adds different questions for the same authored objective", () => {
  for (const pack of depthPacks) {
    const lesson = lessons.find((item) => item.slug === pack.lessonSlug);
    const due = pack.objectives.map((objective, index) => ({ lesson_id: lesson.id, question_id: pack.questions.find((question) => question.evidence.objectiveId === objective.id).id, stage: index }));
    for (let seed = 0; seed < 12; seed += 1) {
      const selected = buildReviewQuestions(due, [lesson], `review-${seed}`);
      assertValidReviewSet(selected, [lesson]);
      assert.deepEqual(selected.filter((question) => question.role === "repair").map((question) => question.questionId), due.map((item) => item.question_id));
      assert.equal(selected.filter((question) => question.role === "transfer").length, 2);
      assert.deepEqual(buildReviewQuestions(due, [lesson], `review-${seed}`), selected);
    }
  }
});

test("review processes only its first three due originals and never invents legacy skill mappings", () => {
  const sourceLessons = lessons.filter((lesson) => !depthPackBySlug.has(lesson.slug)).slice(0, 5);
  const due = sourceLessons.map((lesson) => ({ lesson_id: lesson.id, question_id: lesson.practice[0].id, stage: 0 }));
  const selected = buildReviewQuestions(due, sourceLessons);
  assertValidReviewSet(selected, sourceLessons);
  assert.equal(selected.length, 3);
  assert.ok(selected.every((question) => question.role === "repair"));
  assert.deepEqual(selected.map((question) => question.lessonId), due.slice(0, 3).map((item) => item.lesson_id));
  assert.deepEqual(buildReviewQuestions([], sourceLessons), []);
});

test("Demo review uses authored non-repeating questions for one or several lessons", () => {
  const audited = depthPacks.map((pack) => lessons.find((lesson) => lesson.slug === pack.lessonSlug));
  const baseline = lessons.find((lesson) => !depthPackBySlug.has(lesson.slug));
  for (const sourceLessons of [[audited[0]], [baseline], audited.slice(0, 5), [audited[0], audited[0], audited[1]]]) {
    for (let seed = 0; seed < 16; seed += 1) {
      const selected = buildDemoReviewQuestions(sourceLessons, `demo-${seed}`);
      assertValidReviewSet(selected, sourceLessons);
      assert.equal(selected.length, 5);
      assert.deepEqual(buildDemoReviewQuestions(sourceLessons, `demo-${seed}`), selected);
    }
  }
  assert.deepEqual(buildDemoReviewQuestions([], "empty"), []);
});

test("review submission rejects changed sources, duplicates, missing work, and incorrect answers", () => {
  const pack = depthPacks[0];
  const lesson = lessons.find((item) => item.slug === pack.lessonSlug);
  const due = pack.objectives.map((objective) => ({ lesson_id: lesson.id, question_id: pack.questions.find((question) => question.evidence.objectiveId === objective.id).id, stage: 0 }));
  const plan = buildReviewQuestions(due, [lesson]);
  const answers = plan.map((question) => ({ lessonId: question.lessonId, questionId: question.questionId, sourceQuestionId: question.sourceQuestionId, answer: question.answer.split("|")[0] }));
  const repairIndex = plan.findIndex((question) => question.role === "repair");
  const transferIndex = plan.findIndex((question) => question.role === "transfer");
  assert.ok(repairIndex >= 0 && transferIndex >= 0);

  const wrongSource = answers.map((entry, index) => index === transferIndex ? { ...entry, sourceQuestionId: "unrelated-source" } : entry);
  assert.throws(() => checkReviewSubmission(plan, wrongSource), /review set changed/);
  const duplicate = answers.map((entry, index) => index === transferIndex ? answers[repairIndex] : entry);
  assert.throws(() => checkReviewSubmission(plan, duplicate), /review set changed/);
  assert.throws(() => checkReviewSubmission(plan, answers.filter((_, index) => index !== repairIndex)), /Complete every question/);
  assert.throws(() => checkReviewSubmission(plan, answers.filter((_, index) => index !== transferIndex)), /Complete every question/);
  const wrongAnswer = answers.map((entry, index) => index === transferIndex ? { ...entry, answer: "__incorrect_mathematical_answer__" } : entry);
  assert.throws(() => checkReviewSubmission(plan, wrongAnswer), /Correct each review question/);
  const wrongLesson = answers.map((entry, index) => index === repairIndex ? { ...entry, lessonId: "unrelated-lesson" } : entry);
  assert.throws(() => checkReviewSubmission(plan, wrongLesson), /review set changed/);
  assert.throws(() => checkReviewSubmission(plan, [...answers, answers[0]]), /Complete every question/);
  assert.throws(() => checkReviewSubmission([], []), /Complete every question/);

  const scheduled = checkReviewSubmission(plan, [...answers].reverse());
  assert.deepEqual(scheduled, due.map((item) => ({ lessonId: item.lesson_id, questionId: item.question_id, correct: true })));
  assert.equal(new Set(scheduled.map(questionKey)).size, due.length, "Each original advances at most once, regardless of its transfer question");
  assert.ok(scheduled.every((entry) => !plan.some((question) => question.role === "transfer" && question.questionId === entry.questionId)));
});

test("legacy review submissions can omit sourceQuestionId without losing original-item validation", () => {
  const lesson = lessons.find((item) => !depthPackBySlug.has(item.slug));
  const due = [{ lesson_id: lesson.id, question_id: lesson.practice[0].id, stage: 0 }];
  const plan = buildReviewQuestions(due, [lesson]);
  const submitted = [{ lessonId: lesson.id, questionId: lesson.practice[0].id, answer: lesson.practice[0].answer.split("|")[0] }];
  assert.deepEqual(checkReviewSubmission(plan, submitted), [{ lessonId: lesson.id, questionId: lesson.practice[0].id, correct: true }]);
});

test("v3 matrix foundation remains self-contained when the preceding legacy question is not selected", () => {
  const lesson = lessons.find((item) => item.slug === "g11-matrix-systems");
  const legacy = lesson.practice.find((question) => question.id === "q2");
  assert.equal(legacy.prompt, "For the same system, find y.");
  for (const version of ["depth-v1", "depth-v2"]) assert.deepEqual(getQuestionBank(lesson, version).find((question) => question.id === "q2"), legacy);
  const independent = getQuestionBank(lesson, "depth-v3").find((question) => question.id === "q2");
  assert.equal(independent.prompt, "Solve 2x+y=5 and x−y=1. Find y.");
  assert.equal(independent.answer, legacy.answer);
  const y = Number(independent.answer);
  const x = y + 1;
  assert.equal(2 * x + y, 5);
  assert.equal(x - y, 1);
  let independentCases = 0;
  for (let seed = 0; seed < 128; seed++) {
    const runId = `d3-independent-matrix-${seed}`;
    const selected = selectLessonQuestions(lesson, runId);
    if (selected.some((question) => question.id === "q2") && !selected.some((question) => question.id === "q1")) {
      independentCases++;
      assert.deepEqual(selected.find((question) => question.id === "q2"), independent);
    }
  }
  assert.ok(independentCases > 0, "Exercise the original failure: y must be solvable without a preceding x question");
  const due = [{ lesson_id: lesson.id, question_id: "q2", stage: 0 }];
  assert.equal(buildReviewQuestions(due, [lesson], "depth-v3", "depth-v3")[0].prompt, independent.prompt);
});

test("v3 restores missing function givens for independently sampled Boss and Review questions", () => {
  const cases = [
    ["g10-piecewise-functions", "q2", "f(x)=x+1 for x<0 and x² for x≥0. Find f(3).", 3 ** 2],
    ["g10-piecewise-functions", "q3", "For f(x)=x+1 when x<0 and x² when x≥0, which rule applies at x=0?", "x^2"],
    ["g12-function-composition", "q2", "f(x)=2x+1 and g(x)=x². Find (g∘f)(2).", (2 * 2 + 1) ** 2],
  ];
  for (const [slug, id, prompt, computed] of cases) {
    const lesson = lessons.find((item) => item.slug === slug);
    const original = lesson.practice.find((item) => item.id === id);
    const current = getQuestionBank(lesson, "depth-v3").find((item) => item.id === id);
    assert.equal(current.prompt, prompt);
    assert.equal(current.answer.split("|")[0], String(computed));
    assert.deepEqual({ ...current, prompt: original.prompt }, original, "Only missing givens may be restated");
    for (const version of ["depth-v1", "depth-v2"]) assert.deepEqual(getQuestionBank(lesson, version).find((item) => item.id === id), original);
    assert.deepEqual(selectLessonQuestions(lesson, "d3-self-contained-functions").map((item) => item.id), lesson.practice.map((item) => item.id));
    assert.equal(selectLessonQuestions(lesson, "d3-self-contained-functions").find((item) => item.id === id).prompt, prompt);
    const review = buildReviewQuestions([{ lesson_id: lesson.id, question_id: id, stage: 0 }], [lesson], "depth-v3", "depth-v3");
    assert.equal(review[0].prompt, prompt);
    const region = regions.find((item) => item.id === lesson.regionId);
    let seen = 0;
    for (let seed = 0; seed < 256; seed++) {
      const selected = selectBossQuestions(region, `d3-function-context-${seed}`);
      const question = selected.find((item) => item.lessonId === lesson.id && item.id === id);
      if (question) { seen++; assert.equal(question.prompt, prompt); }
    }
    assert.ok(seen > 0, `${slug}/${id} needs actual standalone Boss coverage`);
  }
});
