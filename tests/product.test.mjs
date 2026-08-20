import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    DB: undefined,
    GOOGLE_CLIENT_ID: "",
    AUTH_HMAC_SECRET: "test-only-hmac-secret",
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the Math Grades 7–9 landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /A simple place/);
  assert.match(html, /Hi, I’m Sting/);
  assert.match(html, /Grades 7, 8, and 9/);
  assert.match(html, /124/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Building your site/);
  assert.match(html, /og\.png/);
});

test("ships all three curriculum files and all source sheets", async () => {
  const curriculum = await readFile(new URL("../lib/curriculum.ts", import.meta.url), "utf8");
  const lessonDefinitions = curriculum.match(/\blesson\(\d+,\s*\d+,/g) ?? [];
  assert.equal(lessonDefinitions.length, 52);
  const grade7 = await readFile(new URL("../lib/curriculum-grade7.ts", import.meta.url), "utf8");
  const grade9 = await readFile(new URL("../lib/curriculum-grade9.ts", import.meta.url), "utf8");
  assert.match(grade7, /7\.RP\.A\.1/);
  assert.match(grade7, /7\.SP\.C\.8/);
  assert.match(grade9, /HSA\.REI\.C\.6/);
  assert.match(grade9, /HSF\.LE\.A/);
  assert.match(curriculum, /8\.NS\.A\.1/);
  assert.match(curriculum, /8\.EE\.C\.8/);
  assert.match(curriculum, /8\.F\.A\.1/);
  assert.match(curriculum, /8\.G\.C\.9/);
  assert.match(curriculum, /8\.SP\.A\.4/);
  const sheets = await readdir(new URL("../public/quick-sheets/", import.meta.url));
  assert.equal(sheets.filter((name) => name.endsWith(".png")).length, 20);
});

test("keeps real Google profile fields out of persistent schema", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  for (const forbidden of ["email", "full_name", "profile_photo", "google_sub"]) assert.doesNotMatch(schema, new RegExp(`["]${forbidden}["]`, "i"));
  assert.match(schema, /auth_key/);
  assert.match(schema, /leaderboard_opt_in/);
  assert.match(schema, /feedback_messages/);
  assert.match(schema, /ON DELETE CASCADE|onDelete: "cascade"/i);
});

test("keeps feedback rows unlinkable from learner progress", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const feedback = schema.slice(schema.indexOf("feedbackMessages"), schema.indexOf("leagueMembers"));
  assert.doesNotMatch(feedback, /learnerId|learner_id|authKey|auth_key/);
  assert.match(feedback, /requestKeyHash/);
});

test("guards authenticated mutations and production responses", async () => {
  const routes = await Promise.all([
    "answer", "state", "review", "feedback",
  ].map((name) => readFile(new URL(`../app/api/${name}/route.ts`, import.meta.url), "utf8")));
  for (const route of routes) {
    assert.match(route, /rejectCrossOriginMutation/);
    assert.match(route, /Idempotency-Key/);
  }
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(worker, /Content-Security-Policy/);
  assert.match(worker, /frame-ancestors 'none'/);
  assert.match(worker, /X-Content-Type-Options/);
  assert.match(worker, /Strict-Transport-Security/);
});
