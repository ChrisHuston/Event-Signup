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
        var $rooms;
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $db_info = new DbInfo();
    $event_id = $_POST['event_id'];

    $query = "SELECT room_id, leader_id AS net_id, room, room_start, room_end, u.user_name
        FROM rooms r
        LEFT JOIN users u
          ON u.net_id=r.leader_id
        WHERE event_id='$event_id'
        ORDER BY room_start, room";

    $result = $mysqli->query($query);
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $db_info->rooms = $json;

    $mysqli->close();
    echo json_encode($db_info);
}

?>