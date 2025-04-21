-- Creazione del database
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

-- Creazione della tabella servizi
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

-- Creazione della tabella ordini
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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `utenteId` (`utenteId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`utenteId`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`servizio`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Creazione della tabella pagamenti
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `utenteId` int(11) NOT NULL,
  `importo` decimal(10,2) NOT NULL,
  `metodo` varchar(255) NOT NULL,
  `stato` varchar(255) NOT NULL,
  `riferimento` varchar(255) NOT NULL,
  `dettagli` json DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `utenteId` (`utenteId`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`utenteId`) REFERENCES `utenti` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Creazione della tabella impostazioni
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


-- Tabella per le revisioni
CREATE TABLE IF NOT EXISTS revisioni (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ordineId INT NOT NULL,
  feedback TEXT NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (ordineId) REFERENCES ordini(id) ON DELETE CASCADE
);

-- Tabella per i feedback
CREATE TABLE IF NOT EXISTS feedback (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ordineId INT NOT NULL,
  userId INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY (ordineId),
  FOREIGN KEY (ordineId) REFERENCES ordini(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES utenti(id) ON DELETE CASCADE
);

-- Tabella per le offerte
CREATE TABLE IF NOT EXISTS offerte (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  puntiRichiesti INT NOT NULL,
  sconto DECIMAL(5,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id)
);



-- Inserimento dati nella tabella utenti
INSERT INTO `utenti` (`id`, `nome`, `cognome`, `email`, `password`, `telefono`, `indirizzo`, `isAdmin`, `puntifedelta`, `isDeleted`, `settings`, `createdAt`, `updatedAt`) VALUES
(1, 'SIMONE', 'Rixolino', 'elrisolix.erx@outlook.com', '$2b$10$Ospmp1.8H98CTqVpc5LzHO5P3DoxR8X1WZ3z3/3Tv0OCLc2uirNsG', NULL, NULL, 1, 0, 0, '{\"fontSize\":2,\"highContrast\":false,\"reduceAnimations\":false,\"colorBlindMode\":\"none\",\"theme\":\"light\"}', '2025-03-10 15:49:34', '2025-03-10 17:28:02'),
(2, 'SIMONa', 'Rixolino', 'simonerisola.sr@gmail.com', '$2b$10$S11T16Can5g0/Re6B75RDuYgIKDSp4rOtDDumGR6/vweKeeydARce', NULL, NULL, 0, 0, 0, '{\"fontSize\":1,\"highContrast\":false,\"reduceAnimations\":false,\"colorBlindMode\":\"none\",\"theme\":\"dark\"}', '2025-03-10 15:49:34', '2025-03-10 17:28:02');

-- Inserimento dati nella tabella servizi
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `deliveryTime`, `revisions`, `createdAt`, `updatedAt`) VALUES
('digitalizzazione', 'Digitalizzazione Documenti', 'Trasformiamo i tuoi documenti cartacei in file digitali, organizzati e facilmente accessibili.', 9.90, 'Digitalizzazione', 'fa-file-import', '3-5 giorni lavorativi', '1 revisione gratuita', '2025-03-10 16:12:07', '2025-03-10 16:12:07'),
('supporto', 'Supporto PC Remoto', 'Assistenza tecnica a distanza per risolvere problemi informatici.', 15.90, 'Supporto', 'fa-headset', '1-2 giorni lavorativi', 'Illimitate', '2025-03-10 16:12:07', '2025-03-10 16:12:07'),
('volantini', 'Creazione Volantini', 'Design professionale di volantini pubblicitari per la tua attività.', 9.90, 'Grafica', 'fa-paint-brush', '2-4 giorni lavorativi', '2 revisioni gratuite', '2025-03-10 16:12:07', '2025-03-10 16:12:07');


-- AUTO_INCREMENT per le tabelle
ALTER TABLE `utenti` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `orders` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `payments` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `settings` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;