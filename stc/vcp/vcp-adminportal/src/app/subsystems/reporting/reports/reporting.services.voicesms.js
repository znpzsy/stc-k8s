(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.services.voicesms', []);

    var ReportingReportsVoiceSMSModule = angular.module('adminportal.subsystems.reporting.reports.services.voicesms');

    ReportingReportsVoiceSMSModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.services.voicesms', {
            abstract: true,
            url: "/voice-sms",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                viewKey: 'VSMS',
                pageHeaderKey: 'Subsystems.Reporting.ServiceReports.VSMS',
                onDemandState: 'subsystems.reporting.reports.services.voicesms.report',
                scheduleState: 'subsystems.reporting.reports.services.voicesms.schedule'
            },
            resolve: {}
        }).state('subsystems.reporting.reports.services.voicesms.report', {
            url: "",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsVoiceSMSCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_VSMS'
                ]
            }
        }).state('subsystems.reporting.reports.services.voicesms.schedule', {
            url: "/voice-sms/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsVoiceSMSScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_VSMS'
                ]
            }
        });

    });

    ReportingReportsVoiceSMSModule.controller('ReportingReportsVoiceSMSCtrl', function ($scope, $log, $controller, $filter, UtilService) {
        $log.debug("ReportingReportsVoiceSMSCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});
        
        var VoiceSMS_Message_Deposit_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceSMS:VoiceSMS_Message_Deposit_Report.prpt');
        var VoiceSMS_Message_Retrieval_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceSMS:VoiceSMS_Message_Retrieval_Report.prpt');
        var VoiceSMS_Message_Store_Cleanup_Report = [
            {name: 'DAILY', url: ':home:vcp:VoiceSMS:VoiceSMS_Message_Store_Cleanup_Report.prpt'}
        ];
        var VoiceSMS_Message_Store_Report = [
            {name: 'DAILY', url: ':home:vcp:VoiceSMS:VoiceSMS_Message_Store_Report.prpt'}
        ];
        var VoiceSMS_SMS_Notification_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceSMS:VoiceSMS_SMS_Notification_Report.prpt');
        var VoiceSMS_Subscriber_Activity_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceSMS:VoiceSMS_Subscriber_Activity_Report.prpt');

        $scope.REPORTS = [
            {
                label: 'Voice SMS Message Deposit Report',
                intervals: VoiceSMS_Message_Deposit_Report
            },
            {
                label: 'Voice SMS Message Retrieval Report',
                intervals: VoiceSMS_Message_Retrieval_Report
            },
            {
                label: 'Voice SMS Message Store Cleanup Report',
                intervals: VoiceSMS_Message_Store_Cleanup_Report
            },
            {
                label: 'Voice SMS Message Store Report',
                intervals: VoiceSMS_Message_Store_Report
            },
            {
                label: 'Voice SMS SMS Notification Report',
                intervals: VoiceSMS_SMS_Notification_Report
            },
            {
                label: 'Voice SMS Subscriber Activity Report',
                intervals: VoiceSMS_Subscriber_Activity_Report
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
    });

    ReportingReportsVoiceSMSModule.controller('ReportingReportsVoiceSMSScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsVoiceSMSScheduleCtrl");

        $controller('ReportingReportsVoiceSMSCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
