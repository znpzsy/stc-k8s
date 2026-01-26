(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.usc', []);

    var ReportingReportsUSCModule = angular.module('adminportal.subsystems.reporting.reports.products.usc');

    ReportingReportsUSCModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.usc', {
            abstract: true,
            url: "/ussd-service-center",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.USC',
                onDemandState: 'subsystems.reporting.reports.products.usc.report',
                scheduleState: 'subsystems.reporting.reports.products.usc.schedule',
                permissions: [
                    'PRODUCTS_USC'
                ]
            },
            resolve: {
                ussdWebServices: function (UssdBrowserService) {
                    return UssdBrowserService.getApplications();
                }
            }
        }).state('subsystems.reporting.reports.products.usc.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsUSCCtrl'
        }).state('subsystems.reporting.reports.products.usc.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsUSCScheduleCtrl'
        });

    });

    ReportingReportsUSCModule.controller('ReportingReportsUSCCtrl', function ($scope, $log, $controller, $filter, UtilService, Restangular, CMPFService,
                                                                              ussdWebServices) {
        $log.debug("ReportingReportsUSCCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var ussdWebServiceList = Restangular.stripRestangular(ussdWebServices);
        $scope.ussdWebServiceList = $filter('orderBy')(ussdWebServiceList, ['name']);

        // USSD Browser reports
        var USSDBR_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:USSDBrowser:USSDBR_Traffic_Report.prpt');
        var USSDBR_Traffic_by_App_Summary_Report = [
            {name: 'DAILY', url: ':home:vcp:USSDBrowser:USSDBR_Traffic_by_App_Summary_Report.prpt'}
        ];
        var USSDBR_Traffic_by_App_Report = UtilService.defineReportsAsDHM(':home:vcp:USSDBrowser:USSDBR_Traffic_by_App_Report.prpt');
        var USSDBR_Traffic_by_ShortCode_Summary_Report = [
            {name: 'DAILY', url: ':home:vcp:USSDBrowser:USSDBR_Traffic_by_ShortCode_Summary_Report.prpt'}
        ];

        $scope.REPORTS = [
            // USSD Browser reports
            {
                label: 'USSD Browser Traffic Report',
                intervals: USSDBR_Traffic_Report
            },
            {
                label: 'USSD Browser Traffic by App Summary Report',
                intervals: USSDBR_Traffic_by_App_Summary_Report
            },
            {
                label: 'USSD Browser Traffic by App Report',
                intervals: USSDBR_Traffic_by_App_Report,
                additionalFields: ['webServicesNames']
            },
            {
                label: 'USSD Browser Traffic by Short Code Summary Report',
                intervals: USSDBR_Traffic_by_ShortCode_Summary_Report
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            webServicesNames: null
        };
    });

    ReportingReportsUSCModule.controller('ReportingReportsUSCScheduleCtrl', function ($scope, $log, $controller, ussdWebServices) {
        $log.debug("ReportingReportsUSCScheduleCtrl");

        $controller('ReportingReportsUSCCtrl', {
            $scope: $scope,
            ussdWebServices: ussdWebServices
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
