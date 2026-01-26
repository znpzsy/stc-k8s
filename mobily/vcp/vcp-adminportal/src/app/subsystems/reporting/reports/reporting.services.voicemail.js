(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.services.voicemail', []);

    var ReportingReportsVoiceMailModule = angular.module('adminportal.subsystems.reporting.reports.services.voicemail');

    ReportingReportsVoiceMailModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.services.voicemail', {
            abstract: true,
            url: "/voice-mail",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ServiceReports.VM',
                onDemandState: 'subsystems.reporting.reports.services.voicemail.report',
                scheduleState: 'subsystems.reporting.reports.services.voicemail.schedule',
                permissions: [
                    'SERVICES_VM'
                ]
            },
            resolve: {}
        }).state('subsystems.reporting.reports.services.voicemail.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsVoiceMailCtrl'
        }).state('subsystems.reporting.reports.services.voicemail.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsVoiceMailScheduleCtrl'
        });

    });

    ReportingReportsVoiceMailModule.controller('ReportingReportsVoiceMailCtrl', function ($scope, $log, $controller, $filter, UtilService) {
        $log.debug("ReportingReportsVoiceMailCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var VM_Message_Deposit_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMail:VM_Message_Deposit_Report.prpt');
        var VM_Message_Retrieval_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMail:VM_Message_Retrieval_Report.prpt');
        var VM_Message_Store_Cleanup_Report = [
            {name: 'DAILY', url: ':home:vcp:VoiceMail:VM_Message_Store_Cleanup_Report.prpt'}
        ];
        var VM_Message_Store_Report = [
            {name: 'DAILY', url: ':home:vcp:VoiceMail:VM_Message_Store_Report.prpt'}
        ];
        var VM_SMS_Notification_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMail:VM_SMS_Notification_Report.prpt');

        $scope.REPORTS = [
            {
                label: 'Voice Mail Message Deposit Report',
                intervals: VM_Message_Deposit_Report
            },
            {
                label: 'Voice Mail Message Retrieval Report',
                intervals: VM_Message_Retrieval_Report
            },
            {
                label: 'Voice Mail Message Store Cleanup Report',
                intervals: VM_Message_Store_Cleanup_Report
            },
            {
                label: 'Voice Mail Message Store Report',
                intervals: VM_Message_Store_Report
            },
            {
                label: 'Voice Mail SMS Notification Report',
                intervals: VM_SMS_Notification_Report
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
    });

    ReportingReportsVoiceMailModule.controller('ReportingReportsVoiceMailScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsVoiceMailScheduleCtrl");

        $controller('ReportingReportsVoiceMailCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
