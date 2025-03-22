CREATE DATABASE IF NOT EXISTS `helpdigit_perhapslay`;
USE `helpdigit_perhapslay`;

-- Creazione della tabella utenti
CREATE TABLE `utenti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cognome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `indirizzo` varchar(255) DEFAULT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT 0,
  `puntifedelta` int(11) NOT NULL DEFAULT 0,
  `isDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `settings` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Creazione della tabella services
CREATE TABLE `services` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `deliveryTime` varchar(255) NOT NULL,
  `revisions` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Creazione della tabella orders
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utenteId` int(11) NOT NULL,
  `servizio` varchar(255) NOT NULL,
  `titolo` varchar(255) NOT NULL,
  `descrizione` text NOT NULL,
  `dettagliAggiuntivi` text DEFAULT NULL,
  `stato` enum('in-attesa', 'pagamento-in-attesa', 'in-lavorazione', 'completato') NOT NULL DEFAULT 'in-attesa',
  `dataRichiesta` datetime NOT NULL DEFAULT current_timestamp(),
  `dataConsegna` datetime DEFAULT NULL,
  `prezzo` decimal(10,2) NOT NULL,
  `progressoLavoro` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `utenteId` (`utenteId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`utenteId`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`servizio`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Creazione della tabella settings
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `fontSize` int(11) DEFAULT 1,
  `highContrast` tinyint(1) DEFAULT 0,
  `reduceAnimations` tinyint(1) DEFAULT 0,
  `colorBlindMode` varchar(255) DEFAULT 'none',
  `theme` varchar(255) DEFAULT 'light',
  `primaryColor` varchar(255) DEFAULT 'default',
  `layout` varchar(255) DEFAULT 'default',
  `emailNotifications` tinyint(1) DEFAULT 1,
  `orderUpdates` tinyint(1) DEFAULT 1,
  `promotions` tinyint(1) DEFAULT 0,
  `newsletter` tinyint(1) DEFAULT 0,
  `dataTelemetry` tinyint(1) DEFAULT 0,
  `cookies` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Creazione della tabella payments
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `utenteId` int(11) NOT NULL,
  `importo` decimal(10,2) NOT NULL,
  `metodo` varchar(255) NOT NULL,
  `stato` varchar(255) NOT NULL,
  `riferimento` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `utenteId` (`utenteId`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `ordini` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`utenteId`) REFERENCES `utenti` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserimento dati nella tabella utenti
INSERT INTO `utenti` (`id`, `nome`, `cognome`, `email`, `password`, `telefono`, `indirizzo`, `isAdmin`, `puntifedelta`, `isDeleted`, `settings`, `createdAt`, `updatedAt`) VALUES
(1, 'SIMONE', 'Rixolino', 'elrisolix.erx@outlook.com', '$2b$10$Ospmp1.8H98CTqVpc5LzHO5P3DoxR8X1WZ3z3/3Tv0OCLc2uirNsG', NULL, NULL, 0, 0, 0, '{\"fontSize\":2,\"highContrast\":false,\"reduceAnimations\":false,\"colorBlindMode\":\"none\"}', '2025-03-10 15:49:34', '2025-03-10 17:28:02'),
(2, 'SIMONE', 'Rixolino', 'admin@gmail.com', '$2b$10$ikH0b1QyCGFyuTZLFFXiYebvzqoknMWDUOi4KyWCWr37DjHKMupZS', NULL, NULL, 0, 0, 0, '{\"fontSize\":2,\"highContrast\":false,\"reduceAnimations\":false,\"colorBlindMode\":\"none\"}', '2025-03-10 15:49:34', '2025-03-10 17:28:02');

-- Inserimento dati nella tabella services
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `deliveryTime`, `revisions`, `createdAt`, `updatedAt`) VALUES
('volantini', 'Creazione Volantini', 'Design professionale di volantini pubblicitari per la tua attività.', 9.90, 'Grafica', 'fa-paint-brush', '2-4 giorni lavorativi', '2 revisioni gratuite', '2025-03-10 16:12:07', '2025-03-10 16:12:07'),
('digitalizzazione', 'Digitalizzazione Documenti', 'Trasformiamo i tuoi documenti cartacei in file digitali, organizzati e facilmente accessibili.', 9.90, 'Digitalizzazione', 'fa-file-import', '3-5 giorni lavorativi', '1 revisione gratuita', '2025-03-10 16:12:07', '2025-03-10 16:12:07'),
('supporto', 'Supporto PC Remoto', 'Assistenza tecnica a distanza per risolvere problemi informatici.', 15.90, 'Supporto', 'fa-headset', '1-2 giorni lavorativi', 'Illimitate', '2025-03-10 16:12:07', '2025-03-10 16:12:07');

-- Inserimento dati nella tabella settings
INSERT INTO `settings` (`id`, `user_id`, `fontSize`, `highContrast`, `reduceAnimations`, `colorBlindMode`, `theme`, `primaryColor`, `layout`, `emailNotifications`, `orderUpdates`, `promotions`, `newsletter`, `dataTelemetry`, `cookies`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, 0, 0, 'none', 'light', 'default', 'default', 1, 1, 0, 0, 0, 1, '2025-03-10 18:11:26', '2025-03-10 18:58:59'),
(2, 2, 1, 0, 0, 'none', 'dark', 'red', 'default', 1, 1, 0, 0, 0, 1, '2025-03-10 18:39:39', '2025-03-10 18:39:47');

-- Vincoli di integrità referenziale per la tabella orders
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`utenteId`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`servizio`) REFERENCES `services` (`id`) ON DELETE CASCADE;

-- Vincoli di integrità referenziale per la tabella settings
ALTER TABLE `settings`
  ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;