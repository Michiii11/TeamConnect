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
        $sql = "select * from user where id like $id;";
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

    function updatePersonalData($id, $firstname, $lastname, $email, $position, $health, $rule, $height, $weight, $imagePath){
        $sql = "update user 
                set firstname = '$firstname', lastname = '$lastname', email = '$email', position = '$position', health = '$health', rule = '$rule', height = '$height', weight = '$weight', imagePath = '$imagePath'
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
        $sql = "select u.id as 'id', firstname, lastname, email, position, health, rule, height, weight, u.imagePath from team
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

    function getPlayerDetails($playerID){
        $sql = "select u.id as id, firstname, lastname, height, weight, position, health, imagePath,
                nvl(sum(goals), 0) as goals, nvl(sum(assists), 0) as assists, nvl(sum(goals+assists), 0) as scorer, nvl(sum(yellow), 0) as yellow, nvl(sum(red), 0) as red,
                (select count(e.id) from event e join user_event ue2 on e.id = ue2.eventID where ue2.playerID = u.id and e.type like 'Spiel') as games,
                (select count(e.id) from event e join user_event ue2 on e.id = ue2.eventID where ue2.playerID = u.id and e.type not like 'Spiel') as trainings from user u
                left outer join user_event ue on ue.playerID = u.id
                left outer join event e on ue.eventID = e.id
                group by u.id
                having u.id like '$playerID'";
        try {
            $result = $this->connection->query($sql);
            if ($result->num_rows == 0) {
                return false;
            } else {
                return $result->fetch_assoc();
            }
        } catch (mysqli_sql_exception $err) {
            throw new Exception("SQL error occurred: " . $err->getMessage());
        }
    }

    function uploadUserIcon(){
        if ($_FILES["image"]) {
            $imageFileType = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
            if($imageFileType == "jpg"){
                $targetDirectory = "../img/";
                $fileExtension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
                $targetFile = $targetDirectory . "userIcon_" . $_SESSION['userID'] . "." . $fileExtension;
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
