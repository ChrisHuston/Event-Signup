<?php
session_start();
//$session_id = session_id();
//header("location: index_lti.php?session_id=". $session_id );
// Load up the Basic LTI Support code
require_once 'ims-blti/blti.php';
// Initialize, all secrets are 'secret', do not set session, and do not redirect
$context = new BLTI("your secret", false, false);

if ( $context->valid && isset($_POST['custom_canvas_course_id'])) {
    $_SESSION['course_id'] = $_POST['custom_canvas_course_id'];
    $_SESSION['net_id'] = strtoupper($_POST['custom_canvas_user_login_id']);
    $_SESSION['email'] = strtolower($_POST['lis_person_contact_email_primary']);
    $_SESSION['family_name'] = $_POST['lis_person_name_family'];
    $_SESSION['given_name'] = $_POST['lis_person_name_given'];
    $_SESSION['full_name'] = $_POST['lis_person_name_full'];
    $_SESSION['canvas_user_id'] = $_POST['custom_canvas_user_id'];
    $_SESSION['is_lti'] = true;
    $roles = $_POST['roles'];
    if (strpos($roles, 'Administrator') !== false || strpos($roles, 'Instructor') !== false || strpos($roles, 'Designer') !== false || strpos($roles, 'ContentDeveloper') !==false) {
        $_SESSION['priv_level'] = 3;
    } else if (strpos($roles, 'TeachingAssistant') !== false) {
        $_SESSION['priv_level'] = 2;
    } else {
        $_SESSION['priv_level'] = 1;
    }
    $_SESSION['roles'] = $roles;
    //header("location: index_lti.php?session_id=". $session_id );
}
?>

<!doctype html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Scheduler</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">
    <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
    <!-- build:css styles/vendor.css -->
    <!-- bower:css -->
    <link rel="stylesheet" href="../bower_components/ng-grid/ng-grid.min.css" />
    <link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap.min.css" />
    <!-- endbower -->
    <!-- endbuild -->
    <link rel="stylesheet" href="../bower_components/font-awesome/css/font-awesome.min.css" />
    <!-- build:css({.tmp,app}) styles/main.css -->
    <link rel="stylesheet" href="styles/main.css">
    <!-- endbuild -->
</head>
<body ng-app="eventManagerApp">
<div ng-controller="MenuCtrl">
    <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bridge-navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="bridge-navbar-collapse">
            <ul class="nav navbar-nav">
                <li ng-class="{active:route.is_main}" ng-click="setActive('/')"><a href="">Events</a></li>
                <li ng-show="user.priv_level>2" ng-class="{active:route.is_admin}"><a href="" ng-click="setActive('/admin')">Admin</a></li>
                <li ng-show="user.priv_level>2" ng-class="{active:route.is_email}"><a href="" ng-click="setActive('/email')">Email</a></li>
                <li ng-show="user.priv_level>2" ng-class="{active:route.is_users}"><a href="" ng-click="setActive('/users')">Users</a></li>
            </ul>
            <button ng-show="user.priv_level>2" class="btn btn-default pull-right full-btn" ng-click="fullscreen()" tooltip="Open in new tab" tooltip-placement="left"><i class="fa fa-external-link"></i></button>

        </div><!-- /.navbar-collapse -->
    </nav>
</div>
<!-- Add your site or application content here -->
<div class="container" ng-view=""></div>

<!-- build:js scripts/vendor.js -->
<!-- bower:js -->
<script src="../bower_components/jquery/dist/jquery.min.js"></script>
<script src="../bower_components/angular/angular.min.js"></script>
<script src="../bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>
<script src="../bower_components/moment/min/moment.min.js"></script>
<script src="../bower_components/ng-grid/build/ng-grid.min.js"></script>
<script src="../bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="../bower_components/angular-sanitize/angular-sanitize.min.js"></script>
<script src="../bower_components/angular-route/angular-route.min.js"></script>
<script src="../bower_components/angular-touch/angular-touch.min.js"></script>
<!-- endbower -->
<!-- endbuild -->

<!-- build:js({.tmp,app}) scripts/scripts.js -->
<script src="scripts/app.js"></script>
<script src="scripts/controllers/main.js"></script>
<script src="scripts/services/userservice.js?v=1"></script>
<script src="scripts/controllers/menu.js"></script>
<script src="scripts/controllers/bridge_event.js?v=2"></script>
<script src="scripts/controllers/admin.js?v=3"></script>
<script src="scripts/controllers/users.js"></script>
<script src="scripts/controllers/email.js?v=1"></script>
<!-- endbuild -->
<script src="//tinymce.cachefly.net/4.2/tinymce.min.js"></script>
<script src="../bower_components/ng-flow/dist/ng-flow-standalone.min.js"></script>
</body>
</html>
