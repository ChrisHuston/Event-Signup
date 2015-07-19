'use strict';

angular.module('eventManagerApp', ['ngSanitize','ngRoute', 'ngTouch', 'ngGrid', 'ui.bootstrap'])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(false);
    $routeProvider
      .when('/', {
        templateUrl: '../../scheduler/views/main.html',
        controller: 'MainCtrl'
      })
      .when('/event', {
        templateUrl: '../../scheduler/views/bridge_event.html',
        controller: 'BridgeEventCtrl'
      })
      .when('/admin', {
        templateUrl: '../../scheduler/views/admin.html',
        controller: 'AdminCtrl'
      })
      .when('/users', {
        templateUrl: '../../scheduler/views/users.html',
        controller: 'UsersCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
