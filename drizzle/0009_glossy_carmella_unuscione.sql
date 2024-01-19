ALTER TABLE `crew_earnings` MODIFY COLUMN `amount` decimal(8,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction_services` MODIFY COLUMN `price` decimal(8,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `total_price` decimal(8,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `discount` decimal(8,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `tip` decimal(8,2) DEFAULT '0.00';