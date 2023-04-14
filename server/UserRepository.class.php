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

    function getAnimaltypes(){
        $sql = "select at.ID as type_id, at.name as type_name, ab.id as breed_id, ab.name as breed_name from animal_type at join animal_breed ab on at.ID = ab.animal_type_ID
                where at.shelter_email = '{$_SESSION['userEmail']}'";
        try {
            $result = $this->connection->query($sql);

            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }

            return $rows;
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getOwners(){
        $sql = "select ID, name, adress, tel, email, note from owner where shelter_email = '{$_SESSION['userEmail']}'";
        try {
            $result = $this->connection->query($sql);

            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[$row["ID"]] = $row;
            }

            return $rows;
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }

    function getRooms(){
        $sql = "select ID, size, name from room where shelter_email = '{$_SESSION['userEmail']}'";
        try {
            $result = $this->connection->query($sql);

            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[$row["ID"]] = $row;
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

    function getName($email)
    {
        $sql = "select * from user where email = '$email'";
        try {
            $result = $this->connection->query($sql);
            if ($result->num_rows == 0) {
                return null;
            } else {
                $row = $result->fetch_assoc();
                return $row["lastname"];
            }
        } catch (mysqli_sql_exception $err) {
            echo "SQL error occurred: " . $err->getMessage();
        }
    }
}
