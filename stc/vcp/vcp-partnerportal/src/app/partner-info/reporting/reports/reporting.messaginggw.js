(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting.reports.messaginggw', []);

    var ReportingReportsMessagingGwModule = angular.module('partnerportal.partner-info.reporting.reports.messaginggw');

    ReportingReportsMessagingGwModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.reporting.reports.messaginggw', {
            abstract: true,
            url: "/messaging-gateway",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'PartnerInfo.Reporting.Messaging',
                permissions: [
                    'PRM__REPORTS_ONDEMAND_READ'
                ]
            },
            resolve: {
                services: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getServicesByOrganizationId(organizationId);
                }
            }
        }).state('partner-info.reporting.reports.messaginggw.report', {
            url: "",
            templateUrl: 'partner-info/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsMessagingGwCtrl'
        });

    });

    ReportingReportsMessagingGwModule.controller('ReportingReportsMessagingGwCtrl', function ($scope, $log, $controller, $filter, UtilService, Restangular, CMPFService,
                                                                                              REPORTING_MSGGW_REPORT_CHANNELS, services) {
        $log.debug("ReportingReportsMessagingGwCtrl");

        $scope.channels = REPORTING_MSGGW_REPORT_CHANNELS;

        var organizationId = $scope.getOrganizationId();

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, 'name');

        var MSGGW_SMS_Traffic_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Traffic_Details_by_Organization_Report.prpt');
        var MSGGW_SMS_Traffic_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Traffic_Details_by_Service_Report.prpt');
        var MSGGW_SMS_Traffic_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Traffic_Details_by_Period_Report.prpt');
        var MSGGW_SMS_Performance_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Performance_by_Organization_Report.prpt');
        var MSGGW_SMS_Performance_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Performance_by_Service_Report.prpt');
        var MSGGW_SMS_Performance_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Performance_by_Period_Report.prpt');
        var MSGGW_SMS_SLA_Errors_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_SLA_Errors_by_Organization_Report.prpt');
        var MSGGW_SMS_SLA_Errors_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_SLA_Errors_by_Service_Report.prpt');
        var MSGGW_SMS_SLA_Errors_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_SLA_Errors_by_Period_Report.prpt');
        var MSGGW_SMS_Error_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Error_Details_by_Organization_Report.prpt');
        var MSGGW_SMS_Error_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Error_Details_by_Service_Report.prpt');
        var MSGGW_SMS_Error_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Error_Details_by_Period_Report.prpt');
        var MSGGW_Free_Vs_Charged_SMS_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_SMS_By_Organization_Report.prpt');
        var MSGGW_Free_Vs_Charged_SMS_By_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_SMS_By_Service_Report.prpt');
        var MSGGW_Free_Vs_Charged_SMS_By_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_SMS_By_Period_Report.prpt');

        var MSGGW_MMS_Traffic_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Traffic_Details_by_Organization_Report.prpt');
        var MSGGW_MMS_Traffic_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Traffic_Details_by_Service_Report.prpt');
        var MSGGW_MMS_Traffic_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Traffic_Details_by_Period_Report.prpt');
        var MSGGW_MMS_Performance_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Performance_by_Organization_Report.prpt');
        var MSGGW_MMS_Performance_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Performance_by_Service_Report.prpt');
        var MSGGW_MMS_Performance_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Performance_by_Period_Report.prpt');
        var MSGGW_MMS_SLA_Errors_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_SLA_Errors_by_Organization_Report.prpt');
        var MSGGW_MMS_SLA_Errors_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_SLA_Errors_by_Service_Report.prpt');
        var MSGGW_MMS_SLA_Errors_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_SLA_Errors_by_Period_Report.prpt');
        var MSGGW_MMS_Error_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Error_Details_by_Organization_Report.prpt');
        var MSGGW_MMS_Error_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Error_Details_by_Service_Report.prpt');
        var MSGGW_MMS_Error_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Error_Details_by_Period_Report.prpt');
        var MSGGW_Free_Vs_Charged_MMS_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_MMS_By_Organization_Report.prpt');
        var MSGGW_Free_Vs_Charged_MMS_By_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_MMS_By_Service_Report.prpt');
        var MSGGW_Free_Vs_Charged_MMS_By_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_MMS_By_Period_Report.prpt');

        var SMS_REPORTS = [
            {label: 'SMS Traffic Details Report', intervals: MSGGW_SMS_Traffic_Details_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'SMS Traffic Details by Service Report', intervals: MSGGW_SMS_Traffic_Details_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'SMS Traffic Details by Period Report', intervals: MSGGW_SMS_Traffic_Details_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'SMS Performance Report', intervals: MSGGW_SMS_Performance_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'SMS Performance by Service Report', intervals: MSGGW_SMS_Performance_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'SMS Performance by Period Report', intervals: MSGGW_SMS_Performance_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'SMS SLA Errors Report', intervals: MSGGW_SMS_SLA_Errors_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'SMS SLA Errors by Service Report', intervals: MSGGW_SMS_SLA_Errors_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'SMS SLA Errors by Period Report', intervals: MSGGW_SMS_SLA_Errors_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'SMS Error Details Report', intervals: MSGGW_SMS_Error_Details_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'SMS Error Details by Service Report', intervals: MSGGW_SMS_Error_Details_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'SMS Error Details by Period Report', intervals: MSGGW_SMS_Error_Details_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Free vs Charged SMS Report', intervals: MSGGW_Free_Vs_Charged_SMS_By_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Free vs Charged SMS by Service Report', intervals: MSGGW_Free_Vs_Charged_SMS_By_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Free vs Charged SMS by Period Report', intervals: MSGGW_Free_Vs_Charged_SMS_By_Period_Report, additionalFields: ['organizationId', 'serviceId']}
        ];

        /*var MMS_REPORTS = [
            {label: 'MMS Traffic Details Report', intervals: MSGGW_MMS_Traffic_Details_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'MMS Traffic Details by Service Report', intervals: MSGGW_MMS_Traffic_Details_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'MMS Traffic Details by Period Report', intervals: MSGGW_MMS_Traffic_Details_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'MMS Performance Report', intervals: MSGGW_MMS_Performance_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'MMS Performance by Service Report', intervals: MSGGW_MMS_Performance_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'MMS Performance by Period Report', intervals: MSGGW_MMS_Performance_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'MMS SLA Errors Report', intervals: MSGGW_MMS_SLA_Errors_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'MMS SLA Errors by Service Report', intervals: MSGGW_MMS_SLA_Errors_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'MMS SLA Errors by Period Report', intervals: MSGGW_MMS_SLA_Errors_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'MMS Error Details Report', intervals: MSGGW_MMS_Error_Details_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'MMS Error Details by Service Report', intervals: MSGGW_MMS_Error_Details_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'MMS Error Details by Period Report', intervals: MSGGW_MMS_Error_Details_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Free vs Charged MMS Report', intervals: MSGGW_Free_Vs_Charged_MMS_By_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Free vs Charged MMS by Service Report', intervals: MSGGW_Free_Vs_Charged_MMS_By_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Free vs Charged MMS by Period Report', intervals: MSGGW_Free_Vs_Charged_MMS_By_Period_Report, additionalFields: ['organizationId', 'serviceId']}
        ];*/

        // Listen changes on the channel to change the report list immediately.
        $scope.changeMsggwChannel = function (channel) {
            if (channel === 'SMS') {
                $scope.REPORTS = SMS_REPORTS;
            } else {
                //$scope.REPORTS = MMS_REPORTS;
                $scope.REPORTS = [];
            }

            $scope.reportCategory = $scope.REPORTS[0];
            $scope.interval = $scope.reportCategory.intervals[0];
        };

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.channel = $scope.channels[0];
        $scope.REPORTS = SMS_REPORTS;
        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.permanentParams = {
            organizationId: organizationId
        };
        $scope.additionalParams = {
            serviceId: null
        };
    });

})();
