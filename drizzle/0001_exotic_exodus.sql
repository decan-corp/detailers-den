ALTER TABLE `transactions` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `customer_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `total_price` decimal(5,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `plate_number` varchar(7);--> statement-breakpoint
ALTER TABLE `transactions` ADD `vehicle_type` varchar(24) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `discount` decimal(5,2);--> statement-breakpoint
ALTER TABLE `transactions` ADD `created_by_id` varchar(255);--> statement-breakpoint
ALTER TABLE `transactions` ADD `updated_by_id` varchar(255);--> statement-breakpoint
ALTER TABLE `transactions` ADD `deleted_by_id` varchar(255);