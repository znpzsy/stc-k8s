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
                viewKey: 'VM',
                pageHeaderKey: 'Subsystems.Reporting.ServiceReports.VM',
                onDemandState: 'subsystems.reporting.reports.services.voicemail.report',
                scheduleState: 'subsystems.reporting.reports.services.voicemail.schedule'
            },
            resolve: {}
        }).state('subsystems.reporting.reports.services.voicemail.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsVoiceMailCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_VM'
                ]
            }
        }).state('subsystems.reporting.reports.services.voicemail.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsVoiceMailScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_VM'
                ]
            }
        });

    });

    ReportingReportsVoiceMailModule.controller('ReportingReportsVoiceMailCtrl', function ($scope, $log, $controller, $filter, UtilService) {
        $log.debug("ReportingReportsVoiceMailCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});


        var VM_Message_Deposit_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMail:VM_Message_Deposit_Report.prpt');
        var VM_Message_Deposit_Errors_Report = [
            {name: 'ALL', url: ':home:vcp:VoiceMail:VM_Message_Deposit_Errors_Report.prpt'}
        ];
        var VM_Message_Retrieval_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMail:VM_Message_Retrieval_Report.prpt');
        var VM_Message_Retrieval_Errors_Report = [
            {name: 'ALL', url: ':home:vcp:VoiceMail:VM_Message_Retrieval_Errors_Report.prpt'}
        ];
        var VM_Message_Store_Cleanup_Report = [
            {name: 'DAILY', url: ':home:vcp:VoiceMail:VM_Message_Store_Cleanup_Report.prpt'}
        ];
        var VM_Message_Store_Report = [
            {name: 'DAILY', url: ':home:vcp:VoiceMail:VM_Message_Store_Report.prpt'}
        ];
        var VM_SMS_Notification_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMail:VM_SMS_Notification_Report.prpt');
        var VM_Subscriber_Activity_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMail:VM_Subscriber_Activity_Report.prpt');

        // Fixedline reports
        var VM_Fixedline_Message_Deposit_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMailFixedline:VM_Fixedline_Message_Deposit_Report.prpt');
        var VM_Fixedline_Message_Retrieval_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMailFixedline:VM_Fixedline_Message_Retrieval_Report.prpt');
        var VM_Fixedline_Subscriber_Activity_Report = UtilService.defineReportsAsDHM(':home:vcp:VoiceMailFixedline:VM_Fixedline_Subscriber_Activity_Report.prpt');

        $scope.REPORTS = [
            {
                group: 'Voice Mail Reports',
                label: 'Voice Mail Message Deposit Report',
                intervals: VM_Message_Deposit_Report
            },
            {
                group: 'Voice Mail Reports',
                label: 'Voice Mail Message Deposit Errors Report',
                intervals: VM_Message_Deposit_Errors_Report
            },
            {
                group: 'Voice Mail Reports',
                label: 'Voice Mail Message Retrieval Report',
                intervals: VM_Message_Retrieval_Report
            },
            {
                group: 'Voice Mail Reports',
                label: 'Voice Mail Message Retrieval Errors Report',
                intervals: VM_Message_Retrieval_Errors_Report
            },
            {
                group: 'Voice Mail Reports',
                label: 'Voice Mail Message Store Cleanup Report',
                intervals: VM_Message_Store_Cleanup_Report
            },
            {
                group: 'Voice Mail Reports',
                label: 'Voice Mail Message Store Report',
                intervals: VM_Message_Store_Report
            },
            {
                group: 'Voice Mail Reports',
                label: 'Voice Mail SMS Notification Report',
                intervals: VM_SMS_Notification_Report
            },
            {
                group: 'Voice Mail Reports',
                label: 'Voice Mail Subscriber Activity Report',
                intervals: VM_Subscriber_Activity_Report
            },
            {
                group: 'Voice Mail (Fixedline) Reports',
                label: 'Voice Mail (Fixedline) Message Deposit Report',
                intervals: VM_Fixedline_Message_Deposit_Report
            },
            {
                group: 'Voice Mail (Fixedline) Reports',
                label: 'Voice Mail (Fixedline) Message Retrieval Report',
                intervals: VM_Fixedline_Message_Retrieval_Report
            },
            {
                group: 'Voice Mail (Fixedline) Reports',
                label: 'Voice Mail (Fixedline) Subscriber Activity Report',
                intervals: VM_Fixedline_Subscriber_Activity_Report
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
