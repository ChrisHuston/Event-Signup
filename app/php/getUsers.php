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
        var $users;
    }

    $course_id = $_SESSION['course_id'];

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $db_info = new DbInfo();

    $query = "SELECT u.user_name, u.net_id, a.priv_level
        FROM users u
        INNER JOIN course_admins a
          ON a.net_id=u.net_id
        WHERE a.priv_level<4 AND a.course_id='$course_id'
        ORDER BY u.user_name";

    $result = $mysqli->query($query);
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $db_info->users = $json;

    $mysqli->close();
    echo json_encode($db_info);
}

?>