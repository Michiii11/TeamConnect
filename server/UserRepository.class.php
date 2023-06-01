<?php

// require database class
require_once "./Database.class.php";

class UserRepository
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
    function insert($user)
    {
        try {
            $hashedPW = password_hash($user->password, PASSWORD_DEFAULT);

            $sql = "INSERT INTO user (firstname, lastname, email, password) VALUES ('{$user->firstname}', '{$user->lastname}', '{$user->email}', '{$hashedPW}')";
            return mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function checkCredentials($email, $password)
    {
        try {
            $sql = "SELECT password FROM user WHERE email = '$email'";

            $result = $this->connection->query($sql);

            if($result->num_rows == 0) return false;

            $row = $result->fetch_assoc();

            return password_verify($password, $row['password']);
        } catch (mysqli_sql_exception $err) {
            echo "Error while checking data...: " . $err;
        }
    }

    function checkPassword($id, $password){
        try {
            $sql = "SELECT password FROM user WHERE id = '$id'";

            $result = $this->connection->query($sql);

            if($result->num_rows == 0) return false;

            $row = $result->fetch_assoc();

            return password_verify($password, $row['password']);
        } catch (mysqli_sql_exception $err) {
            echo "Error while checking data...: " . $err;
        }
    }

    function emailUsed($email)
    {
        $sql = "select * from user where email = '$email'";
        try {
            $result = $this->connection->query($sql);
            if ($result->num_rows == 0) {
                return false;
            } else {
                $_SESSION['email_err'] = $email;
                return true;
            }
        } catch (mysqli_sql_exception $err) {
            throw new Exception("SQL error occurred: " . $err->getMessage());
        }
    }

    function getID($email){
        $sql = "select * from user where email = '$email'";
        try {
            $result = $this->connection->query($sql);
            if ($result->num_rows == 0) {
                return false;
            } else {
                $row = $result->fetch_assoc();
                return $row["id"];
            }
        } catch (mysqli_sql_exception $err) {
            throw new Exception("SQL error occurred: " . $err->getMessage());
        }
    }

    function getName($id){
        $sql = "select * from user where id = '$id'";
        try {
            $result = $this->connection->query($sql);
            if ($result->num_rows == 0) {
                return null;
            } else {
                $row = $result->fetch_assoc();
                return $row["firstname"] . " " . $row["lastname"];
            }
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getPersonalData($id){
        $sql = "select id, firstname, lastname, email, position, health, rule, height, weight from user where id like $id;";
        try {
            $result = $this->connection->query($sql);
            if ($result->num_rows == 0) {
                return null;
            } else {
                return $result->fetch_assoc();
            }

        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function updatePersonalData($id, $firstname, $lastname, $email, $position, $health, $rule, $height, $weight){
        $sql = "update user 
                set firstname = '$firstname', lastname = '$lastname', email = '$email', position = '$position', health = '$health', rule = '$rule', height = '$height', weight = '$weight'
                where id like '$id'";
        try {
            mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function updatePassword($id, $newPassword){
        $hashedPW = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "update user set password = '$hashedPW' where id like '$id'";
        try {
            mysqli_query($this->connection, $sql);
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getPlayer($teamId){
        $sql = "select u.id as 'id', firstname, lastname, email, position, health, rule, height, weight from team
                join user_team ut on team.id = teamID
                join user u on ut.playerID = u.id
                where team.id = {$teamId};";
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
