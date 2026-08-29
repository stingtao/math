CREATE TABLE `auth_identities` (
	`provider` text NOT NULL,
	`subject_key` text NOT NULL,
	`learner_id` text NOT NULL,
	`created_at` text NOT NULL,
	`last_used_at` text NOT NULL,
	PRIMARY KEY(`provider`, `subject_key`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_auth_identities_learner` ON `auth_identities` (`learner_id`);--> statement-breakpoint
INSERT OR IGNORE INTO `auth_identities` (`provider`, `subject_key`, `learner_id`, `created_at`, `last_used_at`)
SELECT 'google', `auth_key`, `id`, `created_at`, `last_seen_at` FROM `learners`;--> statement-breakpoint
CREATE TABLE `public_aliases` (
	`learner_id` text NOT NULL,
	`scope` text NOT NULL,
	`scope_key` text NOT NULL,
	`public_id` text NOT NULL,
	`nickname` text NOT NULL,
	`avatar_glyph` text NOT NULL,
	`avatar_tone` text NOT NULL,
	`frame` text DEFAULT 'plain' NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `scope`, `scope_key`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_public_aliases_public_id` ON `public_aliases` (`scope`,`scope_key`,`public_id`);--> statement-breakpoint
CREATE INDEX `idx_public_aliases_scope` ON `public_aliases` (`scope`,`scope_key`);--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD `question_count` integer DEFAULT 5 NOT NULL;
