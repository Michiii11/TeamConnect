<?php
require_once "./UserRepository.class.php";
$users = new UserRepository();

session_start();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

if($uri[count($uri)-2] == "user.php")
    $type = $uri[count($uri)-1];
else if($uri[count($uri)-3] == "user.php")
    $type = $uri[count($uri)-2];
else
    $type = "problem";

$response = new stdClass();
$postBody = json_decode(file_get_contents('php://input'));

// LOGIN
if ($type == "sign_in") {
    if (isset($_GET["email"]) && isset($_GET["password"]) &&
        $users->checkCredentials(strtolower($_GET["email"]), $_GET["password"]))
    {
        $_SESSION["loggedIn"] = true;
        $_SESSION["userID"] = $users->getID(strtolower($_GET["email"]));
        $response->loggedIn = true;
    }
    else{
        $response->loggedIn = false;
    }
}
else if ($type == "sign_up") {
    if ( isset($postBody->firstname)  && isset($postBody->lastname) && isset($postBody->email) && isset($postBody->password)) {
        $mail = strtolower($postBody->email);
        if(!$users->emailUsed($mail)) {
            $users->insert($postBody);
            $response->emailUsed = false;
            $response->message = "user created";

            if($users->checkCredentials($mail,$postBody->password)){
                $_SESSION["loggedIn"] = true;
                $_SESSION["userID"] = $users->getID($mail);
                $response -> loggedIn = true;
            }
        }
        else{
            $response->emailUsed = true;
        }
    }
}

else if (isset($_SESSION["loggedIn"]) && $_SESSION["loggedIn"]) {
    $response->loggedIn = true;
    $response->name = $users->getName($_SESSION["userID"]);
    $response->personalData = $users->getPersonalData($_SESSION["userID"]);

    switch($type){
        case "getPlayer": $response->data = $users->getPlayer($_GET["teamID"]); break;
        case "getPlayerDetails": $response->data = $users->getPlayerDetails($postBody->playerID);break;
        case "getUserID": $response->data = $_SESSION["userID"]; break;
        case "updatePersonalData": $users->updatePersonalData($_SESSION["userID"], $postBody->firstname, $postBody->lastname, $postBody->email, $postBody->position, $postBody->health, $postBody->rule, $postBody->height, $postBody->weight, $postBody->imagePath); break;
        case "updatePassword": $users->updatePassword($_SESSION["userID"], $postBody->password);break;
        case "checkPassword": $response->data = $users->checkPassword($_SESSION["userID"], $postBody->password); break;
        case "uploadUserIcon": $response->data = $users->uploadUserIcon(); break;
    }
}
else {
    $response->message = "Not Logged in!";
    $response->loggedIn = false;
}

echo json_encode($response);