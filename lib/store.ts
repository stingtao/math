import { ensureSchema, getStore } from "@/db/bootstrap";
import { getGradeCurriculum, isAnswerCorrect, lessons, regions } from "@/lib/curriculum";
import { getCookie, randomToken, sha256 } from "@/lib/security";

const adjectives = ["Calm", "Bright", "Brave", "Clever", "Curious", "Gentle", "Kind", "Nimble", "Quiet", "Swift", "Wise", "Bold"];
const nouns = ["Comet", "Compass", "Cedar", "Falcon", "Harbor", "Lantern", "Orbit", "Panda", "Pebble", "River", "Sparrow", "Summit"];
const glyphs = ["compass", "orbit", "spark", "summit", "wave", "prism"];
const tones = ["blue", "teal", "coral", "violet", "gold"];
const rewardTokens = [10, 12, 14, 16, 18, 20, 30];

export type LearnerRow = { id: string; timezone: string; age_confirmed_at: string | null };
export type ProfileRow = {
  nickname: string;
  avatar_glyph: string;
  avatar_tone: string;
  frame: string;
  reroll_used: number;
  leaderboard_opt_in: number;
  trail_tokens: number;
  current_streak: number;
  longest_streak: number;
  streak_shields: number;
  reward_step: number;
  last_active_date: string | null;
};

function pick<T>(items: T[]) {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return items[bytes[0] % items.length];
}

function randomNickname() {
  const bytes = new Uint16Array(1);
  crypto.getRandomValues(bytes);
  return `${pick(adjectives)}${pick(nouns)}${String(bytes[0] % 1000).padStart(3, "0")}`;
}

export async function listFeedback(limit = 50) {
  await ensureSchema();
  const result = await getStore().prepare("SELECT id, nickname, body, created_at FROM feedback_messages ORDER BY created_at DESC LIMIT ?")
    .bind(Math.min(50, Math.max(1, limit))).all<{ id: string; nickname: string; body: string; created_at: string }>();
  return result.results;
}

export async function createFeedback(requestKey: string | null, body: string) {
  if (!requestKey || requestKey.length < 12 || requestKey.length > 120) throw new Error("A valid idempotency key is required.");
  const message = body.trim().replace(/\s+/g, " ");
  if (message.length < 3 || message.length > 600) throw new Error("Feedback must be between 3 and 600 characters.");
  if (/https?:\/\/|www\./i.test(message)) throw new Error("Please leave links out of public feedback.");
  await ensureSchema();
  const id = crypto.randomUUID();
  const requestKeyHash = await sha256(requestKey);
  await getStore().prepare("INSERT OR IGNORE INTO feedback_messages (id, request_key_hash, nickname, body, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, requestKeyHash, randomNickname(), message, new Date().toISOString()).run();
  return id;
}

export function weekKey(date = new Date()) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() - day + 1);
  return value.toISOString().slice(0, 10);
}

export function localDate(timezone: string, date = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function dayDifference(previous: string, current: string) {
  return Math.round((Date.parse(`${current}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`)) / 86_400_000);
}

export async function getOrCreateLearner(authKey: string, timezone = "UTC", ageConfirmed = false) {
  await ensureSchema();
  const db = getStore();
  const now = new Date().toISOString();
  let learner = await db.prepare("SELECT id, timezone, age_confirmed_at FROM learners WHERE auth_key = ?").bind(authKey).first<LearnerRow>();
  if (!learner) {
    const id = crypto.randomUUID();
    await db.batch([
      db.prepare("INSERT INTO learners (id, auth_key, timezone, age_confirmed_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, authKey, timezone, ageConfirmed ? now : null, now, now),
      db.prepare("INSERT INTO public_profiles (learner_id, nickname, avatar_glyph, avatar_tone) VALUES (?, ?, ?, ?)").bind(id, randomNickname(), pick(glyphs), pick(tones)),
    ]);
    learner = { id, timezone, age_confirmed_at: ageConfirmed ? now : null };
  } else {
    await db.prepare("UPDATE learners SET last_seen_at = ?, timezone = CASE WHEN timezone = 'UTC' THEN ? ELSE timezone END, age_confirmed_at = COALESCE(age_confirmed_at, ?) WHERE id = ?")
      .bind(now, timezone, ageConfirmed ? now : null, learner.id).run();
  }
  return learner;
}

export async function createSession(learnerId: string) {
  await ensureSchema();
  const token = randomToken();
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 86_400_000).toISOString();
  await getStore().prepare("INSERT INTO sessions (token_hash, learner_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash, learnerId, expiresAt, now.toISOString()).run();
  return token;
}

export async function learnerFromRequest(request: Request) {
  const token = getCookie(request, "math_session");
  if (!token) return null;
  await ensureSchema();
  const tokenHash = await sha256(token);
  const learner = await getStore().prepare(`SELECT l.id, l.timezone, l.age_confirmed_at
    FROM sessions s JOIN learners l ON l.id = s.learner_id
    WHERE s.token_hash = ? AND s.expires_at > ?`).bind(tokenHash, new Date().toISOString()).first<LearnerRow>();
  return learner ?? null;
}

export async function deleteSessionFromRequest(request: Request) {
  const token = getCookie(request, "math_session");
  if (!token) return;
  await ensureSchema();
  await getStore().prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
}

export async function getLearnerState(learnerId: string) {
  await ensureSchema();
  const db = getStore();
  const [profile, progressResult, bossResult, xp, weekly, dueReview] = await Promise.all([
    db.prepare("SELECT nickname, avatar_glyph, avatar_tone, frame, reroll_used, leaderboard_opt_in, trail_tokens, current_streak, longest_streak, streak_shields, reward_step, last_active_date FROM public_profiles WHERE learner_id = ?").bind(learnerId).first<ProfileRow>(),
    db.prepare("SELECT lesson_id, stars, first_correct_count, completed_at FROM lesson_progress WHERE learner_id = ? ORDER BY completed_at").bind(learnerId).all<{ lesson_id: string; stars: number; first_correct_count: number; completed_at: string }>(),
    db.prepare("SELECT region_id, cleared, best_hearts FROM boss_progress WHERE learner_id = ?").bind(learnerId).all<{ region_id: number; cleared: number; best_hearts: number }>(),
    db.prepare("SELECT COALESCE(SUM(xp), 0) AS total FROM xp_events WHERE learner_id = ?").bind(learnerId).first<{ total: number }>(),
    db.prepare("SELECT COALESCE(SUM(xp), 0) AS total FROM xp_events WHERE learner_id = ? AND week_key = ?").bind(learnerId, weekKey()).first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) AS total FROM review_items WHERE learner_id = ? AND due_at <= ?").bind(learnerId, new Date().toISOString()).first<{ total: number }>(),
  ]);
  if (!profile) throw new Error("Anonymous profile is missing.");
  if (profile.leaderboard_opt_in) await ensureLeagueMembership(learnerId);
  const learner = await db.prepare("SELECT timezone FROM learners WHERE id = ?").bind(learnerId).first<{ timezone: string }>();
  const todayReward = await db.prepare("SELECT 1 AS claimed FROM daily_rewards WHERE learner_id = ? AND local_date = ?")
    .bind(learnerId, localDate(learner?.timezone ?? "UTC")).first<{ claimed: number }>();
  const completed = new Map(progressResult.results.map((item) => [item.lesson_id, item]));
  const next = lessons.find((item) => !completed.has(item.id)) ?? lessons[lessons.length - 1];
  return {
    profile: {
      nickname: profile.nickname,
      avatar: { glyph: profile.avatar_glyph, tone: profile.avatar_tone, frame: profile.frame },
      rerollUsed: Boolean(profile.reroll_used),
      leaderboardOptIn: Boolean(profile.leaderboard_opt_in),
      trailTokens: profile.trail_tokens,
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      streakShields: profile.streak_shields,
      rewardStep: profile.reward_step,
    },
    completedLessons: progressResult.results.map((item) => ({ id: item.lesson_id, stars: item.stars })),
    clearedBosses: bossResult.results.filter((item) => item.cleared).map((item) => ({ regionId: item.region_id, hearts: item.best_hearts })),
    totalXp: Number(xp?.total ?? 0),
    weeklyXp: Number(weekly?.total ?? 0),
    dueReview: Math.min(Number(dueReview?.total ?? 0), 5),
    dailyRewardClaimed: Boolean(todayReward),
    nextLessonId: next.id,
  };
}

export async function assertLessonUnlocked(learnerId: string, lessonId: string) {
  await ensureSchema();
  const lesson = lessons.find((item) => item.id === lessonId);
  if (!lesson) throw new Error("Lesson not found.");
  const db = getStore();
  const alreadyComplete = await db.prepare("SELECT 1 AS complete FROM lesson_progress WHERE learner_id = ? AND lesson_id = ?")
    .bind(learnerId, lesson.id).first<{ complete: number }>();
  if (alreadyComplete) return lesson;
  const curriculum = getGradeCurriculum(lesson.grade);
  const regionIndex = curriculum.regions.findIndex((item) => item.id === lesson.regionId);
  const region = curriculum.regions[regionIndex];
  if (!region) throw new Error("Lesson region not found.");
  if (regionIndex > 0) {
    const priorBoss = await db.prepare("SELECT cleared FROM boss_progress WHERE learner_id = ? AND region_id = ?")
      .bind(learnerId, curriculum.regions[regionIndex - 1].id).first<{ cleared: number }>();
    if (!priorBoss?.cleared) throw new Error("Clear the previous region boss first.");
  }
  if (lesson.order > 1) {
    const priorLesson = region.lessons[lesson.order - 2];
    const priorComplete = await db.prepare("SELECT 1 AS complete FROM lesson_progress WHERE learner_id = ? AND lesson_id = ?")
      .bind(learnerId, priorLesson.id).first<{ complete: number }>();
    if (!priorComplete) throw new Error("Complete the previous lesson first.");
  }
  return lesson;
}

export async function recordAnswer(learnerId: string, lessonId: string, questionId: string, correct: boolean, usedHint: boolean) {
  await ensureSchema();
  await assertLessonUnlocked(learnerId, lessonId);
  const db = getStore();
  const now = new Date();
  const current = await db.prepare("SELECT first_correct, corrected, attempts, hints_used FROM lesson_attempts WHERE learner_id = ? AND lesson_id = ? AND question_id = ?")
    .bind(learnerId, lessonId, questionId).first<{ first_correct: number; corrected: number; attempts: number; hints_used: number }>();
  if (!current) {
    await db.prepare("INSERT INTO lesson_attempts (learner_id, lesson_id, question_id, first_correct, corrected, hints_used, attempts, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)")
      .bind(learnerId, lessonId, questionId, correct ? 1 : 0, correct ? 1 : 0, usedHint ? 1 : 0, now.toISOString()).run();
  } else {
    await db.prepare("UPDATE lesson_attempts SET corrected = ?, attempts = attempts + 1, hints_used = hints_used + ?, updated_at = ? WHERE learner_id = ? AND lesson_id = ? AND question_id = ?")
      .bind(current.corrected || correct ? 1 : 0, usedHint ? 1 : 0, now.toISOString(), learnerId, lessonId, questionId).run();
  }
  if (!correct || usedHint) {
    const due = new Date(now.getTime() + 86_400_000).toISOString();
    await db.prepare("INSERT INTO review_items (learner_id, lesson_id, question_id, stage, due_at) VALUES (?, ?, ?, 0, ?) ON CONFLICT(learner_id, lesson_id, question_id) DO UPDATE SET due_at = excluded.due_at")
      .bind(learnerId, lessonId, questionId, due).run();
  }
}

export async function claimMutation(learnerId: string, key: string | null, route: string) {
  if (!key || key.length < 12 || key.length > 120) throw new Error("A valid idempotency key is required.");
  await ensureSchema();
  const result = await getStore().prepare("INSERT OR IGNORE INTO mutation_keys (learner_id, key, route, created_at) VALUES (?, ?, ?, ?)")
    .bind(learnerId, key, route, new Date().toISOString()).run();
  return Boolean(result.meta.changes);
}

async function awardXp(learnerId: string, kind: string, refId: string, amount: number) {
  const db = getStore();
  const id = `${learnerId}:${kind}:${refId}`;
  await db.prepare("INSERT OR IGNORE INTO xp_events (id, learner_id, kind, ref_id, xp, week_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, learnerId, kind, refId, amount, weekKey(), new Date().toISOString()).run();
}

export async function getDueReviewItems(learnerId: string) {
  await ensureSchema();
  const result = await getStore().prepare("SELECT lesson_id, question_id, stage FROM review_items WHERE learner_id = ? AND due_at <= ? ORDER BY due_at LIMIT 5")
    .bind(learnerId, new Date().toISOString()).all<{ lesson_id: string; question_id: string; stage: number }>();
  return result.results;
}

export async function completeReviewSet(learnerId: string, results: Array<{ lessonId: string; questionId: string; correct: boolean }>, rewardDate: string) {
  await ensureSchema();
  const db = getStore();
  const now = new Date();
  const intervals = [1, 3, 7, 14];
  for (const result of results) {
    const row = await db.prepare("SELECT stage FROM review_items WHERE learner_id = ? AND lesson_id = ? AND question_id = ?")
      .bind(learnerId, result.lessonId, result.questionId).first<{ stage: number }>();
    if (!row) continue;
    if (result.correct && row.stage >= 3) {
      await db.prepare("DELETE FROM review_items WHERE learner_id = ? AND lesson_id = ? AND question_id = ?").bind(learnerId, result.lessonId, result.questionId).run();
    } else {
      const nextStage = result.correct ? row.stage + 1 : 0;
      const days = result.correct ? intervals[Math.min(nextStage, intervals.length - 1)] : intervals[0];
      await db.prepare("UPDATE review_items SET stage = ?, due_at = ? WHERE learner_id = ? AND lesson_id = ? AND question_id = ?")
        .bind(nextStage, new Date(now.getTime() + days * 86_400_000).toISOString(), learnerId, result.lessonId, result.questionId).run();
    }
  }
  await awardXp(learnerId, "review", rewardDate, 20);
}

export async function completeLesson(learnerId: string, lessonId: string) {
  await ensureSchema();
  const db = getStore();
  const lesson = await assertLessonUnlocked(learnerId, lessonId);
  const summary = await db.prepare("SELECT COUNT(*) AS total, SUM(first_correct) AS first_correct, SUM(hints_used) AS hints FROM lesson_attempts WHERE learner_id = ? AND lesson_id = ? AND corrected = 1")
    .bind(learnerId, lessonId).first<{ total: number; first_correct: number; hints: number }>();
  if (Number(summary?.total ?? 0) < lesson.practice.length) throw new Error("Correct every practice question before completing the lesson.");
  const firstCorrect = Number(summary?.first_correct ?? 0);
  const stars = firstCorrect === lesson.practice.length && Number(summary?.hints ?? 0) === 0 ? 3 : firstCorrect >= Math.ceil(lesson.practice.length * 0.8) ? 2 : 1;
  await db.prepare("INSERT INTO lesson_progress (learner_id, lesson_id, stars, first_correct_count, completed_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(learner_id, lesson_id) DO UPDATE SET stars = MAX(stars, excluded.stars), first_correct_count = MAX(first_correct_count, excluded.first_correct_count)")
    .bind(learnerId, lessonId, stars, firstCorrect, new Date().toISOString()).run();
  await awardXp(learnerId, "lesson", lessonId, 40 + (stars === 3 ? 10 : stars === 2 ? 5 : 0));
  return { stars };
}

type BossAttemptRow = {
  learner_id: string;
  region_id: number;
  attempt_id: string;
  current_question: number;
  hearts: number;
  failed: number;
  failed_question: number | null;
  repair_step: number;
  cleared: number;
  started_at: string;
  updated_at: string;
};

function validateBossAttemptId(attemptId: string) {
  if (!/^[A-Za-z0-9_-]{12,80}$/.test(attemptId)) throw new Error("Start a new boss attempt first.");
}

function publicBossAttempt(row: BossAttemptRow) {
  return {
    attemptId: row.attempt_id,
    questionIndex: row.current_question,
    hearts: row.hearts,
    failed: Boolean(row.failed),
    failedQuestion: row.failed_question,
    repairStep: row.repair_step,
    cleared: Boolean(row.cleared),
  };
}

export async function assertBossUnlocked(learnerId: string, regionId: number) {
  await ensureSchema();
  const region = regions.find((item) => item.id === regionId);
  if (!region) throw new Error("Region not found.");
  const placeholders = region.lessons.map(() => "?").join(",");
  const completed = await getStore().prepare(`SELECT COUNT(*) AS total FROM lesson_progress WHERE learner_id = ? AND lesson_id IN (${placeholders})`)
    .bind(learnerId, ...region.lessons.map((item) => item.id)).first<{ total: number }>();
  if (Number(completed?.total ?? 0) < region.lessons.length) throw new Error("Complete all four lessons first.");
  return region;
}

export async function getActiveBossAttempt(learnerId: string, regionId: number) {
  await ensureSchema();
  const row = await getStore().prepare(`SELECT learner_id, region_id, attempt_id, current_question, hearts, failed, failed_question, repair_step, cleared, started_at, updated_at
    FROM boss_attempts WHERE learner_id = ? AND region_id = ? AND cleared = 0 ORDER BY updated_at DESC LIMIT 1`)
    .bind(learnerId, regionId).first<BossAttemptRow>();
  return row ? publicBossAttempt(row) : null;
}

async function getOrCreateBossAttempt(learnerId: string, regionId: number, attemptId: string) {
  validateBossAttemptId(attemptId);
  await assertBossUnlocked(learnerId, regionId);
  const db = getStore();
  const active = await db.prepare(`SELECT learner_id, region_id, attempt_id, current_question, hearts, failed, failed_question, repair_step, cleared, started_at, updated_at
    FROM boss_attempts WHERE learner_id = ? AND region_id = ? AND cleared = 0 ORDER BY updated_at DESC LIMIT 1`)
    .bind(learnerId, regionId).first<BossAttemptRow>();
  if (active) {
    if (active.attempt_id !== attemptId) throw new Error("Continue the current boss attempt before starting another.");
    return active;
  }
  const now = new Date().toISOString();
  await db.prepare(`INSERT INTO boss_attempts
    (learner_id, region_id, attempt_id, current_question, hearts, failed, repair_step, cleared, started_at, updated_at)
    VALUES (?, ?, ?, 0, 3, 0, 0, 0, ?, ?)`).bind(learnerId, regionId, attemptId, now, now).run();
  return {
    learner_id: learnerId,
    region_id: regionId,
    attempt_id: attemptId,
    current_question: 0,
    hearts: 3,
    failed: 0,
    failed_question: null,
    repair_step: 0,
    cleared: 0,
    started_at: now,
    updated_at: now,
  } satisfies BossAttemptRow;
}

export async function checkBossAnswer(learnerId: string, regionId: number, attemptId: string, questionIndex: number, answer: string) {
  const region = await assertBossUnlocked(learnerId, regionId);
  const questions = [...region.lessons.map((item) => item.practice[0]), region.lessons[0].practice[1]];
  if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= questions.length) throw new Error("Boss question not found.");
  const attempt = await getOrCreateBossAttempt(learnerId, regionId, attemptId);
  if (attempt.failed) return { correct: false, hint: questions[attempt.current_question]?.hint ?? "Complete the repair questions first.", ...publicBossAttempt(attempt) };
  if (attempt.current_question !== questionIndex) throw new Error("Continue from the current boss question.");
  const correct = isAnswerCorrect(answer, questions[questionIndex].answer);
  const db = getStore();
  const now = new Date().toISOString();
  if (!correct) {
    const hearts = Math.max(0, attempt.hearts - 1);
    const failed = hearts === 0;
    await db.prepare("UPDATE boss_attempts SET hearts = ?, failed = ?, failed_question = CASE WHEN ? = 1 THEN ? ELSE failed_question END, updated_at = ? WHERE learner_id = ? AND region_id = ? AND attempt_id = ?")
      .bind(hearts, failed ? 1 : 0, failed ? 1 : 0, questionIndex, now, learnerId, regionId, attemptId).run();
    return { correct: false, hint: questions[questionIndex].hint, attemptId, questionIndex, hearts, failed, failedQuestion: failed ? questionIndex : attempt.failed_question, repairStep: attempt.repair_step, cleared: false };
  }
  const nextQuestion = questionIndex + 1;
  const cleared = nextQuestion === questions.length;
  await db.prepare("UPDATE boss_attempts SET current_question = ?, cleared = ?, updated_at = ? WHERE learner_id = ? AND region_id = ? AND attempt_id = ?")
    .bind(nextQuestion, cleared ? 1 : 0, now, learnerId, regionId, attemptId).run();
  if (cleared) await completeBoss(learnerId, regionId, attempt.hearts);
  return { correct: true, hint: null, attemptId, questionIndex: nextQuestion, hearts: attempt.hearts, failed: false, failedQuestion: null, repairStep: 0, cleared };
}

export async function checkBossRepairAnswer(learnerId: string, regionId: number, attemptId: string, repairIndex: number, answer: string) {
  const region = await assertBossUnlocked(learnerId, regionId);
  validateBossAttemptId(attemptId);
  const db = getStore();
  const attempt = await db.prepare(`SELECT learner_id, region_id, attempt_id, current_question, hearts, failed, failed_question, repair_step, cleared, started_at, updated_at
    FROM boss_attempts WHERE learner_id = ? AND region_id = ? AND attempt_id = ?`).bind(learnerId, regionId, attemptId).first<BossAttemptRow>();
  if (!attempt || !attempt.failed || attempt.failed_question === null) throw new Error("This boss attempt does not need repair.");
  if (repairIndex !== attempt.repair_step || repairIndex < 0 || repairIndex > 1) throw new Error("Complete the repair questions in order.");
  const lesson = region.lessons[Math.min(attempt.failed_question, region.lessons.length - 1)];
  const question = lesson.practice[repairIndex + 2];
  const correct = isAnswerCorrect(answer, question.answer);
  if (!correct) return { correct: false, hint: question.hint, ...publicBossAttempt(attempt), repaired: false };
  const repaired = repairIndex === 1;
  const now = new Date().toISOString();
  if (repaired) {
    await db.prepare("UPDATE boss_attempts SET current_question = 0, hearts = 3, failed = 0, failed_question = NULL, repair_step = 0, updated_at = ? WHERE learner_id = ? AND region_id = ? AND attempt_id = ?")
      .bind(now, learnerId, regionId, attemptId).run();
  } else {
    await db.prepare("UPDATE boss_attempts SET repair_step = 1, updated_at = ? WHERE learner_id = ? AND region_id = ? AND attempt_id = ?")
      .bind(now, learnerId, regionId, attemptId).run();
  }
  return { correct: true, hint: null, attemptId, questionIndex: repaired ? 0 : attempt.current_question, hearts: repaired ? 3 : attempt.hearts, failed: !repaired, failedQuestion: repaired ? null : attempt.failed_question, repairStep: repaired ? 0 : 1, cleared: false, repaired };
}

export async function completeBoss(learnerId: string, regionId: number, hearts: number) {
  await ensureSchema();
  const db = getStore();
  await assertBossUnlocked(learnerId, regionId);
  await db.prepare("INSERT INTO boss_progress (learner_id, region_id, cleared, best_hearts, cleared_at) VALUES (?, ?, 1, ?, ?) ON CONFLICT(learner_id, region_id) DO UPDATE SET cleared = 1, best_hearts = MAX(best_hearts, excluded.best_hearts), cleared_at = COALESCE(cleared_at, excluded.cleared_at)")
    .bind(learnerId, regionId, hearts, new Date().toISOString()).run();
  await awardXp(learnerId, "boss", String(regionId), 100);
}

export async function claimDailyReward(learnerId: string, timezone: string) {
  await ensureSchema();
  const db = getStore();
  const profile = await db.prepare("SELECT reward_step, last_active_date, current_streak, longest_streak, streak_shields FROM public_profiles WHERE learner_id = ?")
    .bind(learnerId).first<{ reward_step: number; last_active_date: string | null; current_streak: number; longest_streak: number; streak_shields: number }>();
  if (!profile) throw new Error("Profile not found.");
  const today = localDate(timezone);
  const existing = await db.prepare("SELECT tokens, reward_step FROM daily_rewards WHERE learner_id = ? AND local_date = ?").bind(learnerId, today).first<{ tokens: number; reward_step: number }>();
  if (existing) return { claimed: false, tokens: existing.tokens, step: existing.reward_step };
  const step = (profile.reward_step % 7) + 1;
  const tokens = rewardTokens[step - 1];
  let streak = 1;
  let shields = profile.streak_shields;
  if (profile.last_active_date) {
    const gap = dayDifference(profile.last_active_date, today);
    if (gap === 0) streak = profile.current_streak;
    else if (gap === 1) streak = profile.current_streak + 1;
    else if (gap === 2 && shields > 0) { streak = profile.current_streak + 1; shields -= 1; }
  }
  if (step === 7) shields += 1;
  const inserted = await db.prepare("INSERT OR IGNORE INTO daily_rewards (learner_id, local_date, reward_step, tokens, claimed_at) VALUES (?, ?, ?, ?, ?)")
    .bind(learnerId, today, step, tokens, new Date().toISOString()).run();
  if (!inserted.meta.changes) {
    const claimed = await db.prepare("SELECT tokens, reward_step FROM daily_rewards WHERE learner_id = ? AND local_date = ?")
      .bind(learnerId, today).first<{ tokens: number; reward_step: number }>();
    return { claimed: false, tokens: claimed?.tokens ?? tokens, step: claimed?.reward_step ?? step };
  }
  await db.prepare("UPDATE public_profiles SET trail_tokens = trail_tokens + ?, reward_step = ?, current_streak = ?, longest_streak = MAX(longest_streak, ?), streak_shields = ?, last_active_date = ? WHERE learner_id = ?")
    .bind(tokens, step, streak, streak, shields, today, learnerId).run();
  return { claimed: true, tokens, step, shield: step === 7 };
}

export async function updateProfile(learnerId: string, action: "reroll" | "leaderboard", enabled?: boolean) {
  await ensureSchema();
  const db = getStore();
  if (action === "reroll") {
    const result = await db.prepare("UPDATE public_profiles SET nickname = ?, avatar_glyph = ?, avatar_tone = ?, reroll_used = 1 WHERE learner_id = ? AND reroll_used = 0")
      .bind(randomNickname(), pick(glyphs), pick(tones), learnerId).run();
    if (!result.meta.changes) throw new Error("Your free identity reroll has already been used.");
  } else {
    await db.prepare("UPDATE public_profiles SET leaderboard_opt_in = ? WHERE learner_id = ?").bind(enabled ? 1 : 0, learnerId).run();
    if (enabled) await ensureLeagueMembership(learnerId);
  }
}

async function ensureLeagueMembership(learnerId: string) {
  const db = getStore();
  const week = weekKey();
  const existing = await db.prepare("SELECT league_id FROM league_members WHERE week_key = ? AND learner_id = ?").bind(week, learnerId).first<{ league_id: string }>();
  if (existing) return existing.league_id;
  const open = await db.prepare(`SELECT league_id, COUNT(*) AS members FROM league_members WHERE week_key = ? GROUP BY league_id HAVING COUNT(*) < 30 ORDER BY league_id LIMIT 1`)
    .bind(week).first<{ league_id: string; members: number }>();
  let leagueId = open?.league_id;
  if (!leagueId) {
    const total = await db.prepare("SELECT COUNT(*) AS total FROM league_members WHERE week_key = ?").bind(week).first<{ total: number }>();
    leagueId = `league-${Math.floor(Number(total?.total ?? 0) / 30) + 1}`;
  }
  await db.prepare("INSERT OR IGNORE INTO league_members (week_key, league_id, learner_id, joined_at) VALUES (?, ?, ?, ?)")
    .bind(week, leagueId, learnerId, new Date().toISOString()).run();
  return leagueId;
}

export async function purchaseFrame(learnerId: string, frame: string) {
  await ensureSchema();
  const costs: Record<string, number> = { halo: 30, summit: 60, prism: 90 };
  const cost = costs[frame];
  if (!cost) throw new Error("Frame not found.");
  const result = await getStore().prepare("UPDATE public_profiles SET trail_tokens = trail_tokens - ?, frame = ? WHERE learner_id = ? AND trail_tokens >= ?")
    .bind(cost, frame, learnerId, cost).run();
  if (!result.meta.changes) throw new Error("Keep learning to earn enough Trail Tokens.");
}

export async function deleteLearner(learnerId: string) {
  await ensureSchema();
  await getStore().prepare("DELETE FROM learners WHERE id = ?").bind(learnerId).run();
}

export async function getLeaderboard(limit = 30) {
  await ensureSchema();
  const currentWeek = weekKey();
  const result = await getStore().prepare(`SELECT p.nickname, p.avatar_glyph, p.avatar_tone, p.frame, SUM(x.xp) AS weekly_xp,
      SUM(CASE WHEN x.kind = 'boss' THEN 1 ELSE 0 END) AS bosses
    FROM xp_events x JOIN public_profiles p ON p.learner_id = x.learner_id
    WHERE x.week_key = ? AND p.leaderboard_opt_in = 1
    GROUP BY x.learner_id, p.nickname, p.avatar_glyph, p.avatar_tone, p.frame
    ORDER BY weekly_xp DESC, bosses DESC, p.nickname ASC LIMIT ?`).bind(currentWeek, Math.min(limit, 30)).all<{ nickname: string; avatar_glyph: string; avatar_tone: string; frame: string; weekly_xp: number }>();
  return result.results.map((entry, index) => ({
    rank: index + 1,
    nickname: entry.nickname,
    avatar: { glyph: entry.avatar_glyph, tone: entry.avatar_tone, frame: entry.frame },
    weeklyXp: Number(entry.weekly_xp),
  }));
}

export async function getLearnerLeaderboard(learnerId: string) {
  await ensureSchema();
  const week = weekKey();
  const leagueId = await ensureLeagueMembership(learnerId);
  const result = await getStore().prepare(`SELECT p.nickname, p.avatar_glyph, p.avatar_tone, p.frame, COALESCE(SUM(x.xp), 0) AS weekly_xp,
      SUM(CASE WHEN x.kind = 'boss' THEN 1 ELSE 0 END) AS bosses
    FROM league_members m JOIN public_profiles p ON p.learner_id = m.learner_id
    LEFT JOIN xp_events x ON x.learner_id = m.learner_id AND x.week_key = m.week_key
    WHERE m.week_key = ? AND m.league_id = ? AND p.leaderboard_opt_in = 1
    GROUP BY m.learner_id, p.nickname, p.avatar_glyph, p.avatar_tone, p.frame
    ORDER BY weekly_xp DESC, bosses DESC, p.nickname ASC LIMIT 30`).bind(week, leagueId).all<{ nickname: string; avatar_glyph: string; avatar_tone: string; frame: string; weekly_xp: number }>();
  return result.results.map((entry, index) => ({ rank: index + 1, nickname: entry.nickname, avatar: { glyph: entry.avatar_glyph, tone: entry.avatar_tone, frame: entry.frame }, weeklyXp: Number(entry.weekly_xp) }));
}

export async function isLeaderboardParticipant(learnerId: string) {
  await ensureSchema();
  const profile = await getStore().prepare("SELECT leaderboard_opt_in FROM public_profiles WHERE learner_id = ?")
    .bind(learnerId).first<{ leaderboard_opt_in: number }>();
  return Boolean(profile?.leaderboard_opt_in);
}
