(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.schedules', []);

    var ReportingSchedulesModule = angular.module('adminportal.subsystems.reporting.schedules');

    ReportingSchedulesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.schedules', {
            url: "/schedules",
            templateUrl: 'subsystems/reporting/schedules/reporting.schedules.html',
            controller: 'ReportingSchedulesCtrl',
            resolve: {
                jobs: function (PentahoApiService) {
                    return PentahoApiService.getJobs();
                }
            }
        });

    });

    ReportingSchedulesModule.controller('ReportingSchedulesCtrl', function ($scope, $log, $filter, $state, $translate, notification, $uibModal, NgTableParams, NgTableService,
                                                                            DateTimeConstants, AuthorizationService, PentahoApiService, jobs) {
        $log.debug("ReportingSchedulesCtrl");

        var mapper = [
            { module: 'SMSC', reportName: ['SMSC'] },
            { module: 'ANTISPAM', reportName: ['SMS Anti-Spam'] },
            { module: 'MMSC', reportName: ['MMS Center'] },
            { module: 'USC', reportName: ['USSD'] },
            { module: 'USSI', reportName: ['USSI'] },
            { module: 'SMSF', reportName: ['SMSF'] },

            // DSP Related Products
            { module: 'APIM', reportName: ['APIM'] },
            { module: 'BMS', reportName: ['BMS'] },
            { module: 'OIVR', reportName: ['Outbound IVR'] },
            { module: 'CHGW', reportName: ['Charging Gateway'] },
            { module: 'MSGW', reportName: ['Messaging Gateway'] },
            { module: 'OTP', reportName: ['OTP'] },

            // Services
            { module: 'CC', reportName: ['Collect Call'] },
            { module: 'CMB', reportName: ['Call Me Back'] },
            { module: 'MCN', reportName: ['MCN'] },
            { module: 'VM', reportName: ['Voice Mail'] },
            { module: 'VSMS', reportName: ['Voice SMS'] },
            { module: 'RBT', reportName: ['Ring Back Tone'] },

            // Subsystems - SSM
            { module: 'SSM', reportName: ['Subscription Traffic Details', 'Mawjood Extra Total Subscription'] }
        ];

        var permissions = AuthorizationService.getReportsScheduled();

        // Complete filtering function
        var filterJobsByPermissions = function(jobs, permissions, mapper) {
            // Get allowed report names based on user permissions
            var allowedReportNames = _.chain(mapper)
                .filter(function(item) {
                    return _.contains(permissions, item.module);
                })
                .map('reportName')
                .flatten()
                .value();

            if (allowedReportNames.length === 0) {
                return [];
            }

            // Filter jobs based on allowed report names
            return _.filter(jobs || [], function(job) {
                return _.some(allowedReportNames, function(reportName) {
                    return job.jobName.toLowerCase().startsWith(reportName.toLowerCase());
                });
            });
        }

        var jobList = jobs.job;
        jobList = _.filter(jobList, function (job) {
            job.prettyJobTrigger = PentahoApiService.jobTriggerHumanReadable(job.jobTrigger);

            return job.userName === PentahoApiService.USERNAME;
        });

        jobList = filterJobsByPermissions(jobList, permissions, mapper);
        jobList = $filter('orderBy')(jobList, ['jobName']);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'jobName',
                    headerKey: 'Subsystems.Reporting.ScheduledReports.ScheduleName'
                },
                {
                    fieldName: 'prettyJobTrigger',
                    headerKey: 'Subsystems.Reporting.ScheduledReports.Repeats'
                },
                {
                    fieldName: 'lastRun',
                    headerKey: 'Subsystems.Reporting.ScheduledReports.LastRun',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'jobTrigger.endTime',
                    headerKey: 'Subsystems.Reporting.ScheduledReports.EndTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'nextRun',
                    headerKey: 'Subsystems.Reporting.ScheduledReports.NextRun',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Reporting.ScheduledReports.Status'
                }
            ]
        };

        // Job list
        $scope.jobList = {
            list: jobList,
            tableParams: {}
        };

        $scope.jobList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "jobName": 'asc'
            }
        }, {
            total: $scope.jobList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.jobList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.jobList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Job list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.jobList.tableParams.settings().$scope.filterText = filterText;
            $scope.jobList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.jobList.tableParams.page(1);
            $scope.jobList.tableParams.reload();
        }, 500);

        // Remove jobs
        $scope.remove = function (job) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    job.rowSelected = true;

                    var message = $translate.instant('CommonLabels.ConfirmationRemoveMessage');
                    message = message + ' [' + job.jobName + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                }
            });

            modalInstance.result.then(function () {
                $log.debug('Removing job: ', job);

                PentahoApiService.removeJob(job.jobId).then(function (response) {
                    $log.debug('Removed job: ', job, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.jobList.list, {
                        jobId: job.jobId
                    });
                    $scope.jobList.list = _.without($scope.jobList.list, deletedListItem);

                    $scope.jobList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    job.rowSelected = false;
                }, function (response) {
                    $log.debug('Cannot delete job: ', job, ', response: ', response);

                    job.rowSelected = false;
                });
            }, function () {
                job.rowSelected = false;
            });
        };

        // Change status of jobs
        $scope.changeStatus = function (job) {
            $log.debug('Change status of job: ', job);

            var apiMethod;
            if (job.state === 'NORMAL') {
                apiMethod = PentahoApiService.pauseJob;
            } else {
                apiMethod = PentahoApiService.resumeJob;
            }

            apiMethod(job.jobId).then(function (response) {
                $log.debug('Change status of job: ', job, ', response: ', response);

                job.state = response;

                $scope.jobList.tableParams.reload();

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot change status job: ', job, ', response: ', response);
            });
        };
    });

})();
