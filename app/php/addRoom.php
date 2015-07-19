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
        var $room_id;
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $db_info = new DbInfo();

    $course_id = $_POST['course_id'];
    $event_id = $_POST['event_id'];
    $room = $_POST['room'];
    $leader_id = $_POST['net_id'];
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
    $query_stmt = $mysqli->prepare("INSERT INTO rooms (room, leader_id, room_start, room_end, event_id, course_id)
        VALUES (?,?,?,?,?,?)");
    $query_stmt->bind_param("ssssii", $room, $leader_id, $room_start, $room_end, $event_id, $course_id);
    $query_stmt->execute();
    $room_id = $query_stmt->insert_id;
    $db_info->room_id = $room_id;
    $query_stmt->close();

    $mysqli->close();
    echo json_encode($db_info);
}

?>