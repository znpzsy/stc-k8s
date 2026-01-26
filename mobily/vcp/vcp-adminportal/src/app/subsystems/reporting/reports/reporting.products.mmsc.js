(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.mmsc', []);

    var ReportingReportsMMSCModule = angular.module('adminportal.subsystems.reporting.reports.products.mmsc');

    ReportingReportsMMSCModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.mmsc', {
            abstract: true,
            url: "/mmsc",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.MMSC',
                onDemandState: 'subsystems.reporting.reports.products.mmsc.report',
                scheduleState: 'subsystems.reporting.reports.products.mmsc.schedule',
                permissions: [
                    'PRODUCTS_MMSC'
                ]
            },
            resolve: {
                operatorsThresholds: function (MmscOperationService) {
                    return MmscOperationService.getAllTrafficControlMm4Thresholds();
                },
                vasApplications: function (MmscOperationService) {
                    return MmscOperationService.getOrderedVasApplicationList();
                }
            }
        }).state('subsystems.reporting.reports.products.mmsc.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsMMSCCtrl'
        }).state('subsystems.reporting.reports.products.mmsc.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsMMSCScheduleCtrl'
        });

    });

    ReportingReportsMMSCModule.controller('ReportingReportsMMSCCtrl', function ($scope, $log, $controller, $filter, UtilService, Restangular, CMPFService,
                                                                                operatorsThresholds, vasApplications) {
        $log.debug("ReportingReportsMMSCCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var mm4OperatorList = operatorsThresholds.list;
        $scope.mm4OperatorList = $filter('orderBy')(mm4OperatorList, ['name']);

        var mm7VasList = vasApplications.vasList;
        _.each(mm7VasList, function (vasApplication) {
            vasApplication.label = vasApplication.label + ' (' + vasApplication.shortCode + ')';
        });
        $scope.mm7VasList = $filter('orderBy')(mm7VasList, ['label']);

        var MMSC_MM1_Incoming_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM1_Incoming_Traffic_Report.prpt');
        var MMSC_MM1_Outgoing_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM1_Outgoing_Traffic_Report.prpt');

        var MMSC_MM3_Incoming_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM3_Incoming_Traffic_Report.prpt');
        var MMSC_MM3_Outgoing_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM3_Outgoing_Traffic_Report.prpt');

        var MMSC_MM4_Incoming_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Incoming_Traffic_Report.prpt');
        var MMSC_MM4_Incoming_Traffic_by_Operator_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Incoming_Traffic_by_Operator_Report.prpt');
        var MMSC_MM4_Outgoing_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Outgoing_Traffic_Report.prpt');
        var MMSC_MM4_Outgoing_Traffic_by_Operator_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Outgoing_Traffic_by_Operator_Report.prpt');

        var MMSC_MM5_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM5_Traffic_Report.prpt');

        var MMSC_MM7_Incoming_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM7_Incoming_Traffic_Report.prpt');
        var MMSC_MM7_Outgoing_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM7_Outgoing_Traffic_Report.prpt');

        $scope.REPORTS = [
            // MM1
            {
                label: 'MMS Center MM1 Incoming Traffic Report',
                intervals: MMSC_MM1_Incoming_Traffic_Report
            },
            {
                label: 'MMS Center MM1 Outgoing Traffic Report',
                intervals: MMSC_MM1_Outgoing_Traffic_Report
            },
            // MM3
            {
                label: 'MMS Center MM3 Outgoing Traffic Report',
                intervals: MMSC_MM3_Outgoing_Traffic_Report
            },
            // MM4
            {
                label: 'MMS Center MM4 Incoming Traffic Report',
                intervals: MMSC_MM4_Incoming_Traffic_Report
            },
            {
                label: 'MMS Center MM4 Incoming Traffic by Operator Report',
                intervals: MMSC_MM4_Incoming_Traffic_by_Operator_Report,
                additionalFields: ['operator']
            },
            {
                label: 'MMS Center MM4 Outgoing Traffic Report',
                intervals: MMSC_MM4_Outgoing_Traffic_Report
            },
            {
                label: 'MMS Center MM4 Outgoing Traffic by Operator Report',
                intervals: MMSC_MM4_Outgoing_Traffic_by_Operator_Report,
                additionalFields: ['operator']
            },
            // MM7
            {
                label: 'MMS Center MM7 Incoming Traffic Report',
                intervals: MMSC_MM7_Incoming_Traffic_Report
            },
            {
                label: 'MMS Center MM7 Outgoing Traffic Report',
                intervals: MMSC_MM7_Outgoing_Traffic_Report
            }
        ];
        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            operator: null,
            vas: null
        };
    });

    ReportingReportsMMSCModule.controller('ReportingReportsMMSCScheduleCtrl', function ($scope, $log, $controller, operatorsThresholds, vasApplications) {
        $log.debug("ReportingReportsMMSCScheduleCtrl");

        $controller('ReportingReportsMMSCCtrl', {
            $scope: $scope,
            operatorsThresholds: operatorsThresholds,
            vasApplications: vasApplications
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
