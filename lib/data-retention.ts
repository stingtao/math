export type DataDeletionCategory = "learning" | "appearance" | "feedback" | "all";

const learningTables = [
  "lesson_attempts",
  "lesson_mastery_checks",
  "lesson_runs",
  "lesson_progress",
  "review_items",
  "boss_progress",
  "boss_attempts",
  "xp_events",
  "daily_rewards",
  "badge_unlocks",
  "answer_credits",
] as const;

export function retentionDeadline(from: Date, months: number) {
  const year = from.getUTCFullYear();
  const month = from.getUTCMonth() + months;
  const targetStart = new Date(Date.UTC(year, month, 1, from.getUTCHours(), from.getUTCMinutes(), from.getUTCSeconds(), from.getUTCMilliseconds()));
  const lastDay = new Date(Date.UTC(targetStart.getUTCFullYear(), targetStart.getUTCMonth() + 1, 0)).getUTCDate();
  targetStart.setUTCDate(Math.min(from.getUTCDate(), lastDay));
  return targetStart.toISOString();
}

function deleteByLearner(db: D1Database, table: (typeof learningTables)[number], learnerId: string) {
  return db.prepare(`DELETE FROM ${table} WHERE learner_id = ?`).bind(learnerId);
}

export async function deleteSavedDataCategory(db: D1Database, learnerId: string, category: DataDeletionCategory) {
  const statements: D1PreparedStatement[] = [];
  if (category === "learning" || category === "all") {
    statements.push(...learningTables.map((table) => deleteByLearner(db, table, learnerId)));
    statements.push(db.prepare(`UPDATE public_profiles SET trail_tokens = 0, current_streak = 0, longest_streak = 0,
      streak_shields = 0, reward_step = 0, last_active_date = NULL WHERE learner_id = ?`).bind(learnerId));
  }
  if (category === "appearance" || category === "all") {
    statements.push(
      db.prepare("DELETE FROM avatar_frames WHERE learner_id = ?").bind(learnerId),
      db.prepare("DELETE FROM learner_preferences WHERE learner_id = ?").bind(learnerId),
      db.prepare("DELETE FROM public_aliases WHERE learner_id = ?").bind(learnerId),
      db.prepare("DELETE FROM league_members WHERE learner_id = ?").bind(learnerId),
    );
    if (category === "all") statements.push(db.prepare("DELETE FROM public_profiles WHERE learner_id = ?").bind(learnerId));
  }
  if (category === "feedback" || category === "all") {
    statements.push(
      db.prepare("DELETE FROM feedback_replies WHERE operator_learner_id = ?").bind(learnerId),
      db.prepare("DELETE FROM feedback_threads WHERE learner_id = ?").bind(learnerId),
    );
  }
  if (category === "all") {
    statements.push(db.prepare("DELETE FROM mutation_keys WHERE learner_id = ?").bind(learnerId));
  }
  if (statements.length) await db.batch(statements);
}

const dueLearners = "SELECT id FROM learners WHERE learning_data_expires_at <= ? AND family_data_deleted_at IS NULL";
const expiredAccounts = "SELECT id FROM learners WHERE account_expires_at <= ?";

export async function runRetentionCleanup(db: D1Database, at = new Date()) {
  const now = at.toISOString();
  const [dataDue, accountsDue] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS total FROM learners WHERE learning_data_expires_at <= ? AND family_data_deleted_at IS NULL`).bind(now).first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) AS total FROM learners WHERE account_expires_at <= ?").bind(now).first<{ total: number }>(),
  ]);

  const statements: D1PreparedStatement[] = [
    db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now),
  ];
  for (const table of learningTables) statements.push(db.prepare(`DELETE FROM ${table} WHERE learner_id IN (${dueLearners})`).bind(now));
  statements.push(
    db.prepare(`DELETE FROM feedback_replies WHERE operator_learner_id IN (${dueLearners})`).bind(now),
    db.prepare(`DELETE FROM feedback_threads WHERE learner_id IN (${dueLearners})`).bind(now),
    db.prepare(`DELETE FROM avatar_frames WHERE learner_id IN (${dueLearners})`).bind(now),
    db.prepare(`DELETE FROM learner_preferences WHERE learner_id IN (${dueLearners})`).bind(now),
    db.prepare(`DELETE FROM public_aliases WHERE learner_id IN (${dueLearners})`).bind(now),
    db.prepare(`DELETE FROM league_members WHERE learner_id IN (${dueLearners})`).bind(now),
    db.prepare(`DELETE FROM public_profiles WHERE learner_id IN (${dueLearners})`).bind(now),
    db.prepare(`DELETE FROM mutation_keys WHERE learner_id IN (${dueLearners})`).bind(now),
    db.prepare(`DELETE FROM sessions WHERE learner_id IN (${dueLearners})`).bind(now),
    db.prepare("UPDATE learners SET family_data_deleted_at = ? WHERE learning_data_expires_at <= ? AND family_data_deleted_at IS NULL").bind(now, now),
    db.prepare(`DELETE FROM auth_identities WHERE learner_id IN (${expiredAccounts})`).bind(now),
    db.prepare(`DELETE FROM sessions WHERE learner_id IN (${expiredAccounts})`).bind(now),
    db.prepare("DELETE FROM learners WHERE account_expires_at <= ?").bind(now),
  );
  await db.batch(statements);
  return { familyDataDeleted: Number(dataDue?.total ?? 0), accountsDeleted: Number(accountsDue?.total ?? 0) };
}
