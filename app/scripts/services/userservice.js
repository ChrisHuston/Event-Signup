'use strict';

angular.module('eventManagerApp')
  .factory('UserService', function ($http, $location) {
        var userInstance = {};
        if (document.domain === "digital.tuck.dartmouth.edu") {
            userInstance.appDir = 'http://digital.tuck.dartmouth.edu/scheduler/';
        } else {
            userInstance.appDir = 'https://www.kblocks.com/app/scheduler/';
        }

        var setActive = function(loc) {
            userInstance.route.is_main = false;
            userInstance.route.is_event = false;
            userInstance.route.is_admin = false;
            userInstance.route.is_users = false;
            $('#bridge-navbar-collapse').collapse('hide');
            $location.path(loc);
            if (loc === "/") {
                userInstance.route.is_main = true;
            } else if (loc === "/bridge_event") {
                userInstance.route.is_event = true;
            } else if (loc === '/admin') {
                userInstance.route.is_admin = true;
            } else if (loc === '/users') {
                userInstance.route.is_users = true;
            }
        };

        userInstance.initApp = function() {
            userInstance.user = {net_id:0, priv_level:0, user_name:"", loginError:null};
            userInstance.bridge = {events:[], evt:{joined:0, wait_list:[]}};
            userInstance.route = {is_main:false, is_event:false, is_admin:false, is_users:false, set_active:setActive};
            userInstance.admin = {events:[], users:[], rooms:[], selectedEvent:{}, multi_event:false, announcements:[]};
        };

        userInstance.initApp();

        userInstance.login = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            if (location.pathname.indexOf("secure") != -1) {
                php_script = "saml_login.php";
            } else {
                php_script = "lti_login.php";
            }

            $http({method: 'POST',
                url: userInstance.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (data.login_error === "NONE") {
                        userInstance.user.net_id = data.net_id;
                        userInstance.user.user_name = data.user_name;
                        userInstance.user.user_email = data.user_email;
                        userInstance.user.priv_level = parseInt(data.priv_level);
                        userInstance.user.course_id = data.course_id;
                        var has_events = false;
                        angular.forEach(data.bridge_events, function(e) {
                            if (e.is_active === '1') {
                                has_events = true;
                            }
                            if (e.event_start) {
                                e.eventStart = utcStrToLocalDate(e.event_start);
                                e.eventEnd = utcStrToLocalDate(e.event_end);
                            }
                            e.event_open = utcStrToLocalDate(e.event_open);
                            e.event_close = utcStrToLocalDate(e.event_close);
                            e.max_sessions = parseInt(e.max_sessions);
                            e.max_members = parseInt(e.max_members);
                            e.session_duration = parseInt(e.session_duration);
                            e.event_over = e.event_over === '1';
                            e.before_event = e.before_event === '1';
                            e.after_event = e.after_event === '1';
                            if (e.session_start) {
                                e.session_start = utcStrToLocalDate(e.session_start);
                                e.session_end = utcStrToLocalDate(e.session_end);
                            }
                        });
                        userInstance.user.has_events = has_events;
                        userInstance.bridge.events = data.bridge_events;
                    } else {
                        userInstance.user.loginError =  data.login_error;
                        userInstance.user.has_events = true;
                    }
                }).
                error(function(data, status) {
                    userInstance.user.loginError =  "Error: " + status + " Sign-in failed. Check your internet connection";
                    $location.path('/');
                });
        };

        userInstance.getUsers = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            var php_script = "getUsers.php"

            $http({method: 'POST',
                url: userInstance.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    userInstance.admin.users = data.users;
                }).
                error(function(data, status) {
                    alert(status);
                });
        };

        userInstance.getAdminEvents = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            var php_script = "getAdminEvents.php";

            $http({method: 'POST',
                url: userInstance.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    angular.forEach(data.events, function(e) {
                        e.max_sessions = parseInt(e.max_sessions);
                        e.max_members = parseInt(e.max_members);
                        e.session_duration = parseInt(e.session_duration);

                        e.event_open = utcStrToLocalDate(e.event_open);
                        e.event_close = utcStrToLocalDate(e.event_close);

                    });
                    userInstance.admin.events = data.events;
                }).
                error(function(data, status) {
                    alert(status);
                });
        };

        userInstance.getRooms = function(event_id) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            params.event_id = event_id;
            var php_script = "getRooms.php";

            var db_call = $http({method: 'POST',
                url: userInstance.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            return db_call;
        };

        return userInstance;
  });

function utcStrToLocalDate(dtstr) {
    if (dtstr) {
        var utcDate;
        if (angular.isDate(dtstr)) {
            utcDate  = dtstr;
        } else {
            var year = dtstr.substr(0,4);
            var month = (dtstr.substr(5,2)-1);
            var day = dtstr.substr(8,2);
            utcDate = new Date(year, month, day, dtstr.substr(11,2), dtstr.substr(14,2), dtstr.substr(17,2)).getTime();
        }
        var offset = new Date().getTimezoneOffset() * 60 * 1000;
        return new Date(utcDate - offset);
    } else {
        return null;
    }

}

function localDateToUTC(d) {
    if (angular.isDate(d)) {
        var offset = new Date().getTimezoneOffset() * 60 * 1000;
        return new Date(d.getTime() + offset);
    } else {
        return null;
    }

}

function mergeDateTimeToUTC(d,t) {
    return localDateToUTC(new Date(d.getFullYear(), d.getMonth(), d.getDate(), t.getHours(), t.getMinutes()));
}
