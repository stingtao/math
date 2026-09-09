import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test, { after } from "node:test";
import { lessons } from "../lib/curriculum.ts";
import { getDepthPacks } from "../lib/curriculum-depth.ts";
import { ASSESSMENT_VERSION, buildReviewQuestions } from "../lib/assessment-selection.ts";

const versions = ["depth-v1", "depth-v2", "depth-v3"];
const storeUrl = new URL("../lib/store.ts", import.meta.url).href;
const context = { signedIn: true, due: [], limits: [], completions: [], credits: [] };
globalThis.reviewRouteTestContext = context;
const hooks = registerHooks({
  resolve(specifier, info, next) {
    if (specifier.startsWith("@/")) return { url: new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, shortCircuit: true };
    return next(specifier, info);
  },
  load(url, info, next) {
    if (url === storeUrl) return { format: "module", source: `
      const ctx = globalThis.reviewRouteTestContext;
      export const learnerFromRequest = async () => ctx.signedIn ? {id:"test", timezone:"UTC"} : null;
      export const getDueReviewItems = async (_, limit) => {ctx.limits.push(limit); return ctx.due.slice(0,limit);};
      export const localDate = () => "2026-09-09";
      export const creditCorrectAnswer = async (_, key) => {ctx.credits.push(key); return {correctAnswers:1,badgeUnlocks:[]};};
      export const claimMutation = async () => true;
      export const completeReviewSet = async (_, results) => {ctx.completions.push(results);};
      export const getLearnerState = async () => ({test:true});
    `, shortCircuit: true };
    return next(url, info);
  },
});
const { GET, POST } = await import("../app/api/review/route.ts");
after(() => { hooks.deregister(); delete globalThis.reviewRouteTestContext; });
function releasePack(version) {
  const index = versions.indexOf(version);
  const previous = new Set(index ? getDepthPacks(versions[index - 1]).map((pack) => pack.lessonSlug) : []);
  const pack = getDepthPacks(version).find((item) => !previous.has(item.lessonSlug));
  assert.ok(pack, `${version} must have an independently authored new pack`);
  return pack;
}
function dueFor(pack) {
  const lesson = lessons.find((item) => item.slug === pack.lessonSlug);
  return pack.objectives.map((objective, stage) => ({ lesson_id: lesson.id, question_id: pack.questions.find((q) => q.evidence.objectiveId === objective.id).id, stage }));
}
function reset(due) { context.signedIn = true; context.due = due; context.limits = []; context.completions = []; context.credits = []; }
function publicPlan(plan) { return JSON.parse(JSON.stringify(plan.map((question) => { const publicQuestion = { ...question }; delete publicQuestion.answer; delete publicQuestion.explanation; return publicQuestion; }))); }
function post(body) { return new Request("http://localhost/api/review", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "route-review-test-12345" }, body: JSON.stringify(body) }); }
function submission(plan) { return plan.map((q) => ({ lessonId: q.lessonId, questionId: q.questionId, sourceQuestionId: q.sourceQuestionId, answer: q.answer.split("|")[0] })); }

for (const version of versions) {
  test(`${version} Review route retains explicit membership and seed when the application default is v3`, async () => {
    assert.equal(ASSESSMENT_VERSION, "depth-v3");
    reset(dueFor(releasePack(version)));
    const expected = buildReviewQuestions(context.due, lessons, version, version);
    const response = await GET(new Request(`http://localhost/api/review?version=${version}`));
    assert.equal(response.status, 200);
    assert.deepEqual(context.limits, [3]);
    const body = await response.json();
    assert.deepEqual(body.questions, publicPlan(expected));
    assert.equal(expected.filter((q) => q.role === "transfer").length, 2);
    assert.ok(body.questions.every((q) => !("answer" in q) && !("explanation" in q)), "Solutions remain hidden until a correct check");
    assert.match(response.headers.get("Cache-Control"), /private, no-store/);
  });

  test(`${version} check reveals explanations only after correctness and complete advances original due items only`, async () => {
    reset(dueFor(releasePack(version)));
    const plan = buildReviewQuestions(context.due, lessons, version, version);
    assert.equal(plan.length, 5);
    const first = plan[0];
    const fields = { action: "check", version, lessonId: first.lessonId, questionId: first.questionId, sourceQuestionId: first.sourceQuestionId };
    const wrong = await POST(post({ ...fields, answer: "definitely not the correct answer" }));
    assert.equal(wrong.status, 200);
    const wrongBody = await wrong.json();
    assert.equal(wrongBody.correct, false);
    assert.equal(wrongBody.explanation, undefined);
    assert.equal(context.credits.length, 0);
    const correct = await POST(post({ ...fields, answer: first.answer.split("|")[0] }));
    assert.equal(correct.status, 200);
    const correctBody = await correct.json();
    assert.equal(correctBody.correct, true);
    assert.equal(correctBody.explanation, first.explanation);
    assert.equal(context.credits.length, 1);
    const complete = await POST(post({ action: "complete", version, answers: submission(plan).reverse() }));
    assert.equal(complete.status, 200);
    assert.equal(context.completions.length, 1);
    assert.equal(context.completions[0].length, 3);
    assert.deepEqual(context.completions[0].map((q) => q.questionId), context.due.map((q) => q.question_id));
  });
}

test("v3 Review rejects changed sources, missing transfer work, and duplicate substitutions before scheduling", async () => {
  reset(dueFor(releasePack("depth-v3")));
  const plan = buildReviewQuestions(context.due, lessons, "depth-v3", "depth-v3");
  const answers = submission(plan);
  const transferIndex = plan.findIndex((q) => q.role === "transfer");
  const transfer = answers[transferIndex];
  const wrongCheck = await POST(post({ action: "check", version: "depth-v3", ...transfer, sourceQuestionId: "unrelated-original" }));
  assert.equal(wrongCheck.status, 400);
  for (const changed of [
    answers.filter((_, index) => index !== transferIndex),
    answers.map((answer, index) => index === transferIndex ? answers[0] : answer),
    answers.map((answer, index) => index === transferIndex ? { ...answer, sourceQuestionId: "unrelated-original" } : answer),
  ]) assert.equal((await POST(post({ action: "complete", version: "depth-v3", answers: changed }))).status, 400);
  assert.deepEqual(context.completions, []);
  assert.deepEqual(context.credits, []);
});

test("v1 and v2 routes cannot check or complete third-release due questions", async () => {
  const due = dueFor(releasePack("depth-v3"));
  const latest = buildReviewQuestions(due, lessons, "depth-v3", "depth-v3");
  for (const version of versions.slice(0, -1)) {
    reset(due);
    const get = await GET(new Request(`http://localhost/api/review?version=${version}`));
    assert.equal(get.status, 200);
    assert.deepEqual((await get.json()).questions, []);
    const check = await POST(post({ action: "check", version, ...submission(latest)[0] }));
    assert.equal(check.status, 400);
    assert.equal((await POST(post({ action: "complete", version, answers: submission(latest) }))).status, 400);
    assert.deepEqual(context.completions, []);
    assert.deepEqual(context.credits, []);
  }
});

test("legacy Review retains five originals and accepts original submissions without sourceQuestionId", async () => {
  const lesson = lessons[0];
  reset(lesson.practice.slice(0, 5).map((q) => ({ lesson_id: lesson.id, question_id: q.id, stage: 0 })));
  const response = await GET(new Request("http://localhost/api/review"));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(context.limits, [5]);
  assert.equal(body.questions.length, 5);
  assert.ok(body.questions.every((q) => q.role === "repair" && q.sourceQuestionId === q.questionId));
  const answers = lesson.practice.slice(0, 5).map((q) => ({ lessonId: lesson.id, questionId: q.id, answer: q.answer.split("|")[0] }));
  assert.equal((await POST(post({ action: "complete", answers }))).status, 200);
  assert.equal(context.completions[0].length, 5);
});

test("unsupported versions and anonymous Review requests cannot award credit or schedule reviews", async () => {
  reset(dueFor(releasePack("depth-v3")));
  assert.equal((await GET(new Request("http://localhost/api/review?version=depth-v4"))).status, 400);
  assert.equal((await POST(post({ action: "complete", version: "depth-v4", answers: [] }))).status, 400);
  assert.deepEqual(context.limits, []);
  context.signedIn = false;
  assert.equal((await GET(new Request("http://localhost/api/review?version=depth-v3"))).status, 401);
  assert.equal((await POST(post({ action: "complete", version: "depth-v3", answers: [] }))).status, 401);
  assert.deepEqual(context.completions, []);
  assert.deepEqual(context.credits, []);
});
