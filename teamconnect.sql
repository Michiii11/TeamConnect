-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 01. Jun 2023 um 10:30
-- Server-Version: 10.4.28-MariaDB
-- PHP-Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `teamconnect`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `event`
--

CREATE TABLE `event` (
  `id` int(11) NOT NULL,
  `teamID` int(11) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  `type` varchar(50) DEFAULT NULL,
  `description` varchar(100) NOT NULL,
  `duration` int(50) DEFAULT NULL,
  `result` varchar(100) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `event`
--

INSERT INTO `event` (`id`, `teamID`, `date`, `time`, `type`, `description`, `duration`, `result`, `note`) VALUES
(1, 1, '2023-04-17', '2023-04-17 06:18:33', 'Konditionstraining', '', 1, NULL, NULL),
(2, 1, '2023-04-17', '2023-04-17 06:18:33', 'Fußballtraining', '', 1, NULL, NULL),
(3, 1, '2023-04-17', '2023-04-17 06:18:33', 'Spiel', 'Spiel gegen LASK Linz', 1, NULL, NULL),
(12, 23, '2023-06-08', '0000-00-00 00:00:00', 'Fußballtraining', '', 1, NULL, NULL),
(13, 19, '2023-06-21', '0000-00-00 00:00:00', 'Fußballtraining', '', 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `team`
--

CREATE TABLE `team` (
  `id` int(11) NOT NULL,
  `playerID` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `team`
--

INSERT INTO `team` (`id`, `playerID`, `name`) VALUES
(1, 8, 'michis team'),
(4, 9, 'yaniks team'),
(18, 8, 'leons team'),
(19, 8, 'yanik'),
(20, 8, 'leons'),
(23, 8, 'test'),
(25, 9, 'leons teams'),
(28, 9, 'leons teamer'),
(29, 9, 'teams'),
(30, 9, 'taem'),
(31, 9, 'lköjh'),
(32, 9, 'stevan vlajic');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `position` varchar(20) NOT NULL,
  `health` varchar(50) NOT NULL,
  `rule` varchar(50) NOT NULL,
  `height` int(5) NOT NULL,
  `weight` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user`
--

INSERT INTO `user` (`id`, `firstname`, `lastname`, `email`, `password`, `position`, `health`, `rule`, `height`, `weight`) VALUES
(8, 'Michael', 'Leisch', 'michael.leisch@gmx.at', '$2y$10$D750CvJDZFfTrwVcfYDF8eO1FCCqb6.YCW8XpgHJHdScWr5Bx6.3a', '', '', '', 0, 0),
(9, 'Yanik', 'Kendler', 'yanik.kendler@gmail.com', '$2y$10$ngrt8eDQB6OT2trgoXE9duRb.VavmNL5DswlY.ooyh4TWfR4Buup.', '', '', '', 0, 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_event`
--

CREATE TABLE `user_event` (
  `eventID` int(11) NOT NULL,
  `playerID` int(11) NOT NULL,
  `goal` int(10) DEFAULT NULL,
  `assist` int(10) DEFAULT NULL,
  `rating` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user_event`
--

INSERT INTO `user_event` (`eventID`, `playerID`, `goal`, `assist`, `rating`) VALUES
(1, 8, NULL, NULL, NULL),
(2, 8, NULL, NULL, NULL),
(3, 8, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_team`
--

CREATE TABLE `user_team` (
  `playerID` int(11) NOT NULL,
  `teamID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user_team`
--

INSERT INTO `user_team` (`playerID`, `teamID`) VALUES
(8, 0),
(8, 1),
(8, 18),
(8, 19),
(8, 20),
(8, 23),
(8, 29),
(8, 30),
(8, 32),
(8, 33),
(9, 0),
(9, 1),
(9, 18),
(9, 19),
(9, 20),
(9, 23),
(9, 25),
(9, 28),
(9, 29),
(9, 30),
(9, 31),
(9, 32);

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `team`
--
ALTER TABLE `team`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indizes für die Tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `user_event`
--
ALTER TABLE `user_event`
  ADD PRIMARY KEY (`eventID`,`playerID`);

--
-- Indizes für die Tabelle `user_team`
--
ALTER TABLE `user_team`
  ADD PRIMARY KEY (`playerID`,`teamID`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `event`
--
ALTER TABLE `event`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT für Tabelle `team`
--
ALTER TABLE `team`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT für Tabelle `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
