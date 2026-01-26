(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.workflows.audit', []);

    var ReportingWorkflowsAuditModule = angular.module('adminportal.subsystems.reporting.reports.workflows.audit');

    ReportingWorkflowsAuditModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.workflows.audit', {
            abstract: true,
            url: "/audit",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                onDemandState: 'subsystems.reporting.reports.workflows.audit.report',
                scheduleState: 'subsystems.reporting.reports.workflows.audit.schedule'
            },
            resolve: {}
        }).state('subsystems.reporting.reports.workflows.audit.report', {
            url: "",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingWorkflowsAuditCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_ONDEMAND_READ'
                ]
            }
        }).state('subsystems.reporting.reports.workflows.audit.schedule', {
            url: "/revenue-management/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingWorkflowsAuditScheduleCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_SCHEDULED_READ'
                ]
            }
        });

    });

    ReportingWorkflowsAuditModule.controller('ReportingWorkflowsAuditCtrl', function ($scope, $log, $controller, $filter, $timeout, Restangular, CMPFService, UtilService) {
        $log.debug("ReportingWorkflowsAuditCtrl");

        var DSP_Summary_Statistics_Report = [
            {
                name: 'DAILY',
                url: ':home:csp:Audit:DSP_Summary_Statistics_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var DSP_Partner_Statistics_Report = [
            {
                name: 'DAILY_SPECIAL',
                url: ':home:csp:Audit:DSP_Partner_Statistics_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var DSP_Resource_Statistics_Report = [
            {
                name: 'DAILY_SPECIAL',
                url: ':home:csp:Audit:DSP_Resource_Statistics_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var DSP_Service_Statistics_Report = [
            {
                name: 'DAILY_SPECIAL',
                url: ':home:csp:Audit:DSP_Service_Statistics_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var DSP_Service_Details_Report = [
            {
                name: 'DAILY_SPECIAL',
                url: ':home:csp:Audit:DSP_Service_Details_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var DSP_Reconciliation_Statistics_Report = [
            {
                name: 'DAILY_SPECIAL',
                url: ':home:csp:Audit:DSP_Reconciliation_Statistics_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var DSP_Revenue_Statistics_by_ServiceType_Lengthwise_Report = [
            {
                name: 'DAILY',
                url: ':home:csp:Audit:DSP_Revenue_Statistics_by_ServiceType_Lengthwise_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var DSP_Revenue_Statistics_by_ServiceType_Widthwise_Report = [
            {
                name: 'DAILY',
                url: ':home:csp:Audit:DSP_Revenue_Statistics_by_ServiceType_Widthwise_Report.prpt',
                reportType: 'Daily'
            }
        ];

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var WITHOUT_PDF_FORMATS_PENTAHO = _.without($scope.FORMATS_PENTAHO, _.findWhere($scope.FORMATS_PENTAHO, {name: 'PDF'}));
        var WITHOUT_HTML_PDF_FORMATS_PENTAHO = _.without(WITHOUT_PDF_FORMATS_PENTAHO, _.findWhere(WITHOUT_PDF_FORMATS_PENTAHO, {name: 'HTML'}));

        $scope.REPORTS = [
            {
                label: 'Summary Statistics Report',
                intervals: DSP_Summary_Statistics_Report
            },
            {
                label: 'Partner Statistics Report',
                intervals: DSP_Partner_Statistics_Report
            },
            {
                label: 'Resource Statistics Report',
                intervals: DSP_Resource_Statistics_Report
            },
            {
                label: 'Service Statistics Report',
                intervals: DSP_Service_Statistics_Report
            },
            {
                label: 'Service Details Report',
                intervals: DSP_Service_Details_Report,
                reportFormats: WITHOUT_PDF_FORMATS_PENTAHO,
                reportScheduleFormats: WITHOUT_HTML_PDF_FORMATS_PENTAHO
            },
            {
                label: 'Reconciliation Statistics Report',
                intervals: DSP_Reconciliation_Statistics_Report
            },
            {
                label: 'Revenue Statistics by Service Type Lengthwise Report',
                intervals: DSP_Revenue_Statistics_by_ServiceType_Lengthwise_Report
            },
            {
                label: 'Revenue Statistics by Service Type Widthwise Report',
                intervals: DSP_Revenue_Statistics_by_ServiceType_Widthwise_Report
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.permanentParams = {};
        $scope.additionalParams = {};
    });

    ReportingWorkflowsAuditModule.controller('ReportingWorkflowsAuditScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingWorkflowsAuditScheduleCtrl");

        $controller('ReportingWorkflowsAuditCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
