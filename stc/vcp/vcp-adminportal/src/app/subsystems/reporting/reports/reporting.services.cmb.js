(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.services.cmb', []);

    var ReportingReportsCMBModule = angular.module('adminportal.subsystems.reporting.reports.services.cmb');

    ReportingReportsCMBModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.services.cmb', {
            abstract: true,
            url: "/call-me-back",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                viewKey: 'CMB',
                pageHeaderKey: 'Subsystems.Reporting.ServiceReports.CMB',
                onDemandState: 'subsystems.reporting.reports.services.cmb.report',
                scheduleState: 'subsystems.reporting.reports.services.cmb.schedule'
            }
        }).state('subsystems.reporting.reports.services.cmb.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsCMBCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_CMB'
                ]
            }
        }).state('subsystems.reporting.reports.services.cmb.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsCMBScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_CMB'
                ]
            }
        });

    });

    ReportingReportsCMBModule.controller('ReportingReportsCMBCtrl', function ($scope, $log, $controller, $filter, UtilService, Restangular) {
        $log.debug("ReportingReportsCMBCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var CMB_Overview_Report = UtilService.defineReportsAsDHM(':home:vcp:CallMeBack:CMB_Overview_Report.prpt');
        var CMB_Failure_Report = UtilService.defineReportsAsDHM(':home:vcp:CallMeBack:CMB_Failure_Report.prpt');

        $scope.REPORTS = [
            {
                label: 'Call Me Back Overview Report',
                intervals: CMB_Overview_Report
            },
            {
                label: 'Call Me Back Failure Report',
                intervals: CMB_Failure_Report
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
    });

    ReportingReportsCMBModule.controller('ReportingReportsCMBScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsCMBScheduleCtrl");

        $controller('ReportingReportsCMBCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
