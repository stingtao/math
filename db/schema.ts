import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const learners = sqliteTable("learners", {
  id: text("id").primaryKey(),
  authKey: text("auth_key").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  ageConfirmedAt: text("age_confirmed_at"),
  createdAt: text("created_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
}, (table) => [uniqueIndex("idx_learners_auth_key").on(table.authKey)]);

export const publicProfiles = sqliteTable("public_profiles", {
  learnerId: text("learner_id").primaryKey().references(() => learners.id, { onDelete: "cascade" }),
  nickname: text("nickname").notNull(),
  avatarGlyph: text("avatar_glyph").notNull(),
  avatarTone: text("avatar_tone").notNull(),
  frame: text("frame").notNull().default("plain"),
  rerollUsed: integer("reroll_used", { mode: "boolean" }).notNull().default(false),
  leaderboardOptIn: integer("leaderboard_opt_in", { mode: "boolean" }).notNull().default(false),
  trailTokens: integer("trail_tokens").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  streakShields: integer("streak_shields").notNull().default(0),
  rewardStep: integer("reward_step").notNull().default(0),
  lastActiveDate: text("last_active_date"),
});

export const avatarFrames = sqliteTable("avatar_frames", {
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  frame: text("frame").notNull(),
  unlockedAt: text("unlocked_at").notNull(),
}, (table) => [primaryKey({ columns: [table.learnerId, table.frame] })]);

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_sessions_learner_id").on(table.learnerId), index("idx_sessions_expires_at").on(table.expiresAt)]);

export const lessonAttempts = sqliteTable("lesson_attempts", {
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull(),
  questionId: text("question_id").notNull(),
  firstCorrect: integer("first_correct", { mode: "boolean" }).notNull(),
  corrected: integer("corrected", { mode: "boolean" }).notNull(),
  hintsUsed: integer("hints_used").notNull().default(0),
  attempts: integer("attempts").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.learnerId, table.lessonId, table.questionId] }),
  index("idx_lesson_attempts_lesson").on(table.learnerId, table.lessonId),
]);

export const lessonProgress = sqliteTable("lesson_progress", {
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull(),
  stars: integer("stars").notNull().default(1),
  firstCorrectCount: integer("first_correct_count").notNull().default(0),
  completedAt: text("completed_at").notNull(),
}, (table) => [primaryKey({ columns: [table.learnerId, table.lessonId] }), index("idx_lesson_progress_learner").on(table.learnerId)]);

export const reviewItems = sqliteTable("review_items", {
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull(),
  questionId: text("question_id").notNull(),
  stage: integer("stage").notNull().default(0),
  dueAt: text("due_at").notNull(),
}, (table) => [primaryKey({ columns: [table.learnerId, table.lessonId, table.questionId] }), index("idx_review_due").on(table.learnerId, table.dueAt)]);

export const bossProgress = sqliteTable("boss_progress", {
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  regionId: integer("region_id").notNull(),
  cleared: integer("cleared", { mode: "boolean" }).notNull().default(false),
  bestHearts: integer("best_hearts").notNull().default(0),
  clearedAt: text("cleared_at"),
}, (table) => [primaryKey({ columns: [table.learnerId, table.regionId] })]);

export const bossAttempts = sqliteTable("boss_attempts", {
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  regionId: integer("region_id").notNull(),
  attemptId: text("attempt_id").notNull(),
  currentQuestion: integer("current_question").notNull().default(0),
  hearts: integer("hearts").notNull().default(3),
  failed: integer("failed", { mode: "boolean" }).notNull().default(false),
  failedQuestion: integer("failed_question"),
  repairStep: integer("repair_step").notNull().default(0),
  cleared: integer("cleared", { mode: "boolean" }).notNull().default(false),
  startedAt: text("started_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.learnerId, table.regionId, table.attemptId] }),
  index("idx_boss_attempts_learner").on(table.learnerId, table.updatedAt),
]);

export const xpEvents = sqliteTable("xp_events", {
  id: text("id").primaryKey(),
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  refId: text("ref_id").notNull(),
  xp: integer("xp").notNull(),
  weekKey: text("week_key").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_xp_unique_award").on(table.learnerId, table.kind, table.refId), index("idx_xp_week").on(table.weekKey, table.learnerId)]);

export const dailyRewards = sqliteTable("daily_rewards", {
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  localDate: text("local_date").notNull(),
  rewardStep: integer("reward_step").notNull(),
  tokens: integer("tokens").notNull(),
  claimedAt: text("claimed_at").notNull(),
}, (table) => [primaryKey({ columns: [table.learnerId, table.localDate] })]);

export const mutationKeys = sqliteTable("mutation_keys", {
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  route: text("route").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [primaryKey({ columns: [table.learnerId, table.key] })]);

export const feedbackMessages = sqliteTable("feedback_messages", {
  id: text("id").primaryKey(),
  requestKeyHash: text("request_key_hash").notNull(),
  nickname: text("nickname").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_feedback_request_key").on(table.requestKeyHash), index("idx_feedback_created").on(table.createdAt)]);

export const leagueMembers = sqliteTable("league_members", {
  weekKey: text("week_key").notNull(),
  leagueId: text("league_id").notNull(),
  learnerId: text("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  joinedAt: text("joined_at").notNull(),
}, (table) => [primaryKey({ columns: [table.weekKey, table.learnerId] }), index("idx_league_members_group").on(table.weekKey, table.leagueId)]);
