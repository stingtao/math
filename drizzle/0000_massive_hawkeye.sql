CREATE TABLE `boss_progress` (
	`learner_id` text NOT NULL,
	`region_id` integer NOT NULL,
	`cleared` integer DEFAULT false NOT NULL,
	`best_hearts` integer DEFAULT 0 NOT NULL,
	`cleared_at` text,
	PRIMARY KEY(`learner_id`, `region_id`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `daily_rewards` (
	`learner_id` text NOT NULL,
	`local_date` text NOT NULL,
	`reward_step` integer NOT NULL,
	`tokens` integer NOT NULL,
	`claimed_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `local_date`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `league_members` (
	`week_key` text NOT NULL,
	`league_id` text NOT NULL,
	`learner_id` text NOT NULL,
	`joined_at` text NOT NULL,
	PRIMARY KEY(`week_key`, `learner_id`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_league_members_group` ON `league_members` (`week_key`,`league_id`);--> statement-breakpoint
CREATE TABLE `learners` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_key` text NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`age_confirmed_at` text,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_learners_auth_key` ON `learners` (`auth_key`);--> statement-breakpoint
CREATE TABLE `lesson_attempts` (
	`learner_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`question_id` text NOT NULL,
	`first_correct` integer NOT NULL,
	`corrected` integer NOT NULL,
	`hints_used` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `lesson_id`, `question_id`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lesson_attempts_lesson` ON `lesson_attempts` (`learner_id`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`learner_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`stars` integer DEFAULT 1 NOT NULL,
	`first_correct_count` integer DEFAULT 0 NOT NULL,
	`completed_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `lesson_id`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lesson_progress_learner` ON `lesson_progress` (`learner_id`);--> statement-breakpoint
CREATE TABLE `public_profiles` (
	`learner_id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`avatar_glyph` text NOT NULL,
	`avatar_tone` text NOT NULL,
	`frame` text DEFAULT 'plain' NOT NULL,
	`reroll_used` integer DEFAULT false NOT NULL,
	`leaderboard_opt_in` integer DEFAULT false NOT NULL,
	`trail_tokens` integer DEFAULT 0 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`streak_shields` integer DEFAULT 0 NOT NULL,
	`reward_step` integer DEFAULT 0 NOT NULL,
	`last_active_date` text,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review_items` (
	`learner_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`question_id` text NOT NULL,
	`stage` integer DEFAULT 0 NOT NULL,
	`due_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `lesson_id`, `question_id`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_review_due` ON `review_items` (`learner_id`,`due_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`learner_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_learner_id` ON `sessions` (`learner_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_expires_at` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `xp_events` (
	`id` text PRIMARY KEY NOT NULL,
	`learner_id` text NOT NULL,
	`kind` text NOT NULL,
	`ref_id` text NOT NULL,
	`xp` integer NOT NULL,
	`week_key` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_xp_unique_award` ON `xp_events` (`learner_id`,`kind`,`ref_id`);--> statement-breakpoint
CREATE INDEX `idx_xp_week` ON `xp_events` (`week_key`,`learner_id`);