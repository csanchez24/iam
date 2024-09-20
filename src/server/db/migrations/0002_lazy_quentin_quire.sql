CREATE TABLE `password_reset_requests` (
	`id` int NOT NULL,
	`pid` varchar(255) NOT NULL,
	`code` varchar(6) NOT NULL,
	`authorization_request_pid` varchar(255) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `password_reset_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_requests_pid_unique` UNIQUE(`pid`)
);
