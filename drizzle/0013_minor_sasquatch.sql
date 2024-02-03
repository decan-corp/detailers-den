DROP TABLE `user_keys`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `hashed_password` varchar(255) NOT NULL;