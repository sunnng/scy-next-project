CREATE TABLE `license_batches` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` varchar(20) NOT NULL,
	`count` int NOT NULL,
	`duration` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`created_by` varchar(36) NOT NULL,
	`notes` text,
	CONSTRAINT `license_batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `license_keys` (
	`id` varchar(36) NOT NULL,
	`key` varchar(32) NOT NULL,
	`type` varchar(20) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'unused',
	`created_at` timestamp DEFAULT (now()),
	`used_at` timestamp,
	`expires_at` timestamp,
	`used_by` varchar(36),
	`batch_id` varchar(36),
	`notes` text,
	CONSTRAINT `license_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `license_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `scy-next-project_post` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scy-next-project_post_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `scy-next-project_post` (`name`);