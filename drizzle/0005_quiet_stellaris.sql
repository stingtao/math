CREATE TABLE `lesson_runs` (
	`learner_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`run_id` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`started_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `lesson_id`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
