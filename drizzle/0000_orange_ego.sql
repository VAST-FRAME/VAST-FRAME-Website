CREATE TABLE `lore_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`project_key` text NOT NULL,
	`entry_type` text NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`canon_status` text NOT NULL,
	`record_status` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lore_entries_slug` ON `lore_entries` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_lore_entries_project_status` ON `lore_entries` (`project_key`,`record_status`);--> statement-breakpoint
CREATE INDEX `idx_lore_entries_updated_at` ON `lore_entries` (`updated_at`);--> statement-breakpoint
CREATE TABLE `lore_entry_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`revision` integer NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`canon_status` text NOT NULL,
	`entry_type` text NOT NULL,
	`record_status` text NOT NULL,
	`change_kind` text NOT NULL,
	`authored_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lore_revisions_entry_revision` ON `lore_entry_revisions` (`entry_id`,`revision`);--> statement-breakpoint
CREATE INDEX `idx_lore_revisions_created_at` ON `lore_entry_revisions` (`created_at`);--> statement-breakpoint
CREATE TABLE `lore_links` (
	`id` text PRIMARY KEY NOT NULL,
	`source_entry_id` text NOT NULL,
	`target_entry_id` text NOT NULL,
	`relationship` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lore_links_identity` ON `lore_links` (`source_entry_id`,`target_entry_id`,`relationship`);--> statement-breakpoint
CREATE INDEX `idx_lore_links_target` ON `lore_links` (`target_entry_id`);--> statement-breakpoint
CREATE TABLE `studio_members` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL,
	`invited_by` text,
	`last_seen_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_studio_members_email` ON `studio_members` (`email`);--> statement-breakpoint
CREATE TABLE `workbench_audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`summary` text NOT NULL,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_events_created_at` ON `workbench_audit_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_events_actor_created` ON `workbench_audit_events` (`actor_email`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_events_entity_created` ON `workbench_audit_events` (`entity_type`,`entity_id`,`created_at`);