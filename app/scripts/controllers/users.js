'use strict';

angular.module('eventManagerApp')
  .controller('UsersCtrl', function ($scope, $http, UserService) {
        $scope.admin = UserService.admin;

        $scope.user = {user_name:'', net_id:'', priv_level:'2'};

        $scope.levels = [
            {priv_level:'2', label:'TA'},
            {priv_level:'3', label:'Admin'}
        ];

        $scope.updateUser = function(row) {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.net_id = row.net_id;
            params.user_name = row.user_name.trim();
            params.priv_level = row.priv_level.trim();
            params.course_id = UserService.user.course_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/updateUser.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Update user failed. Check your internet connection");
                });
        };

        var cellEditor = "<input style=\"text-align: left; width:250px;\" ng-class=\"'colt' + col.index\" ng-input=\"COL_FIELD\" ng-model=\"COL_FIELD\"/>";

        $scope.usersGridOptions = { data: 'admin.users',
            columnDefs: [{displayName:'', headerClass:'centeredCol', width:"50", cellClass:'centeredCol',
                cellTemplate:'<div class="ngCellText colt{{$index}}" ng-click="deleteUser(row.entity)"><i class="fa fa-trash-o"></i></div>'},
                {field:'user_name', displayName:'User Name', headerClass:'centeredCol', width:"*", enableCellEdit: true, editableCellTemplate:cellEditor},
                {field:'net_id', displayName:'NetID', headerClass:'centeredCol', width:"100"},
                {field:'priv_level', displayName:'Access', headerClass:'centeredCol', width:"60", cellClass:'centeredCol', enableCellEdit: true, editableCellTemplate:cellEditor}
            ],
            showGroupPanel: false,
            showColumnMenu: false,
            canSelectRows: true,
            showFilter: false,
            multiSelect: false,
            keepLastSelected: false,
            footerVisible: false,
            maintainColumnRatios:true,
            displaySelectionCheckbox: false
        };

        if ($scope.admin.users.length === 0) {
            UserService.getUsers();
        }

        $scope.$on('ngGridEventEndCellEdit', function(evt){
            $scope.updateUser(evt.targetScope.row.entity);
        });

        $scope.updateAdmins = function(enrollment_type) {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            if (enrollment_type === 'TaEnrollment') {
                var lvl = '2';
            } else {
                lvl = '3';
            }
            params.enrollment_type = enrollment_type;
            params.course_id = UserService.user.course_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/getEnrollmentByType.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    console.log(data);
                    angular.forEach(data, function(usr) {
                        usr.user.login_id = angular.uppercase(usr.user.login_id);
                        var user_name = usr.user.name;
                        var user_email = usr.user.sis_user_id;
                        var user_exists = false;
                        for (var i=0; i < $scope.admin.users.length; i++) {
                            if ($scope.admin.users[i].net_id === usr.user.login_id) {
                                user_exists = true;
                                break;
                            }
                        }
                        if (!user_exists) {
                            var new_user = {net_id:usr.user.login_id, priv_level:lvl, user_name:user_name};
                            $scope.admin.users.push(new_user);
                        }
                    });
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Load Admins failed. Check your internet connection");
                });
        };

        $scope.showGrid = true;

        $scope.deleteUser = function(row) {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.net_id = row.net_id;
            params.course_id = UserService.user.course_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/deleteUser.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    for (var i=0; i < $scope.admin.users.length; i++) {
                        if ($scope.admin.users[i].net_id === row.net_id) {
                            $scope.admin.users.splice(i,1);
                            break;
                        }
                    }
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Update user failed. Check your internet connection");
                });
        };


        $scope.addNewUser = function() {
            if ($scope.user.net_id === '') {
                alert("Enter the NetId for the new user.");
                return;
            }
            if ($scope.user.user_name === '') {
                alert("Enter the name for the new user.");
                return;
            }
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            params.priv_level = $scope.user.priv_level;
            params.net_id = $scope.user.net_id.trim();
            params.user_name = $scope.user.user_name.trim();
            params.user_email = params.net_id + '@dartmouth.edu';
            params.course_id = UserService.user.course_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/addNewUser.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    $scope.admin.users.unshift(params);
                    $scope.user.user_name = '';
                    $scope.user.net_id = '';
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Add new user failed. Check your internet connection");
                });
        };

  });
