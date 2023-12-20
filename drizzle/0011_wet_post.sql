ALTER TABLE `services` ADD `price_matrix` json NOT NULL;--> statement-breakpoint
ALTER TABLE `services` DROP COLUMN `price`;