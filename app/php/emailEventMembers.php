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

    $tz_offset = $_POST['tz_offset'];
    $announcement_txt = $_POST['announcement_txt'];
    $title = $_POST['title'];
    $event_id = $_POST['event_id'];
    $event_name = $_POST['event_name'];
    $subject = 'EVENT SCHEDULER: '.$event_name;
    $sender = $_SESSION['email'];
    $sender_name = $_SESSION['full_name'];
    $course_id = $_SESSION['course_id'];

    $mail = new PHPMailer;
    $mail->isSMTP();
    //$mail->SMTPDebug = 2;
    $mail->Host       = "localhost";      // sets the SMTP server
    $mail->Port       = 25;                   // set the SMTP port
    $mail->SMTPAuth   = false;                  // enable SMTP authentication

    $mail->From = $sender;
    $mail->FromName = $sender_name;
    $mail->Subject    = $subject;
    $mail->WordWrap   = 60;

    $mail->isHTML(true);

    $mail->AltBody = "";
    $mail->addReplyTo($sender, $sender_name);

    $query = "SELECT r.room_id, u.user_email, u.user_name
    FROM rooms r
    INNER JOIN user_sessions s
      ON s.room_id=r.room_id
    INNER JOIN users u
      ON u.net_id=s.net_id
    WHERE r.event_id='$event_id'
    ORDER BY r.room_start, r.room_id, s.session_start, u.user_name";
    $result = $mysqli->query($query);

    $sent_mail = 0;
    $counter = 0;

    $body = "<h3>Event: ".$event_name."</h3>";
    $body .= "<h4>".$title."</h4>";
    $body .= $announcement_txt;
    $body .= '<p><a href="https://your canvas url/courses/'.$course_id.'">Event Sign Up</a></p>';
    $mail->Body = $body;
    $mail->addAddress('event_scheduler@your_email_server.com','Event Scheduler');

    while (list($room_id, $user_email, $user_name) = $result->fetch_row()) {
        if ($counter > 950) {
            $mail->send();
            $mail->clearAddresses();
            $mail->clearBCCs();
            $mail->addAddress('event_scheduler@your_email_server.com','Event Scheduler');
            $counter = 0;
        }
        $mail->addBCC($user_email,$user_name);
        $sent_mail = $sent_mail + 1;
        $counter = $counter + 1;
    }
    if ($counter > 0) {
        $mail->send();
        $mail->clearAddresses();
        $mail->clearBCCs();
    }
    $mysqli->close();
    echo json_encode($sent_mail);
}

?>