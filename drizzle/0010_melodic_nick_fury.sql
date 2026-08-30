CREATE TABLE `feedback_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`operator_learner_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `feedback_threads`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`operator_learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_feedback_replies_thread` ON `feedback_replies` (`thread_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_feedback_replies_operator` ON `feedback_replies` (`operator_learner_id`);--> statement-breakpoint
CREATE TABLE `feedback_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`learner_id` text NOT NULL,
	`category` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`request_key_hash` text NOT NULL,
	`notice_version` text NOT NULL,
	`publication_consent_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_feedback_threads_request` ON `feedback_threads` (`learner_id`,`request_key_hash`);--> statement-breakpoint
CREATE INDEX `idx_feedback_threads_recent` ON `feedback_threads` (`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_feedback_threads_learner` ON `feedback_threads` (`learner_id`);--> statement-breakpoint
CREATE TABLE `site_roles` (
	`learner_id` text NOT NULL,
	`role` text NOT NULL,
	`granted_at` text NOT NULL,
	PRIMARY KEY(`learner_id`, `role`),
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_site_roles_role` ON `site_roles` (`role`);--> statement-breakpoint
ALTER TABLE `learners` ADD `family_agreement_version` text;--> statement-breakpoint
ALTER TABLE `learners` ADD `family_agreement_at` text;--> statement-breakpoint
ALTER TABLE `learners` ADD `learning_data_expires_at` text;--> statement-breakpoint
ALTER TABLE `learners` ADD `account_expires_at` text;--> statement-breakpoint
ALTER TABLE `learners` ADD `family_data_deleted_at` text;--> statement-breakpoint
UPDATE `learners`
SET `learning_data_expires_at` = printf(
  '%s%02dT%sZ',
  strftime('%Y-%m-', `last_seen_at`, 'start of month', '+4 months'),
  min(CAST(strftime('%d', `last_seen_at`) AS INTEGER), CAST(strftime('%d', `last_seen_at`, 'start of month', '+5 months', '-1 day') AS INTEGER)),
  strftime('%H:%M:%f', `last_seen_at`)
),
`account_expires_at` = printf(
  '%s%02dT%sZ',
  strftime('%Y-%m-', `last_seen_at`, 'start of month', '+6 months'),
  min(CAST(strftime('%d', `last_seen_at`) AS INTEGER), CAST(strftime('%d', `last_seen_at`, 'start of month', '+7 months', '-1 day') AS INTEGER)),
  strftime('%H:%M:%f', `last_seen_at`)
);--> statement-breakpoint
CREATE TRIGGER `learners_retention_after_insert`
AFTER INSERT ON `learners`
BEGIN
  UPDATE `learners`
  SET `learning_data_expires_at` = printf(
    '%s%02dT%sZ',
    strftime('%Y-%m-', NEW.`last_seen_at`, 'start of month', '+4 months'),
    min(CAST(strftime('%d', NEW.`last_seen_at`) AS INTEGER), CAST(strftime('%d', NEW.`last_seen_at`, 'start of month', '+5 months', '-1 day') AS INTEGER)),
    strftime('%H:%M:%f', NEW.`last_seen_at`)
  ),
  `account_expires_at` = printf(
    '%s%02dT%sZ',
    strftime('%Y-%m-', NEW.`last_seen_at`, 'start of month', '+6 months'),
    min(CAST(strftime('%d', NEW.`last_seen_at`) AS INTEGER), CAST(strftime('%d', NEW.`last_seen_at`, 'start of month', '+7 months', '-1 day') AS INTEGER)),
    strftime('%H:%M:%f', NEW.`last_seen_at`)
  )
  WHERE `id` = NEW.`id`;
END;--> statement-breakpoint
CREATE TRIGGER `learners_retention_after_login`
AFTER UPDATE OF `last_seen_at` ON `learners`
BEGIN
  UPDATE `learners`
  SET `learning_data_expires_at` = printf(
    '%s%02dT%sZ',
    strftime('%Y-%m-', NEW.`last_seen_at`, 'start of month', '+4 months'),
    min(CAST(strftime('%d', NEW.`last_seen_at`) AS INTEGER), CAST(strftime('%d', NEW.`last_seen_at`, 'start of month', '+5 months', '-1 day') AS INTEGER)),
    strftime('%H:%M:%f', NEW.`last_seen_at`)
  ),
  `account_expires_at` = printf(
    '%s%02dT%sZ',
    strftime('%Y-%m-', NEW.`last_seen_at`, 'start of month', '+6 months'),
    min(CAST(strftime('%d', NEW.`last_seen_at`) AS INTEGER), CAST(strftime('%d', NEW.`last_seen_at`, 'start of month', '+7 months', '-1 day') AS INTEGER)),
    strftime('%H:%M:%f', NEW.`last_seen_at`)
  )
  WHERE `id` = NEW.`id`;
END;--> statement-breakpoint
CREATE INDEX `idx_learners_learning_expiry` ON `learners` (`learning_data_expires_at`,`family_data_deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_learners_account_expiry` ON `learners` (`account_expires_at`);
