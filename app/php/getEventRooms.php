<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['net_id']) && isset($_POST['event_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'event_manager');

    class DbInfo {
        var $evt_rooms = [];
        var $waiting_list = [];
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $evt = new DbInfo();
    $event_id = $_POST['event_id'];

    $query = "SELECT r.room_start, r.room_end, r.room,
    r.room_id, r.leader_id, l.user_name AS leader_name, l.user_email AS leader_email,
    s.room_id AS user_room_id, s.net_id, s.session_start, s.session_end, s.canvas_event_id, u.user_name
    FROM rooms r
    LEFT JOIN users l
      ON l.net_id=r.leader_id
    LEFT JOIN user_sessions s
      ON s.room_id=r.room_id
    LEFT JOIN users u
      ON u.net_id=s.net_id
    WHERE r.event_id='$event_id'
    ORDER BY r.room_start, r.room, r.room_id, s.session_start, u.user_name; ";

    $query .= "SELECT w.net_id, u.user_name, u.user_email, w.canvas_user_id
        FROM wait_list w
        INNER JOIN users u
            ON u.net_id=w.net_id
        WHERE event_id='$event_id'";

    $mysqli->multi_query($query);
    $mysqli->next_result();
    $result = $mysqli->store_result();

    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $evt->evt_rooms = $json;

    $mysqli->next_result();
    $result = $mysqli->store_result();
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $evt->waiting_list = $json;

    $mysqli->close();
    echo json_encode($evt);
}

?>