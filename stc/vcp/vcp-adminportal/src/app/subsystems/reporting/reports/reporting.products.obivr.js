(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.obivr', []);

    var ReportingReportsOBIVRModule = angular.module('adminportal.subsystems.reporting.reports.products.obivr');

    ReportingReportsOBIVRModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.obivr', {
            abstract: true,
            url: "/ob-ivr",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                viewKey: 'OIVR',
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.OBIVR',
                onDemandState: 'subsystems.reporting.reports.products.obivr.report',
                scheduleState: 'subsystems.reporting.reports.products.obivr.schedule'
            },
            resolve: {
                clients: function (OIVRConfService) {
                    return OIVRConfService.getAllClients();
                }
            }
        }).state('subsystems.reporting.reports.products.obivr.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsOBIVRCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_OIVR'
                ]
            }
        }).state('subsystems.reporting.reports.products.obivr.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsOBIVRScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_OIVR'
                ]
            }
        });

    });

    ReportingReportsOBIVRModule.controller('ReportingReportsOBIVRCtrl', function ($scope, $log, $controller, $filter, UtilService, clients, REPORTING_OBIVR_CALL_FLOWS) {
        $log.debug("ReportingReportsOBIVRCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.REPORTING_OBIVR_CALL_FLOWS = REPORTING_OBIVR_CALL_FLOWS;
        $scope.clientList = clients;

        // General Reports
        var OIVR_CallFlow_Report = UtilService.defineReportsAsDHM(':home:vcp:OIVR:OIVR_CallFlow_Report.prpt');

        $scope.REPORTS = [
            // General Reports
            {group: 'General Reports', label: 'Outbound IVR Call Flow Report', intervals: OIVR_CallFlow_Report, additionalFields: ['callFlow', 'clientId']},

        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            callFlow: null,
            clientId: null
        };
    });

    ReportingReportsOBIVRModule.controller('ReportingReportsOBIVRScheduleCtrl', function ($scope, $log, $controller, clients) {
        $log.debug("ReportingReportsOBIVRScheduleCtrl");

        $controller('ReportingReportsOBIVRCtrl', {
            $scope: $scope,
            clients: clients
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
