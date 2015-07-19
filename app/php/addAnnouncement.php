<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['course_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'event_manager');
    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $announcement_txt = $mysqli->real_escape_string($_POST['announcement_txt']);
    $title = $mysqli->real_escape_string($_POST['title']);
    $event_id = $_POST['event_id'];
    $course_id = $_POST['course_id'];
    $net_id = $_SESSION['net_id'];

    $query = "INSERT INTO announcements
                (event_id, course_id, net_id, announcement_txt, title, post_date)
                VALUES ('$event_id', '$course_id', '$net_id', '$announcement_txt', '$title', UTC_TIMESTAMP())";
    $mysqli->query($query);

    $announcement_id = $mysqli->insert_id;
    $mysqli->close();
    echo json_encode($announcement_id);
}

?>