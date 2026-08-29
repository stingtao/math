CREATE TABLE `lesson_mastery_checks` (
	`learner_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`question_id` text NOT NULL,
	`run_id` text NOT NULL,
	`round` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 1 NOT NULL,
	`hints_used` integer DEFAULT 0 NOT NULL,
	`clean_corrected` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `lesson_id`, `question_id`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lesson_mastery_run` ON `lesson_mastery_checks` (`learner_id`,`lesson_id`,`run_id`);