import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { nextMomentumRun } from "../lib/momentum.ts";
import { calculateLessonReward } from "../lib/rewards.ts";
import { achievementTotalsForState, achievementUnlockedBetween, evaluateAchievements, getNextAchievement } from "../lib/achievements.ts";

test("reports only achievement thresholds crossed by the latest saved result", () => {
  const empty = { lessons: 0, stars: 0, bosses: 0, streak: 0 };
  assert.equal(achievementUnlockedBetween(empty, { ...empty, lessons: 1 })?.id, "first-step");
  assert.equal(achievementUnlockedBetween({ ...empty, lessons: 1 }, { ...empty, lessons: 2 }), null);
  assert.equal(achievementUnlockedBetween({ ...empty, stars: 11 }, { ...empty, stars: 12 })?.id, "star-spark");
  assert.equal(achievementUnlockedBetween({ ...empty, lessons: 19, stars: 11 }, { ...empty, lessons: 20, stars: 12 })?.id, "trail-builder");
});

test("uses one achievement evaluation for the profile shelf and learning map", () => {
  const totals = { lessons: 3, stars: 7, bosses: 0, streak: 2 };
  const evaluated = evaluateAchievements(totals);
  assert.equal(evaluated.find((item) => item.id === "first-step")?.unlocked, true);
  assert.equal(evaluated.find((item) => item.id === "star-spark")?.progress, 58);
  assert.equal(getNextAchievement(totals)?.id, "star-spark");
  assert.equal(getNextAchievement({ lessons: 20, stars: 60, bosses: 8, streak: 7 }), null);
});

test("derives every private achievement surface from the same learner snapshot", () => {
  const totals = achievementTotalsForState({
    completedLessons: [{ stars: 3 }, { stars: 2 }, { stars: 1 }],
    clearedBosses: [1, 2],
    profile: { longestStreak: 7 },
  });
  assert.deepEqual(totals, { lessons: 3, stars: 6, bosses: 2, streak: 7 });
  assert.equal(evaluateAchievements(totals).find((item) => item.id === "steady-week")?.unlocked, true);
});

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

test("keeps avatar frames permanently unlocked and makes the token goal visible", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const bootstrap = await readFile(new URL("../db/bootstrap.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../drizzle/0004_faithful_stryfe.sql", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const profile = await readFile(new URL("../app/components/ProfileView.tsx", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/components/LearningDashboard.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(schema, /avatarFrames/);
  assert.match(schema, /primaryKey\(\{ columns: \[table\.learnerId, table\.frame\]/);
  assert.match(bootstrap, /INSERT OR IGNORE INTO avatar_frames/);
  assert.match(migration, /WHERE `frame` <> 'plain'/);
  assert.match(store, /SELECT 1 AS owned FROM avatar_frames/);
  assert.match(store, /NOT EXISTS \(SELECT 1 FROM avatar_frames/);
  assert.match(store, /return \{ unlocked: false, cost: 0 \}/);
  assert.match(profile, /unlocked forever and equipped/);
  assert.match(profile, /NEXT COLLECTION GOAL/);
  assert.match(profile, /Owned · Equip/);
  assert.match(profile, /No tokens spent/);
  assert.match(dashboard, /Use tokens for permanent frames/);
  assert.match(css, /\.locker-goal/);
  assert.match(css, /\.reward-locker-link/);
});

test("presents daily rewards as a fixed, forgiving seven-claim journey", async () => {
  const dashboard = await readFile(new URL("../app/components/LearningDashboard.tsx", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(store, /const rewardTokens = \[10, 12, 14, 16, 18, 20, 30\]/);
  assert.match(store, /INSERT OR IGNORE INTO daily_rewards/);
  assert.match(store, /if \(step === 7\) shields \+= 1/);
  assert.match(dashboard, /Every reward is fixed/);
  assert.match(dashboard, /Skip a day\? Nothing resets/);
  assert.match(dashboard, /no mystery boxes or paid boosts/);
  assert.match(dashboard, /rewardPending \? "Collecting…"/);
  assert.match(dashboard, /Today’s reward is collected/);
  assert.match(dashboard, /Streak Shields available/);
  assert.match(dashboard, /TODAY’S MISSION BOARD/);
  assert.match(dashboard, /Daily check-in is optional/);
  assert.match(dashboard, /learning progress never resets/);
  assert.match(dashboard, /className="daily-reward-details" open=\{!state\.dailyRewardClaimed\}/);
  assert.match(dashboard, /Current streak/);
  assert.match(dashboard, /Longest kept/);
  assert.match(dashboard, /MAIN · \{mainMissionType\.toUpperCase\(\)\}/);
  assert.match(css, /\.reward-balance/);
  assert.match(css, /\.reward-shield/);
  assert.match(css, /\.reward-calendar \.today/);
  assert.match(css, /\.today-mission-header/);
  assert.match(css, /\.today-mission-route/);
  assert.match(css, /\.daily-reward-details/);
  assert.match(css, /\.daily-rhythm/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.today-mission-header/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*\.daily-reward-details > \.reward-calendar \{ grid-template-columns: repeat\(4/);
});

test("keeps signed-in navigation and a private self marker on the weekly league", async () => {
  const page = await readFile(new URL("../app/leaderboard/page.tsx", import.meta.url), "utf8");
  const header = await readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8");
  const view = await readFile(new URL("../app/components/LeaderboardView.tsx", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /LeaderboardView demo=\{params\.demo === "1"\}/);
  assert.match(header, /leaderboard\?demo=1/);
  assert.match(view, /state \? <LearnerHeader/);
  assert.match(view, /YOUR PRIVATE POINTER/);
  assert.match(view, /Other learners see only your random identity/);
  assert.match(view, /entry\.weeklyXp > 0/);
  assert.match(store, /isViewer: entry\.learner_id === learnerId/);
  assert.match(css, /\.current-rank-card/);
  assert.match(css, /li\.current-learner/);
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
  const answerRoute = await readFile(new URL("../app/api/answer/route.ts", import.meta.url), "utf8");
  const stateRoute = await readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8");
  const bossRoute = await readFile(new URL("../app/api/boss/route.ts", import.meta.url), "utf8");
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  assert.match(store, /assertLessonUnlocked/);
  assert.match(store, /assertBossUnlocked/);
  assert.match(store, /UPDATE boss_attempts SET hearts/);
  assert.match(store, /checkBossRepairAnswer/);
  assert.match(store, /const xpEarned = cleared \? await completeBoss/);
  assert.match(store, /return \(await awardXp\(learnerId, "boss", String\(regionId\), 100\)\) \? 100 : 0/);
  assert.match(schema, /bossAttempts/);
  assert.match(schema, /lessonRuns/);
  assert.match(store, /activateLessonRun/);
  assert.match(store, /activeRun\.run_id !== runId/);
  assert.match(answerRoute, /runId/);
  assert.match(stateRoute, /completeLesson\(learner\.id, body\.lessonId, body\.runId\)/);
  assert.match(bossRoute, /claimMutation/);
  assert.doesNotMatch(stateRoute, /action: "completeBoss"/);
});

test("shows exact lesson rewards while keeping replay XP fair", async () => {
  const cases = [
    { previous: 0, run: 1, total: 40, base: 40, star: 0, best: 1 },
    { previous: 0, run: 2, total: 45, base: 40, star: 5, best: 2 },
    { previous: 0, run: 3, total: 50, base: 40, star: 10, best: 3 },
    { previous: 1, run: 3, total: 10, base: 0, star: 10, best: 3 },
    { previous: 2, run: 3, total: 5, base: 0, star: 5, best: 3 },
    { previous: 3, run: 1, total: 0, base: 0, star: 0, best: 3 },
  ];
  for (const item of cases) {
    const reward = calculateLessonReward(item.previous, item.run);
    assert.equal(reward.totalXp, item.total);
    assert.equal(reward.baseXp, item.base);
    assert.equal(reward.starXp, item.star);
    assert.equal(reward.bestStars, item.best);
  }

  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const demoState = await readFile(new URL("../lib/learner-state.ts", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(store, /lesson-star-2/);
  assert.match(store, /lesson-star-3/);
  assert.match(store, /xpEarned: baseXp \+ starXp/);
  assert.match(demoState, /calculateLessonReward/);
  assert.match(lesson, /REWARD RECEIPT/);
  assert.match(lesson, /Fair replay · skill refreshed/);
  assert.match(lesson, /Repeat XP stays at 0/);
  assert.match(lesson, /saved best/);
  assert.match(css, /\.reward-receipt-path/);
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
  const momentum = await readFile(new URL("../app/components/MomentumRun.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const review = await readFile(new URL("../app/components/ReviewPlayer.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const pattern of ["orbit", "confetti", "ripple", "spark", "lift"]) assert.match(component, new RegExp(`"${pattern}"`));
  assert.match(css, /\.success-confetti/);
  assert.match(css, /\.success-ripple/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /animation:\s*none !important/);
  assert.match(momentum, /Bonus signal only—corrections still advance/);
  assert.match(momentum, /BEST ×\{best\}/);
  assert.match(lesson, /FOCUS CHAIN/);
  assert.match(lesson, /setFocusStreak\(0\)/);
  assert.match(lesson, /nextMomentumRun/);
  assert.match(lesson, /focusStreak === 3/);
  assert.match(review, /RECALL CHAIN/);
  assert.match(review, /nextMomentumRun/);
  assert.match(review, /recallStreak === 3/);
  assert.match(css, /\.momentum-run/);
  assert.match(css, /@keyframes chain-link/);
});

test("keeps answer chains optional while preserving the best run", () => {
  let run = nextMomentumRun({ current: 0, best: 0 }, true);
  assert.deepEqual(run, { current: 1, best: 1 });
  run = nextMomentumRun(run, true);
  run = nextMomentumRun(run, true);
  assert.deepEqual(run, { current: 3, best: 3 });
  run = nextMomentumRun(run, false);
  assert.deepEqual(run, { current: 0, best: 3 });
  run = nextMomentumRun(run, true);
  assert.deepEqual(run, { current: 1, best: 3 });
  run = nextMomentumRun(run, false);
  assert.deepEqual(run, { current: 0, best: 3 });
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
  const profile = await readFile(new URL("../app/components/ProfileView.tsx", import.meta.url), "utf8");
  const landmarkUnlock = await readFile(new URL("../app/components/PrivateLandmarkUnlock.tsx", import.meta.url), "utf8");
  const achievementsSource = await readFile(new URL("../lib/achievements.ts", import.meta.url), "utf8");
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
  assert.match(lesson, /settlement-summary/);
  assert.match(lesson, /practiceEncouragement/);
  assert.match(lesson, /practice-charge/);
  assert.match(lesson, /FOCUS CHARGE/);
  assert.match(lesson, /mastery-next-goal/);
  assert.match(boss, /boss-victory-map/);
  for (const visual of ["signed-numbers-context.png", "operations-sequence-context.jpg", "decimal-pattern-context.jpg", "percent-market-context.jpg", "fraction-workshop-context.jpg", "substitution-machine-context.jpg", "exponent-lab-context.jpg", "like-terms-sorting-context.jpg", "slope-trail-context.jpg", "pythagorean-city-context.jpg", "scatter-field-context.jpg", "distributive-workshop-context.jpg", "function-kiosk-context.jpg", "transform-plaza-context.jpg", "cylinder-tank-context.jpg", "equation-balance-context.jpg", "irrational-garden-context.jpg", "scientific-observatory-context.jpg", "multistep-workshop-context.jpg", "unit-rate-bike-context.jpg", "circle-fountain-context.jpg", "prism-packing-context.jpg", "probability-arcade-context.jpg", "systems-transit-context.jpg", "solution-cases-gallery-context.jpg", "inequality-trail-context.jpg", "polynomial-tiles-context.jpg", "parabola-bridge-context.jpg", "exponential-greenhouse-context.jpg", "scale-drawing-studio-context.jpg", "random-sample-context.jpg", "arithmetic-sequence-context.jpg", "quadratic-roots-context.jpg", "surface-area-packaging-context.jpg", "compound-events-lab-context.jpg", "two-way-survey-context.jpg", "exponential-decay-energy-context.jpg", "discount-studio-context.jpg", "angle-plaza-context.jpg", "cone-measure-context.jpg", "geometric-sequence-lab-context.jpg", "absolute-transit-context.jpg", "triangle-builder-context.jpg", "cross-section-studio-context.jpg", "coordinate-route-context.jpg", "sphere-tank-context.jpg", "difference-squares-workshop-context.jpg", "distribution-comparison-context.jpg", "real-number-sort-context.jpg", "elimination-workshop-context.jpg", "rational-exponent-lab-context.jpg", "growth-comparison-context.jpg", "simple-interest-growth-context.jpg", "graphing-line-city-context.jpg", "function-routing-context.jpg", "dilation-studio-context.jpg", "residual-observatory-context.jpg"]) {
    assert.match(concept, new RegExp(visual.replace(".", "\\.")));
    const asset = await readFile(new URL(`../public/visuals/${visual}`, import.meta.url));
    assert.ok(asset.byteLength > 10_000);
  }
  for (const visual of ["operations-sequence-context.jpg", "decimal-pattern-context.jpg", "fraction-workshop-context.jpg", "substitution-machine-context.jpg", "exponent-lab-context.jpg", "like-terms-sorting-context.jpg", "triangle-builder-context.jpg", "cross-section-studio-context.jpg", "coordinate-route-context.jpg", "sphere-tank-context.jpg", "difference-squares-workshop-context.jpg", "distribution-comparison-context.jpg", "real-number-sort-context.jpg", "elimination-workshop-context.jpg", "rational-exponent-lab-context.jpg", "growth-comparison-context.jpg", "simple-interest-growth-context.jpg", "graphing-line-city-context.jpg", "function-routing-context.jpg", "dilation-studio-context.jpg", "residual-observatory-context.jpg", "solution-cases-gallery-context.jpg", "inequality-trail-context.jpg"]) {
    const asset = await readFile(new URL(`../public/visuals/${visual}`, import.meta.url));
    assert.ok(asset.byteLength < 550_000, `${visual} should remain mobile-friendly`);
  }
  for (const model of ["number-line", "symbol-meaning", "sign-pairs", "operation-order", "place-value", "repeating-decimal", "negative-distribute", "percent", "fraction-equivalence", "fraction-addition", "substitution", "power-steps", "term-structure", "slope", "triangle", "triangle-build", "angles", "scatter", "distribute", "function", "transform", "volume", "cone-volume", "sphere-volume", "cross-section", "coordinate-location", "coordinate-distance", "difference-squares", "balance", "root-bracket", "scientific-scale", "equation-steps", "ratio", "circle", "prism", "probability-scale", "systems-crossing", "solution-cases", "inequality-range", "area-product", "parabola", "exponential", "scale-drawing", "random-sample", "arithmetic-sequence", "quadratic-roots", "surface-area-net", "compound-event", "two-way-table", "exponential-decay", "number-kinds", "system-elimination", "distribution-compare", "rational-exponent", "growth-compare", "simple-interest", "graph-line", "dilation", "residuals"]) assert.match(concept, new RegExp(`model: "${model}"`));
  const contextSceneSource = concept.slice(concept.indexOf("const contextScenes"), concept.indexOf("function mathFor"));
  assert.equal((contextSceneSource.match(/^\s{2}(?:"[^"]+"|[\w-]+): \{/gm) ?? []).length, 98);
  const expandedSceneCount = Number(home.match(/const expandedSceneCount = (\d+);/)?.[1]);
  assert.equal(expandedSceneCount, 98);
  for (const representative of ["math-symbols", "signed-numbers", "sign-rules", "order-of-operations", "decimals", "negative-distribution", "repeating-decimals", "percent", "fractions", "adding-fractions", "substitution", "g9-evaluate-formulas", "algebra-language", "combining-like-terms", "g7-equivalent-expressions", "g9-algebraic-structure", "g9-polynomial-vocabulary", "g9-add-subtract-polynomials", "one-step-equations", "distributive-property", "approximating-irrationals", "scientific-notation", "multi-step-equations", "slope-rate", "function-representations", "coordinate-transformations", "pythagorean-theorem", "cylinder-volume", "cone-volume", "sphere-volume", "coordinate-distance", "scatter-plots", "two-way-tables", "rational-irrational", "systems-algebra", "graphing-lines", "function-rules", "dilations-similarity", "g7-unit-rates", "g7-circle-measures", "g7-prism-volume", "g7-probability-scale", "g7-scale-drawings", "g7-random-samples", "g7-surface-area", "g7-compound-events", "g7-discount-markup", "g7-angle-equations", "g7-constructing-triangles", "g7-cross-sections", "g7-compare-distributions", "g7-simple-interest", "g9-systems-by-graphing-g9", "g9-multiply-binomials", "g9-quadratic-graphs", "g9-exponential-growth", "g9-exponential-decay", "g9-arithmetic-sequences", "g9-geometric-sequences", "g9-absolute-value-equations", "g9-difference-squares", "g9-quadratic-formula", "g9-rational-exponents", "g9-linear-vs-exponential", "g9-correlation-residuals"]) {
    assert.match(contextSceneSource, new RegExp(`[" ]${representative}[":]`));
  }
  for (const exactModel of [
    'mathSteps: ["2+3\\\\times4^2", "4^2=16", "3\\\\times16=48", "2+48=50"]',
    'mathSteps: ["0.35", "3\\\\text{ tenths}+5\\\\text{ hundredths}", "\\\\frac{35}{100}=\\\\frac7{20}"]',
    'mathSteps: ["0.\\\\overline{3}", "0.333\\\\ldots", "\\\\frac13"]',
    'mathSteps: ["-3(x^2+y^3)", "-3\\\\cdot x^2=-3x^2", "-3\\\\cdot y^3=-3y^3", "-3x^2-3y^3"]',
    'mathSteps: ["3x+5", "3", "x", "5"]',
    'mathSteps: ["3x+2+5x-1", "(3+5)x+(2-1)", "8x+1"]',
    'mathSteps: ["3x+6", "3(x+2)"',
    'mathSteps: ["3(x+2)^2", "3", "(x+2)", "2"]',
    'mathSteps: ["4x^3-2x+1"',
    'mathSteps: ["(3x^2+x)-(x^2-4x)", "3x^2+x-x^2+4x", "(3-1)x^2+(1+4)x", "2x^2+5x"]',
  ]) assert.ok(contextSceneSource.includes(exactModel), `missing exact algebra model: ${exactModel}`);
  for (const reusedSceneLesson of ["two-step-equations", "systems-graphing", "comparing-functions", "linear-nonlinear", "rigid-transformations", "congruence", "angle-relationships", "triangle-angles", "lines-of-fit", "probability", "g7-inequalities-g7", "g7-multi-step-equations-g7", "g7-percent-change", "g7-tax-tip-commission", "g7-center-spread", "g7-informal-inference", "g9-linear-inequalities-g9", "g9-multi-step-linear-equations", "g9-equation-solution-cases", "g9-slope-from-points", "g9-graph-linear-functions", "g9-factor-trinomials", "g9-properties-real-numbers", "g9-one-variable-data"]) {
    assert.match(contextSceneSource, new RegExp(`[" ]${reusedSceneLesson}[":]`));
  }
  for (const expandedLesson of ["powers", "exponent-rules", "exponents-parentheses", "zero-negative-exponents", "scientific-operations", "coordinate-plane", "g9-integer-exponents-g9", "g9-multiply-monomials"]) {
    assert.match(contextSceneSource, new RegExp('[" ]' + expandedLesson + '[":]'));
  }
  assert.match(home, /mathWorldScenes/);
  assert.match(home, /math-world-grid/);
  assert.match(home, /math-world-mobile-cue/);
  assert.match(home, /loading="lazy"/);
  assert.match(home, /full scenes/);
  assert.match(home, /curriculumStats\.lessons/);
  assert.match(home, /Every lesson has a distinct visual topic marker/);
  assert.match(home, /GRADE \{scene\.grade\}/);
  assert.match(home, /surface-area-packaging-context\.jpg/);
  assert.match(home, /compound-events-lab-context\.jpg/);
  assert.match(home, /two-way-survey-context\.jpg/);
  assert.match(home, /exponential-decay-energy-context\.jpg/);
  assert.match(home, /simple-interest-growth-context\.jpg/);
  assert.match(home, /graphing-line-city-context\.jpg/);
  assert.match(home, /function-routing-context\.jpg/);
  assert.match(home, /dilation-studio-context\.jpg/);
  assert.match(home, /residual-observatory-context\.jpg/);
  assert.match(home, /solution-cases-gallery-context\.jpg/);
  assert.match(home, /inequality-trail-context\.jpg/);
  assert.match(home, /fraction-workshop-context\.jpg/);
  assert.match(home, /substitution-machine-context\.jpg/);
  assert.match(home, /exponent-lab-context\.jpg/);
  assert.match(home, /like-terms-sorting-context\.jpg/);
  assert.match(home, /operations-sequence-context\.jpg/);
  assert.match(home, /decimal-pattern-context\.jpg/);
  assert.match(home, /distribution-comparison-context\.jpg/);
  assert.match(home, /Put the value in its place/);
  assert.match(home, /Four factors, one power/);
  assert.match(home, /Only matching terms combine/);
  assert.match(home, /Read the instruction first/);
  assert.match(home, /Zoom in, then follow the loop/);
  assert.match(home, /Center and spread tell the story/);
  assert.match(home, /x first, then y/);
  assert.match(home, /Different pieces, same amount/);
  assert.match(home, /A boundary and every value beyond it/);
  assert.match(home, /Three ways two lines can relate/);
  assert.match(concept, /solution-cases-context-model/);
  assert.match(concept, /inequality-range-context-model/);
  assert.match(concept, /fraction-equivalence-context-model/);
  assert.match(concept, /fraction-addition-context-model/);
  assert.match(concept, /substitution-context-model/);
  assert.match(concept, /power-context-model/);
  assert.match(concept, /term-structure-context-model/);
  assert.match(concept, /symbol-meaning-context-model/);
  assert.match(concept, /sign-pairs-context-model/);
  assert.match(concept, /operation-order-context-model/);
  assert.match(concept, /place-value-context-model/);
  assert.match(concept, /repeating-decimal-context-model/);
  assert.match(concept, /negative-distribute-context-model/);
  assert.match(concept, /coordinate-location-context-model/);
  assert.match(css, /\.solution-cases-context-model/);
  assert.match(css, /\.inequality-range-context-model/);
  assert.match(css, /\.fraction-equivalence-context-model/);
  assert.match(css, /\.fraction-addition-context-model/);
  assert.match(css, /\.substitution-context-model/);
  assert.match(css, /\.power-context-model/);
  assert.match(css, /\.term-structure-context-model/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.term-structure-context-model > div \{ grid-template-columns: 1fr/);
  assert.match(css, /\.symbol-meaning-context-model/);
  assert.match(css, /\.sign-pairs-context-model/);
  assert.match(css, /\.operation-order-context-model/);
  assert.match(css, /\.place-value-context-model/);
  assert.match(css, /\.repeating-decimal-context-model/);
  assert.match(css, /\.negative-distribute-context-model/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.symbol-meaning-context-model > div,[\s\S]*\.repeating-decimal-context-model \{ grid-template-columns: 1fr/);
  assert.match(css, /\.coordinate-location-context-model/);
  assert.match(home, /game-loop-board/);
  assert.match(home, /Four lesson keys, then the boss/);
  assert.match(home, /RECOVERY COUNTS/);
  assert.match(dashboard, /CURRENT QUEST/);
  assert.match(dashboard, /getNextAchievement/);
  assert.match(dashboard, /NEXT PRIVATE LANDMARK/);
  assert.match(dashboard, /quest-landmark-meter/);
  assert.match(dashboard, /welcomeReady/);
  assert.match(dashboard, /math-welcome-guide/);
  assert.match(dashboard, /Your private trail starts with one small step/);
  assert.match(dashboard, /Your Google name, email, and photo are not saved/);
  assert.match(dashboard, /Collect 4 keys/);
  assert.match(dashboard, /Stars are feedback/);
  assert.match(dashboard, /Start one small step/);
  assert.match(dashboard, /<Avatar avatar=\{state\.profile\.avatar\}/);
  assert.match(dashboard, /reviewBatchSize/);
  assert.match(dashboard, /TODAY’S BEST STEP · REVIEW READY/);
  assert.match(dashboard, /Start Daily Review/);
  assert.match(dashboard, /gradeComplete \? <section className="next-card trail-complete-card"/);
  assert.match(dashboard, /activeBossReady \? <section className="next-card boss-priority-card"/);
  assert.match(dashboard, /TODAY’S BEST STEP · BOSS READY/);
  assert.match(dashboard, /Nothing due today/);
  assert.match(dashboard, /featuredLesson/);
  assert.match(dashboard, /rewardCellClass/);
  assert.match(dashboard, /Claim \$\{nextRewardStep\} of 7/);
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
  assert.match(css, /\.quest-landmark/);
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
  assert.match(css, /\.scale-drawing-context-model/);
  assert.match(css, /\.random-sample-context-model/);
  assert.match(css, /\.arithmetic-sequence-context-model/);
  assert.match(css, /\.quadratic-roots-context-model/);
  assert.match(css, /\.surface-area-context-model/);
  assert.match(css, /\.compound-event-context-model/);
  assert.match(css, /\.two-way-context-model/);
  assert.match(css, /\.exponential-decay-context-model/);
  assert.match(css, /\.angles-context-model/);
  assert.match(css, /\.cone-volume-context-model/);
  assert.match(css, /\.triangle-build-context-model/);
  assert.match(css, /\.cross-section-context-model/);
  assert.match(css, /\.coordinate-distance-context-model/);
  assert.match(css, /\.sphere-volume-context-model/);
  assert.match(css, /\.difference-squares-context-model/);
  assert.match(css, /\.number-kinds-context-model/);
  assert.match(css, /\.system-elimination-context-model/);
  assert.match(css, /\.distribution-compare-context-model/);
  assert.match(css, /\.rational-exponent-context-model/);
  assert.match(css, /\.growth-compare-context-model/);
  assert.match(css, /\.simple-interest-context-model/);
  assert.match(css, /\.graph-line-context-model/);
  assert.match(css, /\.dilation-context-model/);
  assert.match(css, /\.residuals-context-model/);
  assert.match(css, /\.math-world-grid/);
  assert.match(css, /\.math-world-proof/);
  assert.match(css, /scroll-snap-type: x mandatory/);
  assert.match(css, /scroll-snap-align: start/);
  assert.match(css, /overflow-x: auto/);
  assert.match(css, /\.world-landmark/);
  assert.match(css, /\.welcome-trail-guide/);
  assert.match(css, /\.welcome-route-step/);
  assert.match(css, /\.welcome-guide-promises/);
  assert.match(css, /\.review-priority-card/);
  assert.match(css, /\.review-priority-orbit/);
  assert.match(css, /\.boss-priority-card/);
  assert.match(css, /\.trail-complete-card/);
  assert.match(css, /\.practice-charge/);
  assert.match(css, /\.charge-cells/);
  assert.match(lesson, /practice-star-path/);
  assert.match(lesson, /Stars describe this run—they never block progress/);
  assert.match(lesson, /quest-key-card/);
  assert.match(lesson, /First-try spark!/);
  assert.match(lesson, /Recovery complete!/);
  assert.match(lesson, /No progress lost/);
  assert.match(lesson, /recovery-charge-preview/);
  assert.match(lesson, /This is enough for today/);
  assert.match(lesson, /Continue to the next lesson/);
  assert.match(lesson, /Stars and XP details/);
  assert.match(lesson, /Everything is saved/);
  assert.match(lesson, /achievementUnlockedBetween/);
  assert.match(landmarkUnlock, /settlement-landmark/);
  assert.match(lesson, /<PrivateLandmarkUnlock/);
  assert.match(boss, /achievementTotalsForState/);
  assert.match(boss, /landmark\?\.source === "bosses"/);
  assert.match(boss, /<PrivateLandmarkUnlock/);
  assert.match(dashboard, /achievementTotalsForState/);
  assert.match(dashboard, /landmark\?\.source === "streak"/);
  assert.match(dashboard, /<PrivateLandmarkUnlock achievement=\{rewardLandmark\}/);
  assert.match(landmarkUnlock, /PRIVATE LANDMARK UNLOCKED/);
  assert.match(landmarkUnlock, /View shelf/);
  assert.match(landmarkUnlock, /#achievement-heading/);
  assert.doesNotMatch(lesson, /className="reward-strip"/);
  assert.doesNotMatch(lesson, /className="unlock-path"/);
  assert.match(css, /\.game-loop-board/);
  assert.match(css, /\.game-quest-path/);
  assert.match(css, /\.practice-star-path/);
  assert.match(css, /\.quest-key-card/);
  assert.match(css, /\.recovery-feedback/);
  assert.match(css, /\.recovery-charge-preview/);
  assert.match(css, /\.mastery-next-goal/);
  assert.match(css, /\.settlement-summary/);
  assert.match(css, /\.settlement-next/);
  assert.match(css, /\.settlement-details/);
  assert.match(css, /\.settlement-save-note/);
  assert.match(css, /\.settlement-landmark/);
  assert.match(review, /review-finish-emblem/);
  assert.match(review, /Memory strengthened/);
  assert.match(review, /<TopicIcon visual=\{questionLesson\.visual\}/);
  assert.match(review, /review-memory-meter/);
  assert.match(review, /MEMORY PULSE/);
  assert.match(review, /Quick recall!/);
  assert.match(review, /Memory recovered!/);
  assert.match(review, /MEMORY QUEUE · CLEAR/);
  assert.match(review, /SESSION WIN SAVED/);
  assert.match(review, /You can stop here/);
  assert.match(review, /suggestedLesson/);
  assert.match(boss, /isFinalRegion/);
  assert.match(boss, /repair-progress/);
  assert.match(boss, /repairRestored/);
  assert.match(boss, /First repair locked in/);
  assert.match(boss, /All three hearts restored/);
  assert.match(boss, /Retry boss with full hearts/);
  assert.match(boss, /boss-\$\{region\.id\}-hearts-restored/);
  assert.match(boss, /showHint && feedback !== "incorrect"/);
  assert.match(boss, /boss-connection-map/);
  assert.match(boss, /CONNECTION MAP/);
  assert.match(boss, /A correction keeps the map moving/);
  assert.match(boss, /bossXpEarned/);
  assert.match(boss, /Fair replay · no farmable XP/);
  assert.match(boss, /REGION CONNECTION/);
  assert.match(boss, /Every skill remains open to revisit/);
  assert.match(boss, /NEXT REGION UNLOCKED/);
  assert.match(boss, /WHOLE TRAIL COMPLETE/);
  assert.match(boss, /Everything is saved/);
  assert.match(boss, /This is enough for today/);
  assert.match(boss, /region\.lessons\.map\(\(lesson\) => <div className="boss-victory-skill"/);
  assert.doesNotMatch(boss, /className="reward-strip"/);
  assert.doesNotMatch(boss, /className="unlock-path boss-unlock"/);
  assert.match(css, /\.review-memory-path/);
  assert.match(css, /\.review-memory-meter/);
  assert.match(css, /\.review-memory-nodes/);
  assert.match(css, /\.review-clear-state/);
  assert.match(css, /\.session-save-card/);
  assert.match(css, /\.review-finish-actions/);
  assert.match(css, /\.repair-progress/);
  assert.match(css, /\.repair-checkpoint/);
  assert.match(css, /\.repair-restored-card/);
  assert.match(css, /\.repair-restored-path/);
  assert.match(css, /\.boss-connection-map/);
  assert.match(css, /\.boss-connection-nodes/);
  assert.match(css, /\.boss-victory-map/);
  assert.match(css, /\.boss-victory-route/);
  assert.match(css, /\.boss-settlement-summary/);
  assert.match(css, /\.boss-next-region/);
  assert.match(css, /\.boss-victory-actions/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.boss-settlement-summary \{ grid-template-columns: 1fr/);
  assert.match(profile, /evaluateAchievements/);
  assert.match(achievementsSource, /achievementSpecs/);
  assert.match(profile, /PRIVATE ACHIEVEMENT SHELF/);
  for (const achievement of ["First Step", "Twelve Sparks", "Boss Link", "Steady Week", "Trail Builder", "Boss Pathfinder"]) assert.match(achievementsSource, new RegExp(achievement));
  assert.match(profile, /Only you see this shelf/);
  assert.match(profile, /Achievements are not added to the leaderboard/);
  assert.match(css, /\.achievement-section/);
  assert.match(css, /\.achievement-grid/);
  assert.match(css, /\.achievement-badge/);
  assert.match(css, /@media \(max-width: 380px\)[\s\S]*\.achievement-grid/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.quest-tracker/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.welcome-route/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*\.game-quest-path/);
  assert.match(css, /@media \(max-width: 380px\)[\s\S]*\.hero-float-practice/);
});
