import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { calculateLessonReward } from "../lib/rewards.ts";
import { achievementTotalsForState, achievementUnlockedBetween, evaluateAchievements, getNextAchievement } from "../lib/achievements.ts";
import { mathInputMode } from "../lib/math-input.ts";
import { getQuestMilestone } from "../lib/quest-milestone.ts";
import { clippedLinePoints, nearestVisibleLinePoint, parseLinearFunction, valueAt } from "../lib/linear-function.ts";
import { coordinateMissionProgress, coordinateReadTargets, isOnRoverLine, pointToLineTargets, sameCoordinate } from "../lib/coordinate-mission.ts";
import { publicTextPrivacyIssue } from "../lib/privacy.ts";
import { recoveryGuidance, remixedChoices } from "../lib/practice-recovery.ts";
import { isAnswerCorrect, lessons } from "../lib/curriculum.ts";
import { algebraCourseCoverage, extendedProgramCoverage, grade7To12CoreCoverage } from "../lib/curriculum-coverage.ts";
import { ANSWER_BADGE_COUNT, ANSWER_BADGE_STEP, BADGE_CATALOG_SIZE, BADGE_CATALOG_VERSION, answerBadgeForCorrectCount, answerBadges, badgeCatalog, lessonBadges, nextAnswerBadge } from "../lib/badges.ts";
import { completeDemoLesson, creditDemoCorrectAnswer, getDemoState } from "../lib/learner-state.ts";
import { getComboSpec } from "../lib/combo.ts";
import { isThemeId, themeCatalog } from "../lib/themes.ts";
import { frontierWorlds } from "../lib/frontier-worlds.ts";
import { getLessonExperience } from "../lib/lesson-experience.ts";
import { isResponseComplete, MULTI_SELECT_SEPARATOR } from "../lib/question-interactions.ts";
import { chooseLearnerMode } from "../lib/learner-mode.ts";
import { getXpGain, getXpProgress, XP_PER_LEVEL } from "../lib/xp-progression.ts";
import sharp from "sharp";

test("keeps the right math symbols available on mobile answer keyboards", () => {
  assert.equal(mathInputMode("12"), "decimal");
  assert.equal(mathInputMode("0.65"), "decimal");
  assert.equal(mathInputMode("42%|42"), "decimal");
  assert.equal(mathInputMode("-5"), "text");
  assert.equal(mathInputMode("3/4"), "text");
  assert.equal(mathInputMode("(2, 5)"), "text");
  assert.equal(mathInputMode("x = 7|7"), "decimal");
  assert.equal(mathInputMode(), "text");
});

test("accepts the exact exponent symbols shown in answer choices", () => {
  assert.equal(isAnswerCorrect("7.4 × 10³", "7.4*10^3"), true);
  assert.equal(isAnswerCorrect("x²", "x^2"), true);
});

test("keeps written-unit answer choices semantically parallel", () => {
  const question = lessons.find((lesson) => lesson.slug === "g7-unit-rates")?.practice.find((item) => item.prompt === "Which is the unit rate for 24 pages in 6 minutes?");
  assert.deepEqual(question?.choices, ["3 pages per minute", "4 pages per minute", "6 pages per minute", "18 pages per minute"]);
  assert.ok(question?.choices?.every((choice) => choice.endsWith("pages per minute")));
});

test("parses safe slope-intercept equations and clips them to the visible graph", () => {
  assert.deepEqual(parseLinearFunction("y=2x"), { slope: 2, intercept: 0, equation: "y = 2x" });
  assert.deepEqual(parseLinearFunction(" y = -x + 3 "), { slope: -1, intercept: 3, equation: "y = −x + 3" });
  assert.deepEqual(parseLinearFunction("y=1/2x-2"), { slope: 0.5, intercept: -2, equation: "y = 0.5x − 2" });
  assert.deepEqual(parseLinearFunction("y=4"), { slope: 0, intercept: 4, equation: "y = 4" });
  assert.equal(parseLinearFunction("x=2"), null);
  assert.equal(parseLinearFunction("y=x^2"), null);
  assert.equal(parseLinearFunction("y=100x"), null);
  const line = parseLinearFunction("y=2x");
  assert.ok(line);
  assert.equal(valueAt(line, 3), 6);
  assert.deepEqual(clippedLinePoints(line), [{ x: -2.5, y: -5 }, { x: 2.5, y: 5 }]);
  assert.deepEqual(nearestVisibleLinePoint(line, { x: 1.16, y: 2.45 }), { x: 1.2, y: 2.4 });
  assert.deepEqual(nearestVisibleLinePoint(line, { x: 4, y: 8 }), { x: 2.5, y: 5 });
});

test("builds a valid y = 2x + 1 rover mission and reverses it into coordinate reading", () => {
  assert.deepEqual(pointToLineTargets, [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 7 }, { x: 4, y: 9 }]);
  assert.ok(pointToLineTargets.every(isOnRoverLine));
  assert.ok(coordinateReadTargets.every((point) => pointToLineTargets.some((candidate) => sameCoordinate(point, candidate))));
  assert.equal(coordinateMissionProgress(0, false, 0), 0);
  assert.equal(coordinateMissionProgress(5, true, 3), 100);
});

test("turns common wrong answers into specific recovery guidance and a delayed remix", () => {
  const coordinate = { id: "coordinate", prompt: "Name the point.", answer: "(2, 5)", hint: "Read x before y." };
  assert.equal(recoveryGuidance(coordinate, "(5, 2)", 1).label, "CHECK ORDER");

  const signed = { id: "signed", prompt: "Find the change.", answer: "-7", hint: "Check the direction." };
  assert.equal(recoveryGuidance(signed, "7", 1).label, "CHECK THE SIGN");

  const percent = { id: "percent", prompt: "Write the percent.", answer: "50%|50", hint: "Move between decimal and percent." };
  assert.equal(recoveryGuidance(percent, "0.5", 1).label, "CHECK THE SCALE");

  const unitRate = lessons.find((lesson) => lesson.slug === "g7-unit-rates")?.practice[0];
  assert.ok(unitRate);
  assert.equal(recoveryGuidance(unitRate, "50", 1).clue, unitRate.hint);
  assert.notEqual(recoveryGuidance(unitRate, "50", 1).clue, "Use the key idea, then retry.");
  assert.equal(recoveryGuidance(signed, "4", 3).modelAnswer, "-7");
  assert.deepEqual(remixedChoices(["A", "B", "C"], true), ["B", "C", "A"]);
  assert.deepEqual(remixedChoices(["A", "B", "C"], false), ["A", "B", "C"]);
});

test("models answer interactions before rendering all 1,323 questions", () => {
  const questions = lessons.flatMap((lesson) => lesson.practice);
  const yesNo = questions.filter((question) => question.interaction === "yes-no");
  const trueFalse = questions.filter((question) => question.interaction === "true-false");
  const ordering = questions.filter((question) => question.interaction === "ordering");
  const multiSelect = questions.filter((question) => question.interaction === "multi-select");
  const coordinateGrid = questions.filter((question) => question.interaction === "coordinate-grid");
  const numberLine = questions.filter((question) => question.interaction === "number-line");
  const graphChoice = questions.filter((question) => question.interaction === "graph-choice");
  const tableChoice = questions.filter((question) => question.interaction === "table-choice");
  const factorQuestions = questions.filter((question) => /^Factor(?: completely)?\b/i.test(question.prompt));
  const proportionalDecision = lessons.find((lesson) => lesson.slug === "g7-proportional-tables")?.practice[1];

  assert.equal(questions.length, 1323);
  assert.equal(yesNo.length, 110);
  assert.equal(trueFalse.length, 1);
  assert.equal(ordering.length, 16);
  assert.equal(multiSelect.length, 18);
  assert.equal(coordinateGrid.length, 14);
  assert.equal(numberLine.length, 8);
  assert.equal(graphChoice.length, 11);
  assert.equal(tableChoice.length, 7);
  assert.ok(yesNo.every((question) => question.choices?.join("|") === "Yes|No"));
  assert.ok(trueFalse.every((question) => question.choices?.join("|") === "True|False"));
  assert.equal(proportionalDecision?.interaction, "yes-no");
  assert.deepEqual(proportionalDecision?.choices, ["Yes", "No"]);
  assert.equal(factorQuestions.length, 18);
  assert.ok(factorQuestions.every((question) => question.interaction === "four-choice" && question.choices?.length === 4));
  assert.ok(ordering.every((question) => question.choices?.length === 5 && question.answer.split(" → ").length === 5));
  assert.ok(multiSelect.every((question) => question.interactionConfig?.kind === "multi-select" && question.answer.split(MULTI_SELECT_SEPARATOR).length === question.interactionConfig.requiredSelections));
  assert.ok(coordinateGrid.every((question) => question.interactionConfig?.kind === "coordinate-grid" && isResponseComplete(question, question.answer)));
  assert.ok(numberLine.every((question) => question.interactionConfig?.kind === "number-line" && isResponseComplete(question, question.answer)));
  assert.ok(graphChoice.every((question) => question.interactionConfig?.kind === "graph-choice" && question.interactionConfig.plots.length === question.choices?.length));
  assert.ok(tableChoice.every((question) => question.interactionConfig?.kind === "table-choice" && question.interactionConfig.rows.every((row) => row.cells.length === question.interactionConfig.columns.length)));
  for (const grade of [10, 11, 12]) assert.ok(new Set(lessons.filter((lesson) => lesson.grade === grade).flatMap((lesson) => lesson.practice.map((question) => question.interaction))).size >= 9);
});

test("keeps the audited Algebra I scope tied to dedicated lessons and teaching visuals", async () => {
  const concept = await readFile(new URL("../app/components/ConceptVisual.tsx", import.meta.url), "utf8");
  const advanced = await readFile(new URL("../app/components/AdvancedMathTool.tsx", import.meta.url), "utf8");
  const icons = await readFile(new URL("../lib/topic-icons.ts", import.meta.url), "utf8");
  const slugs = new Set(lessons.map((lesson) => lesson.slug));

  assert.equal(algebraCourseCoverage.length, 16);
  assert.equal(extendedProgramCoverage.length, 18);
  assert.equal(grade7To12CoreCoverage.length, 73);
  for (const strand of grade7To12CoreCoverage) for (const slug of strand.lessonSlugs) assert.ok(slugs.has(slug), `${strand.cluster} lost ${slug}`);
  for (const strand of algebraCourseCoverage) for (const slug of strand.lessonSlugs) assert.ok(slugs.has(slug), `${strand.topic} lost ${slug}`);
  for (const strand of extendedProgramCoverage) for (const slug of strand.lessonSlugs) assert.ok(slugs.has(slug), `${strand.authority} lost ${slug}`);
  for (const slug of ["g9-quantities-units-precision", "g9-absolute-value-functions", "g9-absolute-value-inequalities", "g9-graph-linear-inequalities", "g9-systems-linear-inequalities", "g9-linear-quadratic-systems", "g9-build-quadratic-models", "g9-interpret-linear-models"]) assert.match(concept, new RegExp(slug));
  assert.match(concept, /inequality-shade/);
  assert.match(concept, /system-shade/);
  assert.match(concept, /quadratic-model-path/);
  assert.match(advanced, /sets-and-venn[\s\S]*return "venn"/);
  assert.match(advanced, /categorical-data[\s\S]*return "categorical"/);
  assert.match(advanced, /function VennLab/);
  assert.match(advanced, /function CategoricalDataLab/);
  for (const lab of ["ConstructionLab", "TriangleLawLab", "CrossSectionLab", "ComplexNumberLab", "PolynomialIdentityLab", "DecisionLab"]) assert.match(advanced, new RegExp(`function ${lab}`));
  for (const mode of ["construction", "triangle-law", "cross-section", "complex", "identity", "decision"]) assert.match(advanced, new RegExp(`return "${mode}"`));
  const repairedSlugs = ["g9-interpret-linear-models", "g10-geometric-constructions", "g10-similarity-proofs", "g10-laws-of-sines-and-cosines", "g10-cross-sections-and-rotations", "g11-complex-arithmetic", "g11-complex-polynomial-solutions", "g11-polynomial-identities", "g12-decision-strategies"];
  const repairedLessons = repairedSlugs.map((slug) => lessons.find((lesson) => lesson.slug === slug));
  assert.ok(repairedLessons.every(Boolean));
  assert.equal(new Set(repairedLessons.flatMap((lesson) => lesson.exampleSteps)).size, 27);
  assert.match(icons, /venn: \{ kind: "chance", glyph: "∪" \}/);
});

test("lets Enter submit and advance without stealing keyboard input", async () => {
  const response = await readFile(new URL("../app/components/QuestionResponse.tsx", import.meta.url), "utf8");
  const enterAction = await readFile(new URL("../app/components/useEnterAction.ts", import.meta.url), "utf8");
  const autoAdvance = await readFile(new URL("../app/components/AutoAdvanceButton.tsx", import.meta.url), "utf8");
  const lessonStory = await readFile(new URL("../app/components/LessonMissionStory.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const boss = await readFile(new URL("../app/components/BossPlayer.tsx", import.meta.url), "utf8");
  const review = await readFile(new URL("../app/components/ReviewPlayer.tsx", import.meta.url), "utf8");

  assert.match(response, /event\.key !== "Enter"/);
  assert.match(response, /event\.nativeEvent\.isComposing/);
  assert.match(response, /isResponseComplete\(question, value\)/);
  assert.match(response, /question\.interaction === "ordering"/);
  assert.match(enterAction, /event\.repeat/);
  assert.match(enterAction, /event\.isComposing/);
  assert.match(enterAction, /\[role="dialog"\]\[aria-modal="true"\]/);
  assert.match(enterAction, /button, a, input, select, textarea/);
  assert.match(autoAdvance, /useEnterAction\(advanceNow/);
  assert.match(lessonStory, /useEnterAction/);
  for (const player of [lesson, boss, review]) assert.match(player, /aria-keyshortcuts="Enter"/);
});

test("uses one answer control, concise recovery, and a longer success beat everywhere", async () => {
  const response = await readFile(new URL("../app/components/QuestionResponse.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const boss = await readFile(new URL("../app/components/BossPlayer.tsx", import.meta.url), "utf8");
  const review = await readFile(new URL("../app/components/ReviewPlayer.tsx", import.meta.url), "utf8");
  const recovery = await readFile(new URL("../app/components/RecoveryCoach.tsx", import.meta.url), "utf8");
  const recoveryLogic = await readFile(new URL("../lib/practice-recovery.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(response, /data-question-type=\{question\.interaction\}/);
  assert.match(response, /question\.interaction !== "fill-in"/);
  for (const surface of [lesson, boss, review]) assert.match(surface, /<QuestionResponse/);
  assert.match(recovery, /hasMoreSpecificKeyIdea/);
  assert.match(recovery, /<summary>Review the key idea<\/summary>/);
  assert.match(recoveryLogic, /clue: question\.hint/);
  assert.doesNotMatch(`${recovery}\n${recoveryLogic}`, /FIX ONE MOVE|BREAK IT INTO ONE STEP|Pause the full calculation|Say why before you calculate/);
  assert.match(css, /answer-impact-exit 2\.94s/);
  assert.match(css, /@keyframes answer-impact-nice-work/);
  assert.match(css, /scale\(1\.45\)/);
});

test("blocks common contact details before anonymous public feedback is stored", () => {
  assert.equal(publicTextPrivacyIssue("Please reply to student@example.com"), "email address");
  assert.equal(publicTextPrivacyIssue("Call me at +886 912 345 678"), "phone number");
  assert.equal(publicTextPrivacyIssue("My handle is @mathstudent"), "social handle");
  assert.equal(publicTextPrivacyIssue("Please add more coordinate graph practice."), null);
});

test("turns every returning trail state into one clear milestone", () => {
  const base = { gradeComplete: false, reviewBatchSize: 0, activeBossReady: false, activeDone: 0, regionSize: 4, nextLessonTitle: "Signed Numbers" };
  assert.deepEqual(getQuestMilestone(base), { tone: "start", glyph: "1", kicker: "FIRST KEY AHEAD", title: "Signed Numbers starts this region", badge: "0/4" });
  assert.equal(getQuestMilestone({ ...base, activeDone: 2 }).title, "2 short lessons to the Boss");
  assert.deepEqual(getQuestMilestone({ ...base, activeDone: 3 }), { tone: "near", glyph: "4", kicker: "FINAL KEY AHEAD", title: "Signed Numbers opens the Boss", badge: "1 left" });
  assert.equal(getQuestMilestone({ ...base, activeDone: 4, activeBossReady: true }).kicker, "BOSS GATE OPEN");
  assert.equal(getQuestMilestone({ ...base, gradeComplete: true, reviewBatchSize: 3 }).title, "3 ideas are ready to recharge");
  assert.deepEqual(getQuestMilestone({ ...base, gradeComplete: true }), { tone: "complete", glyph: "✓", kicker: "GRADE TRAIL SAFE", title: "Nothing is due today", badge: "Saved" });
});

test("reports only achievement thresholds crossed by the latest saved result", () => {
  const empty = { lessons: 0, stars: 0, bosses: 0, streak: 0 };
  assert.equal(achievementUnlockedBetween(empty, { ...empty, lessons: 1 })?.id, "first-step");
  assert.equal(achievementUnlockedBetween({ ...empty, lessons: 1 }, { ...empty, lessons: 2 }), null);
  assert.equal(achievementUnlockedBetween({ ...empty, stars: 11 }, { ...empty, stars: 12 })?.id, "star-spark");
  assert.equal(achievementUnlockedBetween({ ...empty, lessons: 19, stars: 11 }, { ...empty, lessons: 20, stars: 12 })?.id, "trail-builder");
});

test("uses one achievement evaluation for profile milestones", () => {
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

test("server-renders the Math Grades 7–12 landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Build the worlds no one has reached yet/);
  assert.match(html, /Play one short mission/);
  assert.match(html, /GRADES 7–12/);
  assert.doesNotMatch(html, /220 lessons|1100 questions|full visual scenes/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Building your site/);
  assert.match(html, /og-frontier-v1\.webp/);
});

test("server-renders a public, no-sign-in linear Graph Lab", async () => {
  const response = await render("/labs/linear-graphs");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Plot a rover/);
  assert.match(html, /Type a rule\. Watch the line react/);
  assert.match(html, /Track Nova with y = 2x \+ 1/);
  assert.match(html, /When equations became pictures/);
  assert.match(html, /La Géométrie/);
  assert.doesNotMatch(html, /SIX QUICK TESTS|ONE TOOL · SIX GRADE PATHS|This line keeps showing up/);
});

test("publishes a plain-English AI collaboration and open reuse promise", async () => {
  const response = await render("/about");
  assert.equal(response.status, 200);
  const html = await response.text();
  const legal = await readFile(new URL("../app/components/LegalPage.tsx", import.meta.url), "utf8");
  const footer = await readFile(new URL("../app/components/SiteFooter.tsx", import.meta.url), "utf8");
  assert.match(html, /A dad built it for his daughter/);
  assert.match(html, /Sting’s daughter had math to review/);
  assert.match(html, /Sting and AI build together/);
  assert.match(html, /Use it\. Remix it\. Make it better/);
  assert.match(html, /original learning text and original image assets/);
  assert.match(legal, /AI-assisted creation and accuracy/);
  assert.match(legal, /Open reuse of original material/);
  assert.match(legal, /freely copy, share, and adapt/);
  assert.match(legal, /responsible for checking its accuracy/);
  assert.match(footer, /href="\/about"/);
  assert.match(footer, /Built with AI and human review/);
});

test("ships all six curriculum files and all source sheets", async () => {
  const curriculum = await readFile(new URL("../lib/curriculum.ts", import.meta.url), "utf8");
  const lessonDefinitions = curriculum.match(/\blesson\(\d+,\s*\d+,/g) ?? [];
  assert.equal(lessonDefinitions.length, 52);
  const grade7 = await readFile(new URL("../lib/curriculum-grade7.ts", import.meta.url), "utf8");
  const grade9 = await readFile(new URL("../lib/curriculum-grade9.ts", import.meta.url), "utf8");
  const grade10 = await readFile(new URL("../lib/curriculum-grade10.ts", import.meta.url), "utf8");
  const grade11 = await readFile(new URL("../lib/curriculum-grade11.ts", import.meta.url), "utf8");
  const grade12 = await readFile(new URL("../lib/curriculum-grade12.ts", import.meta.url), "utf8");
  assert.match(grade7, /7\.RP\.A\.1/);
  assert.match(grade7, /7\.SP\.C\.8/);
  assert.match(grade9, /HSA\.REI\.C\.6/);
  assert.match(grade9, /HSF\.LE\.A/);
  assert.match(grade10, /HSG\.SRT\.C/);
  assert.match(grade10, /HSS\.CP\.B/);
  assert.match(grade11, /HSF\.TF\.C/);
  assert.match(grade11, /HSN\.VM/);
  assert.match(grade12, /AP\.CALC\.DIF/);
  assert.match(grade12, /AP\.CALC\.INT/);
  assert.match(curriculum, /8\.NS\.A\.1/);
  assert.match(curriculum, /8\.EE\.C\.8/);
  assert.match(curriculum, /8\.F\.A\.1/);
  assert.match(curriculum, /8\.G\.C\.9/);
  assert.match(curriculum, /8\.SP\.A\.4/);
  const sheets = await readdir(new URL("../public/quick-sheets/", import.meta.url));
  assert.equal(sheets.filter((name) => name.endsWith(".png")).length, 20);
});

test("adds one focused live line grapher across Grade 7, 8, and 9 graph lessons", async () => {
  const visual = await readFile(new URL("../app/components/ConceptVisual.tsx", import.meta.url), "utf8");
  const lab = await readFile(new URL("../app/components/LinearGraphLab.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/labs/linear-graphs/page.tsx", import.meta.url), "utf8");
  const header = await readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const slug of ["g7-proportional-graphs", "graphing-lines", "g9-graph-linear-functions"]) assert.match(visual, new RegExp(`lesson\\.slug === "${slug}"`));
  assert.match(lab, /Type a rule\. Watch the line react/);
  assert.match(lab, /Use y = mx \+ b/);
  assert.match(lab, /role="img"/);
  assert.match(lab, /aria-live="polite"/);
  assert.match(lab, /Explore nearby coordinates on this line/);
  assert.match(lab, /getScreenCTM/);
  assert.match(lab, /coordinateNumber\(hoverPoint\.x\)/);
  assert.match(lab, /toFixed\(1\)/);
  assert.match(lab, /onPointerMove=\{pointNearPointer\}/);
  assert.match(lab, /onFocus=\{startKeyboardExplore\}/);
  assert.doesNotMatch(lab, /useId/);
  assert.match(lab, /Not saved/);
  assert.match(page, /<LinearGraphLab initialEquation="y=2x\+1"/);
  assert.match(page, /graphExamples/);
  assert.match(page, /When equations became pictures/);
  assert.match(page, /mathshistory\.st-andrews\.ac\.uk/);
  assert.doesNotMatch(page, /Predict first\. Check second|guidedChallenges|Check my reasoning|gradeConnections/);
  assert.doesNotMatch(page, /Private by default/);
  assert.match(header, /href="\/labs\/linear-graphs"/);
  assert.match(css, /\.linear-graph-workspace/);
  assert.match(css, /\.linear-example-buttons button \{ min-height: 44px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.linear-graph-workspace \{ grid-template-columns: 1fr/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.linear-graph-line/);
});

test("ships one accessible point-line mission and an active reasoning flow across every lesson", async () => {
  const mission = await readFile(new URL("../app/components/PointToLineMission.tsx", import.meta.url), "utf8");
  const flow = await readFile(new URL("../app/components/WorkedExampleFlow.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const visual = await readFile(new URL("../app/components/ConceptVisual.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(mission, /Plot this point/);
  assert.match(mission, /Connect my points/);
  assert.match(mission, /Check coordinate/);
  assert.match(mission, /coordinate controls beside the graph/);
  assert.match(mission, /hasTrace/);
  assert.match(mission, /point-line-marker-coordinate/);
  assert.match(mission, /attemptedPoint/);
  assert.match(mission, /point-line-attempt-dot/);
  assert.match(mission, /point-line-target-ring/);
  assert.match(mission, /You plotted/);
  assert.match(mission, /connected \? "confirmed" : "progressive"/);
  assert.match(mission, /getScreenCTM/);
  assert.doesNotMatch(mission, /useId/);
  assert.doesNotMatch(mission, /Points are not saved/);
  assert.match(flow, /Predict what the next mathematical move/);
  assert.match(flow, /REASONING CHAIN COMPLETE/);
  assert.match(lesson, /<WorkedExampleFlow steps=\{lesson\.exampleSteps\}/);
  assert.match(lesson, /continueDisabled=\{!exampleReady\}/);
  assert.match(lesson, /<BadgeMedallion badge=\{lessonBadge\}/);
  assert.doesNotMatch(lesson, /<ol className="example-steps"/);
  assert.match(visual, /<PointToLineMission compact \/>/);
  assert.match(css, /\.point-line-workspace/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.point-line-workspace \{ grid-template-columns: 1fr/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.point-line-connection/);
});

test("extends the deterministic badge catalog without deleting answer milestones", () => {
  assert.equal(BADGE_CATALOG_SIZE, 533);
  assert.equal(BADGE_CATALOG_VERSION, "2026.5");
  assert.equal(ANSWER_BADGE_STEP, 10);
  assert.equal(ANSWER_BADGE_COUNT, 280);
  assert.equal(lessonBadges.length, 253);
  assert.equal(answerBadges.length, 280);
  assert.equal(badgeCatalog.length, 533);
  assert.equal(new Set(badgeCatalog.map((badge) => badge.id)).size, 533);
  assert.equal(new Set(badgeCatalog.map((badge) => badge.title)).size, 533);
  assert.equal(new Set(badgeCatalog.map((badge) => badge.catalogNumber)).size, 533);
  assert.equal(new Set(lessonBadges.map((badge) => badge.lessonId)).size, 253);
  assert.equal(answerBadges.at(0)?.target, 10);
  assert.equal(answerBadges.at(-1)?.target, 2_800);
  for (const [index, badge] of answerBadges.entries()) assert.equal(badge.target, (index + 1) * 10);
  assert.equal(answerBadgeForCorrectCount(9), undefined);
  assert.equal(answerBadgeForCorrectCount(10)?.id, "answer-001");
  assert.equal(answerBadgeForCorrectCount(2_800)?.id, "answer-280");
  assert.equal(nextAnswerBadge(0)?.target, 10);
  assert.equal(nextAnswerBadge(2_800), null);
});

test("grants demo badges once at the same milestones as the server", () => {
  let state = structuredClone(getDemoState());
  const first = creditDemoCorrectAnswer(state);
  state = first.state;
  const second = creditDemoCorrectAnswer(state);
  state = second.state;
  const milestone = creditDemoCorrectAnswer(state);
  state = milestone.state;
  assert.equal(milestone.correctAnswers, 10);
  assert.deepEqual(milestone.badgeUnlocks.map((item) => item.id), ["answer-001"]);
  const after = creditDemoCorrectAnswer(state);
  assert.equal(after.badgeUnlocks.length, 0);
  assert.equal(after.state.badges.earnedIds.filter((id) => id === "answer-001").length, 1);

  const lessonState = completeDemoLesson(after.state, "g8-r1-l2", 1);
  assert.ok(lessonState.badges.earnedIds.includes("lesson-g8-r1-l2"));
  assert.equal(lessonState.learningHistory[0].key, "lesson:g8-r1-l2");
  const replayState = completeDemoLesson(lessonState, "g8-r1-l2", 3);
  assert.equal(replayState.badges.earnedIds.filter((id) => id === "lesson-g8-r1-l2").length, 1);
  assert.equal(replayState.learningHistory.filter((entry) => entry.key === "lesson:g8-r1-l2").length, 1);
});

test("always gives a signed-in account priority over a demo query", () => {
  assert.equal(chooseLearnerMode(true, true), "account");
  assert.equal(chooseLearnerMode(true, false), "account");
  assert.equal(chooseLearnerMode(false, true), "demo");
  assert.equal(chooseLearnerMode(false, false), "signed-out");
});

test("separates account identity, weekly public aliases, and private learning history", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const bootstrap = await readFile(new URL("../db/bootstrap.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../drizzle/0009_breezy_the_captain.sql", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const hook = await readFile(new URL("../app/components/useLearner.ts", import.meta.url), "utf8");
  const profile = await readFile(new URL("../app/components/ProfileView.tsx", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/components/LearningDashboard.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");

  for (const source of [schema, bootstrap, migration]) {
    assert.match(source, /auth_identities/);
    assert.match(source, /public_aliases/);
    assert.match(source, /question_count/);
  }
  assert.match(migration, /SELECT 'google', `auth_key`, `id`, `created_at`, `last_seen_at` FROM `learners`/);
  assert.match(store, /FROM auth_identities i JOIN learners l/);
  assert.match(store, /ensurePublicAlias\(learnerId, "leaderboard", week\)/);
  assert.match(store, /JOIN public_aliases a/);
  assert.match(store, /id: entry\.public_id/);
  assert.match(store, /learningHistory/);
  assert.match(hook, /fetch\("\/api\/me"/);
  assert.match(hook, /chooseLearnerMode\(response\.ok, demoRequested\)/);
  assert.match(hook, /isDemo: mode === "demo"/);
  assert.match(dashboard, /demo=\{isDemo\}/);
  assert.match(lesson, /if \(isDemo\)/);
  assert.match(profile, /PRIVATE RECORD/);
  assert.match(profile, /Learning history/);
  assert.match(profile, /separate weekly alias/);
});

test("persists badge ownership and qualified answer credits without adding badge XP", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const bootstrap = await readFile(new URL("../db/bootstrap.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../drizzle/0006_closed_luminals.sql", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const answerRoute = await readFile(new URL("../app/api/answer/route.ts", import.meta.url), "utf8");
  const reviewRoute = await readFile(new URL("../app/api/review/route.ts", import.meta.url), "utf8");

  for (const source of [schema, bootstrap, migration]) {
    assert.match(source, /badge_unlocks/);
    assert.match(source, /answer_credits/);
    assert.match(source, /ON DELETE CASCADE|onDelete: "cascade"/i);
  }
  assert.match(store, /INSERT OR IGNORE INTO answer_credits/);
  assert.match(store, /INSERT OR IGNORE INTO badge_unlocks/);
  assert.match(store, /lessonBadgeByLessonId/);
  assert.match(store, /const eligibleCount = Math\.min\(answerBadges\.length/);
  assert.match(store, /for \(let index = lastUnlocked; index < eligibleCount/);
  assert.match(answerRoute, /correctAnswers/);
  assert.match(answerRoute, /badgeUnlocks/);
  assert.match(reviewRoute, /creditCorrectAnswer/);
  const badgeGrantSource = store.slice(store.indexOf("async function unlockBadge"), store.indexOf("export async function getDueReviewItems"));
  assert.doesNotMatch(badgeGrantSource, /awardXp/);
});

test("ships a focused, extensible badge collection and accessible celebration controls", async () => {
  const page = await readFile(new URL("../app/badges/page.tsx", import.meta.url), "utf8");
  const gallery = await readFile(new URL("../app/components/BadgeGallery.tsx", import.meta.url), "utf8");
  const medallion = await readFile(new URL("../app/components/BadgeMedallion.tsx", import.meta.url), "utf8");
  const reveal = await readFile(new URL("../app/components/BadgeUnlockReveal.tsx", import.meta.url), "utf8");
  const header = await readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const review = await readFile(new URL("../app/components/ReviewPlayer.tsx", import.meta.url), "utf8");
  const boss = await readFile(new URL("../app/components/BossPlayer.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /<BadgeGallery/);
  assert.match(gallery, /NEXT BADGE/);
  assert.match(gallery, /useState<BadgeFilter>\("earned"\)/);
  assert.match(gallery, /slice\(0, visibleCount\)/);
  assert.match(gallery, /setVisibleCount\(48\)/);
  assert.doesNotMatch(gallery, /500 BADGES|of 500|of 124|server-verified|CHOOSE A TARGET|No loot boxes|EARNED · PERMANENT|catalogNumber/i);
  assert.match(medallion, /aria-label=\{`\$\{badge\.title\} badge`\}/);
  assert.doesNotMatch(medallion, /catalog number|badge-medallion-rank|badge-medallion-number/);
  assert.match(header, /badgesUrl/);
  assert.doesNotMatch(header, /badge-nav-count|99\+/);
  assert.match(reveal, /role="dialog"/);
  assert.match(reveal, /aria-modal="true"/);
  assert.match(reveal, /Skip animation/);
  assert.match(reveal, /event\.key === "Escape"/);
  assert.match(reveal, /View badges/);
  assert.match(reveal, /badge-vault-flyer/);
  assert.match(reveal, /Adding…/);
  assert.doesNotMatch(reveal, /OF 500|permanent/i);
  for (const source of [lesson, review, boss]) {
    assert.match(source, /<AnswerImpact/);
    assert.match(source, /<BadgeUnlockReveal/);
  }
  assert.match(css, /@keyframes badge-card-arrive/);
  assert.match(css, /@keyframes badge-fly-to-vault/);
  assert.match(css, /@keyframes answer-impact-core/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*\.badge-catalog-grid \{ grid-template-columns: 1fr/);
  assert.match(css, /\.mobile-learner-nav \{[^}]*grid-template-columns: repeat\(5, 1fr\)/s);
});

test("makes Quick Sheets readable and actionable on small screens", async () => {
  const lessonPlayer = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(lessonPlayer, /aria-labelledby="quick-sheet-title"/);
  assert.match(lessonPlayer, /Tap to open full size/);
  assert.match(lessonPlayer, /target="_blank" rel="noreferrer"/);
  assert.match(lessonPlayer, /Download PNG/);
  assert.match(lessonPlayer, /event\.key === "Escape"/);
  assert.match(css, /\.sheet-preview-link/);
  assert.match(css, /\.sheet-actions/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.sheet-actions a \{ min-width: 0; min-height: 52px/);
});

test("uses one visual loading and private sign-in language across learning flows", async () => {
  const stateComponent = await readFile(new URL("../app/components/LearningGate.tsx", import.meta.url), "utf8");
  const flowFiles = await Promise.all(["LessonPlayer", "BossPlayer", "ReviewPlayer", "ProfileView", "LearningDashboard"].map((name) => readFile(new URL(`../app/components/${name}.tsx`, import.meta.url), "utf8")));
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(stateComponent, /aria-live="polite"/);
  assert.match(stateComponent, /Your Google name, email, and photo stay off the site/);
  for (const source of flowFiles) assert.match(source, /LearningLoading|LearningSignInGate/);
  assert.match(css, /\.learning-loading-card/);
  assert.match(css, /\.learning-loading-route i/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.learning-sign-in-gate \.auth-card \.primary-button \{ width: 100%; min-height: 54px/);
});

test("keeps real Google profile fields out of persistent schema", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  for (const forbidden of ["email", "full_name", "profile_photo", "google_sub"]) assert.doesNotMatch(schema, new RegExp(`["]${forbidden}["]`, "i"));
  assert.match(schema, /auth_key/);
  assert.match(schema, /leaderboard_opt_in/);
  assert.match(schema, /feedback_messages/);
  assert.match(schema, /ON DELETE CASCADE|onDelete: "cascade"/i);
});

test("saves one private theme code and ships five visual learning worlds", async () => {
  const state = await readFile(new URL("../lib/learner-state.ts", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8");
  const profile = await readFile(new URL("../app/components/ProfileView.tsx", import.meta.url), "utf8");
  const header = await readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8");
  const learnerHook = await readFile(new URL("../app/components/useLearner.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.deepEqual(themeCatalog.map((theme) => theme.id), ["classic", "space", "blossom", "ocean", "aurora"]);
  assert.ok(themeCatalog.every((theme) => isThemeId(theme.id)));
  assert.match(state, /theme: ThemeId/);
  assert.match(store, /learner_preferences/);
  assert.match(store, /updateTheme/);
  assert.match(route, /action: "theme"/);
  assert.match(profile, /Choose a world/);
  assert.doesNotMatch(profile, /Pick a new story\. Every cleared lesson stays cleared/);
  assert.match(profile, /profile-command-deck/);
  assert.match(header, /root\.dataset\.theme/);
  assert.match(header, /theme-world-hud/);
  assert.match(header, /getThemeJourney/);
  assert.match(learnerHook, /useState<LearnerState \| null>\(null\)/);
  assert.match(learnerHook, /useState\(true\)/);
  assert.match(css, /theme-worlds-atlas-comic-v2\.webp/);
  assert.match(css, /\.profile-command-deck/);
  assert.match(css, /\.theme-world-hud/);
  assert.ok(themeCatalog.every((theme) => theme.worldName && theme.role && theme.locations.length >= 6));
  for (const theme of themeCatalog) assert.match(css, new RegExp(`data-theme="${theme.id}"`));
  const asset = await readFile(new URL("../public/visuals/theme-worlds-atlas-comic-v2.webp", import.meta.url));
  assert.ok(asset.byteLength > 50_000 && asset.byteLength < 180_000);
  assert.equal((await sharp(asset).metadata()).format, "webp");
});

test("previews every theme as a private, deterministic frontier mission", async () => {
  const explorer = await readFile(new URL("../app/components/FrontierWorldExplorer.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const direction = await readFile(new URL("../docs/homepage-frontier-direction.md", import.meta.url), "utf8");
  assert.deepEqual(frontierWorlds.map((world) => world.id), ["classic", "space", "blossom", "ocean", "aurora"]);
  assert.ok(frontierWorlds.every((world) => world.worldName && world.mission && world.image && world.href && world.skills.length === 3));
  assert.match(explorer, /useState<ThemeId>\("space"\)/);
  assert.match(explorer, /aria-pressed=/);
  assert.match(explorer, /aria-live="polite"/);
  assert.doesNotMatch(explorer, /localStorage|sessionStorage|Math\.random|new Date|document\.cookie/);
  assert.match(css, /\.frontier-world-switcher/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.frontier-world-switcher/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.frontier-hero-media img/);
  assert.match(direction, /Math expands the human frontier/);
  assert.match(direction, /Generated art assets and final prompts/);
});

test("gives every Grade 10–12 lesson an appropriate interactive concept tool", async () => {
  const concept = await readFile(new URL("../app/components/ConceptVisual.tsx", import.meta.url), "utf8");
  const tool = await readFile(new URL("../app/components/AdvancedMathTool.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(concept, /lesson\.grade >= 10/);
  assert.match(concept, /<AdvancedMathTool lesson=\{lesson\}/);
  for (const mode of ["logic", "venn", "categorical", "calculus", "circle", "probability", "vector", "scale", "function"]) assert.match(tool, new RegExp(`"${mode}"`));
  assert.match(tool, /logic-and-conditionals[\s\S]*return "logic"/);
  assert.doesNotMatch(tool, /probability\|conditional\|independence/);
  assert.match(tool, /Not saved/);
  assert.doesNotMatch(tool, /Private scratch space|Nothing here is saved/);
  assert.match(tool, /Run another sample/);
  assert.match(tool, /UNIT CIRCLE/);
  assert.match(tool, /CALCULUS LENS/);
  assert.match(css, /\.advanced-math-tool/);
  assert.match(css, /\.probability-orbit small \{[^}]*width: 100%[^}]*text-align: center/);
  assert.match(css, /\.logic-case-grid button\.selected/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.advanced-tool-workspace \{ min-height: 0; padding: 15px; grid-template-columns: 1fr/);
});

test("keeps every visible CSS font size between 16px and 34px", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const sizes = [...css.matchAll(/font-size:\s*(\d+)px/g)].map((match) => Number(match[1])).filter((size) => size !== 0);
  const shorthandSizes = [...css.matchAll(/font:\s*[^;{}]*?(\d+)px\//g)].map((match) => Number(match[1]));
  assert.ok(sizes.length > 500);
  assert.ok(sizes.every((size) => size >= 16 && size <= 34), `font-size range was ${Math.min(...sizes)}–${Math.max(...sizes)}px`);
  assert.ok(shorthandSizes.every((size) => size >= 16 && size <= 34), `font shorthand fell outside 16–34px: ${shorthandSizes.join(", ")}`);
  assert.doesNotMatch(css, /font:\s*[^;{}]*clamp\(/, "font shorthand must not hide a computed size outside 16–34px");
  assert.match(css, /font-size: clamp\(16px, var\(--badge-symbol\), 34px\)/);
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
  assert.match(profile, /NEXT FRAME/);
  assert.match(profile, /isOwned \? "Equip"/);
  assert.doesNotMatch(profile, /unlocked forever|NEXT COLLECTION GOAL|Owned · Equip|No tokens spent/);
  assert.doesNotMatch(dashboard, /Use tokens for avatar frames|reward-locker-link/);
  assert.match(css, /\.locker-goal/);
});

test("presents the daily reward as a distinct action and retires its completed state", async () => {
  const dashboard = await readFile(new URL("../app/components/LearningDashboard.tsx", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(store, /const rewardTokens = \[10, 12, 14, 16, 18, 20, 30\]/);
  assert.match(store, /INSERT OR IGNORE INTO daily_rewards/);
  assert.match(store, /if \(step === 7\) shields \+= 1/);
  assert.doesNotMatch(dashboard, /Every reward is fixed|Skip a day\? Nothing resets|no mystery boxes or paid boosts|never purchased/);
  assert.match(dashboard, /rewardPending \? "Collecting…"/);
  assert.match(dashboard, /showClaimedReward/);
  assert.match(dashboard, /window\.setTimeout\([\s\S]*5000/);
  assert.match(dashboard, /Collected today/);
  assert.match(dashboard, /reward-ready-button/);
  assert.match(dashboard, /claim-settling/);
  assert.match(dashboard, /OPTIONAL DAILY CHECK-IN/);
  assert.match(dashboard, /aria-busy=\{rewardPending\}/);
  assert.doesNotMatch(dashboard, /daily-reward-details|daily-rhythm|today-mission-header|today-mission-route/);
  assert.match(css, /\.reward-balance/);
  assert.match(css, /\.reward-ready-button/);
  assert.match(css, /@keyframes reward-ready-nudge/);
  assert.match(css, /@keyframes claimed-reward-retire/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.reward-ready-button/);
});

test("keeps signed-in navigation and a clear self marker on the weekly league", async () => {
  const page = await readFile(new URL("../app/leaderboard/page.tsx", import.meta.url), "utf8");
  const header = await readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8");
  const view = await readFile(new URL("../app/components/LeaderboardView.tsx", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /LeaderboardView demo=\{params\.demo === "1"\}/);
  assert.match(header, /leaderboard\?demo=1/);
  assert.match(view, /state \? <LearnerHeader/);
  assert.match(view, /Rank \{viewerEntry\.rank\}/);
  assert.match(view, /entry\.isViewer && <small>YOU<\/small>/);
  assert.doesNotMatch(view, /YOUR PRIVATE MARKER|Everyone else sees your random codename|30-person|Public top 30/);
  assert.match(view, /entry\.weeklyXp > 0/);
  assert.match(store, /isViewer: entry\.learner_id === learnerId/);
  assert.match(css, /\.current-rank-card/);
  assert.match(css, /li\.current-learner/);
});

test("keeps feedback rows unlinkable from learner progress", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const feedback = schema.slice(schema.indexOf("feedbackMessages"), schema.indexOf("leagueMembers"));
  assert.doesNotMatch(feedback, /learnerId|learner_id|authKey|auth_key/);
  assert.match(feedback, /requestKeyHash/);
  assert.match(store, /publicTextPrivacyIssue/);
  assert.match(store, /For privacy, remove the/);
});

test("guards authenticated mutations and production responses", async () => {
  const routes = await Promise.all([
    "answer", "state", "review", "feedback", "boss",
  ].map((name) => readFile(new URL(`../app/api/${name}/route.ts`, import.meta.url), "utf8")));
  for (const route of routes) {
    assert.match(route, /rejectCrossOriginMutation/);
    assert.match(route, /Idempotency-Key/);
  }
  const privateRoutes = await Promise.all([
    "answer", "state", "review", "boss", "me", "auth/google", "auth/logout",
  ].map((name) => readFile(new URL(`../app/api/${name}/route.ts`, import.meta.url), "utf8")));
  for (const route of privateRoutes) assert.match(route, /privateJson/);
  const http = await readFile(new URL("../lib/http.ts", import.meta.url), "utf8");
  assert.match(http, /private, no-store, max-age=0/);
  assert.match(http, /Pragma/);
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(worker, /Content-Security-Policy/);
  assert.match(worker, /frame-ancestors 'none'/);
  assert.match(worker, /X-Content-Type-Options/);
  assert.match(worker, /Strict-Transport-Security/);
  const dashboard = await readFile(new URL("../app/components/LearningDashboard.tsx", import.meta.url), "utf8");
  const profile = await readFile(new URL("../app/components/ProfileView.tsx", import.meta.url), "utf8");
  const feedback = await readFile(new URL("../app/components/FeedbackBoard.tsx", import.meta.url), "utf8");
  const header = await readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8");
  const google = await readFile(new URL("../app/components/GoogleSignIn.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(dashboard, /dailyRewardClaimed \|\| rewardPending/);
  assert.match(profile, /if \(busyAction\) return/);
  assert.match(feedback, /if \(busy \|\| message\.trim\(\)\.length < 3\) return/);
  assert.match(header, /if \(loggingOut\) return/);
  assert.match(google, /if \(authPending\.current\) return/);
  assert.match(css, /button:not\(:disabled\)[\s\S]*:active/);
  assert.match(css, /\[aria-busy="true"\][\s\S]*pointer-events: none/);
});

test("keeps progression and boss hearts server-authoritative", async () => {
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const answerRoute = await readFile(new URL("../app/api/answer/route.ts", import.meta.url), "utf8");
  const stateRoute = await readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8");
  const bossRoute = await readFile(new URL("../app/api/boss/route.ts", import.meta.url), "utf8");
  const bossPlayer = await readFile(new URL("../app/components/BossPlayer.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  assert.match(store, /assertLessonUnlocked/);
  assert.match(store, /assertBossUnlocked/);
  assert.match(store, /UPDATE boss_attempts SET hearts/);
  assert.match(store, /checkBossRepairAnswer/);
  assert.match(store, /if \(existing\) return existing/);
  assert.match(store, /resynced: true/);
  assert.doesNotMatch(store, /Continue from the current boss question/);
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
  assert.match(bossPlayer, /repair-answer-feedback/);
  assert.match(bossPlayer, /No XP or completed repair is lost/);
  assert.match(bossPlayer, /body\.resynced/);
  assert.match(bossPlayer, /nextQuestionIndex/);
  assert.match(bossPlayer, /\[isDemo, questions\.length, region\.id, learnerReady, unlocked\]/);
  assert.match(bossPlayer, /No heart was lost/);
  assert.match(bossPlayer, /aria-valuenow=\{repair\}/);
  assert.match(css, /\.repair-answer-feedback/);
  assert.match(css, /\.boss-sync-message/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*\.repair-answer-feedback/);
});

test("persists recovery mastery and blocks lesson completion until clean recall", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const bootstrap = await readFile(new URL("../db/bootstrap.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../drizzle/0007_demonic_jack_power.sql", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");
  const answerRoute = await readFile(new URL("../app/api/answer/route.ts", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const coach = await readFile(new URL("../app/components/RecoveryCoach.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  for (const source of [schema, bootstrap, migration]) {
    assert.match(source, /lesson_mastery_checks/);
    assert.match(source, /ON DELETE CASCADE|onDelete: "cascade"/i);
  }
  assert.match(store, /recordMasteryCheck/);
  assert.match(store, /clean_corrected/);
  assert.match(store, /Complete every Memory Check before finishing the lesson/);
  assert.match(answerRoute, /body\.mastery/);
  assert.match(answerRoute, /recordMasteryCheck/);
  assert.match(lesson, /masteryQueue/);
  assert.match(lesson, /Memory Check/);
  assert.match(lesson, /remixedChoices/);
  assert.match(lesson, /Try once more later/);
  assert.match(lesson, /<MemoryReturnCue count=\{recoveryCount\}/);
  assert.match(lesson, /!inMemoryCheck && recoveryCount > 0/);
  assert.doesNotMatch(lesson, /recovery-mastery-summary/);
  assert.match(coach, /Review the key idea/);
  assert.match(coach, /Full credit is still available/);
  assert.doesNotMatch(coach, /FIX ONE MOVE|Your progress is safe/);
  assert.match(css, /\.task-progress/);
  assert.match(css, /\.memory-return-tooltip/);
  assert.match(css, /\.memory-check-banner/);
  assert.match(css, /\.recovery-coach/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.recovery-key-idea,/);
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
  assert.match(lesson, /completion-earnings/);
  assert.match(lesson, /reward\.xpEarned/);
  assert.match(lesson, /reward\.bestStars/);
  assert.doesNotMatch(lesson, /REWARD RECEIPT|Fair replay · skill refreshed|Repeat XP stays at 0/);
  assert.doesNotMatch(css, /\.reward-receipt-path/);
});

test("turns lifetime XP into clear levels, themed ranks, and visible next goals", async () => {
  assert.equal(XP_PER_LEVEL, 100);
  assert.deepEqual(getXpProgress(-20, "classic"), {
    totalXp: 0,
    level: 1,
    levelStartXp: 0,
    nextLevelXp: 100,
    earnedInLevel: 0,
    xpToNextLevel: 100,
    percent: 0,
    rankTitle: "Field Scout",
    tier: 1,
    nextRank: { level: 3, title: "Route Finder", xpRequired: 200 },
  });
  const garden = getXpProgress(435, "blossom");
  assert.equal(garden.level, 5);
  assert.equal(garden.earnedInLevel, 35);
  assert.equal(garden.xpToNextLevel, 65);
  assert.equal(garden.rankTitle, "Bloom Keeper");
  assert.deepEqual(garden.nextRank, { level: 8, title: "Sky Gardener", xpRequired: 700 });
  assert.deepEqual(getXpGain(95, 105, "space"), {
    previous: getXpProgress(95, "space"),
    current: getXpProgress(105, "space"),
    levelsGained: 1,
    rankUnlocked: null,
  });
  assert.equal(getXpGain(195, 205, "space").rankUnlocked, "Rover Pilot");

  const profile = await readFile(new URL("../app/components/ProfileView.tsx", import.meta.url), "utf8");
  const header = await readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const boss = await readFile(new URL("../app/components/BossPlayer.tsx", import.meta.url), "utf8");
  const review = await readFile(new URL("../app/components/ReviewPlayer.tsx", import.meta.url), "utf8");
  const progress = await readFile(new URL("../app/components/XpProgress.tsx", import.meta.url), "utf8");
  const themes = await readFile(new URL("../lib/themes.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(profile, /<XpProgress totalXp=\{state\.totalXp\}/);
  assert.match(profile, /Mission \{journey\.stage\}/);
  assert.doesNotMatch(profile, /XP power|<strong>\{journey\.stage\}<\/strong><small>\{world\.levelLabel\}/);
  assert.match(header, /level-chip/);
  assert.doesNotMatch(header, /token-chip/);
  for (const source of [lesson, boss, review]) assert.match(source, /<XpProgress[^>]+variant="reward"/);
  assert.match(progress, /Level up!/);
  assert.match(progress, /NEXT RANK · LEVEL/);
  assert.match(themes, /headline: `Mission \$\{stage\} · \$\{location\}`/);
  assert.match(css, /\.xp-profile-progress/);
  assert.match(css, /\.xp-reward-progress\.level-up/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.xp-level-orb/);
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
  const autoAdvance = await readFile(new URL("../app/components/AutoAdvanceButton.tsx", import.meta.url), "utf8");
  const taskProgress = await readFile(new URL("../app/components/TaskProgress.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const boss = await readFile(new URL("../app/components/BossPlayer.tsx", import.meta.url), "utf8");
  const review = await readFile(new URL("../app/components/ReviewPlayer.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const pattern of ["orbit", "confetti", "ripple", "spark", "lift"]) assert.match(component, new RegExp(`"${pattern}"`));
  assert.match(css, /\.success-confetti/);
  assert.match(css, /\.success-ripple/);
  assert.match(css, /success-flash 2\.24s/);
  assert.match(css, /answer-impact-exit 2\.94s/);
  assert.match(css, /answer-impact-nice-work 2\.55s/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /animation:\s*none !important/);
  assert.match(lesson, /setFocusStreak\(0\)/);
  assert.match(lesson, /correct in a row/);
  assert.match(lesson, /focusStreak >= 3/);
  assert.match(review, /correct in a row/);
  assert.match(review, /recallStreak >= 3/);
  assert.match(taskProgress, /role="progressbar"/);
  assert.match(taskProgress, /of \{total\} complete/);
  assert.match(taskProgress, /MemoryReturnCue/);
  assert.match(taskProgress, /role="tooltip"/);
  assert.doesNotMatch(lesson, /FOCUS CHARGE|FOCUS CHAIN|STAR PATH/);
  assert.doesNotMatch(review, /RECALL CHAIN|Pulse \+1/);
  assert.match(autoAdvance, /AUTO_ADVANCE_SECONDS = 6/);
  assert.match(autoAdvance, /Automatically continuing in/);
  for (const player of [lesson, boss, review]) assert.match(player, /<AutoAdvanceButton/);
  assert.match(css, /\.auto-advance-timer/);
  assert.match(css, /\.task-progress-track/);
  assert.deepEqual([1, 2, 3, 5, 8].map((chain) => getComboSpec(chain).tier), ["signal", "spark", "flame", "prism", "cosmic"]);
  for (const tier of ["signal", "spark", "flame", "prism", "cosmic"]) assert.match(css, new RegExp(`combo-${tier}`));
  assert.match(css, /\.answer-impact-core \{[^}]*overflow: visible/);
  assert.match(css, /\.answer-impact-core::before/);
  assert.match(css, /\.answer-impact\.combo-flame \.answer-impact-core::before \{ clip-path:/);
  assert.doesNotMatch(css, /\.answer-impact\.combo-flame \.answer-impact-core \{[^}]*clip-path:/);
});

test("ships a readable, safe-area-aware mobile learning interface", async () => {
  const header = await readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/components/LearningDashboard.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const boss = await readFile(new URL("../app/components/BossPlayer.tsx", import.meta.url), "utf8");
  const review = await readFile(new URL("../app/components/ReviewPlayer.tsx", import.meta.url), "utf8");
  const response = await readFile(new URL("../app/components/QuestionResponse.tsx", import.meta.url), "utf8");
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
  assert.match(lesson, /lesson-mobile-status/);
  assert.match(lesson, /QUEST STEP \{stage \+ 1\} OF \{stageLabels\.length\}/);
  assert.match(lesson, /role="progressbar"/);
  assert.match(lesson, /aria-valuenow=\{lessonProgressPercent\}/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.lesson-mobile-status \{[^}]*display: grid/);
  assert.match(css, /\.lesson-sidebar \.stage-list,[\s\S]*\.lesson-sidebar \.standard-chip \{ display: none/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.lesson-mobile-status \{[^}]*grid-template-columns: 1fr/);
  assert.match(css, /\.lesson-sidebar,[\s\S]*\.lesson-stage \{ min-width: 0; width: 100%/);
  assert.match(css, /\.lesson-sidebar \.lesson-badge-quest \{ width: 100%; grid-column: 1 \/ -1/);
  assert.match(review, /review-mobile-status/);
  assert.match(review, /5-MINUTE REVIEW/);
  assert.match(review, /<TaskProgress label="Review progress"/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.review-mobile-status \{[^}]*display: grid/);
  assert.match(css, /\.review-layout > aside \{ display: none/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.review-mobile-status \{[^}]*width: calc\(100% - 28px\)/);
  assert.match(css, /\.context-math-card\.context-math-card small \{ font-size: 16px; line-height: 1\.3/);
  assert.match(css, /\.lesson-mobile-topic small \{[^}]*font-size: 16px/);
  assert.match(css, /\.review-mobile-status > header small \{[^}]*font-size: 16px/);
  assert.match(css, /\.task-progress-detail \{[^}]*font-size: 16px/);
  assert.match(css, /\.recovery-clue \{[^}]*font-size: 16px/);
  assert.doesNotMatch(dashboard, /daily-token-medallion[^\n]*<small>/);
  assert.match(css, /\.reward-collected-status p \{[^}]*font-size: 16px/);
  assert.match(css, /\.world-replay-link \{[\s\S]*font-size: 16px/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.demo-banner > p \{ display: none; \}/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.dashboard-wrap \{ padding: 4px 0 42px; \}/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.next-visual \{ min-height: 100px; \}/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.grade-switcher \{ display: flex; overflow-x: auto/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.theme-world-hud \{ min-height: 48px/);
  assert.match(css, /\.math-world-proof-stats small \{ font-size: 16px/);
  assert.match(css, /\.game-feedback-card small \{ font-size: 16px/);
  assert.match(css, /\.game-feedback-card h3 \{ font-size: 20px/);
  assert.match(css, /\.game-feedback-card p \{ font-size: 17px/);
  assert.match(css, /a,[\s\S]*button,[\s\S]*summary \{ touch-action: manipulation/);
  assert.match(css, /\.site-footer nav a,[\s\S]*\.privacy-settings-card > \.text-link,[\s\S]*\.legal-wrap > footer a \{[\s\S]*min-height: 44px/);
  for (const player of [lesson, boss, review]) {
    assert.match(player, /aria-busy=\{busy\}/);
    assert.match(player, /<QuestionResponse/);
  }
  assert.match(response, /inputMode=\{mathInputMode\(/);
  assert.match(response, /enterKeyHint="done"/);
  assert.match(response, /aria-invalid=\{invalid\}/);
  assert.match(lesson, /role="alert">\{errorMessage\}/);
  assert.match(boss, /Your answer is still here\. Check your connection and try again\./);
  assert.match(review, /Your completed review is still here\. Check your connection and save again\./);
  assert.match(css, /\.primary-button\[aria-busy="true"\]::after/);
  assert.match(css, /@keyframes answer-check-spin/);
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
  assert.match(adUnit, /document\.createElement\("script"\)/);
  assert.match(adUnit, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
  assert.match(adUnit, /window\.setTimeout/);
  assert.match(adUnit, /2500/);
  assert.doesNotMatch(layout, /<script/);
  assert.match(layout, /<html lang="en" suppressHydrationWarning>/);
  assert.match(layout, /suppressHydrationWarning/);
  assert.match(layout, /google-adsense-account/);
  assert.match(layout, /page-content google-anno-skip/);
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
  assert.match(worker, /frame-src 'self' https: data: blob:/);
  assert.equal(adsTxt.trim(), "google.com, pub-6452867962392355, DIRECT, f08c47fec0942fa0");
  assert.equal(packageJson.scripts.deploy, "npm run deploy:cloudflare");
});

test("ships a visual topic system across home, trail, lessons, and rewards", async () => {
  const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const topicIcon = await readFile(new URL("../app/components/TopicIcon.tsx", import.meta.url), "utf8");
  const topicIconCatalog = await readFile(new URL("../lib/topic-icons.ts", import.meta.url), "utf8");
  const landmarks = await readFile(new URL("../lib/visual-landmarks.ts", import.meta.url), "utf8");
  const contentValidator = await readFile(new URL("../scripts/validate-curriculum.ts", import.meta.url), "utf8");
  const visualOptimizer = await readFile(new URL("../scripts/optimize-context-visuals.mjs", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/components/LearningDashboard.tsx", import.meta.url), "utf8");
  const lesson = await readFile(new URL("../app/components/LessonPlayer.tsx", import.meta.url), "utf8");
  const boss = await readFile(new URL("../app/components/BossPlayer.tsx", import.meta.url), "utf8");
  const review = await readFile(new URL("../app/components/ReviewPlayer.tsx", import.meta.url), "utf8");
  const profile = await readFile(new URL("../app/components/ProfileView.tsx", import.meta.url), "utf8");
  const landmarkUnlock = await readFile(new URL("../app/components/PrivateLandmarkUnlock.tsx", import.meta.url), "utf8");
  const achievementsSource = await readFile(new URL("../lib/achievements.ts", import.meta.url), "utf8");
  const concept = await readFile(new URL("../app/components/ConceptVisual.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(home, /FrontierWorldExplorer/);
  assert.match(home, /frontier-loop-grid/);
  assert.match(home, /frontier-grade-card/);
  for (const family of ["parts", "ratio", "chance", "data", "graph", "shape", "solid", "power", "algebra", "number", "steps"]) assert.match(topicIconCatalog, new RegExp(`kind: "${family}"`));
  assert.match(topicIcon, /data-visual=\{visual\}/);
  assert.match(topicIconCatalog, /topicIconSpecs/);
  assert.match(topicIconCatalog, /"scientific-ops"/);
  assert.match(topicIconCatalog, /"solution-types"/);
  assert.match(contentValidator, /Every lesson visual must have a specific topic icon/);
  assert.match(visualOptimizer, /width: 1200, height: 800/);
  assert.match(visualOptimizer, /width: 1280, height: 853/);
  assert.match(visualOptimizer, /width: 1200, height: 900/);
  assert.match(visualOptimizer, /webp\(\{ quality: 78/);
  assert.match(visualOptimizer, /maximumBytes = 100_000/);
  assert.match(dashboard, /path-copy/);
  assert.match(dashboard, /<TopicIcon visual=\{item\.visual\}/);
  assert.match(lesson, /<LessonMissionStory lesson=\{lesson\}/);
  assert.match(lesson, /<LessonHistory lesson=\{lesson\}/);
  assert.match(lesson, /completion-earnings/);
  assert.match(lesson, /practiceEncouragement/);
  assert.match(lesson, /<TaskProgress/);
  assert.doesNotMatch(lesson, /Start with the picture|Notice what changes/);
  assert.doesNotMatch(lesson, /mastery-next-goal|quest-key-card|settlement-details/);
  assert.doesNotMatch(boss, /boss-victory-map|boss-settlement-summary/);
  for (const visual of ["signed-numbers-context.webp", "operations-sequence-context.webp", "decimal-pattern-context.webp", "percent-market-context.webp", "fraction-workshop-context.webp", "substitution-machine-context.webp", "exponent-lab-context.webp", "like-terms-sorting-context.webp", "slope-trail-context.webp", "pythagorean-city-context.webp", "scatter-field-context.webp", "distributive-workshop-context.webp", "function-kiosk-context.webp", "transform-plaza-context.webp", "cylinder-tank-context.webp", "equation-balance-context.webp", "irrational-garden-context.webp", "scientific-observatory-context.webp", "multistep-workshop-context.webp", "unit-rate-bike-context.webp", "circle-fountain-context.webp", "prism-packing-context.webp", "probability-arcade-context.webp", "systems-transit-context.webp", "solution-cases-gallery-context.webp", "inequality-trail-context.webp", "polynomial-tiles-context.webp", "parabola-bridge-context.webp", "exponential-greenhouse-context.webp", "scale-drawing-studio-context.webp", "random-sample-context.webp", "arithmetic-sequence-context.webp", "quadratic-roots-context.webp", "surface-area-packaging-context.webp", "compound-events-lab-context.webp", "two-way-survey-context.webp", "exponential-decay-energy-context.webp", "discount-studio-context.webp", "angle-plaza-context.webp", "cone-measure-context.webp", "geometric-sequence-lab-context.webp", "absolute-transit-context.webp", "triangle-builder-context.webp", "cross-section-studio-context.webp", "coordinate-route-context.webp", "sphere-tank-context.webp", "difference-squares-workshop-context.webp", "distribution-comparison-context.webp", "real-number-sort-context.webp", "elimination-workshop-context.webp", "rational-exponent-lab-context.webp", "growth-comparison-context.webp", "simple-interest-growth-context.webp", "graphing-line-city-context.webp", "function-routing-context.webp", "dilation-studio-context.webp", "residual-observatory-context.webp"]) {
    assert.match(concept, new RegExp(visual.replace(".", "\\.")));
    const asset = await readFile(new URL(`../public/visuals/${visual}`, import.meta.url));
    assert.ok(asset.byteLength > 10_000);
    assert.ok(asset.byteLength < 100_000, `${visual} should stay below 100 KB for mobile delivery`);
    assert.equal((await sharp(asset).metadata()).format, "webp", `${visual} should use WebP`);
  }
  for (const visual of ["operations-sequence-context.webp", "decimal-pattern-context.webp", "fraction-workshop-context.webp", "substitution-machine-context.webp", "exponent-lab-context.webp", "like-terms-sorting-context.webp", "triangle-builder-context.webp", "cross-section-studio-context.webp", "coordinate-route-context.webp", "sphere-tank-context.webp", "difference-squares-workshop-context.webp", "distribution-comparison-context.webp", "real-number-sort-context.webp", "elimination-workshop-context.webp", "rational-exponent-lab-context.webp", "growth-comparison-context.webp", "simple-interest-growth-context.webp", "graphing-line-city-context.webp", "function-routing-context.webp", "dilation-studio-context.webp", "residual-observatory-context.webp", "solution-cases-gallery-context.webp", "inequality-trail-context.webp"]) {
    const asset = await readFile(new URL(`../public/visuals/${visual}`, import.meta.url));
    assert.ok(asset.byteLength < 550_000, `${visual} should remain mobile-friendly`);
  }
  for (const visual of ["math-trail-hero.webp", "signed-numbers-context.webp"]) {
    const asset = await readFile(new URL(`../public/visuals/${visual}`, import.meta.url));
    assert.ok(asset.byteLength < 100_000, `${visual} should stay below 100 KB for mobile delivery`);
  }
  for (const visual of ["frontier-mars-comic-v2.webp", "frontier-deepglass-comic-v2.webp", "frontier-aurora-comic-v2.webp"]) {
    const asset = await readFile(new URL(`../public/visuals/${visual}`, import.meta.url));
    assert.ok(asset.byteLength > 50_000 && asset.byteLength < 180_000, `${visual} should remain a compressed homepage scene`);
    const metadata = await sharp(asset).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 1600);
  }
  for (const visual of ["g7-frontier-mission.webp", "g8-frontier-mission.webp", "g9-frontier-mission.webp"]) {
    const asset = await readFile(new URL(`../public/visuals/${visual}`, import.meta.url));
    assert.ok(asset.byteLength > 150_000 && asset.byteLength < 350_000, `${visual} should keep enough comic detail without slowing a lesson`);
    const metadata = await sharp(asset).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 1440);
    assert.equal(metadata.height, 810);
  }
  for (const model of ["number-line", "symbol-meaning", "sign-pairs", "operation-order", "place-value", "repeating-decimal", "negative-distribute", "root-inverse", "solid-compare", "signed-sum", "subtract-opposite", "signed-rational-quotient", "signed-change", "proportion-table", "origin-proportion", "word-equation", "scale-area", "composite-area", "experimental-probability", "sample-space", "literal-equation", "line-forms", "system-substitution", "system-model", "radical-factor", "like-radicals", "gcf-factor", "factor-chain", "plus-minus-roots", "zero-product", "fit-prediction", "model-choice", "percent", "fraction-equivalence", "fraction-addition", "substitution", "power-steps", "term-structure", "slope", "triangle", "triangle-build", "angles", "scatter", "distribute", "function", "transform", "volume", "cone-volume", "sphere-volume", "cross-section", "coordinate-location", "coordinate-distance", "difference-squares", "balance", "root-bracket", "scientific-scale", "equation-steps", "ratio", "circle", "prism", "probability-scale", "systems-crossing", "solution-cases", "inequality-range", "area-product", "parabola", "exponential", "scale-drawing", "random-sample", "arithmetic-sequence", "quadratic-roots", "surface-area-net", "compound-event", "two-way-table", "exponential-decay", "number-kinds", "system-elimination", "distribution-compare", "rational-exponent", "growth-compare", "simple-interest", "graph-line", "dilation", "residuals"]) assert.match(concept, new RegExp(`model: "${model}"`));
  const contextSceneSource = concept.slice(concept.indexOf("const contextScenes"), concept.indexOf("function mathFor"));
  assert.equal((contextSceneSource.match(/^\s{2}(?:"[^"]+"|[\w-]+): \{/gm) ?? []).length, 126);
  assert.doesNotMatch(home, /expandedSceneCount/);
  for (const representative of ["math-symbols", "signed-numbers", "sign-rules", "order-of-operations", "decimals", "negative-distribution", "repeating-decimals", "square-cube-roots", "mixed-volume", "percent", "fractions", "adding-fractions", "substitution", "g9-evaluate-formulas", "algebra-language", "combining-like-terms", "g7-equivalent-expressions", "g7-proportional-tables", "g7-proportional-graphs", "g7-add-rational-numbers", "g7-subtract-rational-numbers", "g7-multiply-divide-rationals", "g7-rational-word-problems", "g7-equation-word-models", "g7-scale-area", "g7-composite-area", "g7-experimental-probability", "g7-sample-spaces", "g7-percent-decision-chains", "g8-composed-transformations", "g9-algebraic-structure", "g9-literal-equations", "g9-linear-equation-forms", "g9-systems-substitution-g9", "g9-systems-elimination-g9", "g9-system-models", "g9-simplify-radicals", "g9-radical-operations", "g9-greatest-common-factor", "g9-factoring-completely", "g9-solve-by-square-roots", "g9-solve-by-factoring", "g9-polynomial-vocabulary", "g9-add-subtract-polynomials", "g9-scatter-models-g9", "g9-modeling-decisions", "one-step-equations", "distributive-property", "approximating-irrationals", "scientific-notation", "multi-step-equations", "slope-rate", "function-representations", "coordinate-transformations", "pythagorean-theorem", "cylinder-volume", "cone-volume", "sphere-volume", "coordinate-distance", "scatter-plots", "two-way-tables", "rational-irrational", "systems-algebra", "graphing-lines", "function-rules", "dilations-similarity", "g7-unit-rates", "g7-circle-measures", "g7-prism-volume", "g7-probability-scale", "g7-scale-drawings", "g7-random-samples", "g7-surface-area", "g7-compound-events", "g7-discount-markup", "g7-angle-equations", "g7-constructing-triangles", "g7-cross-sections", "g7-compare-distributions", "g7-simple-interest", "g9-systems-by-graphing-g9", "g9-multiply-binomials", "g9-quadratic-graphs", "g9-exponential-growth", "g9-exponential-decay", "g9-arithmetic-sequences", "g9-geometric-sequences", "g9-absolute-value-equations", "g9-difference-squares", "g9-quadratic-formula", "g9-rational-exponents", "g9-linear-vs-exponential", "g9-correlation-residuals"]) {
    assert.match(contextSceneSource, new RegExp(`[" ]${representative}[":]`));
  }
  for (const exactModel of [
    'mathSteps: ["2+3\\\\times4^2", "4^2=16", "3\\\\times16=48", "2+48=50"]',
    'mathSteps: ["0.35", "3\\\\text{ tenths}+5\\\\text{ hundredths}", "\\\\frac{35}{100}=\\\\frac7{20}"]',
    'mathSteps: ["0.\\\\overline{3}", "0.333\\\\ldots", "\\\\frac13"]',
    'mathSteps: ["-3(x^2+y^3)", "-3\\\\cdot x^2=-3x^2", "-3\\\\cdot y^3=-3y^3", "-3x^2-3y^3"]',
    'mathSteps: ["9^2=81", "\\\\sqrt{81}=9", "3^3=27", "\\\\sqrt[3]{27}=3"]',
    'mathSteps: ["r=2,\\\\;h=9", "V_{cyl}=36\\\\pi", "V_{cone}=12\\\\pi", "36\\\\pi-12\\\\pi=24\\\\pi"]',
    'mathSteps: ["-7+3", "|-7|=7", "|3|=3", "7-3=4", "-4"]',
    'mathSteps: ["4-(-3)", "4+(+3)", "7"]',
    'mathSteps: ["(-\\\\frac34)\\\\div\\\\frac12", "\\\\text{different signs}\\\\Rightarrow-", "\\\\frac34\\\\times\\\\frac21=\\\\frac32", "-\\\\frac32"]',
    'mathSteps: ["5\\\\text{ m}", "-12\\\\text{ m}", "5+(-12)", "-7\\\\text{ m}"]',
    'mathSteps: ["r=\\\\text{rides}", "4r", "+3", "4r+3=19", "r=4"]',
    'mathSteps: ["A=lw", "\\\\frac{A}{l}=\\\\frac{lw}{l}", "\\\\frac{A}{l}=w", "w=\\\\frac{A}{l}"]',
    'mathSteps: ["y=2x", "x+y=9", "x+2x=9", "x=3", "(x,y)=(3,6)"]',
    'mathSteps: ["a=\\\\text{adults}", "s=\\\\text{students}", "a+s=20", "10a+6s=152", "(a,s)=(8,12)"]',
    'mathSteps: ["\\\\sqrt{72}", "\\\\sqrt{36\\\\cdot2}", "6\\\\sqrt2"]',
    'mathSteps: ["2\\\\sqrt3+5\\\\sqrt3", "(2+5)\\\\sqrt3", "7\\\\sqrt3"]',
    'mathSteps: ["12x^3+8x^2", "\\\\gcd(12,8)=4", "\\\\min(3,2)=2\\\\Rightarrow x^2", "4x^2(3x+2)"]',
    'mathSteps: ["2x^2-18", "2(x^2-9)", "2(x-3)(x+3)"]',
    'mathSteps: ["(x-2)^2=9", "x-2=\\\\pm3", "x=5", "x=-1"]',
    'mathSteps: ["x^2-5x+6=0", "(x-2)(x-3)=0", "x-2=0\\\\;\\\\text{or}\\\\;x-3=0", "x=2,3"]',
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
  assert.doesNotMatch(home, /featuredFrontierWorlds|frontier-world-cards|frontier-world-card-image/);
  assert.match(home, /loading="lazy"/);
  assert.doesNotMatch(home, /full visual scenes|curriculumStats\.lessons/);
  assert.doesNotMatch(home, /frontier-manifesto|frontier-world-gallery|frontier-recovery|frontier-privacy|frontier-content-proof/);
  assert.doesNotMatch(home, /curriculum\.subtitle|world\.skills\.map/);
  assert.match(home, /graphing-line-city-context\.webp/);
  assert.match(home, /Plot it\. Connect it\. Read the line back/);
  assert.match(home, /Hints and retries are built in/);
  assert.match(home, /No sign-in required/);
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
  assert.match(concept, /root-inverse-context-model/);
  assert.match(concept, /solid-compare-context-model/);
  assert.match(concept, /signed-sum-context-model/);
  assert.match(concept, /subtract-opposite-context-model/);
  assert.match(concept, /signed-rational-quotient-context-model/);
  assert.match(concept, /signed-change-context-model/);
  assert.match(concept, /proportion-table-context-model/);
  assert.match(concept, /origin-proportion-context-model/);
  assert.match(concept, /word-equation-context-model/);
  assert.match(concept, /scale-area-context-model/);
  assert.match(concept, /composite-area-context-model/);
  assert.match(concept, /experimental-probability-context-model/);
  assert.match(concept, /sample-space-context-model/);
  assert.match(concept, /literal-equation-context-model/);
  assert.match(concept, /line-forms-context-model/);
  assert.match(concept, /system-substitution-context-model/);
  assert.match(concept, /system-model-context-model/);
  assert.match(concept, /radical-factor-context-model/);
  assert.match(concept, /like-radicals-context-model/);
  assert.match(concept, /gcf-factor-context-model/);
  assert.match(concept, /factor-chain-context-model/);
  assert.match(concept, /plus-minus-roots-context-model/);
  assert.match(concept, /zero-product-context-model/);
  assert.match(concept, /fit-prediction-context-model/);
  assert.match(concept, /model-choice-context-model/);
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
  assert.match(css, /\.root-inverse-context-model/);
  assert.match(css, /\.solid-compare-context-model/);
  assert.match(css, /\.signed-sum-context-model/);
  assert.match(css, /\.rational-flow-context-model/);
  assert.match(css, /\.signed-rational-quotient-context-model/);
  assert.match(css, /\.signed-change-context-model/);
  assert.match(css, /\.proportion-table-context-model/);
  assert.match(css, /\.origin-proportion-context-model/);
  assert.match(css, /\.word-equation-context-model/);
  assert.match(css, /\.scale-area-context-model/);
  assert.match(css, /\.composite-area-context-model/);
  assert.match(css, /\.experimental-probability-context-model/);
  assert.match(css, /\.sample-space-context-model/);
  assert.match(css, /\.literal-equation-context-model/);
  assert.match(css, /\.line-forms-context-model/);
  assert.match(css, /\.system-substitution-context-model/);
  assert.match(css, /\.system-model-context-model/);
  assert.match(css, /\.algebra-path-context-model/);
  assert.match(css, /\.plus-minus-roots-context-model/);
  assert.match(css, /\.fit-prediction-context-model/);
  assert.match(css, /\.model-choice-context-model/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.fit-prediction-context-model,[\s\S]*\.model-choice-context-model \{ grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.algebra-path-context-model \{ grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.literal-equation-context-model,[\s\S]*\.system-substitution-context-model \{ grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.composite-area-context-model,[\s\S]*\.sample-space-context-model \{ grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.proportion-table-context-model,[\s\S]*\.word-equation-context-model \{ grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.rational-flow-context-model,[\s\S]*grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.root-inverse-context-model \{ grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.symbol-meaning-context-model > div,[\s\S]*\.repeating-decimal-context-model \{ grid-template-columns: 1fr/);
  assert.match(css, /\.coordinate-location-context-model/);
  assert.doesNotMatch(home, /frontier-recovery-board|3 \/ 4 online|Correction earns the key/);
  assert.doesNotMatch(dashboard, /CURRENT QUEST|Continue quest|questMilestone|getQuestMilestone|getNextAchievement|quest-landmark-meter/);
  assert.match(dashboard, /welcomeReady/);
  assert.match(dashboard, /math-welcome-guide/);
  assert.match(dashboard, /Start with \{nextLesson\.title\}/);
  assert.match(dashboard, /Hints \+ retries/);
  assert.match(dashboard, /Start first mission/);
  assert.match(dashboard, /<LessonMissionThumbnail lesson=\{nextLesson\}/);
  assert.doesNotMatch(dashboard, /random codename is the only identity shown|Clear 4 lessons|Stars show fluency|FIRST WIN|First lesson reward preview|Base XP|Start this lesson|<Avatar avatar=/i);
  assert.match(dashboard, /reviewBatchSize/);
  assert.match(dashboard, /YOUR NEXT MOVE · REVIEW READY/);
  assert.match(dashboard, /Start the recall/);
  assert.match(dashboard, /gradeComplete \? <section className="next-card trail-complete-card"/);
  assert.match(dashboard, /activeBossReady \? <section className="next-card boss-priority-card"/);
  assert.match(dashboard, /YOUR NEXT MOVE · BOSS READY/);
  assert.match(dashboard, /You finished what was due/);
  assert.match(dashboard, /featuredLesson/);
  assert.match(dashboard, /mission-primary-cta/);
  assert.match(dashboard, /dailyCardVisible/);
  assert.match(dashboard, /showClaimedReward/);
  assert.match(dashboard, /visibleRegions\.map/);
  assert.match(dashboard, /gradeComplete \|\| !activeRegion \? \[\] : \[activeRegion\]/);
  assert.match(dashboard, /aria-expanded=\{showFullMap\}/);
  assert.match(dashboard, /const \[showFullMap, setShowFullMap\] = useState\(true\)/);
  assert.match(dashboard, /id=\{`region-\$\{region\.id\}`\}/);
  assert.match(dashboard, /completed-summary/);
  assert.match(dashboard, /world-lock-preview/);
  assert.match(dashboard, /world-landmark/);
  assert.match(dashboard, /getRegionLandmark/);
  assert.match(landmarks, /grade7RegionLandmarks/);
  assert.match(landmarks, /grade8RegionLandmarks/);
  assert.match(landmarks, /grade9RegionLandmarks/);
  assert.match(landmarks, /grade10RegionLandmarks/);
  assert.match(landmarks, /grade11RegionLandmarks/);
  assert.match(landmarks, /grade12RegionLandmarks/);
  assert.equal((landmarks.match(/^\s+\d+: \{ src:/gm) ?? []).length, 55);
  assert.match(css, /\.topic-icon-xl/);
  assert.match(css, /\.learning-loop-grid/);
  assert.match(css, /\.feedback-celebration/);
  assert.match(css, /\.mission-primary-cta/);
  assert.match(css, /\.dashboard-grid\.mission-only/);
  assert.match(css, /\.world-card\.completed-summary/);
  assert.match(css, /\.world-lock-preview/);
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
  assert.match(css, /\.welcome-first-mission-copy/);
  assert.match(css, /\.welcome-first-mission-visual/);
  assert.doesNotMatch(css, /\.welcome-route-step|\.welcome-first-win|\.welcome-first-win-rewards/);
  assert.match(css, /\.review-priority-card/);
  assert.match(css, /\.review-priority-orbit/);
  assert.match(css, /\.boss-priority-card/);
  assert.match(css, /\.trail-complete-card/);
  assert.match(css, /\.task-progress/);
  assert.match(css, /\.task-progress-track/);
  assert.doesNotMatch(lesson, /practice-star-path|Stars describe this run/);
  assert.doesNotMatch(lesson, /quest-key-card/);
  assert.match(lesson, /correct in a row!/);
  assert.match(lesson, /Corrected!/);
  assert.match(lesson, /<RecoveryCoach/);
  assert.doesNotMatch(lesson, /This is enough for today/);
  assert.match(lesson, /Start the next lesson/);
  assert.doesNotMatch(lesson, /Stars and XP details/);
  assert.doesNotMatch(lesson, /Everything is saved/);
  assert.match(lesson, /achievementUnlockedBetween/);
  assert.match(landmarkUnlock, /settlement-landmark/);
  assert.match(lesson, /<PrivateLandmarkUnlock/);
  assert.match(boss, /achievementTotalsForState/);
  assert.match(boss, /landmark\?\.source === "bosses"/);
  assert.match(boss, /<PrivateLandmarkUnlock/);
  assert.match(dashboard, /achievementTotalsForState/);
  assert.match(dashboard, /landmark\?\.source === "streak"/);
  assert.match(dashboard, /<PrivateLandmarkUnlock achievement=\{rewardLandmark\}/);
  assert.match(landmarkUnlock, /NEW ACHIEVEMENT/);
  assert.match(landmarkUnlock, /View achievements/);
  assert.match(landmarkUnlock, /#achievement-heading/);
  assert.doesNotMatch(lesson, /className="reward-strip"/);
  assert.doesNotMatch(lesson, /className="unlock-path"/);
  assert.match(css, /\.game-loop-board/);
  assert.match(css, /\.game-quest-path/);
  assert.doesNotMatch(css, /\.practice-star-path/);
  assert.doesNotMatch(css, /\.quest-key-card/);
  assert.match(css, /\.recovery-coach/);
  assert.doesNotMatch(css, /\.recovery-score-path/);
  assert.doesNotMatch(css, /\.mastery-next-goal/);
  assert.match(css, /\.completion-earnings/);
  assert.match(css, /\.settlement-next/);
  assert.doesNotMatch(css, /\.settlement-details/);
  assert.doesNotMatch(css, /\.settlement-save-note/);
  assert.match(css, /\.settlement-landmark/);
  assert.match(review, /review-finish-emblem/);
  assert.match(review, /skills back online/);
  assert.match(review, /<TopicIcon visual=\{questionLesson\.visual\}/);
  assert.match(review, /<TaskProgress label="Review progress"/);
  assert.doesNotMatch(review, /review-memory-meter|RECALL STATUS/);
  assert.match(review, /Recalled correctly!/);
  assert.match(review, /Corrected!/);
  assert.match(review, /REVIEW · ALL CLEAR/);
  assert.match(review, /review-stop-note/);
  assert.doesNotMatch(review, /SESSION WIN SAVED|PROGRESS SAVED/);
  assert.match(review, /You can stop here/);
  assert.match(review, /suggestedLesson/);
  assert.match(boss, /isFinalRegion/);
  assert.match(boss, /repair-progress/);
  assert.match(boss, /repairRestored/);
  assert.match(boss, /First repair locked in/);
  assert.match(boss, /Hearts full\. Method repaired/);
  assert.match(boss, /Retry boss with full hearts/);
  assert.match(boss, /boss-\$\{region\.id\}-hearts-restored/);
  assert.match(boss, /showHint && feedback !== "incorrect"/);
  assert.match(boss, /boss-connection-map/);
  assert.match(boss, /SKILL MAP/);
  assert.match(boss, /A correction keeps the map moving/);
  assert.match(boss, /bossXpEarned/);
  assert.match(boss, /completion-earnings/);
  assert.doesNotMatch(boss, /Every skill remains open to revisit/);
  assert.match(boss, /NEXT REGION UNLOCKED/);
  assert.doesNotMatch(boss, /Everything is saved/);
  assert.doesNotMatch(boss, /This is enough for today|REGION CONNECTION|WHOLE TRAIL COMPLETE/);
  assert.doesNotMatch(boss, /className="reward-strip"/);
  assert.doesNotMatch(boss, /className="unlock-path boss-unlock"/);
  assert.doesNotMatch(css, /\.review-memory-path/);
  assert.doesNotMatch(css, /\.review-memory-meter/);
  assert.doesNotMatch(css, /\.review-memory-nodes/);
  assert.match(css, /\.review-clear-state/);
  assert.doesNotMatch(css, /\.session-save-card/);
  assert.match(css, /\.review-stop-note/);
  assert.match(css, /\.review-finish-actions/);
  assert.match(css, /\.repair-progress/);
  assert.match(css, /\.repair-checkpoint/);
  assert.match(css, /\.repair-restored-card/);
  assert.match(css, /\.repair-restored-path/);
  assert.match(css, /\.boss-connection-map/);
  assert.match(css, /\.boss-connection-nodes/);
  assert.doesNotMatch(css, /\.boss-victory-map/);
  assert.doesNotMatch(css, /\.boss-victory-route/);
  assert.doesNotMatch(css, /\.boss-settlement-summary/);
  assert.doesNotMatch(css, /\.boss-next-region/);
  assert.match(css, /\.boss-victory-actions/);
  assert.match(profile, /evaluateAchievements/);
  assert.match(achievementsSource, /achievementSpecs/);
  assert.match(profile, />Achievements</);
  for (const achievement of ["First Step", "Twelve Sparks", "Boss Link", "Steady Week", "Trail Builder", "Boss Pathfinder"]) assert.match(achievementsSource, new RegExp(achievement));
  assert.doesNotMatch(profile, /QUEST TROPHIES|Private collection|Only you can open it|\/ 500/);
  assert.match(css, /\.achievement-section/);
  assert.match(css, /\.achievement-grid/);
  assert.match(css, /\.achievement-badge/);
  assert.match(css, /@media \(max-width: 380px\)[\s\S]*\.achievement-grid/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.mission-primary-cta \{ width: 100%; min-height: 62px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.world-card\.completed-summary \{ grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.welcome-trail-guide \{[^}]*grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*\.game-quest-path/);
  assert.match(css, /@media \(max-width: 380px\)[\s\S]*\.hero-float-practice/);
});

test("gives every lesson an applied mission and a sourced history finish", async () => {
  const lessonMission = await readFile(new URL("../app/components/LessonMissionStory.tsx", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/components/LearningDashboard.tsx", import.meta.url), "utf8");
  const favicon = await readFile(new URL("../public/favicon.svg", import.meta.url), "utf8");
  const faviconIco = await readFile(new URL("../public/favicon.ico", import.meta.url));
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const experiences = lessons.map(getLessonExperience);

  assert.equal(experiences.length, 253);
  assert.deepEqual(new Set(experiences.map((item) => item.scene)), new Set(["numbers", "resources", "systems", "navigation", "habitat", "risk", "growth", "motion", "proof", "signal", "orbit", "accumulation", "network"]));
  for (const experience of experiences) {
    assert.ok(experience.title.length > 20);
    assert.ok(experience.problem.length > 40);
    assert.ok(experience.model.length > 0);
    assert.match(experience.history.sourceUrl, /^https:\/\/mathshistory\.st-andrews\.ac\.uk\//);
    assert.ok(experience.history.story.length > 50);
    assert.ok(experience.history.connection.length > 40);
  }
  assert.match(lessonMission, /MISSION MODEL/);
  assert.match(lessonMission, /WHY THIS IDEA EXISTS/);
  assert.match(lessonMission, /scene === "proof"/);
  assert.match(lessonMission, /scene === "signal"/);
  assert.match(lessonMission, /scene === "orbit"/);
  assert.match(lessonMission, /scene === "accumulation"/);
  assert.match(lessonMission, /scene === "network"/);
  const advancedExperiences = lessons.filter((lesson) => lesson.grade >= 10).map(getLessonExperience);
  assert.equal(new Set(advancedExperiences.map((item) => item.kicker)).size, 24);
  assert.match(dashboard, /Start first mission/);
  assert.match(dashboard, /<LessonMissionThumbnail lesson=\{nextLesson\}/);
  assert.match(dashboard, /<LessonMissionThumbnail lesson=\{featuredLesson\}/);
  assert.doesNotMatch(dashboard, /GradeMissionOverview|dashboard-summary|dashboard-world-heading|Move across Mars/);
  assert.match(favicon, /<title id="title">Math Frontier<\/title>/);
  assert.match(favicon, /stroke="#4c8dff"/);
  assert.equal(faviconIco.subarray(0, 4).toString("hex"), "00000100");
  assert.ok(faviconIco.byteLength > 1_000);
  assert.match(layout, /icons: \{ icon: \[\{ url: "\/favicon\.svg"/);
});
