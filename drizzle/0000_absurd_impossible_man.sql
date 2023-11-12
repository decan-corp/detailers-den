CREATE TABLE `transactions` (
	`id` varchar(128) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`customer_name` varchar(256) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'PENDING',
	`total_price` decimal(5,2),
	`note` text,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
