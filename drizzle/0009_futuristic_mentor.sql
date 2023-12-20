ALTER TABLE `transaction_services` DROP FOREIGN KEY `transaction_services_service_by_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `transaction_services` ADD `price` decimal(5,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction_services` ADD `serviceBy` json NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction_services` DROP COLUMN `service_by_id`;