(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.antispamsms', []);

    var ReportingReportsAntiSpamSMSModule = angular.module('adminportal.subsystems.reporting.reports.products.antispamsms');

    ReportingReportsAntiSpamSMSModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.antispamsms', {
            abstract: true,
            url: "/antispam-sms",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.AntiSpamSMS',
                onDemandState: 'subsystems.reporting.reports.products.antispamsms.report',
                scheduleState: 'subsystems.reporting.reports.products.antispamsms.schedule',
                permissions: [
                    'PRODUCTS_ANTISPAM'
                ]
            }
        }).state('subsystems.reporting.reports.products.antispamsms.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsAntiSpamSMSCtrl'
        }).state('subsystems.reporting.reports.products.antispamsms.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsAntiSpamSMSScheduleCtrl'
        });

    });

    ReportingReportsAntiSpamSMSModule.controller('ReportingReportsAntiSpamSMSCtrl', function ($scope, $log, $controller, $filter, UtilService, SMS_ANTISPAM_REPORTING_FILTER_TYPES,
                                                                                              SMS_ANTISPAM_REPORTING_COUNTER_NAMES) {
        $log.debug("ReportingReportsAntiSpamSMSCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.SMS_ANTISPAM_REPORTING_FILTER_TYPES = SMS_ANTISPAM_REPORTING_FILTER_TYPES;
        $scope.SMS_ANTISPAM_REPORTING_COUNTER_NAMES = SMS_ANTISPAM_REPORTING_COUNTER_NAMES;

        // General Reports
        var Antispam_FilterUrl_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_FilterUrl_Report.prpt');
        var AntiSpam_RuleCount_Blocked_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_RuleCount_Blocked_Report.prpt');
        var AntiSpam_RuleCount_Monitored_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_RuleCount_Monitored_Report.prpt');
        // Traffic Reports
        var AntiSpam_Overall_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Overall_Traffic_Report.prpt');
        var AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Summary_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Summary_Report.prpt' }];
        var AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Report.prpt');
        var AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Summary_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Summary_Report.prpt' }];
        var AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Report.prpt');
        var AntiSpam_A2P_App_Traffic_by_Originator_MSC_GT_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_A2P_App_Traffic_by_Originator_MSC_GT_Report.prpt' }];

        // GSM Reports
        var AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Summary_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Summary_Report.prpt' }];
        var AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Report.prpt');
        // Reject Reason Reports
        var AntiSpam_Reject_Reason_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Reject_Reason_Report.prpt');
        var AntiSpam_Reject_Reason_by_Originator_MSC_GT_Summary_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_Reject_Reason_by_Originator_MSC_GT_Summary_Report.prpt' }];
        var AntiSpam_Reject_Reason_by_Originator_MSC_GT_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Reject_Reason_by_Originator_MSC_GT_Report.prpt');
        // Top GT Reports
        var AntiSpam_TopGT_Summary_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_TopGT_Summary_Report.prpt' }];
        var AntiSpam_TopGT_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_TopGT_Report.prpt');
        var AntiSpam_TopSRI_BParty_Spam_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_TopSRI_BParty_Spam_Report.prpt');
        var AntiSpam_TopSender_MSISDN_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_TopSender_MSISDN_Report.prpt');

        $scope.REPORTS = [
            // General Reports
            {group: 'General Reports', label: 'SMS Anti-Spam Filter URL Report', intervals: Antispam_FilterUrl_Report, additionalFields: ['filterType']},
            {group: 'General Reports', label: 'SMS Anti-Spam Rule Count [Blocked Senders] Report', intervals: AntiSpam_RuleCount_Blocked_Report, additionalFields: ['senderId', 'smscgtId', 'ruleName']},
            {group: 'General Reports', label: 'SMS Anti-Spam Rule Count [Monitored Senders] Report', intervals: AntiSpam_RuleCount_Monitored_Report, additionalFields: ['senderId', 'smscgtId', 'ruleName']},
            // Traffic Reports
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Overall Traffic Report', intervals: AntiSpam_Overall_Traffic_Report},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Overall Traffic by Originator MSC GT Summary Report', intervals: AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Summary_Report, additionalFields: ['requestLimit']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Overall Traffic by Originator MSC GT Report', intervals: AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Report, additionalFields: ['requestLimit', 'mscFilter']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam A2P Traffic by Originator MSC GT Summary Report', intervals: AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Summary_Report, additionalFields: ['requestLimit']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam A2P Traffic by Originator MSC GT Report', intervals: AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Report, additionalFields: ['requestLimit', 'mscFilter']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam A2P App Traffic by Originator MSC GT Report', intervals: AntiSpam_A2P_App_Traffic_by_Originator_MSC_GT_Report, additionalFields: ['mscFilter']},
            // GSM Reports
            {group: 'GSM Reports', label: 'SMS Anti-Spam MT Inbound / Outbound Traffic by Operator Summary Report', intervals: AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Summary_Report},
            {group: 'GSM Reports', label: 'SMS Anti-Spam MT Inbound / Outbound Traffic by Operator Report', intervals: AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Report, additionalFields: ['operatorFilter']},
            // Reject Reason Reports
            {group: 'Reject Reason Reports', label: 'SMS Anti-Spam Reject Reason Report', intervals: AntiSpam_Reject_Reason_Report},
            {group: 'Reject Reason Reports', label: 'SMS Anti-Spam Reject Reason by Originator MSC GT Summary Report', intervals: AntiSpam_Reject_Reason_by_Originator_MSC_GT_Summary_Report},
            {group: 'Reject Reason Reports', label: 'SMS Anti-Spam Reject Reason by Originator MSC GT Report', intervals: AntiSpam_Reject_Reason_by_Originator_MSC_GT_Report, additionalFields: ['mscFilter']},
            // Top GT Reports
            {group: 'Top GT Reports', label: 'SMS Anti-Spam Top GT Summary Report', intervals: AntiSpam_TopGT_Summary_Report},
            {group: 'Top GT Reports', label: 'SMS Anti-Spam Top GT Report', intervals: AntiSpam_TopGT_Report, additionalFields: ['counterName']},
            {group: 'Top GT Reports', label: 'SMS Anti-Spam Top SRI B-Party Spam Report', intervals: AntiSpam_TopSRI_BParty_Spam_Report},
            {group: 'Top GT Reports', label: 'SMS Anti-Spam Top Sender MSISDN Report', intervals: AntiSpam_TopSender_MSISDN_Report, additionalFields: ['senderId', 'smscgtId']}
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            filterType: null,
            operatorFilter: null,
            mscFilter: null,
            requestLimit: null,
            senderId: null,
            smscgtId: null,
            ruleName: null
        };
    });

    ReportingReportsAntiSpamSMSModule.controller('ReportingReportsAntiSpamSMSScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsAntiSpamSMSScheduleCtrl");

        $controller('ReportingReportsAntiSpamSMSCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
