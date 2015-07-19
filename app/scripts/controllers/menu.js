'use strict';

angular.module('eventManagerApp')
  .controller('MenuCtrl', function ($scope, UserService, $location, $window) {
        $scope.user = UserService.user;
        $scope.route = UserService.route;
        UserService.login();
        $scope.route.is_main = true;

        $scope.setActive = function(loc) {
            UserService.route.is_main = false;
            UserService.route.is_event = false;
            UserService.route.is_admin = false;
            UserService.route.is_email = false;
            UserService.route.is_users = false;
            $('#bridge-navbar-collapse').collapse('hide');
            $location.path(loc);
            if (loc === "/") {
                UserService.route.is_main = true;
            } else if (loc === "/event") {
                UserService.route.is_event = true;
            } else if (loc === '/admin') {
                UserService.route.is_admin = true;
            } else if (loc === '/users') {
                UserService.route.is_users = true;
            } else if (loc === '/email') {
                UserService.route.is_email = true;
            }
        };

        $scope.fullscreen = function() {
            $window.open("https://www.kblocks.com/app/scheduler/index_lti.php");
        };
  });
