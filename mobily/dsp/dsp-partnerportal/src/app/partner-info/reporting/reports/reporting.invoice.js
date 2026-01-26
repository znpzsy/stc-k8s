(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting.reports.invoice', []);

    var ReportingReportsInvoiceModule = angular.module('partnerportal.partner-info.reporting.reports.invoice');

    ReportingReportsInvoiceModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.reporting.reports.invoice', {
            abstract: true,
            url: "/invoice",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'PartnerInfo.Reporting.Invoice',
                permissions: [
                    'PRM__FINANCIALREPORTS_ONDEMAND_READ'
                ]
            }
        }).state('partner-info.reporting.reports.invoice.report', {
            url: "",
            templateUrl: 'partner-info/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsInvoiceCtrl'
        });

    });

    ReportingReportsInvoiceModule.controller('ReportingReportsInvoiceCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, CMPFService) {
        $log.debug("ReportingReportsInvoiceCtrl");

        $scope.organizationId = $scope.getOrganizationId();
        $scope.organizationName = $scope.getOrganizationName();

        var DSP_Invoice_Report = [
            {name: 'MONTHLY2_SPECIAL', url: ':home:csp:Revenue:DSP_Invoice_Report.prpt', reportType: 'Monthly'}
        ];

        $scope.REPORTS = [
            {
                group: 'Summary Reports',
                label: 'Invoice Report',
                intervals: DSP_Invoice_Report
            }
        ];

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.permanentParams = {
            organizationId: $scope.organizationId
        };
    });

})();
