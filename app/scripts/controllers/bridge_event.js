'use strict';

angular.module('eventManagerApp')
  .controller('BridgeEventCtrl', function ($scope, UserService, $http, $filter, $location) {
        if (UserService.user.net_id === 0 || !UserService.bridge.evt.event_id) {
            $location.path('/');
        }
        UserService.route.is_main = false;
        $scope.user = UserService.user;
        $scope.bridge_event = UserService.bridge.evt;
        $scope.openings = 1;
        $scope.wait_list = [];
        $scope.on_wait_list = false;
        $scope.total_registered = 0;
        $scope.total_available = 0;
        $scope.total_past = 0;
        $scope.is_member = false;

        $scope.masquerade = {user_name:null, net_id:null};

        $scope.evt = {rooms:[]};

        var getAnnouncements = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "getAnnouncements.php";
            var params = {};
            params.event_id = UserService.bridge.evt.event_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    angular.forEach(data.announcements, function(a) {
                        a.post_date = utcStrToLocalDate(a.post_date);
                        a.show_announcement = false;
                    });
                    $scope.bridge_event.announcements = data.announcements;
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Email announcement failed. Check your internet connection");
                });
        };

        $scope.toggleShowAnnouncement = function(a) {
            a.show_announcement = !a.show_announcement;
        };

        var getEventRooms = function(evt) {
            if (!evt.event_id) {
                alert("Problem identifying the event. Please refresh your browser and try again.");
                return;
            }
            var php_script = "getEventRooms.php";
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.net_id = UserService.user.net_id;
            params.event_id = evt.event_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    var currentTime = new Date().getTime();
                    $scope.wait_list = data.waiting_list;
                    for (var w=0; w < $scope.wait_list.length; w++) {
                        if ($scope.wait_list[w].net_id === $scope.user.net_id) {
                            $scope.on_wait_list = true;
                            break;
                        }
                    }
                    $scope.openings = 0;
                    var current_room = {day_id:null, room_id:null, day_num:0};
                    var rooms = [];
                    for (var i=0; i < data.evt_rooms.length; i++) {
                        var e = data.evt_rooms[i];
                        e.room_start = utcStrToLocalDate(e.room_start);
                        if (e.room_start) {
                            e.day_id = e.room_start.getDate();
                            if (e.day_id !== current_room.day_id || e.room_id !== current_room.room_id) {
                                if (current_room.room_id) {
                                    rooms.push(current_room);
                                }
                                if (current_room.day_id !== e.day_id) {
                                    current_room = {day_num:(current_room.day_num + 1)};
                                } else {
                                    current_room = {day_num:current_room.day_num};
                                }
                                current_room.day_id = e.day_id;
                                current_room.room_id = e.room_id;
                                current_room.room = e.room;
                                current_room.leader_email = e.leader_email;
                                current_room.max_members = $scope.bridge_event.max_members;
                                current_room.leader_name = e.leader_name;
                                current_room.sessions = [];
                                current_room.room_start = e.room_start;
                                current_room.room_end = utcStrToLocalDate(e.room_end);
                                current_room.session_duration = $scope.bridge_event.session_duration;
                                var start = current_room.room_start.getTime();
                                var end = current_room.room_end.getTime();
                                var dur = current_room.session_duration * 60 * 1000;
                                while (start + dur <= end) {
                                    var session = {session_start:new Date(start), session_end:new Date(start + dur), members:[]};
                                    current_room.sessions.push(session);
                                    start = start + dur;

                                    if (currentTime < session.session_start.getTime()) {
                                        session.is_past = false;
                                        $scope.openings += 1;
                                    } else {
                                        $scope.total_past += $scope.bridge_event.max_members;
                                        session.is_past = true;
                                    }
                                    $scope.total_available += $scope.bridge_event.max_members;
                                }
                            }
                        } else {
                            if (e.room_id !== current_room.room_id) {
                                current_room = {day_id:null, room_id:e.room_id, day_num:0};
                                current_room.sessions = [];
                                current_room.room = e.room;
                                current_room.max_members = $scope.bridge_event.max_members;
                                $scope.total_available += $scope.bridge_event.max_members;
                                $scope.openings += $scope.bridge_event.max_members;
                                session = {session_start:null, session_end:null, members:[], is_past:false, is_member:false};
                                current_room.sessions.push(session);
                                if (current_room.room_id) {
                                    rooms.push(current_room);
                                }
                            }

                        }

                        if (e.user_room_id) {
                            e.session_start = utcStrToLocalDate(e.session_start);
                            e.session_end = utcStrToLocalDate(e.session_end);
                            for (var j=0; j < current_room.sessions.length; j++) {
                                if (e.session_start===null || e.session_start.getTime() === current_room.sessions[j].session_start.getTime()) {
                                    var member = {net_id: e.net_id, user_name: e.user_name, canvas_event_id: e.canvas_event_id};
                                    current_room.sessions[j].members.push(member);
                                    $scope.total_registered += 1;

                                    if (e.net_id === UserService.user.net_id) {
                                        $scope.bridge_event.joined += 1;
                                        current_room.sessions[j].is_member = true;
                                        $scope.openings -= 1;
                                        $scope.is_member = true;
                                    } else {
                                        if ($scope.bridge_event.show_names !== '1' && $scope.user.priv_level < 3) {
                                            member.user_name = 'RESERVED';
                                        }
                                        if (current_room.sessions[j].members.length === current_room.max_members && !current_room.sessions[j].is_member && !current_room.sessions[j].is_past) {
                                            $scope.openings -= 1;
                                        }
                                    }
                                    if (current_room.sessions[j].is_past) {
                                        $scope.total_past -= 1;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (current_room.room_id && current_room.room_start) {
                        rooms.push(current_room);
                    }
                    $scope.evt.rooms = rooms;
                    getAnnouncements();
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Get Bridge event failed. Check your internet connection");
                });
        };

        getEventRooms(UserService.bridge.evt);

        $scope.joinRoom = function(r, s) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            params.event_name = UserService.bridge.evt.event_name;
            params.description = UserService.bridge.evt.description;
            params.room = r.room;
            params.net_id = UserService.user.net_id;
            params.room_id = r.room_id;
            params.event_id = UserService.bridge.evt.event_id;
            params.session_start = $filter('date')(localDateToUTC(s.session_start), 'yyyy-MM-dd HH:mm');
            params.session_end = $filter('date')(localDateToUTC(s.session_end), 'yyyy-MM-dd HH:mm');
            params.max_members = r.max_members;

            if ($scope.masquerade.net_id) {
                params.user_name = $scope.masquerade.user_name;
                params.net_id = $scope.masquerade.net_id.toUpperCase();
            }

            php_script = "joinRoom.php";

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (data.res) {
                        $scope.is_member = true;
                        var newMember = {net_id:params.net_id, user_name:UserService.user.user_name, canvas_event_id:data.canvas_event_id};
                        if ($scope.masquerade.net_id) {
                            newMember.user_name = $scope.masquerade.user_name;
                            newMember.net_id = $scope.masquerade.net_id;
                        }
                        s.members.push(newMember);
                        if (!$scope.masquerade.net_id) {
                            s.is_member = true;
                            $scope.bridge_event.joined += 1;
                            UserService.bridge.evt.room = r.room;
                            UserService.bridge.evt.session_start = s.session_start;
                            UserService.bridge.evt.session_end = s.session_end;
                            UserService.bridge.evt.user_name = r.leader_name;
                        }
                        $scope.total_registered += 1;

                    } else {
                        alert(data.error);
                        getEventRooms(UserService.bridge.evt);
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Join Bridge event failed. Check your internet connection");
                });
        };

        $scope.cancelRoom = function(r, s, m) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            params.net_id = m.net_id;
            params.room_id = r.room_id;
            params.canvas_event_id = m.canvas_event_id;
            params.event_id = UserService.bridge.evt.event_id;
            params.session_start = $filter('date')(localDateToUTC(s.session_start), 'yyyy-MM-dd HH:mm');
            params.session_end = $filter('date')(localDateToUTC(s.session_end), 'yyyy-MM-dd HH:mm');
            if ($scope.wait_list.length  > 0) {
                params.waiter_id = $scope.wait_list[0].net_id;
                params.cavas_user_id = $scope.wait_list[0].canvas_user_id;
                params.event_name = UserService.bridge.evt.event_name;
                params.description = UserService.bridge.evt.description;
                params.room = r.room;
            } else {
                params.waiter_id = 0;
            }
            php_script = "cancelRoom.php";

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (data.res) {
                        $scope.is_member = false;
                        s.is_member = false;
                        UserService.bridge.evt.room = null;
                        UserService.bridge.evt.session_start = null;
                        UserService.bridge.evt.session_end = null;
                        UserService.bridge.evt.user_name = null;
                        if (params.waiter_id === 0) {
                            for (var i=0; i< s.members.length; i++) {
                                if (s.members[i].net_id === m.net_id) {
                                    s.members.splice(i,1);
                                }
                            }
                            $scope.bridge_event.joined += -1;
                            $scope.openings = 1;
                            $scope.total_registered += -1;
                        } else {
                            m.user_name = $scope.wait_list[0].user_name;
                            var emailParams = {};
                            emailparams.course_id = UserService.user.course_id;
                            emailParams.event_id = params.event_id;
                            emailParams.event_name = UserService.bridge.evt.event_name;
                            emailParams.room = r.room;
                            emailParams.leader_name = r.leader_name;
                            emailParams.leader_email = r.leader_email;
                            emailParams.session_start = $filter('date')(s.session_start, 'yyyy-MM-dd HH:mm');
                            emailParams.session_end = $filter('date')(s.session_end, 'yyyy-MM-dd HH:mm');
                            emailParams.user_email = $scope.wait_list[0].user_email;
                            emailParams.user_name = $scope.wait_list[0].user_name;
                            $http({method: 'POST',
                                url: UserService.appDir + 'php/' + 'emailJoined.php' + uniqueSuffix,
                                data: emailParams,
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            });
                            $scope.wait_list.splice(0,1);
                        }
                    } else {
                        alert(data.error);
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Cancel Bridge event failed. Check your internet connection");
                });
        };

        $scope.joinWaitList = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script = "joinWaitList.php";
            var params = {};
            params.net_id = UserService.user.net_id;
            params.event_id = UserService.bridge.evt.event_id;

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (data.res) {
                        var newMember = {net_id:params.net_id, user_name:UserService.user.user_name};
                        $scope.wait_list.push(newMember);
                        $scope.on_wait_list = true;
                    } else {
                        alert(data.error);
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Join Bridge event wait list failed. Check your internet connection");
                });
        };

        $scope.cancelWait = function(u) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script = "cancelWait.php";
            var params = {};
            params.net_id = u.net_id;
            params.event_id = UserService.bridge.evt.event_id;

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (data.res) {
                        for (var i = 0; i < $scope.wait_list.length; i++) {
                            if ($scope.wait_list[i].net_id=== u.net_id) {
                                $scope.wait_list.splice(i,1);
                                break;
                            }
                        }
                    } else {
                        alert(data.error);
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Cancel Bridge event wait list failed. Check your internet connection");
                });
        };
  });
