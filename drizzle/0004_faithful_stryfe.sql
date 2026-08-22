CREATE TABLE `avatar_frames` (
	`learner_id` text NOT NULL,
	`frame` text NOT NULL,
	`unlocked_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `frame`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT OR IGNORE INTO `avatar_frames` (`learner_id`, `frame`, `unlocked_at`)
SELECT `learner_id`, `frame`, COALESCE(`last_active_date`, datetime('now'))
FROM `public_profiles`
WHERE `frame` <> 'plain';
