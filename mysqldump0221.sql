-- MySQL dump 10.13  Distrib 8.0.18, for macos10.14 (x86_64)
--
-- Host: coding-fight-club.cydqjqxxvvna.us-east-1.rds.amazonaws.com    Database: coding_fight_club
-- ------------------------------------------------------
-- Server version	8.0.16

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
-- Table structure for table `bug_report`
--

DROP TABLE IF EXISTS `bug_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bug_report` (
  `reporter` varchar(255) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bug_report`
--

LOCK TABLES `bug_report` WRITE;
/*!40000 ALTER TABLE `bug_report` DISABLE KEYS */;
INSERT INTO `bug_report` VALUES ('asdf','asfd','2020-02-20 02:41:33'),('test','test test','2020-02-20 02:42:56'),('test','test','2020-02-20 02:43:43'),('test','test','2020-02-20 02:44:12');
/*!40000 ALTER TABLE `bug_report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `level_table`
--

DROP TABLE IF EXISTS `level_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `level_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_points` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `level_table`
--

LOCK TABLES `level_table` WRITE;
/*!40000 ALTER TABLE `level_table` DISABLE KEYS */;
INSERT INTO `level_table` VALUES (1,'Beginner Fighter',0),(2,'Skilled Fighter',100),(3,'Advanced Fighter',300),(4,'Expert Fighter',800),(5,'Master Fighter',2000);
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
  `answer_code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `small_correctness` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `large_correctness` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correctness` decimal(5,2) DEFAULT NULL,
  `large_passed` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `large_exec_time` int(10) DEFAULT NULL,
  `performance` decimal(5,2) DEFAULT NULL,
  `answer_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `match_id` (`match_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `match_detail_ibfk_2` FOREIGN KEY (`match_id`) REFERENCES `match_table` (`id`),
  CONSTRAINT `match_detail_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user_table` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=501 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_detail`
--

LOCK TABLES `match_detail` WRITE;
/*!40000 ALTER TABLE `match_detail` DISABLE KEYS */;
INSERT INTO `match_detail` VALUES (479,287,34,'const twoSum = function(nums, target) {\n     // Write your code here\n return true\n };','0/6','0/1',0.00,'0/1',NULL,0.00,'31.048',0,'2020-02-20 11:11:18','2020-02-20 11:11:49'),(480,287,18,'const twoSum = function(nums, target) {\n	const comp = {};\n	for(let i=0; i<nums.length; i++){\n		if(comp[nums[i] ]>=0){\n			return [ comp[nums[i] ] , i]\n		}\n	comp[target-nums[i]] = i\n	}\n};','6/6','1/1',100.00,'1/1',2740,100.00,'27.061',100,'2020-02-20 11:11:19','2020-02-20 11:11:45'),(481,290,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 11:25:04','2020-02-20 11:25:04'),(482,290,18,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 11:25:04','2020-02-20 11:25:04'),(483,291,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 11:25:36','2020-02-20 11:25:36'),(484,291,18,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 11:25:37','2020-02-20 11:25:37'),(485,292,18,'const twoSum = function(nums, target) {\n	const comp = {};\n	for(let i=0; i<nums.length; i++){\n		if(comp[nums[i] ]>=0){\n			return [ comp[nums[i] ] , i]\n		}\n	comp[target-nums[i]] = i\n	}\n};','6/6','1/1',100.00,'1/1',2967,100.00,'126.084',100,'2020-02-20 11:55:00','2020-02-20 11:57:06'),(486,292,34,'const twoSum = function(nums, target) {\n     // Write your code here\nreturn [1,2]\n };','2/6','0/1',28.57,'0/1',NULL,0.00,'134.673',14,'2020-02-20 11:55:01','2020-02-20 11:57:15'),(487,293,18,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 11:59:04','2020-02-20 11:59:04'),(488,293,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 11:59:05','2020-02-20 11:59:05'),(489,294,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 12:06:21','2020-02-20 12:06:21'),(490,294,18,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 12:06:22','2020-02-20 12:06:22'),(491,295,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 12:21:20','2020-02-20 12:21:20'),(492,295,18,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 12:21:20','2020-02-20 12:21:20'),(493,296,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 12:33:56','2020-02-20 12:33:56'),(494,296,35,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 12:33:57','2020-02-20 12:33:57'),(495,297,36,'const twoSum = function(nums, target) {\n     // Write your code here\n \n };','0/6','0/1',0.00,'0/1',NULL,0.00,'229.746',0,'2020-02-20 14:34:50','2020-02-20 14:38:39'),(496,297,34,'const twoSum = function(nums, target) {\n	const comp = {};\n	for(let i=0; i<nums.length; i++){\n		if(comp[nums[i] ]>=0){\n			return [ comp[nums[i] ] , i]\n		}\n	comp[target-nums[i]] = i\n	}\n};','6/6','1/1',100.00,'1/1',2715,100.00,'349.775',100,'2020-02-20 14:34:51','2020-02-20 14:40:39'),(497,298,36,'const twoSum = function(nums, target) {\n	const comp = {};\n	for(let i=0; i<nums.length; i++){\n		if(comp[nums[i] ]>=0){\n			return [ comp[nums[i] ] , i]\n		}\n	comp[target-nums[i]] = i\n	}\n};','6/6','1/1',100.00,'1/1',2502,100.00,'43.672',100,'2020-02-20 14:44:16','2020-02-20 14:44:57'),(498,298,34,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-02-20 14:44:18','2020-02-20 14:44:18'),(499,299,18,'const twoSum = function(nums, target) {\n     // Write your code here\n  return [0,2]\n \n};','1/6','0/1',14.29,'0/1',NULL,0.00,'250.762',7,'2020-02-21 02:20:36','2020-02-21 02:24:47'),(500,299,19,'const twoSum = function(nums, target) {\n     // Write your code here\n  \n	for(let i = 0; i < nums.length - 1; i++){\n    	for(let j = i; j < nums.length; j++){\n    		if (nums[i] + nums[j] == target){\n             	return [i, j];\n            }\n    	}\n    }\n};','6/6','0/1',85.71,'0/0',NULL,0.00,'232.573',43,'2020-02-21 02:20:36','2020-02-21 02:24:29');
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
  `question_id` int(11) NOT NULL,
  `match_key` bigint(20) DEFAULT NULL,
  `winner_user_id` int(11) DEFAULT NULL,
  `match_start_time` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `match_key` (`match_key`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `match_table_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=301 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_table`
--

LOCK TABLES `match_table` WRITE;
/*!40000 ALTER TABLE `match_table` DISABLE KEYS */;
INSERT INTO `match_table` VALUES (175,21,4200754183,1,1581598650784,'2020-02-13 12:57:26','2020-02-13 12:57:50'),(176,21,8356801417,2,1581600360839,'2020-02-13 13:25:56','2020-02-13 13:26:17'),(178,21,9928075307,NULL,1581605054554,'2020-02-13 13:53:16','2020-02-13 14:44:14'),(180,21,1453713054,1,1581605288114,'2020-02-13 14:48:00','2020-02-13 14:49:19'),(181,21,9047217672,NULL,NULL,'2020-02-13 14:50:51','2020-02-13 14:50:51'),(182,21,3107972817,1,1581669605220,'2020-02-14 03:09:55','2020-02-14 08:40:06'),(183,21,9305583702,1,1581669615577,'2020-02-14 08:40:10','2020-02-14 08:42:40'),(185,21,8597716920,1,1581676346840,'2020-02-14 10:28:14','2020-02-14 10:32:40'),(186,21,2374405509,2,1581688993216,'2020-02-14 10:33:46','2020-02-14 14:03:48'),(188,21,1957591793,1,1581687619822,'2020-02-14 13:40:14','2020-02-14 13:41:29'),(189,21,8661085541,2,1581689132663,'2020-02-14 14:05:27','2020-02-14 14:06:04'),(190,21,4774401249,NULL,NULL,'2020-02-15 02:03:59','2020-02-15 02:03:59'),(191,21,4073931132,NULL,NULL,'2020-02-15 02:08:22','2020-02-15 02:08:22'),(193,21,6775382484,NULL,NULL,'2020-02-15 02:27:44','2020-02-15 02:27:44'),(194,21,1103597360,NULL,1581749695271,'2020-02-15 06:39:01','2020-02-15 06:54:55'),(197,21,8659239262,2,1581756033300,'2020-02-15 08:40:25','2020-02-15 08:41:46'),(198,21,3685929450,1,1581756945824,'2020-02-15 08:55:38','2020-02-15 08:56:26'),(201,21,9990552293,NULL,1581758578399,'2020-02-15 09:21:03','2020-02-15 09:22:58'),(205,21,9667088765,NULL,1581776472885,'2020-02-15 11:28:34','2020-02-15 14:21:13'),(206,21,7296012781,NULL,1581818740159,'2020-02-16 02:00:05','2020-02-16 02:05:40'),(207,21,5745589042,NULL,NULL,'2020-02-16 02:59:47','2020-02-16 02:59:47'),(209,21,3327420088,NULL,1581826017415,'2020-02-16 04:04:40','2020-02-16 04:06:57'),(212,21,5976375134,NULL,NULL,'2020-02-16 06:45:05','2020-02-16 06:45:05'),(214,21,3536950226,NULL,NULL,'2020-02-17 07:11:13','2020-02-17 07:11:13'),(215,21,5042070456,NULL,NULL,'2020-02-17 07:12:41','2020-02-17 07:12:41'),(216,21,6196887694,NULL,NULL,'2020-02-17 07:15:16','2020-02-17 07:15:16'),(219,21,9933127883,NULL,NULL,'2020-02-17 07:20:04','2020-02-17 07:20:04'),(220,21,5483044792,NULL,1581926423601,'2020-02-17 07:22:29','2020-02-17 08:00:23'),(224,21,2797597786,NULL,1581927358072,'2020-02-17 08:10:32','2020-02-17 08:15:58'),(225,21,7862944180,NULL,1581928406470,'2020-02-17 08:16:03','2020-02-17 08:33:26'),(226,21,9893005944,NULL,1581932604735,'2020-02-17 08:33:29','2020-02-17 09:43:25'),(228,21,5557825928,NULL,1581933089044,'2020-02-17 09:46:59','2020-02-17 09:51:29'),(230,21,4287930213,NULL,1581938037772,'2020-02-17 11:10:13','2020-02-17 11:13:58'),(231,21,5047170290,NULL,1581938699736,'2020-02-17 11:23:01','2020-02-17 11:25:00'),(233,21,3018736441,NULL,1581939053130,'2020-02-17 11:27:15','2020-02-17 11:30:53'),(237,21,7631235683,18,1581940070514,'2020-02-17 11:47:43','2020-02-17 11:48:21'),(238,21,3046972902,NULL,1581940182545,'2020-02-17 11:48:34','2020-02-17 11:49:42'),(241,21,2180828988,NULL,1581941338023,'2020-02-17 12:04:42','2020-02-17 12:08:58'),(242,21,4962465326,NULL,1581941925486,'2020-02-17 12:18:35','2020-02-17 12:18:45'),(245,21,7545739863,19,1581943855119,'2020-02-17 12:34:49','2020-02-17 12:50:55'),(247,21,7721982127,19,1581944266938,'2020-02-17 12:57:41','2020-02-17 12:59:17'),(248,21,596023443,NULL,1581947053720,'2020-02-17 13:40:25','2020-02-17 13:44:14'),(253,21,4490485437,28,1581990982009,'2020-02-18 01:56:02','2020-02-18 01:59:17'),(254,35,2965395735,NULL,NULL,'2020-02-18 02:52:09','2020-02-18 02:52:09'),(255,21,467210030,18,1582009658637,'2020-02-18 07:06:38','2020-02-18 07:08:02'),(258,21,9223224754,18,1582009821405,'2020-02-18 07:10:17','2020-02-18 07:10:51'),(259,21,7313820930,NULL,NULL,'2020-02-18 08:35:01','2020-02-18 08:35:01'),(260,21,1777515265,NULL,NULL,'2020-02-18 09:09:24','2020-02-18 09:09:24'),(261,21,11857432,NULL,NULL,'2020-02-18 13:59:16','2020-02-18 13:59:16'),(262,21,7539425455,NULL,NULL,'2020-02-18 14:24:37','2020-02-18 14:24:37'),(263,21,3725357073,NULL,NULL,'2020-02-19 02:54:20','2020-02-19 02:54:20'),(264,21,9716105905,NULL,1582080960013,'2020-02-19 02:55:47','2020-02-19 02:56:00'),(265,21,1983249985,NULL,NULL,'2020-02-19 03:20:36','2020-02-19 03:20:36'),(266,21,489386488,NULL,NULL,'2020-02-19 06:48:02','2020-02-19 06:48:02'),(267,21,4806157900,NULL,NULL,'2020-02-19 09:56:53','2020-02-19 09:56:53'),(268,21,3559419677,NULL,NULL,'2020-02-20 03:11:18','2020-02-20 03:11:18'),(269,21,5481834171,NULL,1582169439602,'2020-02-20 03:29:53','2020-02-20 03:30:39'),(270,21,6762135010,NULL,NULL,'2020-02-20 05:17:04','2020-02-20 05:17:04'),(271,21,9512082803,NULL,NULL,'2020-02-20 05:20:22','2020-02-20 05:20:22'),(272,21,8998097889,NULL,NULL,'2020-02-20 05:23:45','2020-02-20 05:23:45'),(273,21,1537111563,NULL,NULL,'2020-02-20 05:38:29','2020-02-20 05:38:29'),(274,21,3206883240,NULL,1582180283693,'2020-02-20 06:31:15','2020-02-20 06:31:23'),(275,21,2272626204,NULL,1582183006252,'2020-02-20 07:00:27','2020-02-20 07:16:46'),(276,21,1264694740,NULL,NULL,'2020-02-20 07:23:21','2020-02-20 07:23:21'),(277,21,7191486247,NULL,NULL,'2020-02-20 08:19:58','2020-02-20 08:19:58'),(278,21,3476650624,NULL,1582187783397,'2020-02-20 08:34:52','2020-02-20 08:36:24'),(279,21,1553624984,NULL,1582187870306,'2020-02-20 08:36:24','2020-02-20 08:37:50'),(280,21,6295769452,34,1582187887997,'2020-02-20 08:38:02','2020-02-20 08:38:36'),(281,21,5004122188,18,1582189175250,'2020-02-20 08:59:24','2020-02-20 09:00:48'),(282,21,6964209921,NULL,1582191773386,'2020-02-20 09:40:57','2020-02-20 09:42:53'),(283,21,8063960051,NULL,NULL,'2020-02-20 09:48:24','2020-02-20 09:48:24'),(284,21,3916728285,NULL,NULL,'2020-02-20 09:52:40','2020-02-20 09:52:40'),(285,21,5491171178,19,1582192664646,'2020-02-20 09:56:42','2020-02-20 09:58:11'),(286,21,5450060843,19,1582196665460,'2020-02-20 11:04:19','2020-02-20 11:04:53'),(287,21,2529899530,18,1582197077090,'2020-02-20 11:10:56','2020-02-20 11:11:51'),(288,21,9414960028,NULL,NULL,'2020-02-20 11:21:31','2020-02-20 11:21:31'),(289,21,3032004061,NULL,NULL,'2020-02-20 11:22:28','2020-02-20 11:22:28'),(290,21,195142096,NULL,1582197902355,'2020-02-20 11:24:55','2020-02-20 11:25:02'),(291,21,8887964035,NULL,1582199623328,'2020-02-20 11:25:17','2020-02-20 11:53:43'),(292,21,5932294820,18,1582199699200,'2020-02-20 11:54:53','2020-02-20 11:57:17'),(293,21,1255839625,NULL,1582199943223,'2020-02-20 11:58:56','2020-02-20 11:59:03'),(294,21,8987382888,NULL,1582200380103,'2020-02-20 12:06:05','2020-02-20 12:06:20'),(295,21,8229904688,NULL,1582201278521,'2020-02-20 12:21:07','2020-02-20 12:21:18'),(296,21,1599059251,NULL,1582202034874,'2020-02-20 12:33:40','2020-02-20 12:33:55'),(297,21,1909079717,34,1582209288274,'2020-02-20 14:34:41','2020-02-20 14:40:42'),(298,21,4417166713,NULL,1582209852205,'2020-02-20 14:44:06','2020-02-20 14:44:13'),(299,21,3022069218,19,1582251636621,'2020-02-21 02:20:30','2020-02-21 02:24:47'),(300,35,9468250788,NULL,NULL,'2020-02-21 02:30:12','2020-02-21 02:30:12');
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
  `question_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `question_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `question_code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `question_const` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `difficulty` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES (21,'Two Sum','Given an array of integers, return indices of the two numbers such that they add up to a specific target.\r\n\r\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\r\n\r\nExample:\r\n\r\nGiven nums = [2, 7, 11, 15], target = 9,\r\n\r\nBecause nums[0] + nums[1] = 2 + 7 = 9,\r\nreturn [0, 1].','const twoSum = function(nums, target) {\r     // Write your code here\r \r };','twoSum','easy','array','2020-01-29 06:47:06','2020-02-14 03:09:09'),(35,'Search Insert Position','Given a sorted array and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\nYou may assume no duplicates in the array.\n\nExample input: [1,3,5,6], 5\nOutput: 2','const searchInsert = (nums, target) => {\n    \n};','searchInsert','easy','binary_search','2020-02-18 02:51:57','2020-02-18 02:55:59');
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
  `test_case_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `test_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `threshold_ms` decimal(10,0) DEFAULT NULL,
  `is_large_case` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `test_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test`
--

LOCK TABLES `test` WRITE;
/*!40000 ALTER TABLE `test` DISABLE KEYS */;
INSERT INTO `test` VALUES (39,21,'./testcases/21/0.json','[0,2]',NULL,0),(49,21,'./testcases/21/1.json','[1,2]',NULL,0),(50,21,'./testcases/21/2.json','[0,1]',NULL,0),(53,21,'./testcases/21/3.json','[3,12]',NULL,0),(54,21,'./testcases/21/4.json','[1,2]',NULL,0),(57,21,'./testcases/21/5.json','[0,5]',NULL,0),(65,21,'./testcases/21/6.json','[500000,800001]',8000,1);
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
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `access_expired` bigint(20) DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `level_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `level_id` (`level_id`),
  CONSTRAINT `user_table_ibfk_1` FOREIGN KEY (`level_id`) REFERENCES `level_table` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_table`
--

LOCK TABLES `user_table` WRITE;
/*!40000 ALTER TABLE `user_table` DISABLE KEYS */;
INSERT INTO `user_table` VALUES (18,'testuser_0','test@codingfightclub.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','native','f07ad7301fb1756bf4a6c135c7e02d2cbd92273c6c0956a3f9a921d2cd7ea866',1584769081773,207,3,'2020-02-17 03:10:22','2020-02-21 02:24:47'),(19,'testuser_1','test1@codingfightclub.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','native','e5e5b1d9b25435051ff1ccbd10299b61cd8728c743f7e5ad2e06c5ab79bbb80e',1584767940813,43,2,'2020-02-17 03:11:45','2020-02-21 02:24:29'),(28,'Ethan666','ethan@ethan666.com','bb170201ef5d8f4449fd06812f53dc3d970875ca2c25abbe2bfc3683db807a81','native','fc674cdd2dc1fbe34ce22b28e1dcc0ab097539f6eaa6cbfed6f0c21332c6b1e5',1584582907600,0,1,'2020-02-18 01:55:08','2020-02-20 07:58:36'),(29,'yoyoyo','yo@yo.com','f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b','native','3addef3ee691bec6f7afb0aff2bfc3981b29f148e5323334d629858977443ff9',1584674373310,0,1,'2020-02-19 03:19:33','2020-02-20 07:58:36'),(31,'test18','18@18','f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b','native','9ee307f80173606ed4cc9a4786abf3db72caba7c45f31f2f3be52991fb3abd0b',1584775950493,0,1,'2020-02-20 07:32:30','2020-02-20 07:58:37'),(32,'test19','19@19','f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b','native','2476c5bc1ac32b7e31c86481ff0d2f05eae24c3525ebd8454376ddd27789d29b',1584776038721,0,1,'2020-02-20 07:33:59','2020-02-20 07:58:38'),(33,'test20','20@20','f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b','native','bd93c69e163478b7ad4466bff7c3ff91fee93049c064944eb83dcdf9244f62e4',1584779468535,0,1,'2020-02-20 08:31:08','2020-02-20 08:31:08'),(34,'test21','212@1','f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b','native','100e10404d0d2a14e836e4ac3a4347ff3dc9f49673abc234907ed90497e9194d',1584779630857,114,3,'2020-02-20 08:33:51','2020-02-20 14:40:41'),(35,'okok','ok@ok','f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b','native','404c7f54d0b39c1d65c037593d8c18685aa3f4e32f04a30547c3fa55a187e774',1584793993475,0,1,'2020-02-20 12:33:13','2020-02-20 12:33:13'),(36,'asdf','asdf@asdf','f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b','native','0a024b31c7bcf729e34f08516650a1523805e403b375d9a3f849209368c8ee0b',1584800149431,100,3,'2020-02-20 14:15:49','2020-02-20 14:44:59');
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

-- Dump completed on 2020-02-21 12:03:56
