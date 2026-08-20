CREATE TABLE `mutation_keys` (
	`learner_id` text NOT NULL,
	`key` text NOT NULL,
	`route` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `key`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
