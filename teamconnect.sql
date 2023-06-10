-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 07. Jun 2023 um 16:05
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
  `date` date NOT NULL,
  `time` varchar(50) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `description` varchar(100) NOT NULL,
  `duration` int(50) DEFAULT 1,
  `result` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `event`
--

INSERT INTO `event` (`id`, `teamID`, `date`, `time`, `type`, `description`, `duration`, `result`) VALUES
(17, 1, '2023-06-28', '14:51', 'Fußballtraining', '', 2, NULL),
(18, 1, '2023-06-27', '13:12', 'Spiel', '', 2, NULL),
(19, 1, '2023-06-23', '14:35', 'Konditionstraining', '', 2, NULL),
(23, 1, '2023-06-02', '13:57', 'Fußballtraining', '', 0, NULL),
(24, 71, '2023-06-02', '21:12', 'Fußballtraining', '', 0, NULL),
(25, 71, '2023-06-15', '21:12', 'Fußballtraining', '', 0, NULL),
(26, 71, '2023-05-29', '21:12', 'Fußballtraining', '', 0, NULL),
(27, 71, '2023-06-14', '02:17', 'Spiel', '', 1, NULL),
(28, 137, '0234-02-28', '13:41', 'Spiel', '', 0, NULL),
(29, 137, '2023-06-29', '13:41', 'Fußballtraining', '', 214321, NULL);

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
(71, 8, 'michis team'),
(72, 8, 'lukis team'),
(86, 9, 'yaniks team'),
(108, 8, 'nielis team'),
(119, 10, 'nielis superteam'),
(137, 8, 'nein');

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
(8, 'Michael', 'Leisch', 'michael.leisch@gmx.at', '$2y$10$D750CvJDZFfTrwVcfYDF8eO1FCCqb6.YCW8XpgHJHdScWr5Bx6.3a', 'RM', 'Gesund', '', 185, 75),
(9, 'Yanik', 'Kendler', 'yanik.kendler@gmail.com', '$2y$10$ngrt8eDQB6OT2trgoXE9duRb.VavmNL5DswlY.ooyh4TWfR4Buup.', 'TW', 'Gesund', '', 205, 85),
(10, 'Nieli', 'Nielpferd', 'nieli@nieli.pferd', '$2y$10$5RC83kyWu97K7/yWQnabxOoyS4KDDIeAWhGohDr.1ReGLYm404CXG', 'TW', 'Krank', '', 200, 1000);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_event`
--

CREATE TABLE `user_event` (
  `eventID` int(11) NOT NULL,
  `playerID` int(11) NOT NULL,
  `goal` int(10) DEFAULT NULL,
  `assist` int(10) DEFAULT NULL,
  `yellowCard` int(10) NOT NULL,
  `redCard` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user_event`
--

INSERT INTO `user_event` (`eventID`, `playerID`, `goal`, `assist`, `yellowCard`, `redCard`) VALUES
(18, 8, 0, 2, 2, 1),
(19, 8, 2, 3, 0, 0),
(24, 8, 3, 2, 0, 0);

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
(8, 71),
(8, 72),
(8, 108),
(8, 137),
(9, 71),
(9, 72),
(9, 86),
(10, 119);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_team_request`
--

CREATE TABLE `user_team_request` (
  `id` int(11) NOT NULL,
  `playerID` int(11) NOT NULL,
  `teamID` int(11) NOT NULL,
  `requestTime` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user_team_request`
--

INSERT INTO `user_team_request` (`id`, `playerID`, `teamID`, `requestTime`) VALUES
(1, 8, 119, '2023-06-03 18:45:06'),
(4, 8, 86, '2023-06-03 18:46:54');

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
-- Indizes für die Tabelle `user_team_request`
--
ALTER TABLE `user_team_request`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `event`
--
ALTER TABLE `event`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT für Tabelle `team`
--
ALTER TABLE `team`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=138;

--
-- AUTO_INCREMENT für Tabelle `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT für Tabelle `user_team_request`
--
ALTER TABLE `user_team_request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

select id, name, playerID as 'captain' from team t
where 9 not in (select playerID from user_team where teamID like t.id) and
      9 not in (select playerID from user_team_request where teamID like t.id);