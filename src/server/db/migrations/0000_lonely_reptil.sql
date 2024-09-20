CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('m2m','nextjs'),
	`domain` varchar(255) NOT NULL,
	`client_id` varchar(255) NOT NULL,
	`secret_id` varchar(255) NOT NULL,
	`home_url` varchar(255),
	`login_url` varchar(255),
	`logout_url` varchar(255),
	`callback_url` varchar(255),
	`id_token_exp` int NOT NULL DEFAULT 3600,
	`access_token_exp` int NOT NULL DEFAULT 86400,
	`refresh_token_exp` int NOT NULL DEFAULT 1296000,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `applications_name_unique` UNIQUE(`name`),
	CONSTRAINT `applications_client_id_unique` UNIQUE(`client_id`)
);
--> statement-breakpoint
CREATE TABLE `authorization_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`client_id` varchar(255) NOT NULL,
	`code` varchar(255) NOT NULL,
	`response_type` enum('code','token') NOT NULL,
	`redirect_url` text NOT NULL,
	`scope` varchar(255) NOT NULL,
	`expires_at` datetime(3) NOT NULL DEFAULT (DATE_ADD(NOW(), INTERVAL 1 MINUTE)),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `authorization_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `authorization_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `authorization_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pid` varchar(255) NOT NULL,
	`client_id` varchar(255) NOT NULL,
	`response_type` enum('code','token') NOT NULL,
	`redirect_url` text NOT NULL,
	`scope` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `authorization_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `authorization_requests_pid_unique` UNIQUE(`pid`),
	CONSTRAINT `authorization_requests_state_unique` UNIQUE(`state`)
);
--> statement-breakpoint
CREATE TABLE `labels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `labels_id` PRIMARY KEY(`id`),
	CONSTRAINT `labels_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`application_id` int NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `key_application_unique` UNIQUE(`key`,`application_id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`token` text NOT NULL,
	`descendant_key` varchar(255),
	`expires_at` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_tokens_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`application_id` int NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `roles_to_permissions` (
	`role_id` int NOT NULL,
	`permission_id` int NOT NULL,
	CONSTRAINT `role_permission_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`middle_name` varchar(255),
	`last_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`phone` varchar(15),
	`image` varchar(255),
	`is_active` boolean DEFAULT true,
	`is_admin` boolean DEFAULT false,
	`is_super_admin` boolean DEFAULT false,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `users_to_labels` (
	`user_id` int NOT NULL,
	`label_id` int NOT NULL,
	CONSTRAINT `user_label_pk` PRIMARY KEY(`user_id`,`label_id`)
);
--> statement-breakpoint
CREATE TABLE `users_to_roles` (
	`user_id` int NOT NULL,
	`role_id` int NOT NULL,
	CONSTRAINT `user_role_pk` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_descendant_key_fk` FOREIGN KEY (`descendant_key`) REFERENCES `refresh_tokens`(`key`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `roles_to_permissions` ADD CONSTRAINT `roles_to_permissions_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `roles_to_permissions` ADD CONSTRAINT `roles_to_permissions_permission_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `users_to_labels` ADD CONSTRAINT `users_to_labels_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `users_to_labels` ADD CONSTRAINT `users_to_labels_label_id_labels_id_fk` FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `users_to_roles` ADD CONSTRAINT `users_to_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `users_to_roles` ADD CONSTRAINT `users_to_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `name_idx` ON `applications` (`name`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `permissions` (`name`);--> statement-breakpoint
CREATE INDEX `application_id_idx` ON `permissions` (`application_id`);--> statement-breakpoint
CREATE INDEX `role_name_idx` ON `roles` (`name`);
