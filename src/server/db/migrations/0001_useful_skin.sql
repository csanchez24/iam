ALTER TABLE `roles` DROP INDEX `roles_key_unique`;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `roles_name_unique` UNIQUE(`name`);--> statement-breakpoint
ALTER TABLE `roles` DROP COLUMN `key`;