(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.dcb', []);

    var ReportingReportsDCBModule = angular.module('adminportal.subsystems.reporting.reports.products.dcb');

    ReportingReportsDCBModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.dcb', {
            abstract: true,
            url: "/direct-carrier-billing",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.DCB',
                onDemandState: 'subsystems.reporting.reports.products.dcb.report',
                scheduleState: 'subsystems.reporting.reports.products.dcb.schedule'
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                },
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                }
            }
        }).state('subsystems.reporting.reports.products.dcb.report', {
            url: "",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsDCBCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_ONDEMAND_READ'
                ]
            }
        }).state('subsystems.reporting.reports.products.dcb.schedule', {
            url: "/direct-carrier-billing/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsDCBScheduleCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_SCHEDULED_READ'
                ]
            }
        });

    });

    ReportingReportsDCBModule.controller('ReportingReportsDCBCtrl', function ($scope, $log, $controller, $filter, Restangular, CMPFService, UtilService,
                                                                              organizations, services) {
        $log.debug("ReportingReportsDCBCtrl");

        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['name']);

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['name']);

        // Traffic
        var DCB_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:DCB:DCB_Traffic_Summary_Report.prpt');
        var DCB_Traffic_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:DCB:DCB_Traffic_Details_by_Organization_Report.prpt');
        var DCB_Traffic_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:DCB:DCB_Traffic_Details_by_Service_Report.prpt');
        var DCB_Traffic_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:DCB:DCB_Traffic_Details_by_Period_Report.prpt');
        // Error
        var DCB_Error_Report = UtilService.defineReportsAsDHM(':home:csp:DCB:DCB_Error_Report.prpt');

        $scope.REPORTS = [
            // Traffic Reports
            {
                group: 'Traffic Reports',
                label: 'Direct Carrier Billing Traffic Summary Report',
                intervals: DCB_Traffic_Summary_Report
            },
            {
                group: 'Traffic Reports',
                label: 'Direct Carrier Billing Traffic Details by Organization Report',
                intervals: DCB_Traffic_Details_by_Organization_Report,
                additionalFields: ['organizationId']
            },
            {
                group: 'Traffic Reports',
                label: 'Direct Carrier Billing Traffic Details by Service Report',
                intervals: DCB_Traffic_Details_by_Service_Report,
                additionalFields: ['organizationId', 'serviceId']
            },
            {
                group: 'Traffic Reports',
                label: 'Direct Carrier Billing Traffic Details by Period Report',
                intervals: DCB_Traffic_Details_by_Period_Report,
                additionalFields: ['organizationId', 'serviceId']
            },
            // Error
            {
                group: 'Error Reports',
                label: 'Direct Carrier Billing Error Report',
                intervals: DCB_Error_Report,
                additionalFields: ['organizationId', 'serviceId']
            }
        ];

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            organizationId: null,
            serviceId: null
        };
    });

    ReportingReportsDCBModule.controller('ReportingReportsDCBScheduleCtrl', function ($scope, $log, $controller, organizations, services) {
        $log.debug("ReportingReportsDCBScheduleCtrl");

        $controller('ReportingReportsDCBCtrl', {
            $scope: $scope,
            organizations: organizations,
            services: services
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
