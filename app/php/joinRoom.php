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
        var $res = false;
        var $canvas_event_id = '';
        var $event_obj;
        var $is_lti;
        var $num_members;
        var $max_members;
        var $error;
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $db_info = new DbInfo();
    $db_info->is_lti = $_SESSION['is_lti'];
    $event_id = $_POST['event_id'];
    $room_id = $_POST['room_id'];
    if (empty($_POST['session_start'])) {
        $session_start = null;
    } else {
        $session_start = $_POST['session_start'];
    }
    if (empty($_POST['session_end'])) {
        $session_end = null;
    } else {
        $session_end = $_POST['session_end'];
    }

    $max_members = $_POST['max_members'];
    $net_id = $_POST['net_id'];

    $stmt = $mysqli->prepare("SELECT COUNT(*) FROM user_sessions WHERE room_id=?
        AND session_start=? AND session_end=?");
    $stmt->bind_param("iss", $room_id, $session_start, $session_end);
    $stmt->execute();
    $stmt->bind_result($num_members);
    $stmt->fetch();
    $stmt->close();

    $db_info->num_members = $num_members;
    $db_info->max_members = $max_members;

    if ($max_members == 0 || $num_members < $max_members) {
        if ($_SESSION['is_lti']) {
            /*
            $canvas_user_id = $_SESSION['canvas_user_id'];
            $event_name = $_POST['event_name'];
            $room = $_POST['room'];
            $description = $_POST['description'];

            $fields = array(
                'calendar_event[context_code]' => 'user_'.$canvas_user_id,
                'calendar_event[title]' => $event_name,
                'calendar_event[start_at]' => $session_start."Z",
                'calendar_event[end_at]' => $session_end."Z",
                'calendar_event[location_name]' => $room,
                'calendar_event[description]' => $description
            );

            $fields_query = http_build_query($fields);

            $token = "your token here";
            $url = "https://your Canvas URL/api/v1/calendar_events";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            $headers = array('Authorization: Bearer ' . $token);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch,CURLOPT_POST, count($fields));
            curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_query);
            $event_data = curl_exec($ch);
            curl_close($ch);

            $event_obj = json_decode( $event_data );
            $db_info->event_obj = $event_obj;

            $canvas_event_id = $event_obj->id;
            */
            $canvas_event_id = 0;
        } else {
            $canvas_event_id = 0;
        }


        $query = $mysqli->prepare("INSERT INTO user_sessions (net_id, room_id, session_start, session_end, event_id, canvas_event_id, join_date)
            VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())");
        $query->bind_param("sissii", $net_id, $room_id, $session_start, $session_end, $event_id, $canvas_event_id);
        $db_info->res = $query->execute();

        $db_info->canvas_event_id = $canvas_event_id;

        if (!empty($_POST['user_name'])) {
            $user_name = $_POST['user_name'];
            $query_user = $mysqli->prepare("INSERT IGNORE INTO users (net_id, user_name) VALUES (?, ?)");
            $query_user->bind_param("ss", $net_id, $user_name);
            $query_user->execute();
        }

    } else {
        $db_info->error = "Room is already full at this time.";
    }
    $mysqli->close();
    echo json_encode($db_info);
}

?>