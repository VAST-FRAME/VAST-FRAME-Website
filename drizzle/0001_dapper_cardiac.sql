CREATE TABLE `knowledge_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`slug` text NOT NULL,
	`parent_id` text,
	`product_key` text,
	`entry_type` text NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`version_label` text DEFAULT '0.x / development' NOT NULL,
	`publication_status` text NOT NULL,
	`nav_order` integer DEFAULT 100 NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`published_revision` integer,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_knowledge_entries_space_slug` ON `knowledge_entries` (`space_id`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_knowledge_entries_space_status_order` ON `knowledge_entries` (`space_id`,`publication_status`,`nav_order`);--> statement-breakpoint
CREATE INDEX `idx_knowledge_entries_product_status` ON `knowledge_entries` (`product_key`,`publication_status`);--> statement-breakpoint
CREATE INDEX `idx_knowledge_entries_parent` ON `knowledge_entries` (`parent_id`);--> statement-breakpoint
CREATE TABLE `knowledge_entry_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`revision` integer NOT NULL,
	`slug` text NOT NULL,
	`parent_id` text,
	`product_key` text,
	`entry_type` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`version_label` text NOT NULL,
	`publication_status` text NOT NULL,
	`nav_order` integer NOT NULL,
	`change_kind` text NOT NULL,
	`authored_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_knowledge_revisions_entry_revision` ON `knowledge_entry_revisions` (`entry_id`,`revision`);--> statement-breakpoint
CREATE INDEX `idx_knowledge_revisions_created_at` ON `knowledge_entry_revisions` (`created_at`);--> statement-breakpoint
CREATE TABLE `knowledge_links` (
	`id` text PRIMARY KEY NOT NULL,
	`source_entry_id` text NOT NULL,
	`target_entry_id` text NOT NULL,
	`relationship` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_knowledge_links_identity` ON `knowledge_links` (`source_entry_id`,`target_entry_id`,`relationship`);--> statement-breakpoint
CREATE INDEX `idx_knowledge_links_target` ON `knowledge_links` (`target_entry_id`);--> statement-breakpoint
CREATE TABLE `knowledge_spaces` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`visibility` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_knowledge_spaces_key` ON `knowledge_spaces` (`key`);