(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.services.pokecall', []);

    var ReportingReportsPokeCallModule = angular.module('adminportal.subsystems.reporting.reports.services.pokecall');

    ReportingReportsPokeCallModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.services.pokecall', {
            abstract: true,
            url: "/poke-call",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ServiceReports.PokeCall',
                onDemandState: 'subsystems.reporting.reports.services.pokecall.report',
                scheduleState: 'subsystems.reporting.reports.services.pokecall.schedule',
                permissions: [
                    'SERVICES_PC'
                ]
            },
            resolve: {}
        }).state('subsystems.reporting.reports.services.pokecall.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsPokeCallCtrl'
        }).state('subsystems.reporting.reports.services.pokecall.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsPokeCallScheduleCtrl'
        });

    });

    ReportingReportsPokeCallModule.controller('ReportingReportsPokeCallCtrl', function ($scope, $log, $controller, $filter, UtilService) {
        $log.debug("ReportingReportsPokeCallCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var PC_Overview_Report = UtilService.defineReportsAsDHM(':home:vcp:PokeCall:PC_Overview_Report.prpt');
        var PC_Failure_Report = [
            {name: 'ALL', url: ':home:vcp:PokeCall:PC_Failure_Report.prpt'}
        ];

        $scope.REPORTS = [
            {
                label: 'Poke Call Overview Report',
                intervals: PC_Overview_Report
            },
            {
                label: 'Poke Call Failure Report',
                intervals: PC_Failure_Report
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
    });

    ReportingReportsPokeCallModule.controller('ReportingReportsPokeCallScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsPokeCallScheduleCtrl");

        $controller('ReportingReportsPokeCallCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
