CREATE TABLE `feedback_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key_hash` text NOT NULL,
	`nickname` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_feedback_request_key` ON `feedback_messages` (`request_key_hash`);--> statement-breakpoint
CREATE INDEX `idx_feedback_created` ON `feedback_messages` (`created_at`);