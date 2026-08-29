import assert from "node:assert/strict";
import { curriculumStats, isAnswerCorrect, lessons, regions } from "../lib/curriculum.ts";
import { algebraCourseCoverage, extendedProgramCoverage, grade7To12CoreCoverage } from "../lib/curriculum-coverage.ts";
import { expandedCoverageLessonSlugs } from "../lib/curriculum-extensions.ts";
import { inferQuestionInteraction, type QuestionInteraction } from "../lib/question-interactions.ts";
import { hasSpecificTopicIcon, topicIconVisuals } from "../lib/topic-icons.ts";
import { getRegionLandmark, regionLandmarks } from "../lib/visual-landmarks.ts";

function writtenUnit(choice: string) {
  return choice.trim().match(/^[-+]?\$?\d+(?:\.\d+)?(?:\/\d+)?\s+([A-Za-z].*)$/)?.[1].trim().toLowerCase() ?? null;
}

assert.equal(regions.length, 55, "Grades 7–12 must contain 55 regions");
assert.equal(lessons.length, 253, "Grades 7–12 must contain 253 lessons");
assert.equal(curriculumStats.questions, 1265, "Every lesson must contain five reviewed questions");
assert.ok(lessons.every((lesson) => lesson.practice.length === 5), "Every lesson must contain exactly five questions");
assert.ok(lessons.every((lesson) => lesson.exampleSteps.length >= 3 && lesson.exampleSteps.every((step) => step.trim().length >= 12)), "Every lesson needs a usable worked reasoning sequence");
assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, lessons.length, "Lesson IDs must be unique");
assert.equal(new Set(lessons.map((lesson) => lesson.slug)).size, lessons.length, "Lesson slugs must be unique");
assert.deepEqual([7, 8, 9, 10, 11, 12].map((grade) => lessons.filter((lesson) => lesson.grade === grade).length), [33, 53, 48, 39, 37, 43]);
assert.ok(lessons.every((lesson) => hasSpecificTopicIcon(lesson.visual)), "Every lesson visual must have a specific topic icon");
assert.equal(new Set(lessons.map((lesson) => lesson.visual)).size, topicIconVisuals.length, "Icon catalog must exactly cover curriculum visuals");
assert.equal(Object.keys(regionLandmarks).length, regions.length, "Every current region must have one visual landmark");
assert.ok(regions.every((region) => getRegionLandmark(region.grade, region.id)), "Every current region must resolve to a visual landmark");

const requiredDomains = new Map<number, string[]>([
  [7, ["7.RP", "7.NS", "7.EE", "7.G", "7.SP"]],
  [8, ["8.NS", "8.EE", "8.F", "8.G", "8.SP"]],
  [9, ["HSN.RN", "HSN.Q", "HSA.SSE", "HSA.APR", "HSA.CED", "HSA.REI", "HSF.IF", "HSF.BF", "HSF.LE", "HSS.ID"]],
  [10, ["HSG.CO", "HSG.SRT", "HSG.GPE", "HSG.C", "HSG.GMD", "HSG.MG", "HSS.CP", "HSF.IF", "HSS.ID"]],
  [11, ["HSA.APR", "HSA.REI", "HSF.LE", "HSF.BF", "HSF.TF", "HSG.GPE", "HSN.VM", "HSS.IC"]],
  [12, ["HSF.BF", "AP.CALC.LIM", "AP.CALC.DIF", "AP.CALC.INT", "HSN.VM", "HSS.MD", "HSS.IC", "HSF.LE"]],
]);
for (const [grade, domains] of requiredDomains) {
  const gradeStandards = lessons.filter((lesson) => lesson.grade === grade).map((lesson) => lesson.standard).join(" ");
  for (const domain of domains) assert.match(gradeStandards, new RegExp(domain.replace(".", "\\.")), `Grade ${grade} is missing ${domain} coverage`);
}

const lessonBySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
assert.equal(grade7To12CoreCoverage.length, 73, "The Common Core cluster contract must cover all Grade 7, Grade 8, and high-school clusters");
for (const strand of grade7To12CoreCoverage) {
  assert.ok(strand.lessonSlugs.length > 0, `${strand.cluster} needs at least one mapped lesson`);
  for (const slug of strand.lessonSlugs) assert.ok(lessonBySlug.has(slug), `${strand.cluster} is missing required lesson ${slug}`);
  const mappedStandards = strand.lessonSlugs.map((slug) => lessonBySlug.get(slug)?.standard ?? "").join(" ");
  assert.ok(mappedStandards.includes(strand.cluster), `${strand.cluster} has no matching standard evidence in its mapped lessons`);
}
for (const strand of algebraCourseCoverage) {
  for (const slug of strand.lessonSlugs) assert.ok(lessonBySlug.has(slug), `${strand.topic} is missing required lesson ${slug}`);
  const mappedStandards = strand.lessonSlugs.map((slug) => lessonBySlug.get(slug)?.standard ?? "").join(" ");
  for (const standard of strand.standards) {
    const family = standard.replace(/[.][A-Z0-9–-]+$/, "");
    assert.ok(mappedStandards.includes(standard) || mappedStandards.includes(family), `${strand.topic} is missing standard evidence for ${standard}`);
  }
}
const extendedContractSlugs = new Set(extendedProgramCoverage.flatMap((strand) => strand.lessonSlugs));
for (const strand of extendedProgramCoverage) {
  assert.ok(strand.lessonSlugs.length > 0, `${strand.authority}: ${strand.outcome} needs lesson evidence`);
  for (const slug of strand.lessonSlugs) assert.ok(lessonBySlug.has(slug), `${strand.authority}: ${strand.outcome} is missing ${slug}`);
}
for (const slug of expandedCoverageLessonSlugs) assert.ok(extendedContractSlugs.has(slug), `${slug} must be recorded in the extended coverage contract`);

let propertyChecks = 0;
let multipleChoiceChecks = 0;
let factorChoiceChecks = 0;
let orderingChecks = 0;
const interactionCounts = new Map<QuestionInteraction, number>();
for (const lesson of lessons) {
  const instructionalCopy = [
    lesson.goal,
    lesson.keyIdea,
    lesson.example,
    ...lesson.exampleSteps,
    ...lesson.practice.map((question) => question.prompt),
  ].join("\n");
  assert.doesNotMatch(
    instructionalCopy,
    /^\s*\d*x\s*[+−-]\s*\d+\s+and\s+\d*x\s*[+−-]\s*\d+\s+are\s+(?:vertical|complementary|supplementary)\b/im,
    `${lesson.id} must name the angles represented by its algebraic expressions`,
  );
  assert.doesNotMatch(
    instructionalCopy,
    /(?:^\s*(?:are\s+)?slopes?\s+[-−\d/][^.!?]{0,55}\b(?:parallel|perpendicular)\b|\b(?:parallel|perpendicular)\s+slopes?\b)/im,
    `${lesson.id} must describe lines—not slopes—as parallel or perpendicular`,
  );
  assert.doesNotMatch(
    instructionalCopy,
    /^\s*sides?\s+[\d, ]+\s+and\s+[\d, ]+\s+are\s+similar\b/im,
    `${lesson.id} must describe figures or triangles—not side-length lists—as similar`,
  );
  assert.equal(new Set(lesson.practice.map((question) => question.id)).size, lesson.practice.length, `${lesson.id} has duplicate question IDs`);
  assert.equal(new Set(lesson.practice.map((question) => question.prompt)).size, lesson.practice.length, `${lesson.id} has duplicate question prompts`);
  for (const question of lesson.practice) {
    assert.ok(question.prompt.trim().length >= 3, `${lesson.id}/${question.id} needs a clear prompt`);
    assert.ok(question.hint.trim().length >= 3, `${lesson.id}/${question.id} needs a useful hint`);
    assert.ok(question.answer.split("|").every((answer) => answer.trim()), `${lesson.id}/${question.id} has an empty accepted answer`);
    const inferredInteraction = inferQuestionInteraction(question.answer, question.choices);
    assert.equal(question.interaction, inferredInteraction, `${lesson.id}/${question.id} has a mismatched interaction type`);
    interactionCounts.set(question.interaction, (interactionCounts.get(question.interaction) ?? 0) + 1);
    if (question.interaction === "fill-in") {
      assert.equal(question.choices, undefined, `${lesson.id}/${question.id} cannot combine fill-in with choices`);
    } else {
      assert.ok(question.choices, `${lesson.id}/${question.id} must render selectable answers`);
    }
    if (question.interaction === "yes-no") {
      assert.deepEqual(question.choices?.map((choice) => choice.toLowerCase()), ["yes", "no"], `${lesson.id}/${question.id} must use Yes/No buttons`);
    }
    if (question.interaction === "true-false") {
      assert.deepEqual(question.choices?.map((choice) => choice.toLowerCase()), ["true", "false"], `${lesson.id}/${question.id} must use True/False buttons`);
    }
    if (/^Factor(?: completely)?\b/i.test(question.prompt)) {
      assert.equal(question.interaction, "four-choice", `${lesson.id}/${question.id} must not use free-form factor input`);
      assert.equal(question.choices?.length, 4, `${lesson.id}/${question.id} needs four authored factor choices`);
      factorChoiceChecks += 1;
    }
    if (question.choices) {
      assert.ok(question.choices.length >= 2 && question.choices.length <= 5, `${lesson.id}/${question.id} needs 2–5 choices`);
      assert.equal(new Set(question.choices.map((choice) => choice.trim().toLowerCase())).size, question.choices.length, `${lesson.id}/${question.id} has duplicate choices`);
      if (question.interaction === "ordering") {
        const orderedAnswer = question.answer.split(" → ");
        assert.equal(question.choices.length, 5, `${lesson.id}/${question.id} ordering tasks need five steps`);
        assert.equal(orderedAnswer.length, question.choices.length, `${lesson.id}/${question.id} ordering answer must contain every step`);
        assert.deepEqual([...orderedAnswer].sort(), [...question.choices].sort(), `${lesson.id}/${question.id} ordering answer must use each authored step exactly once`);
        orderingChecks += 1;
      } else {
        assert.equal(question.choices.filter((choice) => isAnswerCorrect(choice, question.answer)).length, 1, `${lesson.id}/${question.id} must have exactly one selectable correct answer`);
        const answerUnit = writtenUnit(question.answer.split("|")[0]);
        if (answerUnit) assert.ok(question.choices.every((choice) => writtenUnit(choice) === answerUnit), `${lesson.id}/${question.id} must use ${answerUnit} on every answer choice`);
      }
      multipleChoiceChecks += 1;
    }
    const primary = question.answer.split("|")[0];
    for (let seed = 0; seed < 100; seed += 1) {
      const padded = `${" ".repeat(seed % 3)}${seed % 2 ? primary.toUpperCase() : primary}${" ".repeat((seed + 1) % 3)}`;
      assert.ok(isAnswerCorrect(padded, question.answer), `${lesson.id}/${question.id} rejected an accepted answer`);
      propertyChecks += 1;
    }
    assert.equal(isAnswerCorrect("__definitely_not_the_answer__", question.answer), false, `${lesson.id}/${question.id} accepted unrelated text`);
  }
}

for (const [input, accepted] of [
  ["0.5", "1/2"], ["2/4", "1/2"], ["50%", "1/2"], ["−7", "-7"], [" 3 / 6 ", "0.5"], ["0.42", "42%"], ["7.4 × 10³", "7.4*10^3"],
]) assert.ok(isAnswerCorrect(input, accepted), `Exact checker failed: ${input} = ${accepted}`);

const interactionSummary = [...interactionCounts.entries()].map(([type, count]) => `${type}: ${count}`).join(", ");
console.log(`Validated Grades 7–12: ${lessons.length} lessons, ${curriculumStats.questions} questions (${interactionSummary}), ${orderingChecks} ordering checks, ${factorChoiceChecks} factor-choice checks, ${multipleChoiceChecks} selectable questions, and ${propertyChecks} seeded answer checks.`);
