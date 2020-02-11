-- MySQL dump 10.13  Distrib 8.0.18, for macos10.14 (x86_64)
--
-- Host: localhost    Database: coding_fight_club
-- ------------------------------------------------------
-- Server version	8.0.18

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
-- Table structure for table `level_table`
--

DROP TABLE IF EXISTS `level_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `level_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_points` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `level_table`
--

LOCK TABLES `level_table` WRITE;
/*!40000 ALTER TABLE `level_table` DISABLE KEYS */;
/*!40000 ALTER TABLE `level_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_detail`
--

DROP TABLE IF EXISTS `match_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `match_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `question_id` int(11) DEFAULT NULL,
  `answer_code` text COLLATE utf8mb4_unicode_ci,
  `small_correctness` decimal(3,2) DEFAULT NULL,
  `large_correctness` decimal(3,2) DEFAULT NULL,
  `small_exec_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `large_exec_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `performance` decimal(3,2) DEFAULT NULL,
  `answer_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  KEY `match_id` (`match_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `match_detail_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`),
  CONSTRAINT `match_detail_ibfk_2` FOREIGN KEY (`match_id`) REFERENCES `match_table` (`id`),
  CONSTRAINT `match_detail_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user_table` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=230 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_detail`
--

LOCK TABLES `match_detail` WRITE;
/*!40000 ALTER TABLE `match_detail` DISABLE KEYS */;
INSERT INTO `match_detail` VALUES (151,98,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [1,2]\n };',0.33,NULL,'8.42',NULL,NULL,'11.099',NULL,'2020-02-09 01:44:58','2020-02-09 10:26:53'),(152,98,2,21,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-09 01:44:58','2020-02-09 09:44:58'),(153,100,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [0,4]\n };',0.17,NULL,'7.37',NULL,NULL,'8.09',NULL,'2020-02-09 02:27:34','2020-02-09 10:28:48'),(154,100,2,21,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-09 02:27:34','2020-02-09 10:27:34'),(165,106,2,21,'const twoSum = function(nums, target) {\n     // Write your code here\n  return [0,4]\n };',0.17,NULL,'7.839',NULL,NULL,'42.529',NULL,'2020-02-09 02:31:49','2020-02-09 11:02:10'),(166,106,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return nums\n };',0.00,NULL,NULL,NULL,NULL,'12.476',NULL,'2020-02-09 02:31:49','2020-02-09 11:16:10'),(167,107,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'4.236',NULL,'2020-02-09 03:16:23','2020-02-09 11:24:21'),(168,107,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'9.799',NULL,'2020-02-09 03:16:23','2020-02-09 11:24:26'),(169,108,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'2.115',NULL,'2020-02-09 03:25:04','2020-02-09 11:28:39'),(170,108,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn target\n};',0.00,NULL,NULL,NULL,NULL,'8.207',NULL,'2020-02-09 03:25:04','2020-02-09 11:28:45'),(171,109,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [1,2]\n };',0.33,NULL,'6.239',NULL,NULL,'8.762',NULL,'2020-02-09 03:29:08','2020-02-09 11:29:16'),(172,109,2,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [1,2]\n };',0.33,NULL,'6.4725',NULL,NULL,'2.689',NULL,'2020-02-09 03:29:08','2020-02-09 13:20:26'),(173,110,1,21,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-09 05:20:41','2020-02-09 13:20:41'),(174,110,2,21,'const twoSum = function(nums, target) {\n     // Write your code here\n \n };',0.00,NULL,NULL,NULL,NULL,'258.778',NULL,'2020-02-09 05:20:41','2020-02-09 13:30:10'),(175,111,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'6.031',NULL,'2020-02-09 05:31:55','2020-02-09 13:32:01'),(176,111,1,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-09 05:31:55','2020-02-09 13:31:55'),(177,113,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [1, 2]\n};',0.40,NULL,'6.644',NULL,NULL,'3948.571',NULL,'2020-02-10 01:42:55','2020-02-10 10:51:44'),(178,113,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [0,4];\n};',0.20,NULL,'14.531',NULL,NULL,'158.453',NULL,'2020-02-10 01:42:55','2020-02-10 09:45:32'),(179,114,1,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-10 03:12:15','2020-02-10 11:12:15'),(180,114,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn nums\n};',0.00,NULL,NULL,NULL,NULL,'32.39',NULL,'2020-02-10 03:12:15','2020-02-10 11:12:47'),(181,115,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'10.431',NULL,'2020-02-10 03:13:55','2020-02-10 11:14:05'),(182,115,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [0, 4]\n};',0.20,NULL,'8.097',NULL,NULL,'37.362',NULL,'2020-02-10 03:13:55','2020-02-10 11:14:32'),(183,116,2,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-10 03:23:09','2020-02-10 11:23:09'),(184,116,1,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-10 03:23:09','2020-02-10 11:23:09'),(185,117,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'3.568',NULL,'2020-02-10 03:24:42','2020-02-10 14:27:27'),(186,117,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [1,2]\n};',0.40,NULL,'7.1655',NULL,NULL,'183.611',NULL,'2020-02-10 03:24:42','2020-02-10 14:30:27'),(187,117,NULL,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-10 06:19:13','2020-02-10 14:19:13'),(188,118,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'3.202',NULL,'2020-02-10 06:31:05','2020-02-10 14:32:04'),(189,118,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'4.53',NULL,'2020-02-10 06:31:05','2020-02-10 14:31:09'),(190,119,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn[1,2]\n};',0.40,NULL,'7.241',NULL,NULL,'15.242',NULL,'2020-02-10 06:32:13','2020-02-10 14:32:28'),(191,119,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'3.524',NULL,'2020-02-10 06:32:13','2020-02-10 14:32:16'),(192,120,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [1,2]\n};',0.40,NULL,'6.2395',NULL,NULL,'4.365',NULL,'2020-02-10 07:01:00','2020-02-10 15:03:29'),(193,120,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'7.126',NULL,'2020-02-10 07:01:00','2020-02-10 15:01:07'),(194,121,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn nums\n};',0.00,NULL,NULL,NULL,NULL,'11.884',NULL,'2020-02-10 07:04:16','2020-02-10 15:04:27'),(195,121,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [1,2]\n};',0.40,NULL,'10.645',NULL,NULL,'3.478',NULL,'2020-02-10 07:04:16','2020-02-10 15:12:00'),(196,122,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn[1,2];\n};',0.40,NULL,'7.2065',NULL,NULL,'15.371',NULL,'2020-02-10 07:12:41','2020-02-10 15:12:56'),(197,122,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'4.082',NULL,'2020-02-10 07:12:41','2020-02-10 15:12:45'),(198,123,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n asdf\n };',0.00,NULL,NULL,NULL,NULL,'9.81',NULL,'2020-02-10 07:14:13','2020-02-10 15:14:22'),(199,123,2,21,'const twoSum = function(nums, target) {\n     // Write your code here\n \n };',0.00,NULL,NULL,NULL,NULL,'3.59',NULL,'2020-02-10 07:14:13','2020-02-10 15:14:16'),(200,124,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn[0,4]\n};',0.20,NULL,'6.239',NULL,NULL,'14.45',NULL,'2020-02-10 07:19:55','2020-02-10 15:20:09'),(201,124,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\n\n};',0.00,NULL,NULL,NULL,NULL,'3.962',NULL,'2020-02-10 07:19:55','2020-02-10 15:19:58'),(202,125,2,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [1,2]\n };',0.33,NULL,'7.9435',NULL,NULL,'15.275',NULL,'2020-02-10 07:22:33','2020-02-10 15:22:48'),(203,125,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n \n };',0.00,NULL,NULL,NULL,NULL,'5.284',NULL,'2020-02-10 07:22:33','2020-02-10 15:22:38'),(204,126,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [0,4]\n};',0.20,NULL,'6.421',NULL,NULL,'13.44',NULL,'2020-02-10 07:24:23','2020-02-10 15:24:36'),(205,126,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\n while (true) {\n }\n};',0.00,NULL,NULL,NULL,NULL,'181.219',NULL,'2020-02-10 07:24:23','2020-02-10 16:33:39'),(206,127,2,21,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-10 08:36:36','2020-02-10 16:36:36'),(207,127,1,21,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-10 08:36:36','2020-02-10 16:36:36'),(208,128,2,34,'const twoSum = function(nums, target) {\n    const comp = {};\n    for(let i=0; i<nums.length; i++){\n        if(comp[nums[i] ]>=0){\n            return [ comp[nums[i] ] , i]\n        }\n        comp[target-nums[i]] = i\n    }\n};',0.00,NULL,NULL,NULL,NULL,'9.593',NULL,'2020-02-10 11:26:35','2020-02-10 22:48:14'),(209,128,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [1,2]\n};',0.29,NULL,'7.3765',NULL,NULL,'29.982',NULL,'2020-02-10 11:26:35','2020-02-10 19:30:06'),(210,129,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [1,2]\n  \n};',0.29,0.00,'6.255',NULL,NULL,'3.104',NULL,'2020-02-10 14:52:30','2020-02-10 23:17:29'),(211,129,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [1,2]\n};',0.29,0.00,'6.9254999999999995',NULL,NULL,'8.71',NULL,'2020-02-10 14:52:30','2020-02-10 23:21:02'),(212,130,2,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [0,4]\n };',0.17,0.00,'7.439',NULL,NULL,'8.223',NULL,'2020-02-10 15:21:32','2020-02-10 23:21:40'),(213,130,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return nums\n };',0.00,0.00,NULL,NULL,NULL,'17.935',NULL,'2020-02-10 15:21:32','2020-02-10 23:21:49'),(214,131,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [1,2]\n };',0.33,0.00,'6.982',NULL,NULL,'44.967',NULL,'2020-02-10 16:23:44','2020-02-11 00:24:28'),(215,131,2,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return nums.length\n };',0.00,0.00,NULL,NULL,NULL,'26.766',NULL,'2020-02-10 16:23:44','2020-02-11 00:24:10'),(216,132,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [0,4]\n};',0.14,0.00,'6.442',NULL,NULL,'11.617',NULL,'2020-02-11 00:48:28','2020-02-11 08:48:39'),(217,132,2,34,'',0.00,0.00,NULL,NULL,NULL,'88.731',NULL,'2020-02-11 00:48:28','2020-02-11 08:49:56'),(218,133,2,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-11 00:50:25','2020-02-11 08:50:25'),(219,133,1,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-11 00:50:25','2020-02-11 08:50:25'),(220,134,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [0,4]\n };',0.17,0.00,'11.022',NULL,NULL,'23.618',NULL,'2020-02-11 00:52:17','2020-02-11 08:52:40'),(221,134,2,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [1,2]\n };',0.33,0.00,'8.705',NULL,NULL,'6.897',NULL,'2020-02-11 00:52:17','2020-02-11 08:52:23'),(222,135,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [0,4]\n};',0.14,0.00,'7.747',NULL,NULL,'20.092',NULL,'2020-02-11 00:56:43','2020-02-11 08:57:03'),(223,135,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [1,2]\n};',0.29,0.00,'7.845',NULL,NULL,'7.187',NULL,'2020-02-11 00:56:43','2020-02-11 08:56:50'),(224,136,1,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [0,4]\n };',0.17,0.00,'6.15',NULL,NULL,'18.476',NULL,'2020-02-11 01:02:15','2020-02-11 09:02:33'),(225,136,2,21,'const twoSum = function(nums, target) {\n     // Write your code here\n return [1,2]\n };',0.33,0.00,'6.713',NULL,NULL,'6.592',NULL,'2020-02-11 01:02:15','2020-02-11 09:02:21'),(226,137,1,34,'const twoSum = function (nums, target) {\n  // Write your code here\n  return [1,2]\n};',0.29,0.00,'6.8774999999999995',NULL,NULL,'103.076',NULL,'2020-02-11 01:53:35','2020-02-11 09:55:18'),(227,137,2,34,'const twoSum = function (nums, target) {\n  // Write your code here\nreturn [0,4]\n};',0.14,0.00,'11.834',NULL,NULL,'141.579',NULL,'2020-02-11 01:53:35','2020-02-11 09:55:56'),(228,138,1,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-11 06:40:13','2020-02-11 14:40:13'),(229,138,2,34,'const twoSum = function(nums, target) {\n  const comp = {};\n  for(let i=0; i<nums.length; i++){\n      if(comp[nums[i] ]>=0){\n          return [ comp[nums[i] ] , i]\n      }\n      comp[target-nums[i]] = i\n  }\n}',0.86,1.00,'8.360166666666666','2292.497',NULL,'23.165',NULL,'2020-02-11 06:40:13','2020-02-11 14:54:46');
/*!40000 ALTER TABLE `match_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_table`
--

DROP TABLE IF EXISTS `match_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id_1` int(11) DEFAULT NULL,
  `user_id_2` int(11) DEFAULT NULL,
  `question_id` int(11) NOT NULL,
  `match_key` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `winner_user_id` int(11) DEFAULT NULL,
  `match_start_time` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `match_key` (`match_key`),
  KEY `question_id` (`question_id`),
  KEY `user_id_1` (`user_id_1`),
  KEY `user_id_2` (`user_id_2`),
  CONSTRAINT `match_table_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`),
  CONSTRAINT `match_table_ibfk_2` FOREIGN KEY (`user_id_1`) REFERENCES `user_table` (`id`),
  CONSTRAINT `match_table_ibfk_3` FOREIGN KEY (`user_id_2`) REFERENCES `user_table` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_table`
--

LOCK TABLES `match_table` WRITE;
/*!40000 ALTER TABLE `match_table` DISABLE KEYS */;
INSERT INTO `match_table` VALUES (80,1,NULL,21,'8313614152',NULL,'2020-02-07 08:08:34','2020-02-07 07:02:31','2020-02-07 16:08:34'),(81,2,NULL,34,'4707215335',NULL,NULL,'2020-02-07 07:02:41','2020-02-07 15:02:41'),(82,1,NULL,21,'0309649042',NULL,'2020-02-07 09:44:56','2020-02-07 08:08:58','2020-02-07 17:44:56'),(83,1,NULL,21,'4039506102',NULL,'2020-02-07 09:46:26','2020-02-07 09:45:00','2020-02-07 17:46:26'),(84,1,NULL,21,'8580739730',NULL,NULL,'2020-02-07 09:50:27','2020-02-07 17:50:27'),(85,1,NULL,21,'6323632157',NULL,NULL,'2020-02-07 09:55:38','2020-02-07 17:55:38'),(86,1,NULL,34,'6989084979',NULL,NULL,'2020-02-07 09:58:40','2020-02-07 17:58:40'),(87,1,NULL,34,'4696059111',NULL,NULL,'2020-02-07 10:01:37','2020-02-07 18:01:37'),(88,1,2,21,'7618908196',NULL,'2020-02-07 10:57:35','2020-02-07 10:01:50','2020-02-07 18:57:35'),(89,1,1,34,'1422755556',NULL,'2020-02-08 02:04:49','2020-02-07 10:57:58','2020-02-08 10:04:49'),(90,1,2,34,'3958356463',NULL,'2020-02-08 05:05:44','2020-02-08 02:06:30','2020-02-08 13:05:44'),(91,1,NULL,21,'9242934182',NULL,NULL,'2020-02-08 05:26:27','2020-02-08 13:26:27'),(92,1,NULL,21,'7208154685',NULL,NULL,'2020-02-08 05:27:03','2020-02-08 13:27:03'),(93,1,NULL,21,'0256144134',NULL,'2020-02-08 05:46:59','2020-02-08 05:30:41','2020-02-08 13:46:59'),(94,1,NULL,21,'8285842955',NULL,NULL,'2020-02-08 05:48:29','2020-02-08 13:48:29'),(95,1,2,34,'1159528858',NULL,'2020-02-08 05:53:10','2020-02-08 05:53:06','2020-02-08 13:53:10'),(96,1,2,34,'7867536323',NULL,'2020-02-08 05:53:57','2020-02-08 05:53:53','2020-02-08 13:53:57'),(97,1,1,21,'3147082899',NULL,'2020-02-09 01:44:29','2020-02-08 05:56:07','2020-02-09 09:44:29'),(98,1,1,21,'0832226432',NULL,'2020-02-09 02:27:25','2020-02-09 01:44:46','2020-02-09 10:27:25'),(100,1,2,21,'0602945288',NULL,'2020-02-09 02:31:04','2020-02-09 02:27:29','2020-02-09 10:31:04'),(101,1,2,34,'7008806274',NULL,'2020-02-09 02:31:12','2020-02-09 02:31:08','2020-02-09 10:31:12'),(102,1,2,34,'3870597776',NULL,'2020-02-09 02:31:18','2020-02-09 02:31:15','2020-02-09 10:31:18'),(103,1,2,34,'3678550470',NULL,'2020-02-09 02:31:24','2020-02-09 02:31:21','2020-02-09 10:31:24'),(104,1,2,34,'8762326833',NULL,'2020-02-09 02:31:29','2020-02-09 02:31:27','2020-02-09 10:31:29'),(105,1,2,34,'0460736204',NULL,'2020-02-09 02:31:38','2020-02-09 02:31:32','2020-02-09 10:31:38'),(106,2,1,21,'4939368229',NULL,'2020-02-09 03:15:58','2020-02-09 02:31:44','2020-02-09 11:15:58'),(107,1,2,34,'8130759791',NULL,'2020-02-09 03:24:51','2020-02-09 03:16:18','2020-02-09 11:24:51'),(108,1,2,34,'9317389779',NULL,'2020-02-09 03:28:37','2020-02-09 03:24:58','2020-02-09 11:28:37'),(109,1,2,21,'3691337234',NULL,'2020-02-09 05:20:24','2020-02-09 03:29:01','2020-02-09 13:20:24'),(110,1,2,21,'8846438043',NULL,'2020-02-09 05:25:52','2020-02-09 05:20:37','2020-02-09 13:25:52'),(111,1,2,34,'8333320943',NULL,'2020-02-09 05:58:21','2020-02-09 05:30:37','2020-02-09 13:58:21'),(112,1,NULL,34,'0478020389',NULL,NULL,'2020-02-09 09:04:04','2020-02-09 17:04:04'),(113,1,1,34,'9034002128',NULL,'2020-02-10 01:45:56','2020-02-09 09:14:11','2020-02-10 09:45:56'),(114,1,2,34,'9244810288',NULL,'2020-02-10 03:12:15','2020-02-10 03:12:11','2020-02-10 11:12:15'),(115,1,2,34,'3833324575',NULL,'2020-02-10 03:13:55','2020-02-10 03:13:51','2020-02-10 11:13:55'),(116,2,1,34,'2179479627',NULL,'2020-02-10 03:24:29','2020-02-10 03:19:54','2020-02-10 11:24:29'),(117,2,1,34,'2040290864',NULL,'2020-02-10 06:27:24','2020-02-10 03:24:32','2020-02-10 14:27:24'),(118,1,2,34,'5001495981',NULL,'2020-02-10 06:32:01','2020-02-10 06:31:01','2020-02-10 14:32:01'),(119,1,2,34,'5698972926',NULL,'2020-02-10 06:32:13','2020-02-10 06:32:10','2020-02-10 14:32:13'),(120,1,1,34,'9400594722',NULL,'2020-02-10 07:04:08','2020-02-10 07:00:50','2020-02-10 15:04:08'),(121,1,1,34,'7100106131',NULL,'2020-02-10 07:11:57','2020-02-10 07:04:12','2020-02-10 15:11:57'),(122,1,2,34,'2889258539',NULL,'2020-02-10 07:12:41','2020-02-10 07:12:38','2020-02-10 15:12:41'),(123,1,2,21,'6985692641',NULL,'2020-02-10 07:14:13','2020-02-10 07:14:08','2020-02-10 15:14:13'),(124,1,2,34,'5100595143',NULL,'2020-02-10 07:19:55','2020-02-10 07:19:50','2020-02-10 15:19:55'),(125,2,1,21,'4428741913',NULL,'2020-02-10 07:22:33','2020-02-10 07:22:29','2020-02-10 15:22:33'),(126,1,1,34,'3610662963',NULL,'2020-02-10 08:30:38','2020-02-10 07:24:19','2020-02-10 16:30:38'),(127,2,2,21,'3013622210',NULL,'2020-02-10 11:26:14','2020-02-10 08:36:32','2020-02-10 19:26:14'),(128,2,1,34,'9736501846',NULL,'2020-02-10 14:48:05','2020-02-10 11:26:27','2020-02-10 22:48:05'),(129,2,2,34,'1301849601',NULL,'2020-02-10 15:20:54','2020-02-10 14:52:25','2020-02-10 23:20:54'),(130,2,1,21,'9601940670',NULL,'2020-02-10 15:21:32','2020-02-10 15:21:29','2020-02-10 23:21:32'),(131,1,2,21,'4737563553',NULL,'2020-02-10 16:23:44','2020-02-10 16:23:35','2020-02-11 00:23:44'),(132,1,2,34,'3505654993',NULL,'2020-02-11 00:48:28','2020-02-11 00:48:18','2020-02-11 08:48:28'),(133,2,1,34,'0416034200',NULL,'2020-02-11 00:52:10','2020-02-11 00:50:21','2020-02-11 08:52:10'),(134,1,2,21,'4708992341',NULL,'2020-02-11 00:52:17','2020-02-11 00:52:12','2020-02-11 08:52:17'),(135,2,1,34,'7988802225',NULL,'2020-02-11 00:56:43','2020-02-11 00:56:40','2020-02-11 08:56:43'),(136,1,2,21,'0238740033',NULL,'2020-02-11 01:02:15','2020-02-11 01:02:11','2020-02-11 09:02:15'),(137,1,2,34,'6540393752',NULL,'2020-02-11 03:34:06','2020-02-11 01:53:30','2020-02-11 11:34:06'),(138,1,1,34,'6517513294',NULL,'2020-02-11 07:51:47','2020-02-11 06:40:07','2020-02-11 15:51:47');
/*!40000 ALTER TABLE `match_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci,
  `question_code` text COLLATE utf8mb4_unicode_ci,
  `question_const` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `difficulty` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES (21,'Two Sum','Given an array of integers, return indices of the two numbers such that they add up to a specific target.\r\n\r\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\r\n\r\nExample:\r\n\r\nGiven nums = [2, 7, 11, 15], target = 9,\r\n\r\nBecause nums[0] + nums[1] = 2 + 7 = 9,\r\nreturn [0, 1].','const twoSum = function(nums, target) {\r     // Write your code here\r \r };','twoSum','easy','algorithms','2020-01-29 06:47:06','2020-02-05 16:12:43'),(34,'Two Sum V2','Given an array of integers, return indices of the two numbers such that they add up to a specific target. \r\n\r\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. \r\n\r\nExample: Given nums = [2, 7, 11, 15], target = 9, \r\nBecause nums[0] + nums[1] = 2 + 7 = 9, return [0, 1].','const twoSum = function (nums, target) {\r\n  // Write your code here\r\n\r\n};','twoSum','easy','algorithms','2020-02-07 05:28:52','2020-02-07 13:28:52');
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test`
--

DROP TABLE IF EXISTS `test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `test_case_path` text COLLATE utf8mb4_unicode_ci,
  `test_result` text COLLATE utf8mb4_unicode_ci,
  `threshold_ms` decimal(10,0) DEFAULT NULL,
  `is_large_case` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `test_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test`
--

LOCK TABLES `test` WRITE;
/*!40000 ALTER TABLE `test` DISABLE KEYS */;
INSERT INTO `test` VALUES (39,21,'./testcases/21/0.json','[0,2]',70,0),(46,34,'./testcases/34/0.json','[0,1]',70,0),(47,34,'./testcases/34/1.json','[0,2]',70,0),(48,34,'./testcases/34/2.json','[1,2]',70,0),(49,21,'./testcases/21/1.json','[1,2]',70,0),(50,21,'./testcases/21/2.json','[0,1]',70,0),(51,34,'./testcases/34/3.json','[0,1]',70,0),(52,34,'./testcases/34/4.json','[3,12]',70,0),(53,21,'./testcases/21/3.json','[3,12]',70,0),(54,21,'./testcases/21/4.json','[1,2]',70,0),(55,34,'./testcases/34/5.json','[1,2]',70,0),(56,34,'./testcases/34/6.json','[0,4]',70,0),(57,21,'./testcases/21/5.json','[0,4]',70,0),(65,21,'./testcases/21/6.json','[500000,800001]',12000,1),(66,34,'./testcases/34/6.json','[500000,800001]',12000,1);
/*!40000 ALTER TABLE `test` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_table`
--

DROP TABLE IF EXISTS `user_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `provider` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `level_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `level_id` (`level_id`),
  CONSTRAINT `user_table_ibfk_1` FOREIGN KEY (`level_id`) REFERENCES `level_table` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_table`
--

LOCK TABLES `user_table` WRITE;
/*!40000 ALTER TABLE `user_table` DISABLE KEYS */;
INSERT INTO `user_table` VALUES (1,'Test','test@test.com',NULL,NULL,NULL,NULL,NULL,'2020-02-07 07:02:00','2020-02-07 15:02:00'),(2,'Ethan','ethan@ethan.com',NULL,NULL,NULL,NULL,NULL,'2020-02-07 07:02:00','2020-02-07 15:02:00');
/*!40000 ALTER TABLE `user_table` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-02-11 16:15:04
