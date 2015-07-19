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

    $net_id = $mysqli->real_escape_string(strtoupper($_POST['net_id']));
    $user_name = $mysqli->real_escape_string($_POST['user_name']);
    $user_email = $_POST['user_email'];
    $priv_level = $_POST['priv_level'];
    $course_id= $_POST['course_id'];

    $query = "INSERT IGNORE INTO users
                (user_name, user_email, net_id)
                VALUES
                ('$user_name', '$user_email', '$net_id'); ";

    $query .= "INSERT IGNORE INTO course_admins
                (net_id, priv_level, course_id)
                VALUES
                ('$net_id', '$priv_level', '$course_id'); ";
    $result = $mysqli->multi_query($query);

    $mysqli->close();
    echo json_encode($result);
}

?>