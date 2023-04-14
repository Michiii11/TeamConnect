<?php
class Database
{
    private static $dbserver = "localhost";
    private static $dbname = "teamconnect";
    private static $dbusername = "teamconnect";
    private static $dbpassword = "team";
    function getDataSource()
    {
        try {
            //self refers to static properties in the class
            $connection = new mysqli(self::$dbserver, self::$dbusername, self::$dbpassword, self::$dbname);
            if (!$connection) {
                die("Database unreachable: " . mysqli_connect_errno());
            } else {
                return $connection;
            }
        } catch (mysqli_sql_exception $err) {
            echo $err;
        }
    }
    function isReachable()
    {
        if (mysqli_ping($this->getDataSource())) {
            return true;
        } else {
            return false;
        }
    }
}