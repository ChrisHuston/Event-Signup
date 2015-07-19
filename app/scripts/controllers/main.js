'use strict';

angular.module('eventManagerApp')
  .controller('MainCtrl', function ($scope, UserService, $location, $timeout) {
        $scope.bridge = UserService.bridge;
        $scope.route = UserService.route;
        $scope.user = UserService.user;

        $scope.selectEvent = function(evt) {
            if (evt) {
                $timeout(function(){
                    UserService.bridge.evt = evt;
                    UserService.bridge.evt.joined = 0;
                    UserService.route.is_main = false;
                    UserService.route.is_event = false;
                    UserService.route.is_admin = false;
                    $('#bridge-navbar-collapse').collapse('hide');
                    $location.path('/event').replace();
                }, 200);
            }
        };

        $scope.gotoAdmin = function() {
            $location.path("/admin");
        }


  });
