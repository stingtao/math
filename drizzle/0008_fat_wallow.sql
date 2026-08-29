CREATE TABLE `learner_preferences` (
	`learner_id` text PRIMARY KEY NOT NULL,
	`theme` text DEFAULT 'classic' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
