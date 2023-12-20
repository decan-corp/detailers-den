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
ALTER TABLE `transactions` RENAME COLUMN `vehicle_type` TO `vehicle_size`;--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `service_cut_percentage` int NOT NULL;--> statement-breakpoint
ALTER TABLE `crew_earnings` ADD CONSTRAINT `crew_earnings_transaction_service_id_transaction_services_id_fk` FOREIGN KEY (`transaction_service_id`) REFERENCES `transaction_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crew_earnings` ADD CONSTRAINT `crew_earnings_crew_id_users_id_fk` FOREIGN KEY (`crew_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;