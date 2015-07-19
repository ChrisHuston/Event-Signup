CREATE DATABASE  IF NOT EXISTS `event_manager` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `event_manager`;
-- MySQL dump 10.13  Distrib 5.6.24, for osx10.8 (x86_64)
--
-- Host: localhost    Database: event_manager
-- ------------------------------------------------------
-- Server version	5.5.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `announcements` (
  `announcement_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `course_id` int(10) NOT NULL,
  `event_id` int(10) unsigned NOT NULL,
  `net_id` varchar(12) NOT NULL,
  `title` varchar(120) NOT NULL,
  `announcement_txt` text NOT NULL,
  `post_date` datetime NOT NULL,
  PRIMARY KEY (`announcement_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_admins`
--

DROP TABLE IF EXISTS `course_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_admins` (
  `course_id` varchar(50) NOT NULL,
  `net_id` varchar(12) NOT NULL,
  `priv_level` tinyint(1) unsigned NOT NULL,
  PRIMARY KEY (`course_id`,`net_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `k_events`
--

DROP TABLE IF EXISTS `k_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `k_events` (
  `event_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `event_name` varchar(120) NOT NULL,
  `is_active` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `max_sessions` tinyint(2) unsigned NOT NULL DEFAULT '1',
  `description` text NOT NULL,
  `max_members` tinyint(2) unsigned NOT NULL DEFAULT '1',
  `session_duration` smallint(5) unsigned NOT NULL DEFAULT '20',
  `event_open` datetime DEFAULT NULL,
  `event_close` datetime DEFAULT NULL,
  `has_wait_list` tinyint(1) NOT NULL DEFAULT '0',
  `show_names` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `course_id` varchar(50) NOT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=242 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rooms` (
  `room_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `event_id` mediumint(8) unsigned NOT NULL,
  `course_id` varchar(50) NOT NULL,
  `leader_id` varchar(12) DEFAULT NULL,
  `room` varchar(128) DEFAULT NULL,
  `room_start` datetime DEFAULT NULL,
  `room_end` datetime DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=636 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_sessions` (
  `net_id` varchar(12) NOT NULL,
  `room_id` mediumint(8) unsigned NOT NULL,
  `session_start` datetime DEFAULT NULL,
  `session_end` datetime DEFAULT NULL,
  `event_id` mediumint(8) unsigned NOT NULL,
  `join_date` datetime NOT NULL,
  `canvas_event_id` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`net_id`,`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `net_id` varchar(12) NOT NULL,
  `user_name` varchar(128) NOT NULL,
  `user_email` varchar(128) NOT NULL,
  PRIMARY KEY (`net_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `wait_list`
--

DROP TABLE IF EXISTS `wait_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wait_list` (
  `net_id` varchar(12) NOT NULL,
  `event_id` mediumint(9) NOT NULL,
  `wait_date` datetime NOT NULL,
  `canvas_user_id` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`net_id`,`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-07-18 15:22:27
