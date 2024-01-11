CREATE INDEX `created_at_idx` ON `crew_earnings` (`created_at`);--> statement-breakpoint
CREATE INDEX `transaction_service_id_idx` ON `crew_earnings` (`transaction_service_id`);--> statement-breakpoint
CREATE INDEX `crew_id_idx` ON `crew_earnings` (`crew_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `transaction_services` (`created_at`);--> statement-breakpoint
CREATE INDEX `transaction_id_idx` ON `transaction_services` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `service_id_idx` ON `transaction_services` (`service_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `transactions` (`created_at`);