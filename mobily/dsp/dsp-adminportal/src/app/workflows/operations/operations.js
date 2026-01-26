(function () {

    'use strict';

    angular.module('adminportal.workflows.operations', [
        'adminportal.workflows.operations.tasks'
    ]);

    var WorkflowsOperationsModule = angular.module('adminportal.workflows.operations');

    WorkflowsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('workflows.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: 'workflows/operations/operations.html'
        });

    });

    WorkflowsOperationsModule.controller('WorkflowsTaskListOperationsCommonCtrl', function ($scope, $log) {

        $log.debug("WorkflowsTaskListOperationsCommonCtrl");

        $scope.getBgColorByType = function (taskType) {
            var bgColorClass = 'bg-default';
            if (taskType === 'SERVICE') {
                bgColorClass = 'bg-primary';
            } else if (taskType === 'OFFER') {
                bgColorClass = 'bg-secondary';
            } else if (taskType === 'PARTNER') {
                bgColorClass = 'bg-tertiary';
            } else if (taskType === 'CONTENT_METADATA') {
                bgColorClass = 'bg-default';
            } else if (taskType === 'CONTENT_FILE') {
                bgColorClass = 'bg-default';
            } else if (taskType === 'SHORT_CODE') {
                bgColorClass = 'bg-success';
            } else if (taskType === 'CAMPAIGN_SMS' || taskType === 'CAMPAIGN_MMS' || taskType === 'CAMPAIGN_IVR' ||
                taskType === 'INTERACTIVE_CAMPAIGN_SMS' || taskType === 'INTERACTIVE_CAMPAIGN_IVR' || taskType === 'INTERACTIVE_CAMPAIGN_FAST_KEY') {
                bgColorClass = 'bg-warning';
            } else if (taskType === 'RBT_CATEGORY' || taskType === 'RBT_MOOD' || taskType === 'RBT_TONE' || taskType === 'RBT_ARTIST' || taskType === 'RBT_ALBUM') {
                bgColorClass = 'bg-info';
            }

            return bgColorClass;
        };

        $scope.getIconByType = function (taskType) {
            var iconClass = 'fa-square-o';
            if (taskType === 'SERVICE') {
                iconClass = 'fa-bookmark';
            } else if (taskType === 'OFFER') {
                iconClass = 'fa-gift';
            } else if (taskType === 'PARTNER') {
                iconClass = 'fa-handshake-o'
            } else if (taskType === 'CONTENT_METADATA') {
                iconClass = 'fa-folder-open'
            } else if (taskType === 'CONTENT_FILE') {
                iconClass = 'fa-file'
            } else if (taskType === 'SHORT_CODE') {
                iconClass = 'fa-commenting'
            } else if (taskType === 'CAMPAIGN_SMS' || taskType === 'CAMPAIGN_MMS' || taskType === 'CAMPAIGN_IVR' ||
                taskType === 'INTERACTIVE_CAMPAIGN_SMS' || taskType === 'INTERACTIVE_CAMPAIGN_IVR' || taskType === 'INTERACTIVE_CAMPAIGN_FAST_KEY') {
                iconClass = 'fa-comments';
            } else if (taskType === 'RBT_CATEGORY' || taskType === 'RBT_MOOD' || taskType === 'RBT_TONE' || taskType === 'RBT_ARTIST' || taskType === 'RBT_ALBUM') {
                iconClass = 'fa-tags';
            }

            return iconClass;
        };

        $scope.getLabelByType = function (taskType) {
            var label = taskType;
            if (taskType === 'CONTENT_METADATA') {
                label = 'Content';
            } else if (taskType === 'CONTENT_FILE') {
                label = 'File';
            } else if (taskType.indexOf('RBT') > -1) {
                label = taskType.split('_')[1];
            } else if (taskType === 'CAMPAIGN_SMS' || taskType === 'CAMPAIGN_MMS' || taskType === 'CAMPAIGN_IVR' ||
                taskType === 'INTERACTIVE_CAMPAIGN_SMS' || taskType === 'INTERACTIVE_CAMPAIGN_IVR' || taskType === 'INTERACTIVE_CAMPAIGN_FAST_KEY') {
                label = 'Campaign';
            }

            return s(label).humanize().titleize().value();
        };

        $scope.getDescriptionByType = function (taskType) {
            var description = '';
            if (taskType.indexOf('CAMPAIGN_SMS') > -1) {
                description = '; Type = SMS';
            } else if (taskType.indexOf('CAMPAIGN_MMS') > -1) {
                description = '; Type = MMS';
            } else if (taskType.indexOf('CAMPAIGN_IVR') > -1 || taskType === 'INTERACTIVE_CAMPAIGN_FAST_KEY') {
                description = '; Type = IVR';
            }

            return description;
        };
    });

    WorkflowsOperationsModule.controller('WorkflowsTaskListOperationsCtrl', function ($scope, $log, $controller, $interval, $timeout, $translate, notification, Restangular, AdmPortalNotificationListPromiseTracker,
                                                                                      WORKFLOWS_STATUSES, SessionService, CMPFService, WorkflowsService, AuthorizationService) {
        $log.debug("WorkflowsTaskListOperationsCtrl");

        $controller('WorkflowsTaskListOperationsCommonCtrl', {$scope: $scope});

        if (!SessionService.isSessionValid()) {
            return;
        }

        // This task count checker. Gets each 60 seconds task count that created newly and waiting for approval.
        var taskCountChecker = function () {
            if (SessionService.isSessionValid() && AuthorizationService.canBpmOperationsTaskRead() && AuthorizationService.canBpmOperationsTaskNotify()) {
                WorkflowsService.getTaskCount(AdmPortalNotificationListPromiseTracker).then(function (response) {
                    SessionService.setTaskCount(response ? response : 0);
                });
            }
        };

        WorkflowsService.taskCountChecker = $interval(function () {
            taskCountChecker();
        }, 10000);
        $timeout(function () {
            taskCountChecker();
        }, 1000);

        $scope.getPendingTasks = function () {
            // Check the bell button is open.
            var isExpanded = angular.element('.navbar-notification .pending-tasks.dropdown-toggle').attr('aria-expanded') === 'true';
            if (!isExpanded) {
                return;
            }

            $scope.showPendingTaskListSpinner = true;

            WorkflowsService.getTasks(0, 10, WORKFLOWS_STATUSES.PENDING, null, AdmPortalNotificationListPromiseTracker).then(function (response) {
                var apiResponse = (response && response.detail) ? response.detail.items : [];

                $scope.tasksSummary = apiResponse.slice(0, 10);
                _.each($scope.tasksSummary, function (task) {
                    task.description = task.description || task.objectDetail.campaignDescription;
                    task.note = $translate.instant('Workflows.Operations.Messages.PendingNote', {
                        user: task.from ? task.from.userId : '',
                        serviceProvider: task.from ? task.from.orgId : ''
                    });
                });

                $scope.showPendingTaskListSpinner = false;
            }, function (response) {
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });

                $scope.showPendingTaskListSpinner = false;
            })
        };

    });

    WorkflowsOperationsModule.controller('WorkflowsTaskSummaryOperationsCtrl', function ($scope, $log, $interval, $timeout, $translate, notification, Restangular, AdmPortalNotificationListPromiseTracker,
                                                                                         WORKFLOWS_STATUSES, SessionService, CMPFService, WorkflowsService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug("WorkflowsTaskSummaryOperationsCtrl");

        $scope.taskCounts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            deleted: 0
        };

        $scope.getTaskSummary = function () {
            // Check the list button is open.
            var isExpanded = angular.element('.navbar-notification .task-summary.dropdown-toggle').attr('aria-expanded') === 'true';
            if (!isExpanded) {
                return;
            }

            $scope.showTaskSummarySpinner = true;

            WorkflowsService.getTasks(0, DEFAULT_REST_QUERY_LIMIT, null, null, AdmPortalNotificationListPromiseTracker).then(function (response) {
                var apiResponse = (response && response.detail) ? response.detail.items : [];

                var tasksSummary = apiResponse;

                var pendingTasks = _.where(tasksSummary, {status: WORKFLOWS_STATUSES.PENDING});
                if (pendingTasks && pendingTasks.length > 0) {
                    $scope.taskCounts.pending = pendingTasks.length;
                }

                var approvedTasks = _.where(tasksSummary, {status: WORKFLOWS_STATUSES.COMPLETED, response: 'APPROVE'});
                if (approvedTasks && approvedTasks.length > 0) {
                    $scope.taskCounts.approved = approvedTasks.length;
                }

                var rejectedTasks = _.where(tasksSummary, {status: WORKFLOWS_STATUSES.COMPLETED, response: 'REJECT'});
                if (rejectedTasks && rejectedTasks.length > 0) {
                    $scope.taskCounts.rejected = rejectedTasks.length;
                }

                var deletedTasks = _.where(tasksSummary, {status: WORKFLOWS_STATUSES.DELETED});
                if (deletedTasks && deletedTasks.length > 0) {
                    $scope.taskCounts.deleted = deletedTasks.length;
                }

                $scope.showTaskSummarySpinner = false;
            }, function (response) {
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });

                $scope.showTaskSummarySpinner = false;
            });
        };

    });

})();
