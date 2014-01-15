SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `assurenote` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `assurenote` ;

-- -----------------------------------------------------
-- Table `assurenote`.`user`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `assurenote`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(45) NOT NULL ,
  `auth_id` VARCHAR(45) NULL ,
  `created` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `assurenote`.`assurance_case`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `assurenote`.`assurance_case` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `hash_key` VARCHAR(45) NOT NULL ,
  `data` TEXT NOT NULL ,
  `meta_data` TEXT NULL ,
  `user_id` INT NOT NULL ,
  `created` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`, `hash_key`) ,
  INDEX `fk_case_user_idx` (`user_id` ASC) ,
  UNIQUE INDEX `hash_key_UNIQUE` (`hash_key` ASC) ,
  CONSTRAINT `fk_case_user`
    FOREIGN KEY (`user_id` )
    REFERENCES `assurenote`.`user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `assurenote` ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
