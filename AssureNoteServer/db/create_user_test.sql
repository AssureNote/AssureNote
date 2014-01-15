SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

CREATE SCHEMA IF NOT EXISTS `assurenote` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `assurenote` ;

-- TODO
grant all privileges on *.* to assure identified by 'assure_test';
grant all privileges on *.* to assure@'localhost' identified by 'assure_test';
