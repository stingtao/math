import assert from "node:assert/strict";
import { curriculumStats, isAnswerCorrect, lessons, regions } from "../lib/curriculum.ts";
import { hasSpecificTopicIcon, topicIconVisuals } from "../lib/topic-icons.ts";
import { grade8RegionLandmarks } from "../lib/visual-landmarks.ts";

assert.equal(regions.length, 31, "Grades 7–9 must contain 31 regions");
assert.equal(lessons.length, 124, "Grades 7–9 must contain 124 lessons");
assert.equal(curriculumStats.questions, 620, "Every lesson must contain five reviewed questions");
assert.ok(lessons.every((lesson) => lesson.practice.length === 5), "Every lesson must contain exactly five questions");
assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, lessons.length, "Lesson IDs must be unique");
assert.equal(new Set(lessons.map((lesson) => lesson.slug)).size, lessons.length, "Lesson slugs must be unique");
assert.deepEqual([7, 8, 9].map((grade) => lessons.filter((lesson) => lesson.grade === grade).length), [32, 52, 40]);
assert.ok(lessons.every((lesson) => hasSpecificTopicIcon(lesson.visual)), "Every lesson visual must have a specific topic icon");
assert.equal(new Set(lessons.map((lesson) => lesson.visual)).size, topicIconVisuals.length, "Icon catalog must exactly cover curriculum visuals");
assert.equal(Object.keys(grade8RegionLandmarks).length, 13, "Every Grade 8 region must have one visual landmark");
assert.ok(regions.filter((region) => region.grade === 8).every((region) => grade8RegionLandmarks[region.id]), "Every Grade 8 region must resolve to a visual landmark");

const standards = lessons.map((lesson) => lesson.standard).join(" ");
for (const domain of ["8.NS", "8.EE", "8.F", "8.G", "8.SP"]) {
  assert.match(standards, new RegExp(domain.replace(".", "\\.")), `Missing ${domain} coverage`);
}

let propertyChecks = 0;
for (const lesson of lessons) {
  for (const question of lesson.practice) {
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
  ["0.5", "1/2"], ["2/4", "1/2"], ["50%", "1/2"], ["−7", "-7"], [" 3 / 6 ", "0.5"], ["0.42", "42%"],
]) assert.ok(isAnswerCorrect(input, accepted), `Exact checker failed: ${input} = ${accepted}`);

console.log(`Validated Grades 7–9: ${lessons.length} lessons, ${curriculumStats.questions} questions, and ${propertyChecks} seeded answer checks.`);
