CREATE TABLE `answer_credits` (
	`learner_id` text NOT NULL,
	`credit_key` text NOT NULL,
	`source` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `credit_key`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_answer_credits_count` ON `answer_credits` (`learner_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `badge_unlocks` (
	`learner_id` text NOT NULL,
	`badge_id` text NOT NULL,
	`source` text NOT NULL,
	`source_ref` text NOT NULL,
	`unlocked_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `badge_id`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_badge_unlocks_recent` ON `badge_unlocks` (`learner_id`,`unlocked_at`);
--> statement-breakpoint
INSERT OR IGNORE INTO `badge_unlocks` (`learner_id`, `badge_id`, `source`, `source_ref`, `unlocked_at`)
SELECT `learner_id`, 'lesson-' || `lesson_id`, 'lesson', `lesson_id`, `completed_at` FROM `lesson_progress`;
--> statement-breakpoint
INSERT OR IGNORE INTO `answer_credits` (`learner_id`, `credit_key`, `source`, `created_at`)
SELECT p.`learner_id`, 'legacy:' || p.`lesson_id` || ':q' || q.n, 'lesson', p.`completed_at`
FROM `lesson_progress` p
CROSS JOIN (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) q;
--> statement-breakpoint
WITH RECURSIVE badge_numbers(n) AS (
	SELECT 1
	UNION ALL
	SELECT n + 1 FROM badge_numbers WHERE n < 376
)
INSERT OR IGNORE INTO `badge_unlocks` (`learner_id`, `badge_id`, `source`, `source_ref`, `unlocked_at`)
SELECT l.`id`, 'answer-' || printf('%03d', badge_numbers.n), 'answer', CAST(badge_numbers.n * 10 AS TEXT), datetime('now')
FROM `learners` l CROSS JOIN badge_numbers
WHERE badge_numbers.n <= (SELECT COUNT(*) / 10 FROM `answer_credits` c WHERE c.`learner_id` = l.`id`);
