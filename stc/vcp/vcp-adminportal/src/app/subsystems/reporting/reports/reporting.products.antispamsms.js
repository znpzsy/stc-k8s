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
                viewKey: 'ANTISPAM',
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.AntiSpamSMS',
                onDemandState: 'subsystems.reporting.reports.products.antispamsms.report',
                scheduleState: 'subsystems.reporting.reports.products.antispamsms.schedule'
            }
        }).state('subsystems.reporting.reports.products.antispamsms.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsAntiSpamSMSCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_ANTISPAM'
                ]
            }
        }).state('subsystems.reporting.reports.products.antispamsms.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsAntiSpamSMSScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_ANTISPAM'
                ]
            }
        });

    });

    ReportingReportsAntiSpamSMSModule.controller('ReportingReportsAntiSpamSMSCtrl', function ($scope, $log, $controller, $filter, UtilService, SMS_ANTISPAM_REPORTING_FILTER_TYPES,
                                                                                              SMS_ANTISPAM_REPORTING_COUNTER_NAMES, SMS_ANTISPAM_REPORTING_HUBS, SMS_ANTISPAM_REPORTING_MVNO, SMS_ANTISPAM_REPORTING_OPERATORS) {
        $log.debug("ReportingReportsAntiSpamSMSCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.SMS_ANTISPAM_REPORTING_FILTER_TYPES = SMS_ANTISPAM_REPORTING_FILTER_TYPES;
        $scope.SMS_ANTISPAM_REPORTING_COUNTER_NAMES = SMS_ANTISPAM_REPORTING_COUNTER_NAMES;
        $scope.SMS_ANTISPAM_REPORTING_MVNO = SMS_ANTISPAM_REPORTING_MVNO;
        $scope.SMS_ANTISPAM_REPORTING_HUBS = SMS_ANTISPAM_REPORTING_HUBS;
        $scope.SMS_ANTISPAM_REPORTING_OPERATORS = SMS_ANTISPAM_REPORTING_OPERATORS;

        // General Reports
        var Antispam_FilterUrl_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_FilterUrl_Report.prpt');
        var Antispam_Rules_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Rules_Report.prpt');
        var AntiSpam_MVNO_MO_Filtering_Report= UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_MVNO_MO_Filtering_Report.prpt');

        // Traffic Reports
        var AntiSpam_Overall_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Overall_Traffic_Report.prpt');
        var AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Summary_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Summary_Report.prpt' }];
        var AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Report.prpt');
        var AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Summary_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Summary_Report.prpt' }];
        var AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Report.prpt');
        var AntiSpam_Terminating_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Terminating_Traffic_Report.prpt');
        var AntiSpam_Terminating_Traffic_by_Country_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Terminating_Traffic_by_Country_Report.prpt');
        var AntiSpam_Terminating_Traffic_by_Operator_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Terminating_Traffic_by_Operator_Report.prpt');
        var AntiSpam_Terminating_Traffic_by_HUB_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Terminating_Traffic_by_HUB_Report.prpt');
        var AntiSpam_Terminating_Traffic_by_MVNO_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Terminating_Traffic_by_MVNO_Report.prpt');
        var AntiSpam_Terminating_Traffic_by_SS7_Direct_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Terminating_Traffic_by_SS7_Direct_Report.prpt');
        var AntiSpam_International_Terminating_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_International_Terminating_Traffic_Report.prpt');
        // Hub Reports
        var AntiSpam_HUB_Terminating_Traffic_Delivery_Errors_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_HUB_Terminating_Traffic_Delivery_Errors_Report.prpt');
        var AntiSpam_HUB_Terminating_Traffic_MT_Errors_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_HUB_Terminating_Traffic_MT_Errors_Report.prpt');
        var AntiSpam_HUB_Terminating_Traffic_SRI_Errors_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_HUB_Terminating_Traffic_SRI_Errors_Report.prpt');
        var AntiSpam_LVN_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Long_Virtual_Numbers_Report.prpt');
        // GSM Reports
        var AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Summary_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Summary_Report.prpt' }];
        var AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Report.prpt');
        var AntiSpam_Alphanumeric_Originators_by_Operator_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Alphanumeric_Originators_by_Operator_Report.prpt');
        var AntiSpam_MO_Spoofing_Feature_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_MO_Spoofing_Feature_Report.prpt');
        var AntiSpam_National_Inbound_Roamer_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_National_Inbound_Roamer_Report.prpt');
        var AntiSpam_National_Outbound_Roamer_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_National_Outbound_Roamer_Report.prpt');
        var AntiSpam_International_Inbound_Roamer_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_International_Inbound_Roamer_Report.prpt');
        // Reject Reason Reports
        var AntiSpam_Reject_Reason_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Reject_Reason_Report.prpt');
        var AntiSpam_Reject_Reason_by_Originator_MSC_GT_Summary_Report = [{ name: 'ALL', url: ':home:vcp:AntiSpam:AntiSpam_Reject_Reason_by_Originator_MSC_GT_Summary_Report.prpt' }];
        var AntiSpam_Reject_Reason_by_Originator_MSC_GT_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_Reject_Reason_by_Originator_MSC_GT_Report.prpt');
        // Top GT Reports
        var AntiSpam_TopGT_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_TopGT_Report.prpt');
        var AntiSpam_TopSRI_BParty_Spam_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_TopSRI_BParty_Spam_Report.prpt');
        var AntiSpam_International_Alphanumeric_Originators_Report = UtilService.defineReportsAsDHM(':home:vcp:AntiSpam:AntiSpam_International_Alphanumeric_Originators_Report.prpt');

        $scope.REPORTS = [
            // General Reports
            {group: 'General Reports', label: 'SMS Anti-Spam Filter URL Report', intervals: Antispam_FilterUrl_Report, additionalFields: ['filterType']},
            {group: 'General Reports', label: 'SMS Anti-Spam Rules Report', intervals: Antispam_Rules_Report},
            {group: 'General Reports', label: 'SMS Anti-Spam MVNO MO Filtering Report', intervals: AntiSpam_MVNO_MO_Filtering_Report, additionalFields: ['operatorListFilter']},
            // Traffic Reports
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Overall Traffic Report', intervals: AntiSpam_Overall_Traffic_Report},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Overall Traffic by Originator MSC GT Summary Report', intervals: AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Summary_Report, additionalFields: ['requestLimit']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Overall Traffic by Originator MSC GT Report', intervals: AntiSpam_Overall_Traffic_by_Originator_MSC_GT_Report, additionalFields: ['requestLimit', 'mscFilter']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam A2P Traffic by Originator MSC GT Summary Report', intervals: AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Summary_Report, additionalFields: ['requestLimit']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam A2P Traffic by Originator MSC GT Report', intervals: AntiSpam_A2P_Traffic_by_Originator_MSC_GT_Report, additionalFields: ['requestLimit', 'mscFilter']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Terminating Traffic Report', intervals: AntiSpam_Terminating_Traffic_Report, additionalFields: ['mvno']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Terminating Traffic by Country Report', intervals: AntiSpam_Terminating_Traffic_by_Country_Report},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Terminating Traffic by Operator Report', intervals: AntiSpam_Terminating_Traffic_by_Operator_Report, additionalFields: ['operatorFilter']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Terminating Traffic by HUB Report', intervals: AntiSpam_Terminating_Traffic_by_HUB_Report, additionalFields: ['hub']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Terminating Traffic by MVNO Report', intervals: AntiSpam_Terminating_Traffic_by_MVNO_Report},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam Terminating Traffic by SS7 Direct Report', intervals: AntiSpam_Terminating_Traffic_by_SS7_Direct_Report, additionalFields: ['operatorFilter']},
            {group: 'Traffic Reports', label: 'SMS Anti-Spam International Terminating Traffic Report', intervals: AntiSpam_International_Terminating_Traffic_Report},
            // Hub Reports
            {group: 'Hub Reports', label: 'SMS Anti-Spam Hub Terminating Traffic Delivery Errors Report', intervals: AntiSpam_HUB_Terminating_Traffic_Delivery_Errors_Report},
            {group: 'Hub Reports', label: 'SMS Anti-Spam Hub Terminating Traffic MT Errors Report', intervals: AntiSpam_HUB_Terminating_Traffic_MT_Errors_Report},
            {group: 'Hub Reports', label: 'SMS Anti-Spam Hub Terminating Traffic SRI Errors Report', intervals: AntiSpam_HUB_Terminating_Traffic_SRI_Errors_Report},
            {group: 'Hub Reports', label: 'SMS Anti-Spam Long Virtual Numbers Report', intervals: AntiSpam_LVN_Report},
            // GSM Reports
            {group: 'GSM Reports', label: 'SMS Anti-Spam MT Inbound / Outbound Traffic by Operator Summary Report', intervals: AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Summary_Report},
            {group: 'GSM Reports', label: 'SMS Anti-Spam MT Inbound / Outbound Traffic by Operator Report', intervals: AntiSpam_MT_Inbound_Outbound_Traffic_by_Operator_Report, additionalFields: ['operatorFilter']},
            {group: 'GSM Reports', label: 'SMS Anti-Spam Alphanumeric Originators by Operator Report', intervals: AntiSpam_Alphanumeric_Originators_by_Operator_Report, additionalFields: ['mvno']},
            {group: 'GSM Reports', label: 'SMS Anti-Spam MO Spoofing Feature Report', intervals: AntiSpam_MO_Spoofing_Feature_Report},
            {group: 'GSM Reports', label: 'SMS Anti-Spam National Inbound Roamer Report', intervals: AntiSpam_National_Inbound_Roamer_Report},
            {group: 'GSM Reports', label: 'SMS Anti-Spam National Outbound Roamer Report', intervals: AntiSpam_National_Outbound_Roamer_Report},
            {group: 'GSM Reports', label: 'SMS Anti-Spam International Inbound Roamer Report', intervals: AntiSpam_International_Inbound_Roamer_Report},

            // Reject Reason Reports
            {group: 'Reject Reason Reports', label: 'SMS Anti-Spam Reject Reason Report', intervals: AntiSpam_Reject_Reason_Report},
            {group: 'Reject Reason Reports', label: 'SMS Anti-Spam Reject Reason by Originator MSC GT Summary Report', intervals: AntiSpam_Reject_Reason_by_Originator_MSC_GT_Summary_Report},
            {group: 'Reject Reason Reports', label: 'SMS Anti-Spam Reject Reason by Originator MSC GT Report', intervals: AntiSpam_Reject_Reason_by_Originator_MSC_GT_Report, additionalFields: ['mscFilter']},
            // Top GT Reports
            //{group: 'Top GT Reports', label: 'SMS Anti-Spam Top GT Summary Report', intervals: AntiSpam_TopGT_Summary_Report},
            {group: 'Top GT Reports', label: 'SMS Anti-Spam Top GT Report', intervals: AntiSpam_TopGT_Report, additionalFields: ['counterName']},
            {group: 'Top GT Reports', label: 'SMS Anti-Spam Top SRI B-Party Spam Report', intervals: AntiSpam_TopSRI_BParty_Spam_Report},
            {group: 'Top GT Reports', label: 'SMS Anti-Spam Top International Alphanumeric by Originators Report', intervals: AntiSpam_International_Alphanumeric_Originators_Report},
            //{group: 'Top GT Reports', label: 'SMS Anti-Spam Top Sender MSISDN Report', intervals: AntiSpam_TopSender_MSISDN_Report, additionalFields: ['senderId', 'smscgtId']}
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            filterType: null,
            operatorFilter: null,
            mscFilter: null,
            requestLimit: null,
            senderId: null,
            smscgtId: null
            //ruleName: null
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
