import { env } from "cloudflare:workers";

type RuntimeEnv = {
  DB?: D1Database;
  GOOGLE_CLIENT_ID?: string;
  AUTH_HMAC_SECRET?: string;
};

export function getRuntimeEnv() {
  return env as RuntimeEnv;
}

export function getStore() {
  const db = getRuntimeEnv().DB;
  if (!db) throw new Error("The DB binding is not available.");
  return db;
}

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, auth_key TEXT NOT NULL UNIQUE, timezone TEXT NOT NULL DEFAULT 'UTC', age_confirmed_at TEXT, created_at TEXT NOT NULL, last_seen_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS public_profiles (learner_id TEXT PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE, nickname TEXT NOT NULL, avatar_glyph TEXT NOT NULL, avatar_tone TEXT NOT NULL, frame TEXT NOT NULL DEFAULT 'plain', reroll_used INTEGER NOT NULL DEFAULT 0, leaderboard_opt_in INTEGER NOT NULL DEFAULT 0, trail_tokens INTEGER NOT NULL DEFAULT 0, current_streak INTEGER NOT NULL DEFAULT 0, longest_streak INTEGER NOT NULL DEFAULT 0, streak_shields INTEGER NOT NULL DEFAULT 0, reward_step INTEGER NOT NULL DEFAULT 0, last_active_date TEXT)`,
  `CREATE TABLE IF NOT EXISTS avatar_frames (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, frame TEXT NOT NULL, unlocked_at TEXT NOT NULL, PRIMARY KEY (learner_id, frame))`,
  `INSERT OR IGNORE INTO avatar_frames (learner_id, frame, unlocked_at) SELECT learner_id, frame, COALESCE(last_active_date, datetime('now')) FROM public_profiles WHERE frame <> 'plain'`,
  `CREATE TABLE IF NOT EXISTS badge_unlocks (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, badge_id TEXT NOT NULL, source TEXT NOT NULL, source_ref TEXT NOT NULL, unlocked_at TEXT NOT NULL, PRIMARY KEY (learner_id, badge_id))`,
  `CREATE TABLE IF NOT EXISTS answer_credits (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, credit_key TEXT NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (learner_id, credit_key))`,
  `CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS lesson_attempts (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, lesson_id TEXT NOT NULL, question_id TEXT NOT NULL, first_correct INTEGER NOT NULL, corrected INTEGER NOT NULL, hints_used INTEGER NOT NULL DEFAULT 0, attempts INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, PRIMARY KEY (learner_id, lesson_id, question_id))`,
  `CREATE TABLE IF NOT EXISTS lesson_runs (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, lesson_id TEXT NOT NULL, run_id TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, started_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (learner_id, lesson_id))`,
  `CREATE TABLE IF NOT EXISTS lesson_progress (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, lesson_id TEXT NOT NULL, stars INTEGER NOT NULL DEFAULT 1, first_correct_count INTEGER NOT NULL DEFAULT 0, completed_at TEXT NOT NULL, PRIMARY KEY (learner_id, lesson_id))`,
  `CREATE TABLE IF NOT EXISTS review_items (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, lesson_id TEXT NOT NULL, question_id TEXT NOT NULL, stage INTEGER NOT NULL DEFAULT 0, due_at TEXT NOT NULL, PRIMARY KEY (learner_id, lesson_id, question_id))`,
  `CREATE TABLE IF NOT EXISTS boss_progress (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, region_id INTEGER NOT NULL, cleared INTEGER NOT NULL DEFAULT 0, best_hearts INTEGER NOT NULL DEFAULT 0, cleared_at TEXT, PRIMARY KEY (learner_id, region_id))`,
  `CREATE TABLE IF NOT EXISTS boss_attempts (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, region_id INTEGER NOT NULL, attempt_id TEXT NOT NULL, current_question INTEGER NOT NULL DEFAULT 0, hearts INTEGER NOT NULL DEFAULT 3, failed INTEGER NOT NULL DEFAULT 0, failed_question INTEGER, repair_step INTEGER NOT NULL DEFAULT 0, cleared INTEGER NOT NULL DEFAULT 0, started_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (learner_id, region_id, attempt_id))`,
  `CREATE TABLE IF NOT EXISTS xp_events (id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, kind TEXT NOT NULL, ref_id TEXT NOT NULL, xp INTEGER NOT NULL, week_key TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS daily_rewards (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, local_date TEXT NOT NULL, reward_step INTEGER NOT NULL, tokens INTEGER NOT NULL, claimed_at TEXT NOT NULL, PRIMARY KEY (learner_id, local_date))`,
  `CREATE TABLE IF NOT EXISTS mutation_keys (learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, key TEXT NOT NULL, route TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (learner_id, key))`,
  `CREATE TABLE IF NOT EXISTS feedback_messages (id TEXT PRIMARY KEY, request_key_hash TEXT NOT NULL UNIQUE, nickname TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS league_members (week_key TEXT NOT NULL, league_id TEXT NOT NULL, learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, joined_at TEXT NOT NULL, PRIMARY KEY (week_key, learner_id))`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_learners_auth_key ON learners(auth_key)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_learner_id ON sessions(learner_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`,
  `CREATE INDEX IF NOT EXISTS idx_lesson_attempts_lesson ON lesson_attempts(learner_id, lesson_id)`,
  `CREATE INDEX IF NOT EXISTS idx_badge_unlocks_recent ON badge_unlocks(learner_id, unlocked_at)`,
  `CREATE INDEX IF NOT EXISTS idx_answer_credits_count ON answer_credits(learner_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_lesson_progress_learner ON lesson_progress(learner_id)`,
  `CREATE INDEX IF NOT EXISTS idx_boss_attempts_learner ON boss_attempts(learner_id, updated_at)`,
  `CREATE INDEX IF NOT EXISTS idx_review_due ON review_items(learner_id, due_at)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_unique_award ON xp_events(learner_id, kind, ref_id)`,
  `CREATE INDEX IF NOT EXISTS idx_xp_week ON xp_events(week_key, learner_id)`,
  `CREATE INDEX IF NOT EXISTS idx_league_members_group ON league_members(week_key, league_id)`,
  `CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_messages(created_at)`,
];

let ready: Promise<void> | null = null;

export function ensureSchema() {
  if (!ready) {
    const db = getStore();
    ready = db.batch(schemaStatements.map((sql) => db.prepare(sql))).then(async () => {
      await db.prepare("PRAGMA optimize").run();
    });
  }
  return ready;
}
