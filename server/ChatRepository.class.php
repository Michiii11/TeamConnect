<?php

// require database class
require_once "./Database.class.php";

class ChatRepository
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

    function getMessages($teamID){
        $sql = "select c.id as id, c.userID as userID, u.firstname as firstname, u.lastname as lastname, c.message as message, c.sendTime as sendTime, u.imagePath as imagePath from chat c
                join user u on u.id = c.userID
                where c.teamID like '$teamID'
                order by 6 asc;";
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

    function sendMessage($playerID, $teamID, $message){
        try {
            $sql = "insert into chat (teamID, userID, message) values ('$teamID', '$playerID', '$message')";
            mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occured: " . $err->getMessage();
        }
    }

    //getters & setters
    function getConnection()
    {
        return $this->connection;
    }
}