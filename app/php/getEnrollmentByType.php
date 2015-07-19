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

    $token = "your token here";
    $type = $_POST['enrollment_type'];
    $course_id = $_SESSION['course_id'];
    $url = "https://your canvas url/api/v1/courses/".$course_id."/enrollments?type[]=".$type."&per_page=100";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    $headers = array('Authorization: Bearer ' . $token);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $data = curl_exec($ch);
    curl_close($ch);

    if ($type == 'TaEnrollment') {
        $priv_level = 2;
    } else {
        $priv_level = 3;
    }

    $user_list = "";
    $admin_list = "";
    $counter = 0;

    $object = json_decode( $data );

    foreach($object as $u) {
        $net_id = strtoupper($u->user->login_id);
        $user_name = $u->user->name;
        $user_email = $u->user->sis_user_id;
        if ($counter != 0) {
            $user_list .= ", ";
            $admin_list .= ", ";
        }
        $user_list .= '("'.$net_id.'","'.$user_email.'","'.$user_name.'")';
        $admin_list .= "('".$net_id."',".$priv_level.",".$course_id.")";
        $counter = $counter + 1;
    }

    $query = "INSERT IGNORE INTO users (net_id, user_email, user_name) VALUES ".$user_list. "; ";
    $query .= "INSERT IGNORE INTO course_admins (net_id, priv_level, course_id) VALUES ".$admin_list. "; ";
    $mysqli->multi_query($query);
    $mysqli->close();

    //echo $query;
    echo $data;
}

?>