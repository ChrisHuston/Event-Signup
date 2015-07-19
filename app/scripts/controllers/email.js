'use strict';

/**
 * @ngdoc function
 * @name eventManagerApp.controller:EmailCtrl
 * @description
 * # EmailCtrl
 * Controller of the eventManagerApp
 */
angular.module('eventManagerApp')
  .controller('EmailCtrl', function ($scope, UserService, $timeout, $http) {
        $scope.admin = UserService.admin;
        $scope.user = UserService.user;
        $scope.bridge = UserService.bridge;
        $scope.currentAnnouncement = {};
        $scope.selectedAnnouncement = null;
        $scope.email_edited = false;
        $scope.selectedEvent = {};

        $scope.flow_config = {
            target: '/app/scheduler/php/fileUpload.php',
            testChunks:false,
            query:{'event_id': $scope.selectedEvent.event_id}
        };

        $scope.changeEvent = function() {
            $scope.flow_config.query.event_id = $scope.selectedEvent.event_id;
        };

        var ed;
        $timeout(function() {
            ed = new tinymce.Editor('announcement_txt', {
                selector: "textarea",
                menubar: false,
                statusbar: true,
                height: 250,
                relative_urls: false,
                remove_script_host: false,
                extended_valid_elements : "a[class|href|id|download|type|target|target=_blank],i[class|style]",
                target_list: [
                    {title: 'New page', value: '_blank'},
                    {title: 'Same page', value: '_self'}
                ],
                auto_focus: "announcement_txt",
                content_css : "https://www.kblocks.com/app/scheduler/styles/tiny_style.css",
                formats: {moderntable : {selector : 'table', classes: 'table table-condensed table-bordered table-striped'}},
                plugins: [
                    "advlist autolink lists link charmap preview",
                    "searchreplace visualblocks code",
                    "insertdatetime table paste textcolor"
                ],
                toolbar: "bold italic | subscript superscript | styleselect | bullist numlist table outdent indent | link charmap code preview"
            }, tinymce.EditorManager);

            ed.render();
            //tinymce.get('role_description').setContent($scope.assignment.review_rubric);
        }, 500);

        $scope.formatTables = function() {
            tinyMCE.activeEditor.selection.select(ed.getBody(), true);
            tinyMCE.activeEditor.formatter.apply('moderntable');
            tinyMCE.activeEditor.selection.select();
        };

        var getAllAnnouncements = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "getAllAnnouncements.php";
            var params = {};
            params.course_id = $scope.user.course_id;
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
                    $scope.admin.announcements = data.announcements;
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Email announcement failed. Check your internet connection");
                });
        };

        if ($scope.admin.announcements.length === 0) {
            getAllAnnouncements();
        }

        var emailEventMembers = function() {
            var announcement_txt = $scope.currentAnnouncement.announcement_txt;
            $scope.currentAnnouncement.progress = "sending";

            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "emailEventMembers.php";
            var params = {};
            params.tz_offset = new Date().getTimezoneOffset()/60;
            params.event_id = $scope.selectedEvent.event_id;
            params.event_name = $scope.selectedEvent.event_name;
            params.announcement_txt = announcement_txt;
            params.title = $scope.currentAnnouncement.title;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    $scope.currentAnnouncement.delivered = data;
                    $scope.currentAnnouncement.progress = null;
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Email announcement failed. Check your internet connection");
                });
        };


        $scope.addAnnouncement = function() {
            var announcement_txt = tinyMCE.activeEditor.getContent();
            $scope.currentAnnouncement.progress = "sending";
            $scope.currentAnnouncement.announcement_txt = announcement_txt;

            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "addAnnouncement.php";
            var params = {};
            params.event_id = $scope.selectedEvent.event_id;
            params.announcement_txt = announcement_txt;
            params.title = $scope.currentAnnouncement.title;
            params.course_id = $scope.user.course_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    $scope.currentAnnouncement.announcement_id = data;
                    $scope.currentAnnouncement.user_name = UserService.user.user_name;
                    $scope.currentAnnouncement.post_date = new Date();
                    $scope.currentAnnouncement.event_id = params.event_id;
                    $scope.currentAnnouncement.event_name = $scope.selectedEvent.event_name;
                    $scope.admin.announcements.unshift($scope.currentAnnouncement);
                    emailEventMembers();
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Add announcement failed. Check your internet connection");
                });
        };

        $scope.selectAnnouncement = function(announcement) {
            tinymce.get('announcement_txt').setContent(announcement.announcement_txt);
            $scope.selectedAnnouncement = announcement;
            $scope.currentAnnouncement.title = announcement.title;
            $scope.currentAnnouncement.delivered = announcement.delivered;
            for (var i=0; i < $scope.bridge.events.length; i++) {
                if ($scope.bridge.events[i].event_id === announcement.event_id) {
                    $scope.selectedEvent = $scope.bridge.events[i];
                    $scope.changeEvent();
                    break;
                }
            }
        };

        $scope.toggleShowAnnouncement = function(a) {
            a.show_announcement = !a.show_announcement;
        };

        $scope.saveAnnouncement = function() {
            var announcement_txt = tinyMCE.activeEditor.getContent();
            var announcement_id = $scope.selectedAnnouncement.announcement_id;
            $scope.selectedAnnouncement.announcement_txt = announcement_txt;
            $scope.selectedAnnouncement.title = $scope.currentAnnouncement.title;
            $scope.selectedAnnouncement.post_date = new Date();
            if ($scope.email_edited) {
                $scope.currentAnnouncement.progress = "sending";
                $scope.currentAnnouncement.delivered = null;
            }
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "saveAnnouncement.php";
            var params = {};
            params.announcement_txt = announcement_txt;
            params.title = $scope.currentAnnouncement.title;
            params.announcement_id = announcement_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                    if ($scope.email_edited) {
                        $scope.currentAnnouncement.announcement_txt = announcement_txt;
                        emailEventMembers();
                    }
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Save announcement failed. Check your internet connection");
                });
        };

        $scope.deleteAnnouncement = function() {
            var announcement_id = $scope.selectedAnnouncement.announcement_id;

            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "deleteAnnouncement.php";
            var params = {};
            params.announcement_id = announcement_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (data) {
                        for (var i=0; i < UserService.admin.announcements.length; i++) {
                            if (UserService.admin.announcements[i].announcement_id===announcement_id) {
                                UserService.admin.announcements.splice(i,1);
                                break;
                            }
                        }
                    }
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Save announcement failed. Check your internet connection");
                });
        };

        var safe_name;
        $scope.addedUpload = function(flowFile) {
            safe_name = flowFile.name;
            safe_name = safe_name.replace(/ /g, '_');
            safe_name = safe_name.replace(/#/g, '');
            flowFile.name = safe_name;
        };


        $scope.uploadComplete = function(file_type) {
            var full_path = "https://www.kblocks.com/app/scheduler/files/" + $scope.selectedEvent.event_id + "/" + safe_name;
            var tag;
            if (file_type === 'video') {
                tag = "<video class=\"t-wiki-video video-js vjs-default-skin vjs-big-play-centered img-responsive\" src=\"" + full_path + "\" type=\"video/mp4\" controls></video>";
            } else if (file_type === 'img') {
                tag = "<img src=\"" + full_path + "\" class=\"img-responsive\" alt=\"" + safe_name + "\"></img>";
            } else {
                tag = "<a href=\"" + full_path + "\" target=\"_blank\">" + safe_name + "</a>";
            }
            tinyMCE.activeEditor.execCommand('mceInsertContent', false, tag);
        }
  });
