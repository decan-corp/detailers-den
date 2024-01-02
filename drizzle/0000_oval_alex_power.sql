CREATE TABLE `crew_earnings` (
	`id` varchar(255) NOT NULL,
	`transaction_service_id` varchar(255) NOT NULL,
	`crew_id` varchar(255) NOT NULL,
	`computed_service_cut_percentage` int,
	`amount` decimal(5,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`created_by_id` varchar(255),
	`updated_by_id` varchar(255),
	`deleted_by_id` varchar(255),
	CONSTRAINT `crew_earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(255) NOT NULL,
	`service_name` varchar(255) NOT NULL,
	`description` text,
	`service_cut_percentage` int NOT NULL DEFAULT 0,
	`price_matrix` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`created_by_id` varchar(255),
	`updated_by_id` varchar(255),
	`deleted_by_id` varchar(255),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction_services` (
	`id` varchar(255) NOT NULL,
	`transaction_id` varchar(255) NOT NULL,
	`service_id` varchar(255) NOT NULL,
	`price` decimal(5,2) NOT NULL,
	`serviceBy` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`created_by_id` varchar(255),
	`updated_by_id` varchar(255),
	`deleted_by_id` varchar(255),
	CONSTRAINT `transaction_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(255) NOT NULL,
	`customer_name` varchar(255),
	`status` varchar(64) NOT NULL DEFAULT 'pending',
	`total_price` decimal(5,2) NOT NULL,
	`note` text,
	`plate_number` varchar(7) NOT NULL,
	`vehicle_size` varchar(24) NOT NULL,
	`discount` decimal(5,2) DEFAULT '0.00',
	`tip` decimal(5,2) DEFAULT '0.00',
	`mode_of_payment` varchar(64) NOT NULL DEFAULT 'cash',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`created_by_id` varchar(255),
	`updated_by_id` varchar(255),
	`deleted_by_id` varchar(255),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_keys` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`hashed_password` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `user_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`active_expires` bigint NOT NULL,
	`idle_expires` bigint NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(64) NOT NULL,
	`service_cut_percentage` int,
	`image` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`created_by_id` varchar(255),
	`updated_by_id` varchar(255),
	`deleted_by_id` varchar(255),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
