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
        var $delete_res = '';
    }

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $db_info = new DbInfo();
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
    $net_id = $_POST['net_id'];
    $waiter_id = $_POST['waiter_id'];

    if ($waiter_id != '0') {
        $query = "UPDATE user_sessions SET net_id='$waiter_id', join_date=UTC_TIMESTAMP()
          WHERE net_id='$net_id' AND room_id='$room_id' AND event_id='$event_id'; ";
        $query .= "DELETE FROM wait_list WHERE net_id='$waiter_id' AND event_id='$event_id'; ";
    } else {
        $query = "DELETE FROM user_sessions WHERE
          net_id='$net_id' AND room_id='$room_id' AND event_id='$event_id'; ";
    }
    $db_info->res = $mysqli->multi_query($query);

    if ($_SESSION['is_lti']) {
        /*
        $token = "your token";
        $canvas_event_id = $_POST['canvas_event_id'];
        $url = "https://your Canvas URL/api/v1/calendar_events/".$canvas_event_id;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $headers = array('Authorization: Bearer ' . $token);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $res = curl_exec($ch);
        curl_close($ch);
        if ($waiter_id != '0') {
            $event_name = $_POST['event_name'];
            $room = $_POST['room'];
            $description = $_POST['description'];
            $canvas_user_id = $_POST['canvas_user_id'];

            $fields = array(
                'calendar_event[context_code]' => 'user_'.$canvas_user_id,
                'calendar_event[title]' => $event_name,
                'calendar_event[start_at]' => $session_start."Z",
                'calendar_event[end_at]' => $session_end."Z",
                'calendar_event[location_name]' => $room,
                'calendar_event[description]' => $description
            );

            $fields_query = http_build_query($fields);

            $url = "https://canvas.dartmouth.edu/api/v1/calendar_events";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            $headers = array('Authorization: Bearer ' . $token);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch,CURLOPT_POST, count($fields));
            curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_query);
            $event_data = curl_exec($ch);
            curl_close($ch);
        }
        */
    }

    //$db_info->delete_res = $res;

    $mysqli->close();
    echo json_encode($db_info);
}

?>