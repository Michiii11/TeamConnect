<?php

require_once "./TeamRepository.class.php";
$teams = new TeamRepository();

session_start();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

$response = new stdClass();
$postBody = json_decode(file_get_contents('php://input'));

if ($uri[count($uri) - 2] == "team.php")
    $type = $uri[count($uri) - 1];
else if ($uri[count($uri) - 3] == "team.php")
    $type = $uri[count($uri) - 2];
else
    $type = "problem";

if (isset($_SESSION["loggedIn"]) && $_SESSION["loggedIn"]) {
    switch($type){
        case "getAllTeams": $response->data = $teams->getAllTeams(); break;
        case "getTeams": $response->data = $teams->getTeams($_SESSION["userID"]); break;
        case "createTeam": $response->data = $teams->createTeam($_SESSION["userID"], $postBody->teamName); break;
        case "addTeam": $response->data = $teams->addTeam($_SESSION["userID"], $postBody->teamName); break;
    }
} else {
    $response->message = "Not Logged in!";
}

echo json_encode($response);
