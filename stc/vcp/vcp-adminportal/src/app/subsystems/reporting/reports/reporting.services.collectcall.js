(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.services.collectcall', []);

    var ReportingReportsCollectCallModule = angular.module('adminportal.subsystems.reporting.reports.services.collectcall');

    ReportingReportsCollectCallModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.services.collectcall', {
            abstract: true,
            url: "/collect-call",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                viewKey: 'CC',
                pageHeaderKey: 'Subsystems.Reporting.ServiceReports.CollectCall',
                onDemandState: 'subsystems.reporting.reports.services.collectcall.report',
                scheduleState: 'subsystems.reporting.reports.services.collectcall.schedule'
            },
            resolve: {}
        }).state('subsystems.reporting.reports.services.collectcall.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsCollectCallCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_CC'
                ]
            }
        }).state('subsystems.reporting.reports.services.collectcall.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsCollectCallScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_CC'
                ]
            }
        });

    });

    ReportingReportsCollectCallModule.controller('ReportingReportsCollectCallCtrl', function ($scope, $log, $controller, $filter, UtilService) {
        $log.debug("ReportingReportsCollectCallCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var CC_Overview_Report = UtilService.defineReportsAsDHM(':home:vcp:CollectCall:CC_Overview_Report.prpt');
        var CC_Failure_Report = UtilService.defineReportsAsDHM(':home:vcp:CollectCall:CC_Failure_Report.prpt');
        var CC_Call_Duration_Report = UtilService.defineReportsAsDHM(':home:vcp:CollectCall:CC_Call_Duration_Report.prpt');

        $scope.REPORTS = [
            {
                label: 'Collect Call Overview Report',
                intervals: CC_Overview_Report
            },
            {
                label: 'Collect Call Failure Report',
                intervals: CC_Failure_Report
            },
            {
                label: 'Collect Call Duration Report',
                intervals: CC_Call_Duration_Report
            }
        ];
        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
    });

    ReportingReportsCollectCallModule.controller('ReportingReportsCollectCallScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsCollectCallScheduleCtrl");

        $controller('ReportingReportsCollectCallCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
