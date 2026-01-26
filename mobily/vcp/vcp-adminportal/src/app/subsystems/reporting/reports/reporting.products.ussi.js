(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.ussi', []);

    var ReportingReportsUSSIModule = angular.module('adminportal.subsystems.reporting.reports.products.ussi');

    ReportingReportsUSSIModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.ussi', {
            abstract: true,
            url: "/ussi-service-center",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.USSI',
                onDemandState: 'subsystems.reporting.reports.products.ussi.report',
                scheduleState: 'subsystems.reporting.reports.products.ussi.schedule',
                permissions: [
                    'PRODUCTS_USC'
                ]
            },
            resolve: {
            }
        }).state('subsystems.reporting.reports.products.ussi.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsUSSICtrl'
        }).state('subsystems.reporting.reports.products.ussi.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsUSSIScheduleCtrl'
        });

    });

    ReportingReportsUSSIModule.controller('ReportingReportsUSSICtrl', function ($scope, $log, $controller, $filter, UtilService, Restangular, CMPFService ) {
        $log.debug("ReportingReportsUSSICtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        // USSIGW reports
        var USSIGW_General_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:USSIGW:USSIGW_General_Traffic_Report.prpt');
        var USSIGW_MAP_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:USSIGW:USSIGW_MAP_Traffic_Report.prpt');
        var USSIGW_SIP_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:USSIGW:USSIGW_SIP_Traffic_Report.prpt');
        var USSIGW_SIP_Traffic_by_Originator_CSCF_Report = UtilService.defineReportsAsDHM(':home:vcp:USSIGW:USSIGW_SIP_Traffic_by_Originator_CSCF_Report.prpt');
        var USSIGW_General_Error_Report = UtilService.defineReportsAsDHM(':home:vcp:USSIGW:USSIGW_General_Error_Report.prpt');
        var USSIGW_License_Report = UtilService.defineReportsAsDHM(':home:vcp:USSIGW:USSIGW_License_Report.prpt');
        var USSIGW_Delivery_Latency_Report = [
            {name: 'DAILY', url: ':home:vcp:USSIGW:USSIGW_Delivery_Latency_Report.prpt'}
        ];

        $scope.REPORTS = [
            {
                label: 'USSI Gateway General Traffic Report',
                intervals: USSIGW_General_Traffic_Report
            },
            {
                label: 'USSI Gateway MAP Traffic Report',
                intervals: USSIGW_MAP_Traffic_Report
            },
            {
                label: 'USSI Gateway SIP Traffic Report',
                intervals: USSIGW_SIP_Traffic_Report
            },
            {
                label: 'USSI Gateway SIP Traffic by Originator CSCF Report',
                intervals: USSIGW_SIP_Traffic_by_Originator_CSCF_Report
            },
            {
                label: 'USSI Gateway Delivery Latency Report',
                intervals: USSIGW_Delivery_Latency_Report
            },
            {
                label: 'USSI Gateway General Error Report',
                intervals: USSIGW_General_Error_Report
            },
            {
                label: 'USSI Gateway License Report',
                intervals: USSIGW_License_Report
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
        };
    });

    ReportingReportsUSSIModule.controller('ReportingReportsUSSIScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsUSSIScheduleCtrl");

        $controller('ReportingReportsUSSICtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
