(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.smsf', []);

    var ReportingReportsSMSFModule = angular.module('adminportal.subsystems.reporting.reports.products.smsf');

    ReportingReportsSMSFModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.smsf', {
            abstract: true,
            url: "/smsf",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                viewKey: 'SMSF',
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.SMSF',
                onDemandState: 'subsystems.reporting.reports.products.smsf.report',
                scheduleState: 'subsystems.reporting.reports.products.smsf.schedule'
            },
            resolve: {
            }
        }).state('subsystems.reporting.reports.products.smsf.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsSMSFCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_SMSF'
                ]
            }
        }).state('subsystems.reporting.reports.products.smsf.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsSMSFScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_SMSF'
                ]
            }
        });

    });

    ReportingReportsSMSFModule.controller('ReportingReportsSMSFCtrl', function ($scope, $log, $controller, $filter, UtilService, Restangular, CMPFService ) {
        $log.debug("ReportingReportsSMSFCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});


        // SMSF reports

        var SMSF_General_SMS_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_General_SMS_Traffic_Report.prpt');
        var SMSF_MO_SMS_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_MO_SMS_Traffic_Report.prpt');
        var SMSF_MO_SMS_Traffic_by_AMF_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_MO_SMS_Traffic_by_AMF_Report.prpt');
        var SMSF_MT_SMS_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_MT_SMS_Traffic_Report.prpt');
        var SMSF_MT_SMS_Traffic_by_AMF_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_MT_SMS_Traffic_by_AMF_Report.prpt');
        var SMSF_General_Delivery_Error_Report = [
            {name: 'DAILY', url: ':home:vcp:SMSF:SMSF_General_Delivery_Error_Report.prpt'}
        ];
        var SMSF_MO_SMS_Delivery_Error_Report = [
            {name: 'DAILY', url: ':home:vcp:SMSF:SMSF_MO_SMS_Delivery_Error_Report.prpt'}
        ];
        var SMSF_MT_SMS_Delivery_Error_Report = [
            {name: 'DAILY', url: ':home:vcp:SMSF:SMSF_MT_SMS_Delivery_Error_Report.prpt'}
        ];
        var SMSF_SM_Activate_Deactivate_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_SM_Activate_Deactivate_Report.prpt');
        var SMSF_SM_Activate_Error_Report = [
            {name: 'DAILY', url: ':home:vcp:SMSF:SMSF_SM_Activate_Error_Report.prpt'}
        ];
        var SMSF_SM_Deactivate_Error_Report = [
            {name: 'DAILY', url: ':home:vcp:SMSF:SMSF_SM_Deactivate_Error_Report.prpt'}
        ];
        var SMSF_Total_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_Total_Delivery_Report.prpt');
        var SMSF_MO_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_MO_Delivery_Report.prpt');
        var SMSF_MT_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_MT_Delivery_Report.prpt');
        var SMSF_Delivery_Latency_Report = [
            {name: 'DAILY', url: ':home:vcp:SMSF:SMSF_Delivery_Latency_Report.prpt'}
        ];
        var SMSF_NRF_Events_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_NRF_Events_Report.prpt');
        var SMSF_UDM_SDM_Events_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_UDM_SDM_Events_Report.prpt');
        var SMSF_UDM_UECM_Events_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_UDM_UECM_Events_Report.prpt');
        var SMSF_License_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSF:SMSF_License_Report.prpt');

        $scope.REPORTS = [
            {
                label: 'SMSF General SMS Traffic Report',
                intervals: SMSF_General_SMS_Traffic_Report
            },
            {
                label: 'SMSF MO SMS Traffic Report',
                intervals: SMSF_MO_SMS_Traffic_Report
            },
            {
                label: 'SMSF MO SMS Traffic By AMF ID',
                intervals: SMSF_MO_SMS_Traffic_by_AMF_Report
            },
            {
                label: 'SMSF MT SMS Traffic Report',
                intervals: SMSF_MT_SMS_Traffic_Report
            },
            {
                label: 'SMSF MT SMS Traffic By AMF ID',
                intervals: SMSF_MT_SMS_Traffic_by_AMF_Report
            },
            {
                label: 'SMSF General Delivery Error Report',
                intervals: SMSF_General_Delivery_Error_Report
            },
            {
                label: 'SMSF MO SMS Delivery Error Report',
                intervals: SMSF_MO_SMS_Delivery_Error_Report
            },
            {
                label: 'SMSF MT SMS Delivery Error Report',
                intervals: SMSF_MT_SMS_Delivery_Error_Report
            },
            {
                label: 'SMSF SM Activate Deactivate Report',
                intervals: SMSF_SM_Activate_Deactivate_Report
            },
            {
                label: 'SMSF SM Activate Error Report',
                intervals: SMSF_SM_Activate_Error_Report
            },
            {
                label: 'SMSF SM Deactivate Error Report',
                intervals: SMSF_SM_Deactivate_Error_Report
            },
            {
                label: 'SMSF Total Delivery Report',
                intervals: SMSF_Total_Delivery_Report
            },
            {
                label: 'SMSF MO Delivery Report',
                intervals: SMSF_MO_Delivery_Report
            },
            {
                label: 'SMSF MT Delivery Report',
                intervals: SMSF_MT_Delivery_Report
            },
            {
                label: 'SMSF Delivery Latency Report Daily',
                intervals: SMSF_Delivery_Latency_Report
            },
            {
                label: 'SMSF NRF Events Report',
                intervals: SMSF_NRF_Events_Report
            },
            {
                label: 'SMSF UDM SDM Events Report',
                intervals: SMSF_UDM_SDM_Events_Report
            },
            {
                label: 'SMSF UDM UECM Events Report',
                intervals: SMSF_UDM_UECM_Events_Report
            },
            {
                label: 'SMSF License Report',
                intervals: SMSF_License_Report
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
        };
    });

    ReportingReportsSMSFModule.controller('ReportingReportsSMSFScheduleCtrl', function ($scope, $log, $controller) {
        $log.debug("ReportingReportsSMSFScheduleCtrl");

        $controller('ReportingReportsSMSFCtrl', {
            $scope: $scope
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
