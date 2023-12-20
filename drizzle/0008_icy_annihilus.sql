ALTER TABLE `transactions` MODIFY COLUMN `plate_number` varchar(7) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `discount` decimal(5,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `mode_of_payment` varchar(64) NOT NULL DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE `services` ADD `service_cut_percentage` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `transactions` ADD `tip` decimal(5,2) DEFAULT '0.00';