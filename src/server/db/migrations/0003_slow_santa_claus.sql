ALTER TABLE `password_reset_requests` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `password_reset_requests` ADD `user_id` int NOT NULL;