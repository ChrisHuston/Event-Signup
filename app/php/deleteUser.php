<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['net_id']) && isset($_SESSION['priv_level']) && $_SESSION['priv_level']>2) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'event_manager');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $net_id = $_POST['net_id'];
    $course_id= $_POST['course_id'];

    $query = "DELETE FROM rooms WHERE leader_id='$net_id' AND course_id='$course_id'; ";
    $query .= "DELETE FROM course_admins WHERE net_id='$net_id' AND course_id='$course_id'; ";
    $result = $mysqli->multi_query($query);

    $mysqli->close();
    echo json_encode($result);
}

?>