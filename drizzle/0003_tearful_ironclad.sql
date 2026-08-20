CREATE TABLE `boss_attempts` (
	`learner_id` text NOT NULL,
	`region_id` integer NOT NULL,
	`attempt_id` text NOT NULL,
	`current_question` integer DEFAULT 0 NOT NULL,
	`hearts` integer DEFAULT 3 NOT NULL,
	`failed` integer DEFAULT false NOT NULL,
	`failed_question` integer,
	`repair_step` integer DEFAULT 0 NOT NULL,
	`cleared` integer DEFAULT false NOT NULL,
	`started_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `region_id`, `attempt_id`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_boss_attempts_learner` ON `boss_attempts` (`learner_id`,`updated_at`);