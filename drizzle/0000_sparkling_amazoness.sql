CREATE TABLE `crew_earnings` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_service_id` text NOT NULL,
	`crew_id` text NOT NULL,
	`computed_service_cut_percentage` integer,
	`amount` real NOT NULL,
	`crew_cut_percentage` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`transaction_service_id`) REFERENCES `transaction_services`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`crew_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reset_password_tokens` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`is_valid` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`service_name` text NOT NULL,
	`description` text,
	`service_cut_percentage` integer DEFAULT 0 NOT NULL,
	`price_matrix` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`user_id` text(255) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transaction_services` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`service_id` text NOT NULL,
	`price` real NOT NULL,
	`service_by` text NOT NULL,
	`service_cut_percentage` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_price` real NOT NULL,
	`note` text,
	`plate_number` text(12) NOT NULL,
	`vehicle_size` text NOT NULL,
	`discount` real DEFAULT 0,
	`tip` real DEFAULT 0,
	`mode_of_payment` text(64) DEFAULT 'cash' NOT NULL,
	`completed_at` integer,
	`completed_by` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	FOREIGN KEY (`completed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text(64) NOT NULL,
	`service_cut_percentage` integer DEFAULT 0,
	`image` text,
	`is_first_time_login` integer DEFAULT true,
	`hashed_password` text(255) NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE INDEX `crew_earning_created_at_idx` ON `crew_earnings` (`created_at`);--> statement-breakpoint
CREATE INDEX `crew_earning_transaction_service_id_idx` ON `crew_earnings` (`transaction_service_id`);--> statement-breakpoint
CREATE INDEX `crew_earning_crew_id_idx` ON `crew_earnings` (`crew_id`);--> statement-breakpoint
CREATE INDEX `transaction_service_created_at_idx` ON `transaction_services` (`created_at`);--> statement-breakpoint
CREATE INDEX `transaction_service_transaction_id_idx` ON `transaction_services` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `transaction_service_service_id_idx` ON `transaction_services` (`service_id`);--> statement-breakpoint
CREATE INDEX `transaction_created_at_idx` ON `transactions` (`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);