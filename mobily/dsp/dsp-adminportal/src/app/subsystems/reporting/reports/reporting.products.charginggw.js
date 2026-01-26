(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.charginggw', []);

    var ReportingReportsChargingGwModule = angular.module('adminportal.subsystems.reporting.reports.products.charginggw');

    ReportingReportsChargingGwModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.charginggw', {
            abstract: true,
            url: "/charging-gateway",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.ChargingGw',
                onDemandState: 'subsystems.reporting.reports.products.charginggw.report',
                scheduleState: 'subsystems.reporting.reports.products.charginggw.schedule'
            }
        }).state('subsystems.reporting.reports.products.charginggw.report', {
            url: "",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsChargingGwCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_ONDEMAND_READ'
                ]
            }
        }).state('subsystems.reporting.reports.products.charginggw.schedule', {
            url: "/charging-gateway/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsChargingGwScheduleCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_SCHEDULED_READ'
                ]
            }
        });

    });

    ReportingReportsChargingGwModule.controller('ReportingReportsChargingGwCtrl', function ($scope, $log, $controller, $filter, Restangular, CMPFService, UtilService) {
        $log.debug("ReportingReportsChargingGwCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        // Traffic
        var ChargingGW_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:ChargingGW:ChargingGW_Traffic_Summary_Report.prpt');
        // Error
        var ChargingGW_Error_Report = UtilService.defineReportsAsDHM(':home:csp:ChargingGW:ChargingGW_Error_Report.prpt');

        $scope.REPORTS = [
            // Traffic
            {
                label: 'Charging Gateway Traffic Summary Report',
                intervals: ChargingGW_Traffic_Summary_Report
            },
            // Error
            {
                label: 'Charging Gateway Error Report',
                intervals: ChargingGW_Error_Report
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {};
    });

    ReportingReportsChargingGwModule.controller('ReportingReportsChargingGwScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsChargingGwScheduleCtrl");

        $controller('ReportingReportsChargingGwCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
