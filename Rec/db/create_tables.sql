SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `rec` ;
CREATE SCHEMA IF NOT EXISTS `rec` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `rec` ;

-- -----------------------------------------------------
-- Table `rec`.`monitors`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `rec`.`monitors` ;

CREATE TABLE IF NOT EXISTS `rec`.`monitors` (
  `monitorid` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  `location` VARCHAR(45) NOT NULL,
  `authid` VARCHAR(45) NOT NULL,
  `latest_recid` INT UNSIGNED NULL,
  `begin_timestamp` DATETIME NOT NULL,
  `latest_timestamp` DATETIME NOT NULL,
  PRIMARY KEY (`monitorid`),
  UNIQUE INDEX `monitorid_UNIQUE` (`monitorid` ASC),
  UNIQUE INDEX `latest_data_id_UNIQUE` (`latest_recid` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `rec`.`rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `rec`.`rawdata` ;

CREATE TABLE IF NOT EXISTS `rec`.`rawdata` (
  `recid` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `monitorid` INT UNSIGNED NOT NULL,
  `data` INT NOT NULL,
  `context` VARCHAR(45) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  PRIMARY KEY (`recid`),
  UNIQUE INDEX `rawdataid_UNIQUE` (`recid` ASC),
  INDEX `fk_rawdata_monitors_idx` (`monitorid` ASC),
  CONSTRAINT `fk_rawdata_monitors`
    FOREIGN KEY (`monitorid`)
    REFERENCES `rec`.`monitors` (`monitorid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
