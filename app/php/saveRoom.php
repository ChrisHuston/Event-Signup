<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['net_id']) && isset($_SESSION['priv_level']) && $_SESSION['priv_level']>2) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'event_manager');

    class DbInfo {
        var $res;
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $db_info = new DbInfo();

    $room = $_POST['room'];
    if (empty($_POST['room_start'])) {
        $room_start = null;
    } else {
        $room_start = $_POST['room_start'];
    }
    if (empty($_POST['room_end'])) {
        $room_end = null;
    } else {
        $room_end = $_POST['room_end'];
    }
    if (empty($_POST['net_id'])) {
        $leader_id = null;
    } else {
        $leader_id = $_POST['net_id'];
    }
    $room_id = $_POST['room_id'];
    $room_stmt = $mysqli->prepare("UPDATE rooms SET room=?, room_start=?, room_end=?, leader_id=? WHERE room_id=?");
    $room_stmt->bind_param("ssssi", $room, $room_start, $room_end, $leader_id, $room_id);
    $db_info->res = $room_stmt->execute();
    $room_stmt->close();

    $mysqli->close();
    echo json_encode($db_info);
}

?>