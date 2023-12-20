ALTER TABLE `transactions` MODIFY COLUMN `customer_name` varchar(255);--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `status` varchar(64) NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `transactions` ADD `mode_of_payment` varchar(64) NOT NULL;