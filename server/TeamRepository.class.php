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
    function createTeam($id, $teamName){
        try {
            $sql = "INSERT INTO team (playerID, name) VALUES ('$id', '$teamName')";
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
        $sql = "select t.id, t.name, t.playerID as 'captain', ut.playerID from user_team ut
                left outer join team t on ut.teamID = t.id
                where t.playerID not like '$id' and '$id' not in (select playerID from user_team_request where teamID like ut.teamID);";
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
        $sql = "select id, name, t.playerID as 'captain', user_team.playerID from user_team 
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
        $sql = "select id, teamID, type, description, date, time from event
                where teamID like '{$id}';";
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

    function addEvent($teamID, $type, $description, $date, $time, $duration){
        try {
            $sql = "insert into event (teamID, date, time, type, description, duration) values ('$teamID', '$date', '$time', '$type', '$description', '$duration')";
            mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occured: " . $err->getMessage();
        }
    }

    function getJoinRequests(){
        $id = $_SESSION["userID"];
        $sql = "select playerID, teamID, requestTime from user_team_request
                where playerID like '$id';";
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

    function changeTeamName($oldTeamName, $newTeamName){
        $sql = "update team set name = '$newTeamName' where name = '$oldTeamName'";
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
        try {
            mysqli_query($this->connection, $sql);
            mysqli_query($this->connection, $sql2);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    //getters & setters
    function getConnection()
    {
        return $this->connection;
    }
}