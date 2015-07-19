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
        var $announcements = [];
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $db_info = new DbInfo();

    $course_id = $_POST['course_id'];

    $query = "SELECT e.event_id, e.event_name, a.announcement_txt, a.title, a.announcement_id, a.post_date, IFNULL(u.user_name, 'Admin') AS user_name, u.user_email
                FROM announcements a
                INNER JOIN k_events e
                    ON e.event_id=a.event_id
                LEFT JOIN users u
                    ON u.net_id=a.net_id
                WHERE a.course_id='$course_id'
                GROUP BY a.announcement_id
                ORDER BY post_date DESC; ";

    $result = $mysqli->query($query);
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $db_info->announcements = $json;

    $mysqli->close();
    echo json_encode($db_info);
}

?>