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
  assert.match(html, /Small steps/);
  assert.match(html, /Hi, I’m Sting/);
  assert.match(html, /Grades 7, 8, and 9/);
  assert.match(html, /124/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Building your site/);
  assert.match(html, /og-v2\.png/);
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
    "answer", "state", "review", "feedback", "boss",
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

test("keeps progression and boss hearts server-authoritative", async () => {
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const stateRoute = await readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8");
  const bossRoute = await readFile(new URL("../app/api/boss/route.ts", import.meta.url), "utf8");
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  assert.match(store, /assertLessonUnlocked/);
  assert.match(store, /assertBossUnlocked/);
  assert.match(store, /UPDATE boss_attempts SET hearts/);
  assert.match(store, /checkBossRepairAnswer/);
  assert.match(schema, /bossAttempts/);
  assert.match(bossRoute, /claimMutation/);
  assert.doesNotMatch(stateRoute, /action: "completeBoss"/);
});

test("does not send review answers to authenticated clients", async () => {
  const route = await readFile(new URL("../app/api/review/route.ts", import.meta.url), "utf8");
  const getHandler = route.slice(route.indexOf("export async function GET"), route.indexOf("export async function POST"));
  assert.doesNotMatch(getHandler, /answer:\s*question\.answer/);
  assert.match(route, /action === "check"/);
  assert.match(route, /results\.some\(\(entry\) => !entry\.correct\)/);
});

test("ships five extensible success patterns and reduced-motion handling", async () => {
  const component = await readFile(new URL("../app/components/SuccessBurst.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const pattern of ["orbit", "confetti", "ripple", "spark", "lift"]) assert.match(component, new RegExp(`"${pattern}"`));
  assert.match(css, /\.success-confetti/);
  assert.match(css, /\.success-ripple/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /animation:\s*none !important/);
});

test("ships a readable, safe-area-aware mobile learning interface", async () => {
  const header = await readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(header, /mobile-learner-nav/);
  assert.match(header, /mobile-public-menu/);
  assert.match(layout, /viewportFit:\s*"cover"/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media \(max-width: 380px\)/);
  assert.match(css, /-webkit-text-size-adjust:\s*100%/);
  assert.match(css, /\.sheet-modal img \{[^}]*object-fit:\s*contain/);
  assert.match(css, /\.katex-display \{[^}]*overflow-x:\s*auto/);
});

test("places a teen-treated AdSense unit between every page and the shared footer", async () => {
  const adUnit = await readFile(new URL("../app/components/AdUnit.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const legal = await readFile(new URL("../app/components/LegalPage.tsx", import.meta.url), "utf8");
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  const adsTxt = await readFile(new URL("../public/ads.txt", import.meta.url), "utf8");
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.match(adUnit, /ca-pub-6452867962392355/);
  assert.match(adUnit, /2899407297/);
  assert.match(adUnit, /data-ad-format="autorelaxed"/);
  assert.match(adUnit, /data-tag-for-age-treatment="2"/);
  assert.match(layout, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
  assert.match(layout, /google-adsense-account/);
  assert.ok(layout.indexOf("{children}") < layout.indexOf("<AdUnit"));
  assert.ok(layout.indexOf("<AdUnit") < layout.indexOf("<SiteFooter"));
  assert.doesNotMatch(home, /<footer className="site-footer"/);
  assert.doesNotMatch(home, /No ads or behavior tracking/);
  assert.match(legal, /Google AdSense/);
  assert.match(legal, /policies\.google\.com\/technologies\/partner-sites/);
  assert.match(worker, /pagead2\.googlesyndication\.com/);
  assert.match(worker, /HTMLRewriter/);
  assert.match(worker, /'strict-dynamic'/);
  assert.match(worker, /'unsafe-eval'/);
  assert.equal(adsTxt.trim(), "google.com, pub-6452867962392355, DIRECT, f08c47fec0942fa0");
  assert.equal(packageJson.scripts.deploy, "npm run deploy:cloudflare");
});

test("ships a visual topic system across home, trail, lessons, and rewards", async () => {
  const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const topicIcon = await readFile(new URL("../app/components/TopicIcon.tsx", import.meta.url), "utf8");
  const topicIconCatalog = await readFile(new URL("../lib/topic-icons.ts", import.meta.url), "utf8");
  const landmarks = await readFile(new URL("../lib/visual-landmarks.ts", import.meta.url), "utf8");
  const contentValidator = await readFile(new URL("../scripts/validate-curriculum.ts", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/components/LearningDashboard.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const boss = await readFile(new URL("../app/components/BossPlayer.tsx", import.meta.url), "utf8");
  const review = await readFile(new URL("../app/components/ReviewPlayer.tsx", import.meta.url), "utf8");
  const concept = await readFile(new URL("../app/components/ConceptVisual.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(home, /math-trail-hero\.png/);
  assert.match(home, /learning-loop-grid/);
  assert.match(home, /grade-card-visual/);
  for (const family of ["parts", "ratio", "chance", "data", "graph", "shape", "solid", "power", "algebra", "number", "steps"]) assert.match(topicIconCatalog, new RegExp(`kind: "${family}"`));
  assert.match(topicIcon, /data-visual=\{visual\}/);
  assert.match(topicIconCatalog, /topicIconSpecs/);
  assert.match(topicIconCatalog, /"scientific-ops"/);
  assert.match(topicIconCatalog, /"solution-types"/);
  assert.match(contentValidator, /Every lesson visual must have a specific topic icon/);
  assert.match(dashboard, /path-copy/);
  assert.match(dashboard, /<TopicIcon visual=\{item\.visual\}/);
  assert.match(lesson, /goal-concept/);
  assert.match(lesson, /unlock-path/);
  assert.match(lesson, /practiceEncouragement/);
  assert.match(lesson, /practice-charge/);
  assert.match(lesson, /FOCUS CHARGE/);
  assert.match(lesson, /mastery-next-goal/);
  assert.match(boss, /boss-unlock/);
  for (const visual of ["signed-numbers-context.png", "percent-market-context.jpg", "slope-trail-context.jpg", "pythagorean-city-context.jpg", "scatter-field-context.jpg", "distributive-workshop-context.jpg", "function-kiosk-context.jpg", "transform-plaza-context.jpg", "cylinder-tank-context.jpg", "equation-balance-context.jpg", "irrational-garden-context.jpg", "scientific-observatory-context.jpg", "multistep-workshop-context.jpg", "unit-rate-bike-context.jpg", "circle-fountain-context.jpg", "prism-packing-context.jpg", "probability-arcade-context.jpg", "systems-transit-context.jpg", "polynomial-tiles-context.jpg", "parabola-bridge-context.jpg", "exponential-greenhouse-context.jpg"]) {
    assert.match(concept, new RegExp(visual.replace(".", "\\.")));
    const asset = await readFile(new URL(`../public/visuals/${visual}`, import.meta.url));
    assert.ok(asset.byteLength > 10_000);
  }
  for (const model of ["number-line", "percent", "slope", "triangle", "scatter", "distribute", "function", "transform", "volume", "balance", "root-bracket", "scientific-scale", "equation-steps", "ratio", "circle", "prism", "probability-scale", "systems-crossing", "area-product", "parabola", "exponential"]) assert.match(concept, new RegExp(`model: "${model}"`));
  const contextSceneSource = concept.slice(concept.indexOf("const contextScenes"), concept.indexOf("function mathFor"));
  for (const representative of ["signed-numbers", "percent", "one-step-equations", "distributive-property", "approximating-irrationals", "scientific-notation", "multi-step-equations", "slope-rate", "function-representations", "coordinate-transformations", "pythagorean-theorem", "cylinder-volume", "scatter-plots", "g7-unit-rates", "g7-circle-measures", "g7-prism-volume", "g7-probability-scale", "g9-systems-by-graphing-g9", "g9-multiply-binomials", "g9-quadratic-graphs", "g9-exponential-growth"]) {
    assert.match(contextSceneSource, new RegExp(`[" ]${representative}[":]`));
  }
  assert.match(home, /mathWorldScenes/);
  assert.match(home, /math-world-grid/);
  assert.match(home, /13 \/ 13/);
  assert.match(dashboard, /CURRENT QUEST/);
  assert.match(dashboard, /visibleRegions\.map/);
  assert.match(dashboard, /aria-expanded=\{showFullMap\}/);
  assert.match(dashboard, /id=\{`region-\$\{region\.id\}`\}/);
  assert.match(dashboard, /world-landmark/);
  assert.match(dashboard, /getRegionLandmark/);
  assert.match(landmarks, /grade7RegionLandmarks/);
  assert.match(landmarks, /grade8RegionLandmarks/);
  assert.match(landmarks, /grade9RegionLandmarks/);
  assert.equal((landmarks.match(/^\s+\d+: \{ src:/gm) ?? []).length, 31);
  assert.match(css, /\.topic-icon-xl/);
  assert.match(css, /\.learning-loop-grid/);
  assert.match(css, /\.feedback-celebration/);
  assert.match(css, /\.quest-tracker/);
  assert.match(css, /\.percent-context-grid/);
  assert.match(css, /\.scatter-model/);
  assert.match(css, /\.distribute-context-model/);
  assert.match(css, /\.function-context-model/);
  assert.match(css, /\.transform-context-model/);
  assert.match(css, /\.volume-context-model/);
  assert.match(css, /\.balance-context-model/);
  assert.match(css, /\.root-bracket-context-model/);
  assert.match(css, /\.scientific-context-model/);
  assert.match(css, /\.equation-steps-context-model/);
  assert.match(css, /\.ratio-context-model/);
  assert.match(css, /\.circle-context-model/);
  assert.match(css, /\.prism-context-model/);
  assert.match(css, /\.probability-context-model/);
  assert.match(css, /\.systems-context-model/);
  assert.match(css, /\.area-product-context-model/);
  assert.match(css, /\.parabola-context-model/);
  assert.match(css, /\.exponential-context-model/);
  assert.match(css, /\.math-world-grid/);
  assert.match(css, /\.math-world-proof/);
  assert.match(css, /\.world-landmark/);
  assert.match(css, /\.practice-charge/);
  assert.match(css, /\.charge-cells/);
  assert.match(css, /\.mastery-next-goal/);
  assert.match(review, /review-finish-emblem/);
  assert.match(review, /Memory strengthened/);
  assert.match(review, /<TopicIcon visual=\{questionLesson\.visual\}/);
  assert.match(boss, /isFinalRegion/);
  assert.match(boss, /repair-progress/);
  assert.match(boss, /showHint && feedback !== "incorrect"/);
  assert.match(css, /\.review-memory-path/);
  assert.match(css, /\.repair-progress/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.quest-tracker/);
  assert.match(css, /@media \(max-width: 380px\)[\s\S]*\.hero-float-practice/);
});
