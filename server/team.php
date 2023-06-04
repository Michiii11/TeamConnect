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
        case "getAllTeamsNotEnteredYet": $response->data = $teams->getAllTeamsNotEnteredYet(); break;
        case "getTeams": $response->data = $teams->getTeams($_SESSION["userID"]); break;
        case "getTeamRequests": $response->data = $teams->getTeamRequests(); break;
        case "createTeam": $response->data = $teams->createTeam($_SESSION["userID"], $postBody->teamName); break;
        case "requestTeam": $response->data = $teams->requestTeam($_SESSION["userID"], $postBody->teamName); break;
        case "agreeRequest": $response->data = $teams->agreeRequest($postBody->requestID, $postBody->playerID, $postBody->teamID); break;
        case "denyRequest": $response->data = $teams->denyRequest($postBody->requestID); break;
        case "getEvents": $response->data = $teams->getEvents($_GET["teamID"]); break;
        case "addEvent": $response->data = $teams->addEvent($postBody->teamID, $postBody->type, $postBody->description, $postBody->date, $postBody->time, $postBody->duration); break;
        case "changeTeamName": $teams->changeTeamName($postBody->oldTeamName, $postBody->newTeamName);break;
        case "quitTeam": $teams->quitTeam($_SESSION["userID"], $postBody->teamName);
    }
} else {
    $response->message = "Not Logged in!";
}

echo json_encode($response);
