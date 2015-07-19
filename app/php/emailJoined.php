<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['net_id'])) {
    require("PHPMailerAutoload.php");

    $event_id = $_POST['event_id'];
    $event_name = $_POST['event_name'];
    $room = $_POST['room'];
    $leader_name = $_POST['leader_name'];
    $session_start = $_POST['session_start'];
    $session_end = $_POST['session_end'];
    $user_email = $_POST['user_email'];
    $user_name = $_POST['user_name'];
    if (empty($_POST['course_id'])) {
        $course_id = $_SESSION['course_id'];
    } else {
        $course_id = $_POST['course_id'];
    }


    $subject = $event_name;

    if (!empty($_POST['leader_email'])) {
        $sender = $_POST['leader_email'];
        $sender_name = $leader_name;
    } else {
        $sender = $course_id."@kblocks.com";
        $sender_name = "Event Sign Up";
    }


    $query = "SELECT COUNT(*) as num_announcements FROM announcements WHERE event_id='$event_id'";
    $result = $mysqli->query($query);
    list($num_announcements) = $result->fetch_row();

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

    $body = "<h3>".$event_name."</h3>";
    $body .= "<p>A spot has become available in this event and you are now registered:<br/></p>";
    if (!empty($_POST['room'])) {
        $body .= "<p><b>Location:  </b>".$room."</p>";
    }
    if (!empty($_POST['leader_name'])) {
        $body .= "<p><b>With: </b>".$leader_name."</p>";
    }
    if (!empty($_POST['session_start'])) {
        $body .= "<p><b>Time: </b>".$session_start." - ".$session_end."</p>";
    }

    if ($num_announcements == 1) {
        $body .= "<h4> One announcement for this event has already been posted. Be sure to sign in to the event to review this announcement.</h4>";
    } else if ($num_announcements > 1) {
        $body .= "<h4>".$num_announcements." announcements for this event have already been posted. Be sure to sign in to the event to review these announcements.</h4>";
    }
    $body .= '<p><a href="https://canvas.dartmouth.edu/courses/'.$course_id.'">Event Sign Up</a></p>';
    $mail->Body = $body;
    $mail->addAddress($user_email,$user_name);
    $sent_mail = $mail->send();

    $mysqli->close();

    echo json_encode($sent_mail);
}

?>