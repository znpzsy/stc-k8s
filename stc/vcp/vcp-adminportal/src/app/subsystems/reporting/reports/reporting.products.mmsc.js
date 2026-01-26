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
                viewKey: 'MMSC',
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.MMSC',
                onDemandState: 'subsystems.reporting.reports.products.mmsc.report',
                scheduleState: 'subsystems.reporting.reports.products.mmsc.schedule'
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
            controller: 'ReportingReportsMMSCCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_MMSC'

                ]
            }
        }).state('subsystems.reporting.reports.products.mmsc.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsMMSCScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_MMSC'
                ]
            }
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

        // General
        var MMSC_General_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_General_Traffic_Report.prpt');

        // MM1 - MMSC User Agent Reports
        var MMSC_MM1_Incoming_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM1_Incoming_Traffic_Report.prpt');
        var MMSC_MM1_Outgoing_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM1_Outgoing_Traffic_Report.prpt');
        var MMSC_MM1_Content_Type_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM1_Content_Type_Report.prpt');
        var MMSC_MM1_Message_Size_Categories_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM1_Message_Size_Categories_Report.prpt');

        // MM3 - MMSC External Server Reports
        var MMSC_MM3_Outgoing_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM3_Outgoing_Traffic_Report.prpt');

        // MM4 - MMSC Interconnect Agents Reports
        var MMSC_MM4_Incoming_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Incoming_Traffic_Report.prpt');
        var MMSC_MM4_Incoming_Traffic_by_Operator_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Incoming_Traffic_by_Operator_Report.prpt');
        var MMSC_MM4_Incoming_Content_Type_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Incoming_Content_Type_Report.prpt');
        var MMSC_MM4_Incoming_Message_Size_Categories_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Incoming_Message_Size_Categories_Report.prpt');

        var MMSC_MM4_Outgoing_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Outgoing_Traffic_Report.prpt');
        var MMSC_MM4_Outgoing_Traffic_by_Operator_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Outgoing_Traffic_by_Operator_Report.prpt');
        var MMSC_MM4_Outgoing_Content_Type_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Outgoing_Content_Type_Report.prpt');
        var MMSC_MM4_Outgoing_Message_Size_Categories_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM4_Outgoing_Message_Size_Categories_Report.prpt');
        // MM5 - MMSC MAP Interface Reports
        var MMSC_MM5_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM5_Traffic_Report.prpt');

        // MM7 - MMSC Application Reports
        var MMSC_MM7_Incoming_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM7_Incoming_Traffic_Report.prpt');
        var MMSC_MM7_Outgoing_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM7_Outgoing_Traffic_Report.prpt');
        var MMSC_MM7_Incoming_Traffic_by_VAS_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM7_Incoming_Traffic_by_VAS_Report.prpt');
        var MMSC_MM7_Outgoing_Traffic_by_VAS_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM7_Outgoing_Traffic_by_VAS_Report.prpt');
        var MMSC_MM7_Message_Size_Categories_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM7_Message_Size_Categories_Report.prpt');
        var MMSC_MM7_Content_Type_Report = UtilService.defineReportsAsDHM(':home:vcp:MMSC:MMSC_MM7_Content_Type_Report.prpt');

        $scope.REPORTS = [
            // General
            {
                group: 'General Reports',
                label: 'MMS Center General Traffic Report',
                intervals: MMSC_General_Traffic_Report
            },
            // MM1 - MMSC User Agent Reports
            {
                group: 'MMSC User Agent Reports',
                label: 'MMS Center MM1 Incoming Traffic Report',
                intervals: MMSC_MM1_Incoming_Traffic_Report
            },
            {
                group: 'MMSC User Agent Reports',
                label: 'MMS Center MM1 Outgoing Traffic Report',
                intervals: MMSC_MM1_Outgoing_Traffic_Report
            },
            {
                group: 'MMSC User Agent Reports',
                label: 'MMS Center MM1 Content Type Report',
                intervals: MMSC_MM1_Content_Type_Report
            },
            {
                group: 'MMSC User Agent Reports',
                label: 'MMS Center MM1 Message Size Categories Report',
                intervals: MMSC_MM1_Message_Size_Categories_Report
            },
            // MM3 - MMSC External Server Reports
            {
                group: 'MMSC External Server Reports',
                label: 'MMS Center MM3 Outgoing Traffic Report',
                intervals: MMSC_MM3_Outgoing_Traffic_Report
            },
            // MM4 - MMSC Interconnect Agents Reports
            {
                group: 'MMSC Interconnect Agents Reports',
                label: 'MMS Center MM4 Incoming Traffic Report',
                intervals: MMSC_MM4_Incoming_Traffic_Report
            },
            {
                group: 'MMSC Interconnect Agents Reports',
                label: 'MMS Center MM4 Incoming Traffic by Operator Report',
                intervals: MMSC_MM4_Incoming_Traffic_by_Operator_Report,
                additionalFields: ['operator']
            },
            {
                group: 'MMSC Interconnect Agents Reports',
                label: 'MMS Center MM4 Incoming Traffic Content Type Report',
                intervals: MMSC_MM4_Incoming_Content_Type_Report,
            },
            {
                group: 'MMSC Interconnect Agents Reports',
                label: 'MMS Center MM4 Incoming Message Size Categories Report',
                intervals: MMSC_MM4_Incoming_Message_Size_Categories_Report,
            },
            {
                group: 'MMSC Interconnect Agents Reports',
                label: 'MMS Center MM4 Outgoing Traffic Report',
                intervals: MMSC_MM4_Outgoing_Traffic_Report
            },
            {
                group: 'MMSC Interconnect Agents Reports',
                label: 'MMS Center MM4 Outgoing Traffic by Operator Report',
                intervals: MMSC_MM4_Outgoing_Traffic_by_Operator_Report,
                additionalFields: ['operator']
            },
            {
                group: 'MMSC Interconnect Agents Reports',
                label: 'MMS Center MM4 Outgoing Traffic Content Type Report',
                intervals: MMSC_MM4_Outgoing_Content_Type_Report,
            },
            {
                group: 'MMSC Interconnect Agents Reports',
                label: 'MMS Center MM4 Outgoing Message Size Categories Report',
                intervals: MMSC_MM4_Outgoing_Message_Size_Categories_Report,
            },
            // MM5 - MMSC MAP Interface Reports
            {
                group: 'MMSC MAP Interface Reports',
                label: 'MMS Center MM5 Traffic Report',
                intervals: MMSC_MM5_Traffic_Report
            },
            // MM7 - MMSC Application Reports
            {
                group: 'MMSC Application Reports',
                label: 'MMS Center MM7 Incoming Traffic Report',
                intervals: MMSC_MM7_Incoming_Traffic_Report
            },
            {
                group: 'MMSC Application Reports',
                label: 'MMS Center MM7 Outgoing Traffic Report',
                intervals: MMSC_MM7_Outgoing_Traffic_Report
            },
            {
                group: 'MMSC Application Reports',
                label: 'MMS Center MM7 Incoming Traffic By VAS Report',
                intervals: MMSC_MM7_Incoming_Traffic_by_VAS_Report
            },
            {
                group: 'MMSC Application Reports',
                label: 'MMS Center MM7 Outgoing Traffic By VAS Report',
                intervals: MMSC_MM7_Outgoing_Traffic_by_VAS_Report
            },
            {
                group: 'MMSC Application Reports',
                label: 'MMS Center MM7 Message Size Categories Report',
                intervals: MMSC_MM7_Message_Size_Categories_Report
            },
            {
                group: 'MMSC Application Reports',
                label: 'MMS Center MM7 Content Type Report',
                intervals: MMSC_MM7_Content_Type_Report
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
