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
    $event_name = $_POST['event_name'];
    $description = $_POST['description'];
    $is_active = $_POST['is_active'];
    $has_wait_list = $_POST['has_wait_list'];
    $show_names = $_POST['show_names'];
    $max_sessions = $_POST['max_sessions'];
    if (empty($_POST['max_members'])) {
        $max_members = 0;
    } else {
        $max_members = $_POST['max_members'];
    }
    if (empty($_POST['session_duration'])) {
        $session_duration = 0;
    } else {
        $session_duration = $_POST['session_duration'];
    }
    if (empty($_POST['event_open'])) {
        $event_open = null;
    } else {
        $event_open = $_POST['event_open'];
    }

    if (empty($_POST['event_close'])) {
        $event_close = null;
    } else {
        $event_close = $_POST['event_close'];
    }
    $event_id = $_POST['event_id'];

    $stmt = $mysqli->prepare("UPDATE k_events SET event_name=?, is_active=?, max_sessions=?,
          description=?, max_members=?, session_duration=?, event_open=?, event_close=?, has_wait_list=?, show_names=?
        WHERE event_id=?");
    $stmt->bind_param("siisiissiii", $event_name, $is_active, $max_sessions, $description, $max_members, $session_duration, $event_open, $event_close, $has_wait_list, $show_names, $event_id);
    $db_info->res = $stmt->execute();
    $stmt->close();

    if ($_POST['multi_event'] == 0) {
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
        $room_id = $_POST['room_id'];
        $room_stmt = $mysqli->prepare("UPDATE rooms SET room=?, room_start=?, room_end=? WHERE room_id=?");
        $room_stmt->bind_param("sssi", $room, $room_start, $room_end, $room_id);
        $db_info->res = $room_stmt->execute() && $db_info->res;
        $room_stmt->close();
    }

    $mysqli->close();
    echo json_encode($db_info);
}

?>