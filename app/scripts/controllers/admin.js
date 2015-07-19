'use strict';

angular.module('eventManagerApp')
  .controller('AdminCtrl', function ($scope, $http, UserService, $timeout, $filter, $modal) {
        $scope.evt = {event_id:0, event_name:'', max_sessions:1, is_active:'1', max_members:10, session_duration:60, has_wait_list:'1', show_names:'1'};
        $scope.showGrid = false;
        $scope.admin = UserService.admin;
        $scope.bridge = UserService.bridge;
        var initDate = new Date();
        $scope.room = {room_id:0, room:'', net_id:'', room_start:new Date(initDate.getFullYear(), initDate.getMonth(), initDate.getDate(), 12, 0, 0, 0),
            room_end:new Date(initDate.getFullYear(), initDate.getMonth(), initDate.getDate(), 13, 0, 0, 0)};

        var ed;
        $scope.selectedEvent = null;

        if ($scope.admin.users.length === 0) {
            UserService.getUsers();
        }

        $timeout(function() {
            ed = new tinymce.Editor('event_description', {
                selector: "textarea",
                menubar: false,
                statusbar: false,
                relative_urls: false,
                remove_script_host: false,
                extended_valid_elements : "a[class|href|id|download|type|target|section-link|ng-click]",
                auto_focus: "event_description",
                content_css : "https://www.kblocks.com/app/scheduler/styles/tiny_style.css",
                formats: {custom_format : {table : 'table', classes: "table table-condensed table-bordered table-striped"}},
                plugins: [
                    "advlist autolink lists link charmap",
                    "searchreplace visualblocks code",
                    "insertdatetime table paste textcolor"
                ],
                toolbar: "bold italic | subscript superscript | styleselect | bullist numlist table outdent indent | link charmap code"
            }, tinymce.EditorManager);

            ed.render();
            $scope.showGrid = true;
        }, 500);

        $scope.eventsGridOptions = { data: 'bridge.events',
            columnDefs: [{displayName:'Del', headerClass:'centeredCol', width:"50", cellClass:'centeredCol',
                cellTemplate:'<div class="ngCellText colt{{$index}}" ng-click="confirmDelete(row.entity.event_name, row.entity, deleteEvent)"><i class="fa fa-trash-o"></i></div>'},
                {field:'event_name', displayName:'Name', width:'20%'},
                {field:'session_duration', displayName:'Time', width:'60', cellClass:'centeredCol'},
                {field:'max_members', displayName:'Max #', width:'60', cellClass:'centeredCol'},
                {field:'description', displayName:'Description', width:'*',
                    cellTemplate:'<div class="ngCellText" ng-class="col.colIndex()"><div class="description-cell" ng-bind-html="row.getProperty(col.field)"></div></div>'},
                {displayName:'Waitlist', headerClass:'centeredCol', width:"70", cellClass:'centeredCol',
                    cellTemplate:'<div class="ngCellText colt{{$index}}"><input ng-change="toggleWaitList(row.entity)" type="checkbox" ng-model="row.entity.has_wait_list" ng-true-value="\'1\'" ng-false-value="\'0\'"</div>'},
                {displayName:'Active', headerClass:'centeredCol', width:"60", cellClass:'centeredCol',
                    cellTemplate:'<div class="ngCellText colt{{$index}}"><input ng-change="toggleActive(row.entity)" type="checkbox" ng-model="row.entity.is_active" ng-true-value="\'1\'" ng-false-value="\'0\'"</div>'}],
            showGroupPanel: false,
            showColumnMenu: false,
            canSelectRows: true,
            rowHeight:85,
            showFilter: false,
            multiSelect: false,
            enableCellSelection: false,
            keepLastSelected: false,
            footerVisible: false,
            beforeSelectionChange:function(itm) {
                if (!itm.selected) {
                    $scope.evt = angular.copy(itm.entity);
                    tinymce.get('event_description').setContent($scope.evt.description);
                    //$scope.evt.open_time = $scope.evt.open_date;
                    //$scope.evt.close_time = $scope.evt.close_date;
                    var db_call = UserService.getRooms($scope.evt.event_id);
                    db_call.success(function(data) {
                        angular.forEach(data.rooms, function(r) {
                            r.room_start = utcStrToLocalDate(r.room_start);
                            r.room_end = utcStrToLocalDate(r.room_end);
                        });
                        $scope.admin.rooms = data.rooms;
                        if (data.rooms.length === 1) {
                            $scope.room = data.rooms[0];
                            $scope.room.start_time = data.rooms[0].room_start;
                            $scope.room.end_time = data.rooms[0].room_end;
                        }
                    }).
                        error(function(data, status) {
                            alert(status);
                        });
                } else {
                    $scope.evt = {event_id:0, event_name:'', max_sessions:1, is_active:false, max_members:1, session_duration:20};
                    tinymce.get('event_description').setContent('');
                }
                return true;
            },
            displaySelectionCheckbox: false
        };


        $scope.addNewEvent = function() {
            if ($scope.evt.event_name === '') {
                alert("Enter the event name.");
                return;
            }
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            params.event_name = $scope.evt.event_name;
            params.is_active = $scope.evt.is_active;
            if ($scope.evt.has_wait_list) {
                params.has_wait_list = $scope.evt.has_wait_list;
            } else {
                params.has_wait_list = '0';
            }
            params.show_names = $scope.evt.show_names;
            params.max_sessions = $scope.evt.max_sessions;
            params.max_members = $scope.evt.max_members;
            params.session_duration = $scope.evt.session_duration;
            if (angular.isDate($scope.evt.event_open)) {
                params.event_open = $filter('date')(localDateToUTC($scope.evt.event_open), 'yyyy-MM-dd HH:mm');
            }
            if (angular.isDate($scope.evt.event_close)) {
                params.event_close = $filter('date')(localDateToUTC($scope.evt.event_close), 'yyyy-MM-dd HH:mm');
            }

            params.description = tinyMCE.activeEditor.getContent();
            params.course_id = UserService.user.course_id;

            if ($scope.admin.multi_event) {
                params.multi_event = 1;
            } else {
                params.multi_event = 0;
                params.room_start = $filter('date')(localDateToUTC($scope.room.room_start), 'yyyy-MM-dd HH:mm');
                params.room_end = $filter('date')(localDateToUTC($scope.room.room_end), 'yyyy-MM-dd HH:mm');
                if (params.room_start && params.room_end) {
                    var dur = $scope.room.room_end.getTime() - $scope.room.room_start.getTime();
                    if (dur < ($scope.evt.session_duration * 60 * 1000)) {
                        alert("Session time cannot be longer than event time. Decrease session time or increase event time.");
                        return;
                    }
                }
                params.room = $scope.room.room;
            }

            php_script = "addEvent.php";

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    $scope.evt.event_id = data.event_id;
                    $scope.evt.description = params.description;
                    $scope.bridge.events.push(angular.copy($scope.evt));
                    if (params.is_active === '1') UserService.user.has_events = true;
                    if (!$scope.admin.multi_event) {
                        $scope.room.room_id = data.room_id;
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Add event failed. Check your internet connection");
                });
        };

        $scope.toggleWaitList = function(e) {
            for (var i=0; i < $scope.bridge.events.length; i++) {
                if ($scope.bridge.events[i].event_id === e.event_id) {
                    $scope.bridge.events[i].is_active = e.is_active;
                    $scope.evt = $scope.bridge.events[i];
                    break;
                }
            }
            $scope.saveEvent(e.description);
        };

        $scope.toggleActive = function(e) {
            var has_events = false;
            for (var i=0; i < $scope.bridge.events.length; i++) {
                if ($scope.bridge.events[i].event_id === e.event_id) {
                    $scope.bridge.events[i].is_active = e.is_active;
                    $scope.evt = $scope.bridge.events[i];
                }
                if ($scope.bridge.events[i].is_active === '1') {
                    has_events = true;
                }
            }
            UserService.user.has_events = has_events;
            $scope.saveEvent(e.description);
        };

        $scope.saveEvent = function(description) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            params.event_id = $scope.evt.event_id;
            params.event_name = $scope.evt.event_name;
            params.is_active = $scope.evt.is_active;
            if (!$scope.evt.has_wait_list) {
                params.has_wait_list = '0';
            } else {
                params.has_wait_list = $scope.evt.has_wait_list;
            }

            params.show_names = $scope.evt.show_names;
            params.max_sessions = $scope.evt.max_sessions;
            params.max_members = $scope.evt.max_members;
            params.session_duration = $scope.evt.session_duration;
            params.event_open = $filter('date')(localDateToUTC($scope.evt.event_open), 'yyyy-MM-dd HH:mm');
            params.event_close = $filter('date')(localDateToUTC($scope.evt.event_close), 'yyyy-MM-dd HH:mm');

            if (description) {
                params.description = description;
            } else {
                params.description = tinyMCE.activeEditor.getContent();
                $scope.evt.description = params.description;
                if (params.is_active === '1') {
                    UserService.user.has_events = true;
                }
            }

            if ($scope.admin.multi_event) {
                params.multi_event = 1;
            } else {
                params.multi_event = 0;
                params.room = $scope.room.room;
                params.room_id = $scope.room.room_id;
                params.room_start = $filter('date')(localDateToUTC($scope.room.room_start), 'yyyy-MM-dd HH:mm');
                params.room_end = $filter('date')(localDateToUTC($scope.room.room_end), 'yyyy-MM-dd HH:mm');
            }

            php_script = "saveEvent.php";

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (data && data.res) {
                        for (var i = 0; i < $scope.bridge.events.length; i++) {
                            if ($scope.bridge.events[i].event_id === params.event_id) {
                                $scope.bridge.events[i].event_name = $scope.evt.event_name;
                                $scope.bridge.events[i].is_active = $scope.evt.is_active;
                                if (!$scope.evt.has_wait_list) {
                                    $scope.bridge.events[i].has_wait_list = '0';
                                } else {
                                    $scope.bridge.events[i].has_wait_list = $scope.evt.has_wait_list;
                                }

                                $scope.bridge.events[i].show_names = $scope.evt.show_names;
                                $scope.bridge.events[i].max_sessions = $scope.evt.max_sessions;
                                $scope.bridge.events[i].max_members = $scope.evt.max_members;
                                $scope.bridge.events[i].session_duration = $scope.evt.session_duration;
                                $scope.bridge.events[i].event_open = $scope.evt.event_open;
                                $scope.bridge.events[i].event_close = $scope.evt.event_close;
                                $scope.bridge.events[i].description = params.description;
                                $scope.bridge.events[i] = angular.copy($scope.evt);
                                break;
                            }
                        }
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Save event failed. Check your internet connection");
                });
        };

        $scope.deleteEvent = function(row) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            params.event_id = row.event_id;

            php_script = "deleteEvent.php";

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    for (var i = 0; i < $scope.bridge.events.length; i++) {
                        if ($scope.bridge.events[i].event_id === params.event_id) {
                            $scope.bridge.events.splice(i,1);
                            break;
                        }
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Delete event failed. Check your internet connection");
                });
        };

        $scope.emailReminder = function(row) {
            if ($scope.evt.event_id === 0) {
                alert("Select an event to send a reminder.");
                return;
            }
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            var params = {};
            params.event_id = $scope.evt.event_id;
            params.event_name = $scope.evt.event_name;

            php_script = "emailReminder.php";

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    alert("Sent " + data + " reminder notifications for this event.");
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Email reminder failed. Check your internet connection");
                });
        };

        $scope.openEventOpen = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.evt_open_opened = true;
        };

        $scope.openEventClose = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.evt_close_opened = true;
        };

        $scope.openStart = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.start_opened = true;
        };

        $scope.openEnd = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.end_opened = true;
        };
        $scope.hstep = 1;
        $scope.mstep = 5;
        $scope.ismeridian = true;

        $scope.dateOptions = {
            'show-weeks': false,
            'starting-day': 0
        };

        $scope.format = 'yyyy-MM-dd';

        var dateCell = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field) | date:"MMM d, h:mm"}}</span></div>';
        var timeCell = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field) | date:"h:mm"}}</span></div>';

        $scope.roomsGridOptions = { data: 'admin.rooms',
            columnDefs: [{displayName:'Del', headerClass:'centeredCol', width:"50", cellClass:'centeredCol',
                cellTemplate:'<div class="ngCellText colt{{$index}}" ng-click="confirmDelete(row.entity.room, row.entity, deleteRoom)"><i class="fa fa-trash-o"></i></div>'},
                {field:'user_name', displayName:'Leader', width:'*'},
                {field:'room', displayName:'Room', width:'*'},
                {field:'room_start', displayName:'Start', width:'170', cellClass:'centeredCol', cellTemplate:dateCell},
                {field:'room_end', displayName:'End', width:'170', cellClass:'centeredCol', cellTemplate:timeCell}],
            showGroupPanel: false,
            showColumnMenu: false,
            canSelectRows: true,
            showFilter: false,
            multiSelect: false,
            enableCellSelection: false,
            keepLastSelected: false,
            footerVisible: false,
            beforeSelectionChange:function(itm) {
                if (!itm.selected) {
                    $scope.room = itm.entity;
                } else {
                    $scope.room = angular.copy(itm.entity);
                }
                $scope.room.start_time = itm.entity.room_start;
                $scope.room.end_time = itm.entity.room_end;
                return true;
            },
            displaySelectionCheckbox: false
        };

        $scope.filterUsers = function(val) {
            var p = parseInt(val.priv_level);
            return p === 2 || p === 3;
        };

        $scope.changeRoomStart = function() {
            if (room.room_start && !room.room_end) {
                room.room_end = room.room_start;
            }
        };

        $scope.addRoom = function() {
            if ($scope.evt.event_id === 0) {
                alert("Select an event above to add the location to.");
                return;
            }

            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.course_id = UserService.user.course_id;
            params.room = $scope.room.room;
            params.net_id = $scope.room.net_id;
            params.event_id = $scope.evt.event_id;
            params.room_start = $filter('date')(localDateToUTC($scope.room.room_start), 'yyyy-MM-dd HH:mm');
            params.room_end = $filter('date')(localDateToUTC($scope.room.room_end), 'yyyy-MM-dd HH:mm');
            var php_script = "addRoom.php";

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    $scope.room.room_id = data.room_id;
                    for (var i = 0; i < UserService.admin.users.length; i++) {
                        if (UserService.admin.users[i].net_id === params.net_id) {
                            $scope.room.user_name = UserService.admin.users[i].user_name;
                        }
                    }
                    $scope.room.room_start = utcStrToLocalDate(params.room_start);
                    $scope.room.room_end = utcStrToLocalDate(params.room_end);
                    $scope.admin.rooms.push(angular.copy($scope.room));
                    if ($scope.evt.eventStart && $scope.room.room_start && $scope.room.room_end) {
                        if ($scope.room.room_start.getTime() < $scope.evt.eventStart.getTime()) {
                            $scope.evt.eventStart = $scope.room.room_start;
                        }
                        if ($scope.evt.eventEnd.getTime() < $scope.room.room_end.getTime()) {
                            $scope.evt.eventEnd = $scope.room.room_end;
                        }
                    } else if ($scope.room.room_start && $scope.room.room_end) {
                        $scope.evt.eventStart = $scope.room.room_start;
                        $scope.evt.eventEnd = $scope.room.room_end;
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Add location failed. Check your internet connection");
                });
        };

        $scope.saveRoom = function() {
            if ($scope.evt.event_id === 0) {
                alert("Select an event above to save a location to.");
                return;
            }

            if ($scope.room.room_id === 0) {
                alert("Select a location to save.");
                return;
            }

            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.room = $scope.room.room;
            params.room_id = $scope.room.room_id;
            params.net_id = $scope.room.net_id;
            params.room_start = $filter('date')(localDateToUTC($scope.room.room_start), 'yyyy-MM-dd HH:mm');
            params.room_end = $filter('date')(localDateToUTC($scope.room.room_end), 'yyyy-MM-dd HH:mm');
            var php_script = "saveRoom.php";

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    for (var i = 0; i < $scope.admin.rooms.length; i++) {
                        if ($scope.admin.rooms[i].room_id === params.room_id) {
                            $scope.admin.rooms[i] = $scope.room;
                            break;
                        }
                    }
                    if ($scope.room.room_start && $scope.room.room_start.getTime() < $scope.evt.eventStart.getTime()) {
                        $scope.evt.eventStart = $scope.room.room_start;
                    }
                    if ($scope.room.room_end && $scope.evt.eventEnd.getTime() < $scope.room.room_end.getTime()) {
                        $scope.evt.eventEnd = $scope.room.room_end;
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Save location failed. Check your internet connection");
                });
        };

        $scope.deleteRoom = function(row) {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.room_id = row.room_id;
            var php_script = "deleteRoom.php";

            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    for (var i=0; i < $scope.admin.rooms.length; i++) {
                        if ($scope.admin.rooms[i].room_id === row.room_id) {
                            $scope.admin.rooms.splice(i,1);
                            break;
                        }
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Delete location failed. Check your internet connection");
                });
        };


        $scope.confirmDelete = function (name, row, deleteFxn) {
            var modalInstance = $modal.open({
                templateUrl: 'confirmModal.html',
                controller: 'ConfirmModalCtrl',
                backdrop: false,
                resolve: {
                    name: function () {
                        return name;
                    }
                }
            });

            modalInstance.result.then(function () {
                deleteFxn(row);
            });
        };

  });

angular.module('eventManagerApp').
    controller('ConfirmModalCtrl', function ($scope, $modalInstance, name) {

    $scope.itm = {name:name};

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
