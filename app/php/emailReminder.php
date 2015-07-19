<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['net_id']) && isset($_SESSION['priv_level']) && $_SESSION['priv_level']>2) {
    include("advanced_user_oo.php");
    require("PHPMailerAutoload.php");

    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'event_manager');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $event_id = $_POST['event_id'];
    $event_name = $_POST['event_name'];
    $subject = 'EVENT SCHEDULER: '.$event_name;
    $sender = $_SESSION['email'];
    $sender_name = $_SESSION['full_name'];
    $course_id = $_SESSION['course_id'];

    $mail = new PHPMailer;
    $mail->isSMTP();
    $mail->Host       = "localhost";      // sets the SMTP server
    $mail->Port       = 25;               // set the SMTP port
    $mail->SMTPAuth   = false;            // disable SMTP authentication

    $mail->From = $sender;
    $mail->FromName = $sender_name;
    $mail->Subject    = $subject;
    $mail->WordWrap   = 60;

    $mail->isHTML(true);

    $mail->AltBody = "";
    $mail->addReplyTo($sender, $sender_name);

    $query = "SELECT r.room, l.user_name AS leader_name,
      DATE_FORMAT(SUBDATE(session_start, INTERVAL 4 HOUR), '%M %e, %l:%i') as session_start,
      DATE_FORMAT(SUBDATE(session_end, INTERVAL 4 HOUR), '%l:%i') as session_end, u.user_email, u.user_name
    FROM rooms r
    INNER JOIN users l
      ON l.net_id=r.leader_id
    INNER JOIN user_sessions s
      ON s.room_id=r.room_id
    INNER JOIN users u
      ON u.net_id=s.net_id
    WHERE r.event_id='$event_id'
    ORDER BY r.room_start, r.room, s.session_start, u.user_name";
    $result = $mysqli->query($query);

    $sent_mail = 0;
    while (list($room, $leader_name, $session_start, $session_end, $user_email, $user_name) = $result->fetch_row()) {
        $body = "<h3>Event: ".$event_name."</h3>";
        $body .= "<p><b>Location:  </b>".$room."</p>";
        $body .= "<p><b>With: </b>".$leader_name."</p>";
        $body .= "<p><b>Time: </b>".$session_start." - ".$session_end."</p>";
        $body .= '<p><a href="http://digital.tuck.dartmouth.edu/secure/scheduler/index.php?id='.$course_id.'">Event Scheduler</a></p>';
        $mail->Body = $body;
        $mail->AddAddress($user_email,$user_name);
        if ($mail->Send()) {
            $sent_mail = $sent_mail + 1;
        }

        $mail->ClearAddresses();
    }
    $mysqli->close();
    echo json_encode($sent_mail);
}

?>