<?php
session_start();

require_once "./ChatRepository.class.php";
$chats = new ChatRepository();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

$response = new stdClass();
$postBody = json_decode(file_get_contents('php://input'));

if ($uri[count($uri) - 2] == "chat.php")
    $type = $uri[count($uri) - 1];
else if ($uri[count($uri) - 3] == "chat.php")
    $type = $uri[count($uri) - 2];
else
    $type = "problem";

if (isset($_SESSION["loggedIn"]) && $_SESSION["loggedIn"]) {
    switch($type){
        case "getMessages": $response->data = $chats->getMessages($postBody->teamID); break;
        case "sendMessage": $chats->sendMessage($_SESSION["userID"], $postBody->teamID, $postBody->message); break;
    }
} else {
    $response->message = "Not Logged in!";
}

echo json_encode($response);
