<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['net_id']) && isset($_SESSION['priv_level']) && $_SESSION['priv_level']>2) {

    $token = "your token here";
    $type = $_POST['enrollment_type'];
    $course_id = $_SESSION['course_id'];
    $url = "https://your Canvas URL/api/v1/courses/".$course_id."/enrollments?type[]=".$type."&per_page=50";

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
    $counter = 0;

    foreach($data as $u) {
        $net_id = strtoupper($u->user->login_id);
        if ($counter != 0) {
            $user_list .= ",";
        }
        $user_list .= "(".$net_id.",".$priv_level.",".$course_id.")";
        $counter = $counter + 1;
    }

    $query = "INSERT IGNORE INTO course_admins (net_id, priv_level, course_id) VALUES '$user_list'";
    echo $data;
}

?>