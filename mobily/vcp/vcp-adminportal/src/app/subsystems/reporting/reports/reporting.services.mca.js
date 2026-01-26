(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.services.mca', []);

    var ReportingReportsMCAModule = angular.module('adminportal.subsystems.reporting.reports.services.mca');

    ReportingReportsMCAModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.services.mca', {
            abstract: true,
            url: "/missed-call-notification",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ServiceReports.MCA',
                onDemandState: 'subsystems.reporting.reports.services.mca.report',
                scheduleState: 'subsystems.reporting.reports.services.mca.schedule',
                permissions: [
                    'SERVICES_MCN'
                ]
            },
            resolve: {}
        }).state('subsystems.reporting.reports.services.mca.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsMCACtrl'
        }).state('subsystems.reporting.reports.services.mca.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsMCAScheduleCtrl'
        });

    });

    ReportingReportsMCAModule.controller('ReportingReportsMCACtrl', function ($scope, $log, $controller, $filter, UtilService) {
        $log.debug("ReportingReportsMCACtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var MCN_Overview_Report = UtilService.defineReportsAsDHM(':home:vcp:MissedCallNotification:MCN_Overview_Report.prpt');
        var MCN_Call_Details_Report = UtilService.defineReportsAsDHM(':home:vcp:MissedCallNotification:MCN_Call_Details_Report.prpt');
        var MCN_SMS_Details_Report = UtilService.defineReportsAsDHM(':home:vcp:MissedCallNotification:MCN_SMS_Details_Report.prpt');

        $scope.REPORTS = [
            {
                label: 'Missed Call Notification Overview Report',
                intervals: MCN_Overview_Report,
                additionalFields: ['database', 'operatorName']
            },
            {
                label: 'Missed Call Notification Call Details Report',
                intervals: MCN_Call_Details_Report,
                additionalFields: ['database', 'operatorName']
            },
            {
                label: 'Missed Call Notification SMS Details Report',
                intervals: MCN_SMS_Details_Report,
                additionalFields: ['database', 'operatorName']
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.permanentParams = {
            database: 'MCN',
            operatorName: 'Mobily'
        };
    });

    ReportingReportsMCAModule.controller('ReportingReportsMCAScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsMCAScheduleCtrl");

        $controller('ReportingReportsMCACtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
