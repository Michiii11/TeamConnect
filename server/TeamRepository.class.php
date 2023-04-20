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

    function addTeam($id, $teamName){
        try {
            $teamId = $this->getTeamByName($teamName);

            $sql = "INSERT INTO user_team (playerID, teamID) VALUES ('$id', '$teamId')";
            mysqli_query($this->connection, $sql);
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

    function getAllTeams(){
        $sql = "select id, name, t.playerID as 'captain', user_team.playerID from user_team 
                join team t on user_team.teamID = t.id;";
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

    //getters & setters
    function getConnection()
    {
        return $this->connection;
    }
}