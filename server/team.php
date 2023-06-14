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
        case "createTeam": $teams->createTeam($_SESSION["userID"], $postBody->teamName, $postBody->imagePath); break;
        case "requestTeam": $response->data = $teams->requestTeam($_SESSION["userID"], $postBody->teamName); break;
        case "agreeRequest": $teams->agreeRequest($postBody->requestID, $postBody->playerID, $postBody->teamID); break;
        case "denyRequest": $teams->denyRequest($postBody->requestID); break;
        case "getEvents": $response->data = $teams->getEvents($_GET["teamID"]); break;
        case "addEvent": $teams->addEvent($postBody->teamID, $postBody->type, $postBody->description, $postBody->date, $postBody->time, $postBody->duration, $_SESSION["userID"]); break;
        case "updateEvent": $teams->updateEvent($postBody->eventID, $postBody->date, $postBody->time, $postBody->duration, $postBody->description, $postBody->result, $postBody->notions); break;
        case "deleteEvent": $teams->deleteEvent($postBody->eventID);break;
        case "getPlayersForEvent": $response->data = $teams->getPlayersForEvent($postBody->eventID); break;
        case "setPlayersToEvent": $teams->setPlayersToEvent($postBody->playerList, $postBody->eventID); break;
        case "checkIfPlayerIsInEvent": $response->data = $teams->checkIfPlayerIsInEvent($_SESSION["userID"], $postBody->eventID); break;
        case "updateStatsToEvent": $teams->updateStatsToEvent($postBody->list, $_GET["eventID"]); break;
        case "getStatsToEvent": $response->data = $teams->getStatsOfEvent($_GET["eventID"]); break;
        case "getEventsThisMonth": $response->data = $teams->getEventsThisMonth($_SESSION["userID"], $postBody->teamID, $postBody->month); break;
        case "changeTeamName": $teams->changeTeamName($postBody->oldTeamName, $postBody->newTeamName, $postBody->imagePath);break;
        case "quitTeam": $teams->quitTeam($_SESSION["userID"], $postBody->teamName); break;
        case "uploadTeamIcon": $response->data = $teams->uploadTeamIcon($_GET["teamName"]); break;
    }
} else {
    $response->message = "Not Logged in!";
}

echo json_encode($response);
