import assert from "node:assert/strict";
import { curriculumStats, isAnswerCorrect, lessons, regions } from "../lib/curriculum.ts";
import { inferQuestionInteraction, type QuestionInteraction } from "../lib/question-interactions.ts";
import { hasSpecificTopicIcon, topicIconVisuals } from "../lib/topic-icons.ts";
import { getRegionLandmark, regionLandmarks } from "../lib/visual-landmarks.ts";

function writtenUnit(choice: string) {
  return choice.trim().match(/^[-+]?\$?\d+(?:\.\d+)?(?:\/\d+)?\s+([A-Za-z].*)$/)?.[1].trim().toLowerCase() ?? null;
}

assert.equal(regions.length, 55, "Grades 7–12 must contain 55 regions");
assert.equal(lessons.length, 220, "Grades 7–12 must contain 220 lessons");
assert.equal(curriculumStats.questions, 1100, "Every lesson must contain five reviewed questions");
assert.ok(lessons.every((lesson) => lesson.practice.length === 5), "Every lesson must contain exactly five questions");
assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, lessons.length, "Lesson IDs must be unique");
assert.equal(new Set(lessons.map((lesson) => lesson.slug)).size, lessons.length, "Lesson slugs must be unique");
assert.deepEqual([7, 8, 9, 10, 11, 12].map((grade) => lessons.filter((lesson) => lesson.grade === grade).length), [32, 52, 40, 32, 32, 32]);
assert.ok(lessons.every((lesson) => hasSpecificTopicIcon(lesson.visual)), "Every lesson visual must have a specific topic icon");
assert.equal(new Set(lessons.map((lesson) => lesson.visual)).size, topicIconVisuals.length, "Icon catalog must exactly cover curriculum visuals");
assert.equal(Object.keys(regionLandmarks).length, regions.length, "Every current region must have one visual landmark");
assert.ok(regions.every((region) => getRegionLandmark(region.grade, region.id)), "Every current region must resolve to a visual landmark");

const requiredDomains = new Map<number, string[]>([
  [7, ["7.RP", "7.NS", "7.EE", "7.G", "7.SP"]],
  [8, ["8.NS", "8.EE", "8.F", "8.G", "8.SP"]],
  [9, ["HSN.RN", "HSA.SSE", "HSA.APR", "HSA.CED", "HSA.REI", "HSF.IF", "HSF.BF", "HSF.LE", "HSS.ID"]],
  [10, ["HSG.CO", "HSG.SRT", "HSG.GPE", "HSG.C", "HSG.GMD", "HSG.MG", "HSS.CP", "HSF.IF", "HSS.ID"]],
  [11, ["HSA.APR", "HSA.REI", "HSF.LE", "HSF.BF", "HSF.TF", "HSG.GPE", "HSN.VM", "HSS.IC"]],
  [12, ["HSF.BF", "AP.CALC.LIM", "AP.CALC.DIF", "AP.CALC.INT", "HSN.VM", "HSS.MD", "HSS.IC", "HSF.LE"]],
]);
for (const [grade, domains] of requiredDomains) {
  const gradeStandards = lessons.filter((lesson) => lesson.grade === grade).map((lesson) => lesson.standard).join(" ");
  for (const domain of domains) assert.match(gradeStandards, new RegExp(domain.replace(".", "\\.")), `Grade ${grade} is missing ${domain} coverage`);
}

let propertyChecks = 0;
let multipleChoiceChecks = 0;
let factorChoiceChecks = 0;
const interactionCounts = new Map<QuestionInteraction, number>();
for (const lesson of lessons) {
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
      assert.equal(question.choices.filter((choice) => isAnswerCorrect(choice, question.answer)).length, 1, `${lesson.id}/${question.id} must have exactly one selectable correct answer`);
      const answerUnit = writtenUnit(question.answer.split("|")[0]);
      if (answerUnit) assert.ok(question.choices.every((choice) => writtenUnit(choice) === answerUnit), `${lesson.id}/${question.id} must use ${answerUnit} on every answer choice`);
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
console.log(`Validated Grades 7–12: ${lessons.length} lessons, ${curriculumStats.questions} questions (${interactionSummary}), ${factorChoiceChecks} factor-choice checks, ${multipleChoiceChecks} selectable questions, and ${propertyChecks} seeded answer checks.`);
