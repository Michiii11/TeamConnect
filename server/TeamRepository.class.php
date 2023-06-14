<?php

// require database class
require_once "./Database.class.php";

class TeamRepository
{
    private $connection;
    function __construct(){
        $database = new Database();
        try {
            $this->connection = $database->getDataSource();
        } catch (mysqli_sql_exception $err) {
            echo $err;

            exit;
        }
    }
    function createTeam($id, $teamName, $imagePath){
        try {
            $sql = "INSERT INTO team (playerID, name, imagePath) VALUES ('$id', '$teamName', '$imagePath')";
            mysqli_query($this->connection, $sql);

            $teamId = $this->getTeamByLeader($id, $teamName);

            $sql = "INSERT INTO user_team (playerID, teamID) VALUES ('$id', '$teamId')";
            mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occured: " . $err->getMessage();
        }
    }

    function requestTeam($id, $teamName){
        try {
            $teamId = $this->getTeamByName($teamName);

            $sql = "INSERT INTO user_team_request (playerID, teamID) VALUES ('$id', '$teamId')";
            return mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occured: " . $err->getMessage();
        }
    }

    function getTeamByName ($teamName){
        $sql = "select id from team where name like '{$teamName}'";
        try {
            $result = $this->connection->query($sql);
            if ($result->num_rows == 0) {
                return false;
            } else {
                $row = $result->fetch_assoc();
                return $row["id"];
            }
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getTeamByLeader($playerID, $teamName){
        $sql = "select id from team where playerID like '{$playerID}' and name like '{$teamName}'";
        try {
            $result = $this->connection->query($sql);
            if ($result->num_rows == 0) {
                return false;
            } else {
                $row = $result->fetch_assoc();
                return $row["id"];
            }
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getAllTeamsNotEnteredYet(){
        $id = $_SESSION["userID"];
        $sql = "select id, name, playerID as 'captain' from team t
                where '$id' not in (select playerID from user_team where teamID like t.id) and
                        '$id' not in (select playerID from user_team_request where teamID like t.id);";
        try {
            $result = $this->connection->query($sql);

            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[$row["id"]] = $row;
            }

            return $rows;
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }
    function getTeams($id){
        $sql = "select id, name, t.playerID as 'captain', user_team.playerID, imagePath from user_team 
                join team t on user_team.teamID = t.id
                where user_team.playerID like {$id};";
        try {
            $result = $this->connection->query($sql);

            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[$row["id"]] = $row;
            }

            return $rows;
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getEvents($id){
        $sql = "select id, teamID, type, description, date, time, duration, result, notions from event
                where teamID like '{$id}'
                order by date, time desc;";
        try {
            $idTemp = 0;
            $result = $this->connection->query($sql);

            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows["$idTemp"] = $row;
                $idTemp++;
            }

            return $rows;
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function addEvent($teamID, $type, $description, $date, $time, $duration, $playerID){
        try {
            $sql = "insert into event (teamID, date, time, type, description, duration) values ('$teamID', '$date', '$time', '$type', '$description', '$duration')";
            mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occured: " . $err->getMessage();
        }
    }

    function updateEvent($eventID, $date, $time, $duration, $description, $result, $notions){
        $sql = "update event set date = '$date', time = '$time', duration = '$duration', description = '$description', result = '$result', notions = '$notions' where id = '$eventID'";
        try {
            mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function deleteEvent($eventID){
        $sql = "delete from event where id = '$eventID'";
        $sql2 = "delete from user_event where eventID = '$eventID'";
        try {
            mysqli_query($this->connection, $sql);
            mysqli_query($this->connection, $sql2);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getPlayersForEvent($id){
        $sql = "select id, firstname, lastname from user_event
                join user on id like user_event.playerID
                where eventID like '$id';";
        try {
            $result = $this->connection->query($sql);

            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[$row["id"]] = $row;
            }

            return $rows;
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function setPlayersToEvent($playerList, $eventID){
        try {
            $sql = "delete from user_event where eventID = '$eventID'";
            mysqli_query($this->connection, $sql);

            foreach ($playerList as &$value) {
                $sql = "insert into user_event (eventID, playerID) values ('$eventID', '$value')";
                mysqli_query($this->connection, $sql);
            }
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function checkIfPlayerIsInEvent($playerID, $eventID){
        $sql = "select * from user_event where playerID = '$playerID' and eventID = '$eventID'";
        try {
            $result = $this->connection->query($sql);
            if ($result->num_rows == 0) {
                return false;
            } else {
                return true;
            }
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function setUserStatsToZero($eventID){
        $types = ['goals', 'assists', 'yellow', 'red'];
        for($i = 0; $i < 4; $i++){
            $sql = "update user_event set $types[$i] = '0' where eventID = '{$eventID}'";
            try {
                mysqli_query($this->connection, $sql);
            } catch (mysqli_sql_exception $err) {
                echo "SQL error occurred: " . $err->getMessage();
            }
        }
    }
    function updateStatsToEvent($list, $eventID){
        $this->setUserStatsToZero($eventID);
        for($i = 0; $i < count($list); $i++){
            $sql = "update user_event set {$list[$i]->type} = '{$list[$i]->count}' where playerID = '{$list[$i]->id}' and eventID = '{$eventID}'";
            try {
                mysqli_query($this->connection, $sql);
            } catch (mysqli_sql_exception $err) {
                echo "SQL error occurred: " . $err->getMessage();
            }
        }
    }

    function getStatsOfEvent($eventID){
        $sql = "select playerID as id, firstname, lastname, goals, assists, yellow, red from user_event
                join user on playerID = id
                where eventID like '$eventID';";
        try {
            $result = $this->connection->query($sql);

            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[$row["id"]] = $row;
            }

            return $rows;
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getEventsThisMonth($playerID, $teamID, $month){
        $sql = "select * from event e
                join user_event on e.id = eventID
                where playerID like '$playerID' and e.teamID like '$teamID' and extract(month from e.date) = '$month'";
        try {
            $result = $this->connection->query($sql);

            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[$row["id"]] = $row;
            }

            return $rows;
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getTeamRequests(){
        $id = $_SESSION["userID"];
        $sql = "select utr.id as id, utr.playerID, utr.teamID, utr.requestTime, t.name as teamName, u.firstname, u.lastname from user_team_request utr
                join team t on utr.teamID like t.id
                join user u on utr.playerID like u.id
                where t.playerID like '$id';";
        try {
            $result = $this->connection->query($sql);

            $rows = array();
            $temp = 0;
            while ($row = $result->fetch_assoc()) {
                $rows[$row["id"]] = $row;
            }

            return $rows;
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function agreeRequest($requestID, $playerID, $teamID){
        $sql = "delete from user_team_request where id = '$requestID'";
        $sql2 = "insert into user_team (playerID, teamID) values ($playerID, $teamID)";
        try {
            mysqli_query($this->connection, $sql);
            mysqli_query($this->connection, $sql2);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }
    function denyRequest($requestID){
        $sql = "delete from user_team_request where id = '$requestID'";
        try {
            mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function changeTeamName($oldTeamName, $newTeamName, $imagePath){
        $sql = "update team set name = '$newTeamName' where name = '$oldTeamName'";
        if($imagePath){
            $sql = "update team set name = '$newTeamName', imagePath = '$imagePath' where name = '$oldTeamName'";
        }
        try {
            mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function quitTeam($id, $teamName){
        if($this->getTeamByLeader($id, $teamName) !== false){ // delete
            $this->deleteTeam($teamName);
        } else{ // quit
            $teamID = $this->getTeamByName($teamName);
            $sql = "delete from user_team where teamID = '$teamID' and playerID = '$id'";
            try {
                mysqli_query($this->connection, $sql);
            } catch (mysqli_sql_exception $err) {
                echo "SQL error occurred: " . $err->getMessage();
            }
        }

    }

    function deleteTeam($teamName){
        $teamID = $this->getTeamByName($teamName);
        $sql = "delete from team where id = '$teamID'";
        $sql2 = "delete from user_team where teamID = '$teamID'";
        $sql3 = "delete from user_event where teamID = '$teamID'";
        $sql4 = "delete from user_team_request where teamID = '$teamID'";
        $sql5 = "delete from chat where teamID = '$teamID'";
        try {
            mysqli_query($this->connection, $sql);
            mysqli_query($this->connection, $sql2);
            mysqli_query($this->connection, $sql3);
            mysqli_query($this->connection, $sql4);
            mysqli_query($this->connection, $sql5);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function uploadTeamIcon($teamName){
        if ($_FILES["image"]) {
            $imageFileType = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
            if($imageFileType === "jpg"){
                $targetDirectory = "../img/";
                $fileExtension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
                $targetFile = $targetDirectory . "groupIcon_" . $teamName . "." . $fileExtension;
                move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile);

                return $targetFile;
            }
        }
        return false;
    }

    //getters & setters
    function getConnection()
    {
        return $this->connection;
    }
}