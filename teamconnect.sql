-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 11. Jun 2023 um 14:07
-- Server-Version: 10.4.27-MariaDB
-- PHP-Version: 8.2.0

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
-- Tabellenstruktur für Tabelle `chat`
--

CREATE TABLE `chat` (
  `id` int(11) NOT NULL,
  `teamID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `sendTime` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `chat`
--

INSERT INTO `chat` (`id`, `teamID`, `userID`, `message`, `sendTime`) VALUES
(1, 71, 8, 'test', '2023-06-09 19:18:06'),
(2, 71, 8, 'testo', '2023-06-09 19:20:12'),
(3, 71, 8, 'new message', '2023-06-09 19:33:46'),
(4, 108, 8, 'test', '2023-06-09 19:33:52'),
(5, 71, 8, 'test', '2023-06-09 19:37:46'),
(6, 71, 8, 'testomatiko', '2023-06-09 19:39:18'),
(7, 71, 8, 'hallo', '2023-06-09 19:44:02'),
(8, 71, 9, 'hallo ich bin yanik jihu', '2023-06-09 19:49:20'),
(9, 71, 8, 'Ich schicke diese Nachricht mit enter', '2023-06-09 19:53:57');

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
  `result` varchar(100) NOT NULL,
  `notions` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `event`
--

INSERT INTO `event` (`id`, `teamID`, `date`, `time`, `type`, `description`, `duration`, `result`, `notions`) VALUES
(37, 71, '2023-06-15', '19:09', 'Konditionstraining', '', 0, '', ''),
(38, 71, '2023-06-10', '16:10', 'Fußballtraining', '', 0, '', ''),
(39, 71, '2023-06-08', '16:10', 'Fußballtraining', '', 0, '', ''),
(40, 71, '2023-06-15', '18:00', 'Spiel', 'Spiel gegen LASK', 2, '0:0', '');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `chatID` int(11) NOT NULL,
  `eventID` int(11) NOT NULL,
  `teamID` int(11) NOT NULL,
  `notiType` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `team`
--

CREATE TABLE `team` (
  `id` int(11) NOT NULL,
  `playerID` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `imagePath` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `team`
--

INSERT INTO `team` (`id`, `playerID`, `name`, `imagePath`) VALUES
(71, 8, 'michis team', '../img/groupIcon_michisteam.png'),
(72, 8, 'lukis team', '../img/groupIcon_lukisteam.png'),
(86, 9, 'yaniks team', ''),
(108, 8, 'nielis team', '../img/groupIcon_nielisteam.png'),
(119, 10, 'nielis superteam', ''),
(138, 8, 'Langenstein', '../img/groupIcon_Langenstein.png'),
(157, 8, 'test', '../img/groupIcon_test.png');

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
  `weight` int(5) NOT NULL,
  `imagePath` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user`
--

INSERT INTO `user` (`id`, `firstname`, `lastname`, `email`, `password`, `position`, `health`, `rule`, `height`, `weight`, `imagePath`) VALUES
(8, 'Michael', 'Leisch', 'michael.leisch@gmx.at', '$2y$10$D750CvJDZFfTrwVcfYDF8eO1FCCqb6.YCW8XpgHJHdScWr5Bx6.3a', 'RM', 'Gesund', '', 185, 75, '../img/userIcon_8.JPEG'),
(9, 'Yanik', 'Kendler', 'yanik.kendler@gmail.com', '$2y$10$ngrt8eDQB6OT2trgoXE9duRb.VavmNL5DswlY.ooyh4TWfR4Buup.', 'TW', 'Gesund', '', 205, 85, ''),
(10, 'Nieli', 'Nielpferd', 'nieli@nieli.pferd', '$2y$10$5RC83kyWu97K7/yWQnabxOoyS4KDDIeAWhGohDr.1ReGLYm404CXG', 'TW', 'Krank', '', 200, 1000, ''),
(11, 'Lukas', 'Leisch', 'lukas.leisch@gmx.at', '$2y$10$rXv1L/qNZgYor4Skm76nw.d.MbAapCvVjcdBr.YzWfp/U5vVVMKu6', 'TW', 'Gesund', '', 0, 0, '');

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
(33, 8, NULL, NULL, 0, 0),
(35, 8, NULL, NULL, 0, 0),
(35, 9, NULL, NULL, 0, 0),
(35, 11, NULL, NULL, 0, 0),
(37, 8, NULL, NULL, 0, 0),
(37, 9, NULL, NULL, 0, 0),
(37, 11, NULL, NULL, 0, 0),
(38, 8, NULL, NULL, 0, 0),
(39, 8, NULL, NULL, 0, 0),
(39, 9, NULL, NULL, 0, 0),
(39, 11, NULL, NULL, 0, 0),
(40, 8, NULL, NULL, 0, 0),
(40, 9, NULL, NULL, 0, 0),
(40, 11, NULL, NULL, 0, 0);

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
(8, 138),
(8, 157),
(9, 71),
(9, 72),
(9, 86),
(9, 108),
(10, 119),
(11, 71);

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
-- Indizes für die Tabelle `chat`
--
ALTER TABLE `chat`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `notifications`
--
ALTER TABLE `notifications`
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
-- AUTO_INCREMENT für Tabelle `chat`
--
ALTER TABLE `chat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT für Tabelle `event`
--
ALTER TABLE `event`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT für Tabelle `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `team`
--
ALTER TABLE `team`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT für Tabelle `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT für Tabelle `user_team_request`
--
ALTER TABLE `user_team_request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
