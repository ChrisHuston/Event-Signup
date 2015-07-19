<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['net_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'event_manager');

    class DbInfo {
        var $res = false;
        var $error;
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $db_info = new DbInfo();
    $event_id = $_POST['event_id'];
    $net_id = $_SESSION['net_id'];
    $canvas_user_id = $_SESSION['canvas_user_id'];

    $query = "INSERT INTO wait_list (net_id, event_id, wait_date, canvas_user_id)
    VALUES ('$net_id', '$event_id', UTC_TIMESTAMP(), '$canvas_user_id')";
    $db_info->res = $mysqli->query($query);

    $mysqli->close();
    echo json_encode($db_info);
}

?>