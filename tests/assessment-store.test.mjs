import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { registerHooks } from "node:module";
import { DatabaseSync } from "node:sqlite";
import test, { after } from "node:test";
import { lessons } from "../lib/curriculum.ts";
import { selectLessonQuestions } from "../lib/assessment-selection.ts";

const bootstrapUrl = new URL("../db/bootstrap.ts", import.meta.url).href;
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) return { url: new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === bootstrapUrl) return { format: "module", source: "export const ensureSchema = async () => {}; export const getStore = () => globalThis.assessmentTestDatabase;", shortCircuit: true };
    return next(url, context);
  },
});
const { recordAnswer, recordMasteryCheck, completeLesson, getActiveLessonRun, getDueReviewItems, completeReviewSet } = await import("../lib/store.ts");
after(() => hooks.deregister());
const migrationDir = new URL("../drizzle/", import.meta.url);
const migrations = await Promise.all((await readdir(migrationDir)).filter((name) => name.endsWith(".sql")).sort().map((name) => readFile(new URL(name, migrationDir), "utf8")));
function fixture() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys=OFF");
  for (const migration of migrations) db.exec(migration);
  const wrap = (sql, values = []) => ({
    bind(...args) { return wrap(sql, args); },
    first() { return Promise.resolve(db.prepare(sql).get(...values) ?? null); },
    all() { return Promise.resolve({ results: db.prepare(sql).all(...values) }); },
    run() { const result = db.prepare(sql).run(...values); return Promise.resolve({ meta: { changes: Number(result.changes) } }); },
  });
  let batchTail = Promise.resolve();
  globalThis.assessmentTestDatabase = {
    prepare: wrap,
    batch(statements) {
      const result = batchTail.then(async () => {
        db.exec("BEGIN");
        try { const results = []; for (const statement of statements) results.push(await statement.run()); db.exec("COMMIT"); return results; }
        catch (error) { db.exec("ROLLBACK"); throw error; }
      });
      batchTail = result.catch(() => {});
      return result;
    },
  };
  // Tests exercise the actual store SQL against the project's migrated schema.
  const lesson = lessons.find((item) => item.slug === "g7-surface-area");
  db.prepare("INSERT INTO lesson_progress (learner_id, lesson_id, stars, first_correct_count, question_count, completed_at) VALUES ('test', ?, 3, 5, 5, '2026-01-01')").run(lesson.id);
  return { db, lesson };
}

test("a second lesson page cannot erase an incomplete run, and reload returns its evidence", async () => {
  const { db, lesson } = fixture();
  const run = "d1-saved-run-12345";
  const question = selectLessonQuestions(lesson, run)[0];
  await recordAnswer("test", lesson.id, question.id, false, true, run);
  const other = "d1-second-run-12345";
  await assert.rejects(recordAnswer("test", lesson.id, selectLessonQuestions(lesson, other)[0].id, false, false, other), /Reload to continue/);
  const resumed = await getActiveLessonRun("test", lesson.id);
  assert.equal(resumed.runId, run);
  assert.deepEqual(resumed.attempts, [{ questionId: question.id, firstCorrect: false, corrected: false, attempts: 1, hintsUsed: 1 }]);
  db.close();
});

test("completion requires the selected IDs, finishes six questions, and preserves paired historical accuracy", async () => {
  const { db, lesson } = fixture();
  const run = "d1-six-question-run";
  const questions = selectLessonQuestions(lesson, run);
  assert.equal(questions.length, 6);
  await recordAnswer("test", lesson.id, questions[0].id, false, false, run);
  for (const question of questions.slice(0, 5)) await recordAnswer("test", lesson.id, question.id, true, false, run);
  db.prepare("INSERT INTO lesson_attempts (learner_id,lesson_id,question_id,first_correct,corrected,hints_used,attempts,updated_at) VALUES ('test',?,'unrelated',1,1,0,1,'now')").run(lesson.id);
  await assert.rejects(completeLesson("test", lesson.id, run), /Correct every practice question/);
  await recordAnswer("test", lesson.id, questions[5].id, true, false, run);
  await assert.rejects(completeLesson("test", lesson.id, run), /Memory Check/);
  await recordMasteryCheck("test", lesson.id, questions[0].id, true, false, run, 0);
  const result = await completeLesson("test", lesson.id, run);
  assert.equal(result.stars, 2);
  assert.deepEqual({ ...db.prepare("SELECT first_correct_count, question_count FROM lesson_progress WHERE learner_id='test' AND lesson_id=?").get(lesson.id) }, { first_correct_count: 5, question_count: 5 });
  assert.equal(await getActiveLessonRun("test", lesson.id), null);
  const nextRun = "d1-next-run-12345";
  await recordAnswer("test", lesson.id, selectLessonQuestions(lesson, nextRun)[0].id, false, false, nextRun);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM lesson_attempts").get().n, 1);
  db.close();
});

test("legacy review membership stays unchanged, while the new short set includes other lessons", async () => {
  const { db, lesson } = fixture();
  for (let i=0;i<6;i++) db.prepare("INSERT INTO review_items (learner_id,lesson_id,question_id,stage,due_at) VALUES ('test',?,?,0,?)").run(lesson.id, `q${i}`, `2026-01-0${i+1}`);
  db.prepare("INSERT INTO review_items (learner_id,lesson_id,question_id,stage,due_at) VALUES ('test','another-lesson','q1',0,'2026-01-07')").run();
  assert.deepEqual((await getDueReviewItems("test")).map((item) => item.question_id), ["q0","q1","q2","q3","q4"]);
  assert.ok((await getDueReviewItems("test",3)).some((item) => item.lesson_id === "another-lesson"));
  db.close();
});

test("two review completions cannot advance one due item twice", async () => {
  const { db, lesson } = fixture();
  db.prepare("INSERT INTO review_items (learner_id,lesson_id,question_id,stage,due_at) VALUES ('test',?,'q1',1,'2026-01-01')").run(lesson.id);
  const answers = [{ lessonId: lesson.id, questionId: "q1", correct: true }];
  await Promise.all([completeReviewSet("test", answers, "2026-09-08"), completeReviewSet("test", answers, "2026-09-08")]);
  assert.equal(db.prepare("SELECT stage FROM review_items").get().stage, 2);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM xp_events WHERE kind='review'").get().n, 1);
  db.close();
});


test("simultaneous first answers keep the first result and accumulate same-run attempts atomically", async () => {
  const { db, lesson } = fixture();
  const run = "d1-two-tabs-same-run";
  const question = selectLessonQuestions(lesson, run)[0];
  await Promise.all([
    recordAnswer("test", lesson.id, question.id, false, false, run),
    recordAnswer("test", lesson.id, question.id, true, true, run),
  ]);
  const row = db.prepare("SELECT first_correct, corrected, attempts, hints_used FROM lesson_attempts").get();
  assert.deepEqual({ ...row }, { first_correct: 0, corrected: 1, attempts: 2, hints_used: 1 });
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM answer_credits").get().n, 1);
  db.close();
});

test("simultaneous new runs choose one winner without mixing or deleting answers", async () => {
  const { db, lesson } = fixture();
  const runs = ["d1-new-tab-one-123", "d1-new-tab-two-123"];
  const results = await Promise.allSettled(runs.map((run) => recordAnswer("test", lesson.id, selectLessonQuestions(lesson, run)[0].id, false, false, run)));
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const saved = await getActiveLessonRun("test", lesson.id);
  assert.equal(saved.attempts.length, 1);
  assert.equal(saved.attempts[0].questionId, selectLessonQuestions(lesson, saved.runId)[0].id);
  db.close();
});

async function correctedQuestion(lesson, run) {
  const question = selectLessonQuestions(lesson, run)[0];
  await recordAnswer("test", lesson.id, question.id, false, false, run);
  await recordAnswer("test", lesson.id, question.id, true, false, run);
  return question;
}

test("simultaneous first Memory Check answers preserve the first result and accumulate hints", async () => {
  const { db, lesson } = fixture();
  const run = "d1-memory-first-round";
  const question = await correctedQuestion(lesson, run);
  const results = await Promise.all([
    recordMasteryCheck("test", lesson.id, question.id, false, true, run, 0),
    recordMasteryCheck("test", lesson.id, question.id, true, false, run, 0),
  ]);
  assert.deepEqual(results, [{ cleanCorrected: false }, { cleanCorrected: false }]);
  assert.deepEqual({ ...db.prepare("SELECT round, attempts, hints_used, clean_corrected FROM lesson_mastery_checks").get() }, { round: 0, attempts: 2, hints_used: 1, clean_corrected: 0 });
  assert.deepEqual(await recordMasteryCheck("test", lesson.id, question.id, true, false, run, 0), { cleanCorrected: false });
  assert.equal(db.prepare("SELECT attempts FROM lesson_mastery_checks").get().attempts, 3);
  db.close();
});

test("simultaneous transitions into one Memory Check round cannot overwrite the first failed recall", async () => {
  const { db, lesson } = fixture();
  const run = "d1-memory-next-round";
  const question = await correctedQuestion(lesson, run);
  await recordMasteryCheck("test", lesson.id, question.id, false, false, run, 0);
  const results = await Promise.all([
    recordMasteryCheck("test", lesson.id, question.id, false, true, run, 1),
    recordMasteryCheck("test", lesson.id, question.id, true, false, run, 1),
  ]);
  assert.deepEqual(results, [{ cleanCorrected: false }, { cleanCorrected: false }]);
  assert.deepEqual({ ...db.prepare("SELECT round, attempts, hints_used, clean_corrected FROM lesson_mastery_checks").get() }, { round: 1, attempts: 2, hints_used: 1, clean_corrected: 0 });
  assert.deepEqual(await recordMasteryCheck("test", lesson.id, question.id, true, false, run, 2), { cleanCorrected: true });
  assert.deepEqual({ ...db.prepare("SELECT round, attempts, hints_used, clean_corrected FROM lesson_mastery_checks").get() }, { round: 2, attempts: 1, hints_used: 0, clean_corrected: 1 });
  // The stored achievement remains true, but a later answer is not a new clean recall.
  assert.deepEqual(await recordMasteryCheck("test", lesson.id, question.id, true, false, run, 2), { cleanCorrected: false });
  assert.deepEqual({ ...db.prepare("SELECT round, attempts, hints_used, clean_corrected FROM lesson_mastery_checks").get() }, { round: 2, attempts: 2, hints_used: 0, clean_corrected: 1 });
  db.close();
});

test("a clean first recall survives a simultaneous later miss without crediting both submissions", async () => {
  const { db, lesson } = fixture();
  const run = "d1-memory-clean-first";
  const question = await correctedQuestion(lesson, run);
  const results = await Promise.all([
    recordMasteryCheck("test", lesson.id, question.id, true, false, run, 0),
    recordMasteryCheck("test", lesson.id, question.id, false, true, run, 0),
  ]);
  assert.deepEqual(results, [{ cleanCorrected: true }, { cleanCorrected: false }]);
  assert.deepEqual({ ...db.prepare("SELECT round, attempts, hints_used, clean_corrected FROM lesson_mastery_checks").get() }, { round: 0, attempts: 2, hints_used: 1, clean_corrected: 1 });
  db.close();
});

test("another page cannot replace an already-clean Memory Check with a failed new round", async () => {
  const { db, lesson } = fixture();
  const run = "d1-memory-already-clean";
  const question = await correctedQuestion(lesson, run);
  assert.deepEqual(await recordMasteryCheck("test", lesson.id, question.id, true, false, run, 0), { cleanCorrected: true });
  const passed = { ...db.prepare("SELECT * FROM lesson_mastery_checks").get() };
  await assert.rejects(recordMasteryCheck("test", lesson.id, question.id, false, true, run, 1), /Reload to continue the saved lesson run/);
  assert.deepEqual({ ...db.prepare("SELECT * FROM lesson_mastery_checks").get() }, passed);
  db.close();
});

test("stale Memory Check rounds and invalid jumps cannot overwrite the current round", async () => {
  const { db, lesson } = fixture();
  const run = "d1-memory-stale-round";
  const question = await correctedQuestion(lesson, run);
  await assert.rejects(recordMasteryCheck("test", lesson.id, question.id, true, false, run, 1), /Start with the first Memory Check round/);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM lesson_mastery_checks").get().n, 0);
  await recordMasteryCheck("test", lesson.id, question.id, false, false, run, 0);
  await recordMasteryCheck("test", lesson.id, question.id, true, false, run, 1);
  const before = { ...db.prepare("SELECT * FROM lesson_mastery_checks").get() };
  await assert.rejects(recordMasteryCheck("test", lesson.id, question.id, true, false, run, 0), /Reload to continue the saved lesson run/);
  await assert.rejects(recordMasteryCheck("test", lesson.id, question.id, true, false, run, 3), /Continue the current Memory Check round/);
  for (const invalid of [-1, 21, 1.5]) await assert.rejects(recordMasteryCheck("test", lesson.id, question.id, true, false, run, invalid), /Memory Check round is invalid/);
  assert.deepEqual({ ...db.prepare("SELECT * FROM lesson_mastery_checks").get() }, before);
  db.close();
});

test("late Memory Check submissions cannot mutate a completed or replacement run", async () => {
  const { db, lesson } = fixture();
  const oldRun = "d1-memory-old-lesson-run";
  const selected = selectLessonQuestions(lesson, oldRun);
  for (const question of selected) await recordAnswer("test", lesson.id, question.id, true, false, oldRun);
  await recordMasteryCheck("test", lesson.id, selected[0].id, true, false, oldRun, 0);
  await completeLesson("test", lesson.id, oldRun);
  const completed = { ...db.prepare("SELECT * FROM lesson_mastery_checks").get() };
  await assert.rejects(recordMasteryCheck("test", lesson.id, selected[0].id, false, true, oldRun, 1), /Reload to continue the saved lesson run/);
  assert.deepEqual({ ...db.prepare("SELECT * FROM lesson_mastery_checks").get() }, completed);
  const nextRun = "d1-memory-new-lesson-run";
  const nextQuestion = await correctedQuestion(lesson, nextRun);
  await recordMasteryCheck("test", lesson.id, nextQuestion.id, false, false, nextRun, 0);
  const replacement = { ...db.prepare("SELECT * FROM lesson_mastery_checks").get() };
  await assert.rejects(recordMasteryCheck("test", lesson.id, selected[0].id, true, false, oldRun, 0), /Reload to continue the saved lesson run/);
  assert.deepEqual({ ...db.prepare("SELECT * FROM lesson_mastery_checks").get() }, replacement);
  db.close();
});

test("Memory Check still requires a corrected original and does not grant clean credit after a hint", async () => {
  const { db, lesson } = fixture();
  const run = "d1-memory-needs-repair";
  const question = selectLessonQuestions(lesson, run)[0];
  await recordAnswer("test", lesson.id, question.id, false, false, run);
  await assert.rejects(recordMasteryCheck("test", lesson.id, question.id, true, false, run, 0), /Correct the practice question before its Memory Check/);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM lesson_mastery_checks").get().n, 0);
  await recordAnswer("test", lesson.id, question.id, true, false, run);
  assert.deepEqual(await recordMasteryCheck("test", lesson.id, question.id, true, true, run, 0), { cleanCorrected: false });
  assert.deepEqual(await recordMasteryCheck("test", lesson.id, question.id, true, false, run, 0), { cleanCorrected: false });
  assert.deepEqual({ ...db.prepare("SELECT attempts, hints_used, clean_corrected FROM lesson_mastery_checks").get() }, { attempts: 2, hints_used: 1, clean_corrected: 0 });
  db.close();
});

test("a saved v1 lesson stays unchanged until completion before a v2 run can use the new content", async () => {
  const { db } = fixture();
  const lesson = lessons.find((item) => item.slug === "g7-percent-change");
  db.prepare("INSERT INTO lesson_progress (learner_id, lesson_id, stars, first_correct_count, question_count, completed_at) VALUES ('test', ?, 3, 6, 6, '2026-01-01')").run(lesson.id);
  const oldRun = "d1-before-second-expansion";
  const newRun = "d2-after-second-expansion";
  const oldQuestions = selectLessonQuestions(lesson, oldRun);
  const newQuestions = selectLessonQuestions(lesson, newRun);
  assert.deepEqual(oldQuestions, lesson.practice);
  const newQuestion = newQuestions.find((q) => q.id.startsWith("d2-"));
  assert.ok(newQuestion);
  await recordAnswer("test", lesson.id, oldQuestions[0].id, true, false, oldRun);
  await assert.rejects(recordAnswer("test", lesson.id, newQuestion.id, true, false, oldRun), /not in this lesson run/);
  await assert.rejects(recordAnswer("test", lesson.id, newQuestion.id, true, false, newRun), /Reload to continue/);
  assert.equal((await getActiveLessonRun("test", lesson.id)).runId, oldRun);
  for (const q of oldQuestions.slice(1)) await recordAnswer("test", lesson.id, q.id, true, false, oldRun);
  await completeLesson("test", lesson.id, oldRun);
  await recordAnswer("test", lesson.id, newQuestion.id, true, false, newRun);
  const resumed = await getActiveLessonRun("test", lesson.id);
  assert.equal(resumed.runId, newRun);
  assert.deepEqual(resumed.attempts.map((q) => q.questionId), [newQuestion.id]);
  for (const q of newQuestions.filter((q) => q.id !== newQuestion.id)) await recordAnswer("test", lesson.id, q.id, true, false, newRun);
  assert.equal((await completeLesson("test", lesson.id, newRun)).stars, 3);
  db.close();
});

test("a saved v2 lesson resumes unchanged and rejects v3 replacements until it is completed", async () => {
  const { db } = fixture();
  const lesson = lessons.find((item) => item.slug === "g7-scale-drawings");
  db.prepare("INSERT INTO lesson_progress (learner_id, lesson_id, stars, first_correct_count, question_count, completed_at) VALUES ('test', ?, 3, 6, 6, '2026-01-01')").run(lesson.id);
  const oldRun = "d2-before-third-expansion";
  const newRun = "d3-after-third-expansion";
  const oldQuestions = selectLessonQuestions(lesson, oldRun);
  const newQuestions = selectLessonQuestions(lesson, newRun);
  assert.deepEqual(oldQuestions, lesson.practice);
  const newQuestion = newQuestions.find((q) => q.id.startsWith("d3-"));
  assert.ok(newQuestion);
  await recordAnswer("test", lesson.id, oldQuestions[0].id, true, false, oldRun);
  await assert.rejects(recordAnswer("test", lesson.id, newQuestion.id, true, false, oldRun), /not in this lesson run/);
  await assert.rejects(recordAnswer("test", lesson.id, newQuestion.id, true, false, newRun), /Reload to continue/);
  assert.equal((await getActiveLessonRun("test", lesson.id)).runId, oldRun);
  for (const q of oldQuestions.slice(1)) await recordAnswer("test", lesson.id, q.id, true, false, oldRun);
  await completeLesson("test", lesson.id, oldRun);
  await recordAnswer("test", lesson.id, newQuestion.id, true, false, newRun);
  const resumed = await getActiveLessonRun("test", lesson.id);
  assert.equal(resumed.runId, newRun);
  assert.deepEqual(resumed.attempts.map((q) => q.questionId), [newQuestion.id]);
  for (const q of newQuestions.filter((q) => q.id !== newQuestion.id)) await recordAnswer("test", lesson.id, q.id, true, false, newRun);
  assert.equal((await completeLesson("test", lesson.id, newRun)).stars, 3);
  db.close();
});
