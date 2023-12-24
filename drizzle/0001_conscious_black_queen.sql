ALTER TABLE `transaction_services` RENAME COLUMN `serviceBy` TO `service_by`;--> statement-breakpoint
ALTER TABLE `transactions` ADD `completed_at` timestamp;