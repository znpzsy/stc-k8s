(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.messaginggw', []);

    var ReportingReportsMessagingGwModule = angular.module('adminportal.subsystems.reporting.reports.products.messaginggw');

    ReportingReportsMessagingGwModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.messaginggw', {
            abstract: true,
            url: "/messaging-gateway",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.MessagingGw',
                onDemandState: 'subsystems.reporting.reports.products.messaginggw.report',
                scheduleState: 'subsystems.reporting.reports.products.messaginggw.schedule'
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                },
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                }
            }
        }).state('subsystems.reporting.reports.products.messaginggw.report', {
            url: "",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsMessagingGwCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_ONDEMAND_READ'
                ]
            }
        }).state('subsystems.reporting.reports.products.messaginggw.schedule', {
            url: "/messaging-gateway/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsMessagingGwScheduleCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_SCHEDULED_READ'
                ]
            }
        });

    });

    ReportingReportsMessagingGwModule.controller('ReportingReportsMessagingGwCtrl', function ($scope, $log, $controller, $filter, Restangular, CMPFService, UtilService, REPORTING_MSGGW_REPORT_CHANNELS,
                                                                                              organizations, services) {
        $log.debug("ReportingReportsMessagingGwCtrl");

        $scope.channels = REPORTING_MSGGW_REPORT_CHANNELS;

        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['name']);

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, 'name');

        var MSGGW_SMS_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Traffic_Summary_Report.prpt');
        var MSGGW_SMS_Traffic_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Traffic_Details_by_Organization_Report.prpt');
        var MSGGW_SMS_Traffic_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Traffic_Details_by_Service_Report.prpt');
        var MSGGW_SMS_Traffic_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Traffic_Details_by_Period_Report.prpt');
        var MSGGW_SMS_Traffic_Busy_Period_Report = UtilService.defineReportsAsDH(':home:csp:MessagingGW:MSGGW_SMS_Traffic_Busy_Period_Report.prpt');
        var MSGGW_SMS_Performance_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Performance_Summary_Report.prpt');
        var MSGGW_SMS_Performance_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Performance_by_Organization_Report.prpt');
        var MSGGW_SMS_Performance_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Performance_by_Service_Report.prpt');
        var MSGGW_SMS_Performance_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Performance_by_Period_Report.prpt');
        var MSGGW_SMS_SLA_Errors_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_SLA_Errors_by_Organization_Report.prpt');
        var MSGGW_SMS_SLA_Errors_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_SLA_Errors_by_Service_Report.prpt');
        var MSGGW_SMS_SLA_Errors_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_SLA_Errors_by_Period_Report.prpt');
        var MSGGW_SMS_Error_Details_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Error_Details_Summary_Report.prpt');
        var MSGGW_SMS_Error_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Error_Details_by_Organization_Report.prpt');
        var MSGGW_SMS_Error_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Error_Details_by_Service_Report.prpt');
        var MSGGW_SMS_Error_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_SMS_Error_Details_by_Period_Report.prpt');
        var MSGGW_Free_Vs_Charged_SMS_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_SMS_By_Organization_Report.prpt');
        var MSGGW_Free_Vs_Charged_SMS_By_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_SMS_By_Service_Report.prpt');
        var MSGGW_Free_Vs_Charged_SMS_By_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_SMS_By_Period_Report.prpt');
        var MSGGW_SMS_General_Delivery_Errors_Report = UtilService.defineReportsAsD(':home:csp:MessagingGW:MSGGW_SMS_General_Delivery_Errors_Report.prpt');

        var MSGGW_MMS_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Traffic_Summary_Report.prpt');
        var MSGGW_MMS_Traffic_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Traffic_Details_by_Organization_Report.prpt');
        var MSGGW_MMS_Traffic_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Traffic_Details_by_Service_Report.prpt');
        var MSGGW_MMS_Traffic_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Traffic_Details_by_Period_Report.prpt');
        var MSGGW_MMS_Traffic_Busy_Period_Report = UtilService.defineReportsAsDH(':home:csp:MessagingGW:MSGGW_MMS_Traffic_Busy_Period_Report.prpt');
        var MSGGW_MMS_Performance_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Performance_Summary_Report.prpt');
        var MSGGW_MMS_Performance_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Performance_by_Organization_Report.prpt');
        var MSGGW_MMS_Performance_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Performance_by_Service_Report.prpt');
        var MSGGW_MMS_Performance_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Performance_by_Period_Report.prpt');
        var MSGGW_MMS_SLA_Errors_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_SLA_Errors_by_Organization_Report.prpt');
        var MSGGW_MMS_SLA_Errors_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_SLA_Errors_by_Service_Report.prpt');
        var MSGGW_MMS_SLA_Errors_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_SLA_Errors_by_Period_Report.prpt');
        var MSGGW_MMS_Error_Details_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Error_Details_Summary_Report.prpt');
        var MSGGW_MMS_Error_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Error_Details_by_Organization_Report.prpt');
        var MSGGW_MMS_Error_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Error_Details_by_Service_Report.prpt');
        var MSGGW_MMS_Error_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_MMS_Error_Details_by_Period_Report.prpt');
        var MSGGW_Free_Vs_Charged_MMS_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_MMS_By_Organization_Report.prpt');
        var MSGGW_Free_Vs_Charged_MMS_By_Service_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_MMS_By_Service_Report.prpt');
        var MSGGW_Free_Vs_Charged_MMS_By_Period_Report = UtilService.defineReportsAsDHM(':home:csp:MessagingGW:MSGGW_Free_Vs_Charged_MMS_By_Period_Report.prpt');

        var SMS_REPORTS = [
            {label: 'Messaging Gateway SMS Traffic Summary Report', intervals: MSGGW_SMS_Traffic_Summary_Report},
            {label: 'Messaging Gateway SMS Traffic Details by Organization Report', intervals: MSGGW_SMS_Traffic_Details_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway SMS Traffic Details by Service Report', intervals: MSGGW_SMS_Traffic_Details_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway SMS Traffic Details by Period Report', intervals: MSGGW_SMS_Traffic_Details_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway SMS Traffic Busy Period Report', intervals: MSGGW_SMS_Traffic_Busy_Period_Report},
            {label: 'Messaging Gateway SMS Performance Summary Report', intervals: MSGGW_SMS_Performance_Summary_Report},
            {label: 'Messaging Gateway SMS Performance by Organization Report', intervals: MSGGW_SMS_Performance_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway SMS Performance by Service Report', intervals: MSGGW_SMS_Performance_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway SMS Performance by Period Report', intervals: MSGGW_SMS_Performance_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway SMS SLA Errors by Organization Report', intervals: MSGGW_SMS_SLA_Errors_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway SMS SLA Errors by Service Report', intervals: MSGGW_SMS_SLA_Errors_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway SMS SLA Errors by Period Report', intervals: MSGGW_SMS_SLA_Errors_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway SMS Error Details Summary Report', intervals: MSGGW_SMS_Error_Details_Summary_Report},
            {label: 'Messaging Gateway SMS Error Details by Organization Report', intervals: MSGGW_SMS_Error_Details_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway SMS Error Details by Service Report', intervals: MSGGW_SMS_Error_Details_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway SMS Error Details by Period Report', intervals: MSGGW_SMS_Error_Details_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway Free vs Charged SMS by Organization Report', intervals: MSGGW_Free_Vs_Charged_SMS_By_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway Free vs Charged SMS by Service Report', intervals: MSGGW_Free_Vs_Charged_SMS_By_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway Free vs Charged SMS by Period Report', intervals: MSGGW_Free_Vs_Charged_SMS_By_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway General Delivery Errors Report', intervals: MSGGW_SMS_General_Delivery_Errors_Report}
        ];

        var MMS_REPORTS = [
            {label: 'Messaging Gateway MMS Traffic Summary Report', intervals: MSGGW_MMS_Traffic_Summary_Report},
            {label: 'Messaging Gateway MMS Traffic Details by Organization Report', intervals: MSGGW_MMS_Traffic_Details_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway MMS Traffic Details by Service Report', intervals: MSGGW_MMS_Traffic_Details_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway MMS Traffic Details by Period Report', intervals: MSGGW_MMS_Traffic_Details_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway MMS Traffic Busy Period Report', intervals: MSGGW_MMS_Traffic_Busy_Period_Report},
            {label: 'Messaging Gateway MMS Performance Summary Report', intervals: MSGGW_MMS_Performance_Summary_Report},
            {label: 'Messaging Gateway MMS Performance by Organization Report', intervals: MSGGW_MMS_Performance_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway MMS Performance by Service Report', intervals: MSGGW_MMS_Performance_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway MMS Performance by Period Report', intervals: MSGGW_MMS_Performance_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway MMS SLA Errors by Organization Report', intervals: MSGGW_MMS_SLA_Errors_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway MMS SLA Errors by Service Report', intervals: MSGGW_MMS_SLA_Errors_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway MMS SLA Errors by Period Report', intervals: MSGGW_MMS_SLA_Errors_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway MMS Error Details Summary Report', intervals: MSGGW_MMS_Error_Details_Summary_Report},
            {label: 'Messaging Gateway MMS Error Details by Organization Report', intervals: MSGGW_MMS_Error_Details_by_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway MMS Error Details by Service Report', intervals: MSGGW_MMS_Error_Details_by_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway MMS Error Details by Period Report', intervals: MSGGW_MMS_Error_Details_by_Period_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway Free vs Charged MMS by Organization Report', intervals: MSGGW_Free_Vs_Charged_MMS_By_Organization_Report, additionalFields: ['organizationId']},
            {label: 'Messaging Gateway Free vs Charged MMS by Service Report', intervals: MSGGW_Free_Vs_Charged_MMS_By_Service_Report, additionalFields: ['organizationId', 'serviceId']},
            {label: 'Messaging Gateway Free vs Charged MMS by Period Report', intervals: MSGGW_Free_Vs_Charged_MMS_By_Period_Report, additionalFields: ['organizationId', 'serviceId']}
        ];

        // Listen changes on the channel to change the report list immediately.
        $scope.changeMsggwChannel = function (channel) {
            if (channel === 'SMS') {
                $scope.REPORTS = SMS_REPORTS;
            } else {
                $scope.REPORTS = MMS_REPORTS;
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
        $scope.additionalParams = {
            organizationId: null,
            serviceId: null
        };
    });

    ReportingReportsMessagingGwModule.controller('ReportingReportsMessagingGwScheduleCtrl', function ($scope, $log, $controller, organizations, services) {
        $log.debug("ReportingReportsMessagingGwScheduleCtrl");

        $controller('ReportingReportsMessagingGwCtrl', {
            $scope: $scope,
            organizations: organizations,
            services: services
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
