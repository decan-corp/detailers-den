ALTER TABLE `crew_earnings` DROP FOREIGN KEY `crew_earnings_transaction_service_id_transaction_services_id_fk`;
--> statement-breakpoint
ALTER TABLE `crew_earnings` DROP FOREIGN KEY `crew_earnings_crew_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `transaction_services` DROP FOREIGN KEY `transaction_services_transaction_id_transactions_id_fk`;
--> statement-breakpoint
ALTER TABLE `transaction_services` DROP FOREIGN KEY `transaction_services_service_id_services_id_fk`;
--> statement-breakpoint
ALTER TABLE `user_keys` DROP FOREIGN KEY `user_keys_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `user_sessions` DROP FOREIGN KEY `user_sessions_user_id_users_id_fk`;
