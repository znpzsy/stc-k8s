(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting.reports.dcb', []);

    var ReportingReportsCBModule = angular.module('partnerportal.partner-info.reporting.reports.dcb');

    ReportingReportsCBModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.reporting.reports.dcb', {
            abstract: true,
            url: "/direct-carrier-billing",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'PartnerInfo.Reporting.DCB',
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
        }).state('partner-info.reporting.reports.dcb.report', {
            url: "",
            templateUrl: 'partner-info/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsCBCtrl'
        });

    });

    ReportingReportsCBModule.controller('ReportingReportsCBCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, CMPFService,
                                                                            services) {
        $log.debug("ReportingReportsCBCtrl");

        $scope.organizationId = $scope.getOrganizationId();
        $scope.organizationName = $scope.getOrganizationName();

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['name']);

        // Traffic reports
        var DCB_Traffic_Details_by_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:DCB:DCB_Traffic_Details_by_Organization_Report.prpt');
        var DCB_Traffic_Details_by_Service_Report = UtilService.defineReportsAsDHM(':home:csp:DCB:DCB_Traffic_Details_by_Service_Report.prpt');
        var DCB_Traffic_Details_by_Period_Report = UtilService.defineReportsAsDHM(':home:csp:DCB:DCB_Traffic_Details_by_Period_Report.prpt');

        $scope.REPORTS = [
            // Traffic Reports
            {
                group: 'Traffic Reports',
                label: 'Direct Carrier Billing Traffic Details Report',
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
            }
        ];

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.permanentParams = {
            organizationId: $scope.organizationId
        };
        $scope.additionalParams = {
            serviceId: null
        };
    });

})();
