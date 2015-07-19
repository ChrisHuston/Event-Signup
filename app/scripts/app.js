'use strict';

var eventManagerApp = angular.module('eventManagerApp', ['ngSanitize','ngRoute', 'flow', 'ngTouch', 'ngGrid', 'ui.bootstrap'])
  .config(function ($compileProvider, $routeProvider, $locationProvider) {
    $locationProvider.html5Mode(false);
    $compileProvider.debugInfoEnabled(false);
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html?v=1',
        controller: 'MainCtrl'
      })
      .when('/event', {
        templateUrl: 'views/bridge_event.html?v=2',
        controller: 'BridgeEventCtrl'
      })
      .when('/admin', {
        templateUrl: 'views/admin.html?v=1',
        controller: 'AdminCtrl'
      })
      .when('/users', {
        templateUrl: 'views/users.html',
        controller: 'UsersCtrl'
      })
      .when('/email', {
        templateUrl: 'views/email.html',
        controller: 'EmailCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
