CREATE TABLE `services` (
	`id` varchar(255) NOT NULL,
	`service_name` varchar(255) NOT NULL,
	`price` decimal(5,2),
	`description` text,
	`service_cut_percentage` int NOT NULL,
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
	`service_by_id` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`created_by_id` varchar(255),
	`updated_by_id` varchar(255),
	`deleted_by_id` varchar(255),
	CONSTRAINT `transaction_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_service_by_id_users_id_fk` FOREIGN KEY (`service_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;