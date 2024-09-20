-- MySQL dump 10.13  Distrib 8.3.0, for macos14.2 (arm64)
--
-- Host: 167.71.91.198    Database: fcf_iam
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__drizzle_migrations`
--

DROP TABLE IF EXISTS `__drizzle_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__drizzle_migrations`
--

LOCK TABLES `__drizzle_migrations` WRITE;
/*!40000 ALTER TABLE `__drizzle_migrations` DISABLE KEYS */;
INSERT INTO `__drizzle_migrations` VALUES (1,'696e703be2774d6c8c6334505bf7bc1b2ce82107ad1718db5317ae56f2d29507',1718820383907),(2,'77c053ab277cd9c537cc2ce98570637adce8184f64157d404ec2fc45bc315c06',1718946197922),(3,'635fa3ef3faba005d09833ad1374521fafdec4400743445f54dad2a7473c106d',1721058521893),(4,'8b27241125978303bb711cb66ef5f3b5ccd8626c580b9bcd947f8920a76aa106',1721058674555);
/*!40000 ALTER TABLE `__drizzle_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `type` enum('m2m','nextjs') DEFAULT NULL,
  `domain` varchar(255) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `secret_id` varchar(255) NOT NULL,
  `home_url` varchar(255) DEFAULT NULL,
  `login_url` varchar(255) DEFAULT NULL,
  `logout_url` varchar(255) DEFAULT NULL,
  `callback_url` varchar(255) DEFAULT NULL,
  `id_token_exp` int NOT NULL DEFAULT '3600',
  `access_token_exp` int NOT NULL DEFAULT '86400',
  `refresh_token_exp` int NOT NULL DEFAULT '1296000',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `applications_name_unique` (`name`),
  UNIQUE KEY `applications_client_id_unique` (`client_id`),
  KEY `name_idx` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (69,'FCF IAM (Dev)','Identity and access management platform (Dev ONLY)',NULL,'http://localhost:3000','81581594-fb6a-4a04-ac88-43f0039771f9','FkRUxesiYlJe7Z40qkMxvlEiaRm7puvf8E2hksh5mtL1dO1WiI7VMuhpYnB0cCdD','http://localhost:3000','http://localhost:3000','http://localhost:3000','http://localhost:3000/api/auth/callback',3600,86400,1296000,'2024-06-21 05:04:21.351','2024-06-21 05:04:21.351'),(70,'FCF IAM (Prod)','Identity and access management platform (Prod ONLY)',NULL,'https://fcf-iam.brownbear.dev','90dba10b-8316-4190-901f-9878524c727b','x20eTiRcqNkNHXma-heUzQVbdRBPXXVUpn3LzMjYj2MomoffM7qvKyH3LdU5PQ-a','https://fcf-iam.brownbear.dev','https://fcf-iam.brownbear.dev','https://fcf-iam.brownbear.dev','https://fcf-iam.brownbear.dev/api/auth/callback',3600,86400,1296000,'2024-06-21 05:04:21.351','2024-06-21 05:04:21.351'),(71,'FCF Training (Dev)','Training platform to ease interactions between academies, users and admins (Dev ONLY)',NULL,'http://localhost:3001','b102fd9e-858a-4494-95b1-8fadcb860c3c','hO9QjsdFsSDH1jaOZU-B1oUfne5UDXwlemJNcNp-W0_VHWQ0SLP0c9pMVYUVDcHl','http://localhost:3001','http://localhost:3001','http://localhost:3001','http://localhost:3001/api/auth/callback',3600,86400,1296000,'2024-06-21 05:04:21.351','2024-06-21 05:04:21.351'),(72,'FCF Training (Prod)','Training platform to ease interactions between academies, users and admins (Prod ONLY)',NULL,'https://fcf-training.brownbear.dev','ab6f37f4-ab63-4157-b157-93b7a82cdff0','uHMqke5d3VniQ7K1jpU7gdbOsWoXIoURxw9Gzd2C-LPVrJGhREbQAkoEYs5_Iqyo','https://fcf-training.brownbear.dev','https://fcf-training.brownbear.dev','https://fcf-training.brownbear.dev','https://fcf-training.brownbear.dev/api/auth/callback',3600,86400,1296000,'2024-06-21 05:04:21.351','2024-06-21 05:04:21.351');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authorization_codes`
--

DROP TABLE IF EXISTS `authorization_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authorization_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `response_type` enum('code','token') NOT NULL,
  `redirect_url` text NOT NULL,
  `scope` varchar(255) NOT NULL,
  `expires_at` datetime(3) NOT NULL DEFAULT ((now() + interval 1 minute)),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `authorization_codes_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authorization_codes`
--

LOCK TABLES `authorization_codes` WRITE;
/*!40000 ALTER TABLE `authorization_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `authorization_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authorization_requests`
--

DROP TABLE IF EXISTS `authorization_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authorization_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` varchar(255) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `response_type` enum('code','token') NOT NULL,
  `redirect_url` text NOT NULL,
  `scope` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `authorization_requests_pid_unique` (`pid`),
  UNIQUE KEY `authorization_requests_state_unique` (`state`)
) ENGINE=InnoDB AUTO_INCREMENT=1461 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authorization_requests`
--

LOCK TABLES `authorization_requests` WRITE;
/*!40000 ALTER TABLE `authorization_requests` DISABLE KEYS */;
INSERT INTO `authorization_requests` VALUES (1438,'821c2067-ebe5-45e1-928f-6a33d976573a','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','Q9OHONk8_FeclbmZg-Csd','2024-07-30 13:52:08.036','2024-07-30 13:52:08.036'),(1439,'2e19675a-64d3-4048-a008-9624ab06d474','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','bDZC2B_tKm3j4nfuxDYxO','2024-07-30 14:15:44.138','2024-07-30 14:15:44.138'),(1440,'8d62e022-29f0-41ff-80ac-7b2ee626954c','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','63WWWomA9iOcGt1z40bFR','2024-07-30 14:15:46.109','2024-07-30 14:15:46.109'),(1441,'6d009e73-2372-453d-83cc-3bbaf966171f','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','EdQeVSMVMt8SBAEp7l_wN','2024-07-30 17:57:40.953','2024-07-30 17:57:40.953'),(1442,'f788618d-b576-4110-83dc-212acf460cff','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','ZRB6DShIPAao32ceaD_mF','2024-07-30 19:07:12.741','2024-07-30 19:07:12.741'),(1443,'8f8aa808-2c31-4f9c-923d-08b00abb4f01','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','x1VpEqveRhLwKxSVj-FNr','2024-07-30 19:07:12.934','2024-07-30 19:07:12.934'),(1444,'d77c17bf-b466-4e77-832c-f12f95c9035c','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','VowXgZckruyhq1kHc-Toj','2024-07-30 19:07:14.954','2024-07-30 19:07:14.954'),(1445,'8d72e58f-9d10-4368-a3a8-e2319899b274','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','K9ojQH7t4Y8cxO_HZQyKV','2024-07-30 20:21:25.164','2024-07-30 20:21:25.164'),(1446,'66a56964-232b-448f-827f-6779ec924528','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','q7TNbzPaeDAglSXwDQemQ','2024-07-30 20:21:25.465','2024-07-30 20:21:25.465'),(1447,'8ad0742c-b2ef-46f6-a359-d319c475c826','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','25EdaGTGJdfyOVZTcmbkl','2024-07-30 20:33:04.686','2024-07-30 20:33:04.686'),(1448,'4d0c8f8c-9263-416c-a856-961c2cda86dc','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','mwBcMxJ3iRT6GMdeBpaew','2024-07-30 20:33:05.547','2024-07-30 20:33:05.547'),(1449,'e301f08a-347f-4569-877a-ff7da18b1c53','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','9J7bHPD51aXFCs_Fd0dH1','2024-07-30 20:33:05.801','2024-07-30 20:33:05.801'),(1450,'5713f15c-525d-4409-9770-fe269b34d0bd','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','XKOIpvVLnDN9fDKSqB7G4','2024-07-30 21:39:37.487','2024-07-30 21:39:37.487'),(1451,'1528f437-59ac-4f92-b1a1-da60bf74e796','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','Wf1hLbmrn1EFEyUouKfNu','2024-07-31 00:10:00.929','2024-07-31 00:10:00.929'),(1452,'e168204b-f40e-497b-b873-24cf97241cf7','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','AAcJACMCn5MPurstRvyIJ','2024-07-31 00:49:55.660','2024-07-31 00:49:55.660'),(1453,'985e7a8d-8181-4f71-9cf0-f29f0ca59511','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','6-zRBFBkYGER9N35DFaFC','2024-07-31 00:49:55.743','2024-07-31 00:49:55.743'),(1454,'933eb79a-d401-4597-be96-a102395c33b8','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','n9KEx13N-_6VxvlmEtbfl','2024-07-31 01:25:48.600','2024-07-31 01:25:48.600'),(1455,'a30ed539-48c4-4013-880a-786ed041a3ec','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','ccV9quc7z72kZFvNePrvI','2024-07-31 01:54:10.442','2024-07-31 01:54:10.442'),(1456,'3477aec5-486a-4868-9be8-f665a7aa3497','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','IPN_Mrg14qgVAnZRE_g6c','2024-07-31 01:54:11.257','2024-07-31 01:54:11.257'),(1458,'e6915648-0863-48ee-a9bd-ee9b313dc054','ab6f37f4-ab63-4157-b157-93b7a82cdff0','code','https://fcf-training.brownbear.dev/api/auth/callback','email profile openid','DXT8IEcj_WXBCDric9cns','2024-07-31 02:27:17.350','2024-07-31 02:27:17.350'),(1459,'cac11620-7774-462c-8ec6-ba9ec58f8cad','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','fmqbydglTWIiaV7ATqwoU','2024-07-31 02:27:20.999','2024-07-31 02:27:20.999'),(1460,'d30688c0-d4bc-41a6-963c-12e50c6fb5f4','90dba10b-8316-4190-901f-9878524c727b','code','https://fcf-iam.brownbear.dev/api/auth/callback','email profile openid','iOAN8PpwqBcvMbdJ8BeIX','2024-07-31 02:27:25.723','2024-07-31 02:27:25.723');
/*!40000 ALTER TABLE `authorization_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labels`
--

DROP TABLE IF EXISTS `labels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `labels_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labels`
--

LOCK TABLES `labels` WRITE;
/*!40000 ALTER TABLE `labels` DISABLE KEYS */;
INSERT INTO `labels` VALUES (8,'employee','Dolor demonstro viriliter cubo stillicidium beatae defetiscor.','2024-06-21 05:04:22.310','2024-06-21 05:04:22.310'),(9,'admin','Perspiciatis nisi venia aeger dapifer auctus suppono.','2024-06-21 05:04:22.310','2024-06-21 05:04:22.310'),(10,'company','Paens cimentarius damno ocer utrum amplus sed asperiores attollo apto.','2024-06-21 05:04:22.310','2024-06-21 05:04:22.310'),(11,'academy','Tremo arma ceno administratio supra amitto acsi cupiditate.','2024-06-21 05:04:22.310','2024-06-21 05:04:22.310');
/*!40000 ALTER TABLE `labels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_requests`
--

DROP TABLE IF EXISTS `password_reset_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `authorization_request_pid` varchar(255) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_requests_pid_unique` (`pid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_requests`
--

LOCK TABLES `password_reset_requests` WRITE;
/*!40000 ALTER TABLE `password_reset_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `application_id` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_application_unique` (`key`,`application_id`),
  KEY `name_idx` (`name`),
  KEY `application_id_idx` (`application_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1758 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1701,'dashboard:download','SISE','descargar archivo SISE desde el tablero de control',71,'2024-07-30 13:22:21.733','2024-07-30 13:22:21.733'),(1703,'period:manage','periodo','administrar periodos',71,'2024-07-30 13:27:23.756','2024-07-30 13:27:23.756'),(1704,'period:read','periodos','leer periodos',71,'2024-07-30 13:27:23.784','2024-07-30 13:27:23.784'),(1705,'academy:manage','instituciones','administrar instituciones educativas',71,'2024-07-30 13:27:23.810','2024-07-30 13:27:23.810'),(1706,'academy:read','instituciones','leer instituciones educativas',71,'2024-07-30 13:27:23.837','2024-07-30 13:27:23.837'),(1707,'company:manage','empresas','administrar empresas',71,'2024-07-30 13:27:23.865','2024-07-30 13:27:23.865'),(1708,'company:read','empresas','leer administrar',71,'2024-07-30 13:27:23.891','2024-07-30 13:27:23.891'),(1709,'person:read','personas','administrar personas',71,'2024-07-30 13:27:23.918','2024-07-30 13:27:23.918'),(1710,'person:manage','personas','leer administrar',71,'2024-07-30 13:27:23.944','2024-07-30 13:27:23.944'),(1711,'person:upload','personas','cargar archivo personas',71,'2024-07-30 13:27:23.972','2024-07-30 13:27:23.972'),(1712,'person:assign','personas','asignar cursos personas',71,'2024-07-30 13:27:23.999','2024-07-30 13:27:23.999'),(1713,'request:manage','formularios','administrar formularios empresas',71,'2024-07-30 13:27:24.025','2024-07-30 13:27:24.025'),(1714,'request:read','formularios','leer formularios empresas',71,'2024-07-30 13:27:24.052','2024-07-30 13:27:24.052'),(1715,'course-assignment:read','cursos asignados','cursos asignados',71,'2024-07-30 13:27:24.079','2024-07-30 13:27:24.079'),(1716,'training-assignment:read','entrenamientos asignados','entrenamientos asignados',71,'2024-07-30 13:27:24.106','2024-07-30 13:27:24.106'),(1717,'report:read','reportes','reportes',71,'2024-07-30 13:27:24.132','2024-07-30 13:27:24.132'),(1718,'dashboard:download','SISE','descargar archivo SISE desde el tablero de control',72,'2024-07-30 13:22:21.733','2024-07-30 13:22:21.733'),(1719,'period:manage','periodo','administrar periodos',72,'2024-07-30 13:27:23.756','2024-07-30 13:27:23.756'),(1720,'period:read','periodos','leer periodos',72,'2024-07-30 13:27:23.784','2024-07-30 13:27:23.784'),(1721,'academy:manage','instituciones','administrar instituciones educativas',72,'2024-07-30 13:27:23.810','2024-07-30 13:27:23.810'),(1722,'academy:read','instituciones','leer instituciones educativas',72,'2024-07-30 13:27:23.837','2024-07-30 13:27:23.837'),(1723,'company:manage','empresas','administrar empresas',72,'2024-07-30 13:27:23.865','2024-07-30 13:27:23.865'),(1724,'company:read','empresas','leer administrar',72,'2024-07-30 13:27:23.891','2024-07-30 13:27:23.891'),(1725,'person:read','personas','administrar personas',72,'2024-07-30 13:27:23.918','2024-07-30 13:27:23.918'),(1726,'person:manage','personas','leer administrar',72,'2024-07-30 13:27:23.944','2024-07-30 13:27:23.944'),(1727,'person:upload','personas','cargar archivo personas',72,'2024-07-30 13:27:23.972','2024-07-30 13:27:23.972'),(1728,'person:assign','personas','asignar cursos personas',72,'2024-07-30 13:27:23.999','2024-07-30 13:27:23.999'),(1729,'request:manage','formularios','administrar formularios empresas',72,'2024-07-30 13:27:24.025','2024-07-30 13:27:24.025'),(1730,'request:read','formularios','leer formularios empresas',72,'2024-07-30 13:27:24.052','2024-07-30 13:27:24.052'),(1731,'course-assignment:read','cursos asignados','cursos asignados',72,'2024-07-30 13:27:24.079','2024-07-30 13:27:24.079'),(1732,'training-assignment:read','entrenamientos asignados','entrenamientos asignados',72,'2024-07-30 13:27:24.106','2024-07-30 13:27:24.106'),(1733,'report:read','reportes','reportes',72,'2024-07-30 13:27:24.132','2024-07-30 13:27:24.132'),(1734,'user:create','usuarios','crear usuarios',69,'2024-07-31 02:22:36.541','2024-07-31 02:22:36.541'),(1735,'user:update','usuarios','actualizar usuarios',69,'2024-07-31 02:22:36.569','2024-07-31 02:22:36.569'),(1736,'user:delete','usuarios','borrar usuarios',69,'2024-07-31 02:22:36.595','2024-07-31 02:22:36.595'),(1737,'user:read','usuarios','leer usuario',69,'2024-07-31 02:22:36.621','2024-07-31 02:22:36.621'),(1738,'application:create','usuarios','crear aplicaciones',69,'2024-07-31 02:22:36.541','2024-07-31 02:22:36.541'),(1739,'application:update','usuarios','actualizar aplicaciones',69,'2024-07-31 02:22:36.569','2024-07-31 02:22:36.569'),(1740,'application:delete','usuarios','borrar aplicaciones',69,'2024-07-31 02:22:36.595','2024-07-31 02:22:36.595'),(1741,'application:read','usuarios','leer aplicaciones',69,'2024-07-31 02:22:36.621','2024-07-31 02:22:36.621'),(1742,'role:create','usuarios','crear role',69,'2024-07-31 02:22:36.541','2024-07-31 02:22:36.541'),(1743,'role:update','usuarios','actualizar role',69,'2024-07-31 02:22:36.569','2024-07-31 02:22:36.569'),(1744,'role:delete','usuarios','borrar role',69,'2024-07-31 02:22:36.595','2024-07-31 02:22:36.595'),(1745,'role:read','usuarios','leer role',69,'2024-07-31 02:22:36.621','2024-07-31 02:22:36.621'),(1746,'user:create','usuarios','crear usuarios',70,'2024-07-31 02:22:36.541','2024-07-31 02:22:36.541'),(1747,'user:update','usuarios','actualizar usuarios',70,'2024-07-31 02:22:36.569','2024-07-31 02:22:36.569'),(1748,'user:delete','usuarios','borrar usuarios',70,'2024-07-31 02:22:36.595','2024-07-31 02:22:36.595'),(1749,'user:read','usuarios','leer usuario',70,'2024-07-31 02:22:36.621','2024-07-31 02:22:36.621'),(1750,'application:create','usuarios','crear aplicaciones',70,'2024-07-31 02:22:36.541','2024-07-31 02:22:36.541'),(1751,'application:update','usuarios','actualizar aplicaciones',70,'2024-07-31 02:22:36.569','2024-07-31 02:22:36.569'),(1752,'application:delete','usuarios','borrar aplicaciones',70,'2024-07-31 02:22:36.595','2024-07-31 02:22:36.595'),(1753,'application:read','usuarios','leer aplicaciones',70,'2024-07-31 02:22:36.621','2024-07-31 02:22:36.621'),(1754,'role:create','usuarios','crear role',70,'2024-07-31 02:22:36.541','2024-07-31 02:22:36.541'),(1755,'role:update','usuarios','actualizar role',70,'2024-07-31 02:22:36.569','2024-07-31 02:22:36.569'),(1756,'role:delete','usuarios','borrar role',70,'2024-07-31 02:22:36.595','2024-07-31 02:22:36.595'),(1757,'role:read','usuarios','leer role',70,'2024-07-31 02:22:36.621','2024-07-31 02:22:36.621');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `token` text NOT NULL,
  `descendant_key` varchar(255) DEFAULT NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_tokens_key_unique` (`key`),
  KEY `refresh_tokens_descendant_key_fk` (`descendant_key`),
  CONSTRAINT `refresh_tokens_descendant_key_fk` FOREIGN KEY (`descendant_key`) REFERENCES `refresh_tokens` (`key`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (137,'1e90dfcb-6fce-414f-9fc5-c3a9e1bb7567','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIwNCwiYXpwIjoiYWI2ZjM3ZjQtYWI2My00MTU3LWIxNTctOTNiN2E4MmNkZmYwIiwiaXNzIjoiaHR0cHM6Ly9mY2YtdHJhaW5pbmcuYnJvd25iZWFyLmRldiIsImp0aSI6IjIxZWY1NGE0LTI5YWItNDllNy05NTI2LTUyZTZhN2RiYTkwMCIsImlhdCI6MTcyMjM5MjgzNC4wNTUsInBlcm1pc3Npb25zIjpbXSwibGFiZWxzIjpbXSwiaXNBZG1pbiI6dHJ1ZSwiaXNTdXBlckFkbWluIjp0cnVlLCJzY29wZSI6ImVtYWlsIHByb2ZpbGUgb3BlbmlkIiwiZXhwIjoxNzIzNjg4ODM0LjA1NX0.qr8FX-1CcKTViH4AO5Q-UxwjtdCQtDRE65001THmdKQ',NULL,'1970-01-20 22:48:08.834','2024-07-31 02:27:14.058','2024-07-31 02:27:14.058');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `application_id` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`),
  KEY `role_name_idx` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_to_permissions`
--

DROP TABLE IF EXISTS `roles_to_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles_to_permissions` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `roles_to_permissions_permission_id_fk` (`permission_id`),
  CONSTRAINT `roles_to_permissions_permission_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `roles_to_permissions_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_to_permissions`
--

LOCK TABLES `roles_to_permissions` WRITE;
/*!40000 ALTER TABLE `roles_to_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles_to_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_admin` tinyint(1) DEFAULT '0',
  `is_super_admin` tinyint(1) DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=217 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (203,'Pedro','Pablo','Medina','pedrodelilia@gmail.com','$2b$10$kO1GChOTv8/0e71x6JQqPevV0xCeocLq40WppOmGKdJGuMYUlUQYK','(628) 287-0802',NULL,1,1,1,'2024-06-21 05:04:22.247','2024-07-15 16:24:31.778'),(204,'Carlos','','Sanchez','carlosjosesancheze@gmail.com','$2b$10$zw.Ofdvwt8EYXcWZSBYseOQinkP9HOS00bTFPXGZj97RXcr8KHxjO','7232492949 x560',NULL,1,1,1,'2024-06-21 05:04:22.247','2024-06-21 05:04:22.247');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_to_labels`
--

DROP TABLE IF EXISTS `users_to_labels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_to_labels` (
  `user_id` int NOT NULL,
  `label_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`label_id`),
  KEY `users_to_labels_label_id_labels_id_fk` (`label_id`),
  CONSTRAINT `users_to_labels_label_id_labels_id_fk` FOREIGN KEY (`label_id`) REFERENCES `labels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `users_to_labels_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_to_labels`
--

LOCK TABLES `users_to_labels` WRITE;
/*!40000 ALTER TABLE `users_to_labels` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_to_labels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_to_roles`
--

DROP TABLE IF EXISTS `users_to_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_to_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `users_to_roles_role_id_roles_id_fk` (`role_id`),
  CONSTRAINT `users_to_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `users_to_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_to_roles`
--

LOCK TABLES `users_to_roles` WRITE;
/*!40000 ALTER TABLE `users_to_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_to_roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-30 22:29:28
