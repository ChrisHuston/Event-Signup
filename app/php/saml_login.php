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
if (isset($_SESSION['net_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'event_manager');
    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    if (!isset($_SESSION['email']) || is_null($_SESSION['email']) || !is_string($_SESSION['email']) || strlen($_SESSION['email']) < 10) {
        $user_email = $_SESSION['net_id'] + "@test.edu";
    } else {
        $user_email = strtolower($_SESSION['email']);
    }

    $saml_user_name = $_SESSION['user_name'];
    $net_id = strtoupper($_SESSION['net_id']);
    $course_id = $_SESSION['course_id'];

    $query = "SELECT u.user_name, u.user_email, c.priv_level
			FROM users u
			LEFT JOIN course_admins c
			  ON c.net_id='$net_id'
            WHERE u.net_id='$net_id'";
    $result = $mysqli->query($query);
    list($user_name, $email, $priv_level) = $result->fetch_row();


    if ($email == "" || is_null($email)) {
        $query = "INSERT INTO users
				(net_id, user_name, user_email) VALUES
				('$net_id', '$saml_user_name', '$user_email')";
        $mysqli->query($query);
        $priv_level = 1;
        $user_name = $saml_user_name;
    } else {
        $user_email = $email;
    }

    $query = "SELECT e.event_id, e.event_name, e.is_active, e.max_sessions, e.description, e.max_members, e.session_duration,
                      e.event_open, e.event_close,(UTC_TIMESTAMP()<e.event_open) as before_event,
                      (UTC_TIMESTAMP()>e.event_close) AS after_event, e.has_wait_list, e.show_names,
                      MIN(rm.room_start) AS event_start, MAX(rm.room_end) AS event_end,
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
    $login_result->course_id = $_SESSION['course_id'];

    $_SESSION['net_id'] = $net_id;
    $_SESSION['priv_level'] = $priv_level;
    $_SESSION['is_lti'] = false;

    $mysqli->close();
    echo json_encode($login_result);

} else {
    $login_result->login_error = "Authentication error.";
    echo json_encode($login_result);
}

?>