<?php
session_start();
class UserInfo {
    var $user_name = "";
    var $user_email = "";
    var $net_id = "";
    var $course_id = "";
    var $priv_level;
    var $login_error = "NONE";
    var $bridge_events;
}

$login_result = new UserInfo();

$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['course_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'event_manager');
    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $user_email = $_SESSION['email'];
    $saml_user_name = $_SESSION['full_name'];
    $net_id = $_SESSION['net_id'];
    $course_id = $_SESSION['course_id'];
    $priv_level = $_SESSION['priv_level'];

    $query = "SELECT u.user_name, u.user_email, a.priv_level
			FROM users u
			LEFT JOIN course_admins a
			  ON a.net_id=u.net_id AND a.course_id='$course_id'
            WHERE u.net_id='$net_id'";
    $result = $mysqli->query($query);
    list($user_name, $email, $admin) = $result->fetch_row();

    if ($admin != "") {
        $priv_level = $admin;
        $_SESSION['priv_level'] = $admin;
    }


    if ($email == "" || is_null($email)) {
        $user_email = $mysqli->real_escape_string($user_email);
        $saml_user_name = $mysqli->real_escape_string($saml_user_name);
        $query = "INSERT INTO users
				(net_id, user_name, user_email) VALUES
				('$net_id', '$saml_user_name', '$user_email')
				ON DUPLICATE KEY UPDATE user_name=VALUES(user_name), user_email=VALUES(user_email)";
        $mysqli->query($query);
        $user_name = $saml_user_name;
    } else {
        $user_email = $email;
    }

    $query = "SELECT e.event_id, e.event_name, e.is_active, e.max_sessions,
                  e.description, e.max_members, e.session_duration,
                  e.event_open, e.event_close,IF(e.event_open,(UTC_TIMESTAMP()<e.event_open),0) as before_event,
                  IF(e.event_close,(UTC_TIMESTAMP()>e.event_close),0) AS after_event, e.has_wait_list, e.show_names,
                  MIN(rm.room_start) AS event_start, MAX(rm.room_end) AS event_end, IF(rm.room_end,(MAX(rm.room_end)<UTC_TIMESTAMP),0) AS event_over,
                  s.session_start, s.session_end, r.room, u.user_name
			FROM k_events e
            LEFT JOIN rooms rm
              ON rm.event_id=e.event_id
            LEFT JOIN user_sessions s
              ON s.event_id=e.event_id AND s.net_id='$net_id'
            LEFT JOIN rooms r
              ON r.room_id=s.room_id
            LEFT JOIN users u
              ON u.net_id=r.leader_id
            WHERE e.course_id='$course_id'
            GROUP BY e.event_id
            ORDER BY e.event_open, event_start, e.event_id";

    $mysqli->multi_query($query);

    $mysqli->next_result();
    $result = $mysqli->store_result();
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $login_result->bridge_events = $json;

    $login_result->user_name = $user_name;
    $login_result->user_email = $user_email;
    $login_result->priv_level = $priv_level;
    $login_result->net_id = $net_id;
    $login_result->course_id = $course_id;

    $mysqli->close();
    echo json_encode($login_result);

} else {
    $login_result->login_error = "Cookies disabled.";
    echo json_encode($login_result);
}

?>