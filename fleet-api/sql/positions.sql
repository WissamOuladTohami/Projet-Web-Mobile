CREATE TABLE IF NOT EXISTS `vehicle_positions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `vehicle_id` INT NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `speed` FLOAT NOT NULL DEFAULT 0,
  `heading` FLOAT NOT NULL DEFAULT 0,
  `accuracy` FLOAT NULL,
  `recorded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_positions_vehicle_recorded` (`vehicle_id`, `recorded_at`),
  CONSTRAINT `fk_positions_vehicle`
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
