CREATE TABLE `commercial_products` (
	`key` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`availability` text NOT NULL,
	`price_label` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customer_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`provider` text NOT NULL,
	`external_order_id` text NOT NULL,
	`status` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customer_orders_provider_external` ON `customer_orders` (`provider`,`external_order_id`);--> statement-breakpoint
CREATE INDEX `idx_customer_orders_organization_created` ON `customer_orders` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `customer_organization_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customer_memberships_organization_user` ON `customer_organization_memberships` (`organization_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `idx_customer_memberships_user_status` ON `customer_organization_memberships` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `customer_organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customer_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`last_seen_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customer_users_email` ON `customer_users` (`email`);--> statement-breakpoint
CREATE TABLE `product_download_events` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`release_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_product_download_events_organization_created` ON `product_download_events` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `product_licenses` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`product_key` text NOT NULL,
	`state` text NOT NULL,
	`assignment_status` text NOT NULL,
	`assigned_title` text,
	`purchased_at` text NOT NULL,
	`updates_end_at` text NOT NULL,
	`released_at` text,
	`external_order_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_product_licenses_organization_state` ON `product_licenses` (`organization_id`,`state`);--> statement-breakpoint
CREATE INDEX `idx_product_licenses_product_state` ON `product_licenses` (`product_key`,`state`);--> statement-breakpoint
CREATE TABLE `product_releases` (
	`id` text PRIMARY KEY NOT NULL,
	`product_key` text NOT NULL,
	`version` text NOT NULL,
	`channel` text NOT NULL,
	`status` text NOT NULL,
	`unity_version` text NOT NULL,
	`filename` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text DEFAULT 'application/gzip' NOT NULL,
	`size_bytes` integer NOT NULL,
	`checksum_sha256` text NOT NULL,
	`release_notes` text DEFAULT '' NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_product_releases_product_version_channel` ON `product_releases` (`product_key`,`version`,`channel`);--> statement-breakpoint
CREATE INDEX `idx_product_releases_product_status_published` ON `product_releases` (`product_key`,`status`,`published_at`);