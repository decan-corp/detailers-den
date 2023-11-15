CREATE TABLE `services` (
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`created_by_id` varchar(255),
	`updated_by_id` varchar(255),
	`deleted_by_id` varchar(255),
	`id` varchar(255) NOT NULL,
	`service_name` varchar(255) NOT NULL,
	`price` decimal(5,2),
	`description` text,
	`service_cut_percentage` int NOT NULL,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction_services` (
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`created_by_id` varchar(255),
	`updated_by_id` varchar(255),
	`deleted_by_id` varchar(255),
	`id` varchar(255) NOT NULL,
	`transaction_id` varchar(255) NOT NULL,
	`service_id` varchar(255) NOT NULL,
	`service_by_id` varchar(255) NOT NULL,
	CONSTRAINT `transaction_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `customer_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `total_price` decimal(5,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `created_by_id` varchar(255);--> statement-breakpoint
ALTER TABLE `transactions` ADD `updated_by_id` varchar(255);--> statement-breakpoint
ALTER TABLE `transactions` ADD `deleted_by_id` varchar(255);--> statement-breakpoint
ALTER TABLE `transactions` ADD `plate_number` varchar(7);--> statement-breakpoint
ALTER TABLE `transactions` ADD `vehicle_type` varchar(24) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `discount` decimal(5,2);--> statement-breakpoint
ALTER TABLE `user` ADD `created_by_id` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `updated_by_id` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `deleted_by_id` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `role` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `service_cut_percentage` int;--> statement-breakpoint
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_services` ADD CONSTRAINT `transaction_services_service_by_id_user_id_fk` FOREIGN KEY (`service_by_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;