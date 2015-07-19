<?php
session_start();
if (isset($_SERVER["mail"])) {
    $_SESSION['email'] = $_SERVER["mail"];
}
$_SESSION['net_id'] = $_SERVER["nameid"];
$_SESSION['user_name'] = $_SERVER["displayName"];
$_SESSION['is_lti'] = false;
$_SESSION['course_id'] = $_GET['id'];
?>

<!doctype html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Event Scheduler</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">
      <link rel="icon"
            type="image/ico"
            href="../../scheduler/favicon.ico">
    <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
    <!-- build:css styles/vendor.css -->
    <!-- bower:css -->
    <link rel="stylesheet" href="../../scheduler/bower_components/ng-grid/ng-grid.min.css" />
    <link rel="stylesheet" href="../../scheduler/bower_components/bootstrap/dist/css/bootstrap.min.css" />
    <!-- endbower -->
    <!-- endbuild -->
      <link rel="stylesheet" href="../../scheduler/bower_components/font-awesome/css/font-awesome.min.css" />
    <!-- build:css({.tmp,app}) styles/main.css -->
    <link rel="stylesheet" href="../../scheduler/styles/main.css">
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
                  <li ng-show="user.priv_level>2" ng-class="{active:route.is_users}"><a href="" ng-click="setActive('/users')">Users</a></li>
              </ul>

          </div><!-- /.navbar-collapse -->
      </nav>
  </div>
    <!-- Add your site or application content here -->
    <div class="container" ng-view=""></div>


    <!--[if lt IE 9]>
    <script src="../../bower_components/es5-shim/es5-shim.min.js"></script>
    <script src="../../bower_components/json3/lib/json3.min.js"></script>
    <![endif]-->

    <!-- build:js scripts/vendor.js -->
    <!-- bower:js -->
    <script src="../../bower_components/jquery/dist/jquery.min.js"></script>
    <script src="../../bower_components/angular/angular.min.js"></script>
    <script src="../../bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>
    <script src="../../bower_components/moment/min/moment.min.js"></script>
    <script src="../../bower_components/ng-grid/build/ng-grid.min.js"></script>
    <script src="../../bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="../../bower_components/angular-sanitize/angular-sanitize.min.js"></script>
    <script src="../../bower_components/angular-route/angular-route.min.js"></script>
    <script src="../../bower_components/angular-touch/angular-touch.min.js"></script>
    <!-- endbower -->
    <!-- endbuild -->

        <!-- build:js({.tmp,app}) scripts/scripts.js -->
        <script src="scripts/app.js"></script>
        <script src="../../scheduler/scripts/controllers/main.js"></script>
        <script src="../../scheduler/scripts/services/userservice.js"></script>
        <script src="../../scheduler/scripts/controllers/menu.js"></script>
        <script src="../../scheduler/scripts/controllers/bridge_event.js"></script>
        <script src="../../scheduler/scripts/controllers/admin.js"></script>
        <script src="../../scheduler/scripts/controllers/users.js"></script>
        <!-- endbuild -->
  <script src="//tinymce.cachefly.net/4.1/tinymce.min.js"></script>
</body>
</html>
