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
                viewKey: 'MCN',
                pageHeaderKey: 'Subsystems.Reporting.ServiceReports.MCA',
                onDemandState: 'subsystems.reporting.reports.services.mca.report',
                scheduleState: 'subsystems.reporting.reports.services.mca.schedule'
            },
            resolve: {}
        }).state('subsystems.reporting.reports.services.mca.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsMCACtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_MCN'
                ]
            }
        }).state('subsystems.reporting.reports.services.mca.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsMCAScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_MCN'
                ]
            }
        });

    });

    ReportingReportsMCAModule.controller('ReportingReportsMCACtrl', function ($scope, $log, $controller, $filter, UtilService) {
        $log.debug("ReportingReportsMCACtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var MCN_Mawjood_Overview_Report = UtilService.defineReportsAsDHM(':home:vcp:MissedCallNotification:MCN_Mawjood_Overview_Report.prpt');
        var MCN_Mawjood_Call_Details_Report = UtilService.defineReportsAsDHM(':home:vcp:MissedCallNotification:MCN_Mawjood_Call_Details_Report.prpt');
        var MCN_Mawjood_SMS_Details_Report = UtilService.defineReportsAsDHM(':home:vcp:MissedCallNotification:MCN_Mawjood_SMS_Details_Report.prpt');
        var MCN_Mawjood_Errors_Report = [
            {name: 'ALL', url: ':home:vcp:MissedCallNotification:MCN_Mawjood_Errors_Report.prpt'}
        ];
        var MCN_Mawjood_Extra_Overview_Report = UtilService.defineReportsAsDHM(':home:vcp:MissedCallNotification:MCN_Mawjood_Extra_Overview_Report.prpt');
        var MCN_Mawjood_Extra_SMS_Details_Report = UtilService.defineReportsAsDHM(':home:vcp:MissedCallNotification:MCN_Mawjood_Extra_SMS_Details_Report.prpt');
        var MCN_Mawjood_Extra_Call_Details_Report = UtilService.defineReportsAsDHM(':home:vcp:MissedCallNotification:MCN_Mawjood_Extra_Call_Details_Report.prpt');
        var MCN_Mawjood_Extra_Errors_Report = [
            {name: 'ALL', url: ':home:vcp:MissedCallNotification:MCN_Mawjood_Extra_Errors_Report.prpt'}
        ];
        $scope.REPORTS = [
            {
                label: 'MCN Mawjood Overview Report',
                intervals: MCN_Mawjood_Overview_Report,
                additionalFields: ['database', 'operatorName']
            },
            {
                label: 'MCN Mawjood Call Details Report',
                intervals: MCN_Mawjood_Call_Details_Report,
                additionalFields: ['database', 'operatorName']
            },
            {
                label: 'MCN Mawjood SMS Details Report',
                intervals: MCN_Mawjood_SMS_Details_Report,
                additionalFields: ['database', 'operatorName']
            },
            {
                label: 'MCN Mawjood Errors Report',
                intervals: MCN_Mawjood_Errors_Report,
                additionalFields: ['database', 'operatorName']
            },
            {
                label: 'MCN Mawjood Extra Overview Report',
                intervals: MCN_Mawjood_Extra_Overview_Report,
                additionalFields: ['database', 'operatorName']
            },
            {
                label: 'MCN Mawjood Extra Call Details Report',
                intervals: MCN_Mawjood_Extra_Call_Details_Report,
                additionalFields: ['database', 'operatorName']
            },
            {
                label: 'MCN Mawjood Extra SMS Details Report',
                intervals: MCN_Mawjood_Extra_SMS_Details_Report,
                additionalFields: ['database', 'operatorName']
            },
            {
                label: 'MCN Mawjood Extra Errors Report',
                intervals: MCN_Mawjood_Extra_Errors_Report,
                additionalFields: ['database', 'operatorName']
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.permanentParams = {
            database: 'MCN',
            operatorName: 'STC'
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
