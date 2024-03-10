CREATE TABLE `test_table` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text
);
