CREATE TABLE `reset_password_tokens` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`is_valid` boolean NOT NULL DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`created_by_id` varchar(255),
	`updated_by_id` varchar(255),
	`deleted_by_id` varchar(255),
	CONSTRAINT `reset_password_tokens_id` PRIMARY KEY(`id`)
);
