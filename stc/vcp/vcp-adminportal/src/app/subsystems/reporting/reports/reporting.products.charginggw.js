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
                viewKey: 'CHGW',
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
                    'REPORTS_ONDEMAND_CHGW'
                ]
            }
        }).state('subsystems.reporting.reports.products.charginggw.schedule', {
            url: "/charging-gateway/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsChargingGwScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_CHGW'
                ]
            }
        });

    });

    ReportingReportsChargingGwModule.controller('ReportingReportsChargingGwCtrl', function ($scope, $log, $controller, $filter, Restangular, CMPFService, UtilService) {
        $log.debug("ReportingReportsChargingGwCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        // Traffic
        var ChargingGW_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:vcp:ChargingGW:ChargingGW_Traffic_Summary_Report.prpt');
        var ChargingGW_Traffic_Details_By_Organization_Report = UtilService.defineReportsAsDHM(':home:vcp:ChargingGW:ChargingGW_Traffic_Details_By_Organization_Report.prpt');
        var ChargingGW_Traffic_Details_By_Service_Report = UtilService.defineReportsAsDHM(':home:vcp:ChargingGW:ChargingGW_Traffic_Details_By_Service_Report.prpt');
        var ChargingGW_Traffic_Details_By_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:ChargingGW:ChargingGW_Traffic_Details_By_Period_Report.prpt');
        // Error
        var ChargingGW_Error_Report = UtilService.defineReportsAsDHM(':home:vcp:ChargingGW:ChargingGW_Error_Report.prpt');

        $scope.REPORTS = [
            // Traffic
            {
                label: 'Charging Gateway Traffic Summary Report',
                intervals: ChargingGW_Traffic_Summary_Report
            },
            {
                label: 'Charging Gateway Traffic Details By Organization Report',
                intervals: ChargingGW_Traffic_Details_By_Organization_Report
            },
            {
                label: 'Charging Gateway Traffic Details By Service Report',
                intervals: ChargingGW_Traffic_Details_By_Service_Report
            },
            {
                label: 'Charging Gateway Traffic Details By Period Report',
                intervals: ChargingGW_Traffic_Details_By_Period_Report
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

        var checkDateRange = function (dateFieldName) {
            var start = moment($scope.dateHolder.startDate);
            var end = moment($scope.dateHolder.endDate);
            var duration = moment.duration(end.diff(start));

            UtilService.setError($scope.form, 'startDate', 'hourlyReport5DailyIntervalError', true);
            UtilService.setError($scope.form, 'startDate', 'dailyReportMonthlyIntervalError', true);
            UtilService.setError($scope.form, 'startDate', 'monthlyReport6MonthlyIntervalError', true);

            UtilService.setError($scope.form, 'endDate', 'hourlyReport5DailyIntervalError', true);
            UtilService.setError($scope.form, 'endDate', 'dailyReportMonthlyIntervalError', true);
            UtilService.setError($scope.form, 'endDate', 'monthlyReport6MonthlyIntervalError', true);

            if ($scope.interval.reportType == 'Hourly' && duration.asDays() > 5) {
                UtilService.setError($scope.form, dateFieldName, 'hourlyReport5DailyIntervalError', false);
            } else if ($scope.interval.reportType == 'Daily' && duration.asMonths() > 2) {
                UtilService.setError($scope.form, dateFieldName, 'dailyReportMonthlyIntervalError', false);
            } else if ($scope.interval.reportType == 'Monthly' && duration.asMonths() > 6) {
                UtilService.setError($scope.form, dateFieldName, 'monthlyReport6MonthlyIntervalError', false);
            }
        };

        $scope.$watch('interval', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                checkDateRange('startDate');
            }
        });

        $scope.$watch('dateHolder.startDate', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                checkDateRange('startDate');
            }
        });

        $scope.$watch('dateHolder.endDate', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                checkDateRange('endDate');
            }
        });

    });

    ReportingReportsChargingGwModule.controller('ReportingReportsChargingGwScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsChargingGwScheduleCtrl");

        $controller('ReportingReportsChargingGwCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
