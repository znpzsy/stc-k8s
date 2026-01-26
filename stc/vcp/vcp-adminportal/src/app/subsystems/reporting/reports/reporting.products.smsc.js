(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.smsc', []);

    var ReportingReportsSMSCModule = angular.module('adminportal.subsystems.reporting.reports.products.smsc');

    ReportingReportsSMSCModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.smsc', {
            abstract: true,
            url: "/smsc",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                viewKey: 'SMSC',
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.SMSC',
                onDemandState: 'subsystems.reporting.reports.products.smsc.report',
                scheduleState: 'subsystems.reporting.reports.products.smsc.schedule'
            },
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByType(0, DEFAULT_REST_QUERY_LIMIT, 'NetworkOperator,Partner');
                }
            }
        }).state('subsystems.reporting.reports.products.smsc.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsSMSCCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_SMSC'
                ]
            }
        }).state('subsystems.reporting.reports.products.smsc.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsSMSCScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_SMSC'
                ]
            }
        });

    });

    ReportingReportsSMSCModule.controller('ReportingReportsSMSCCtrl', function ($scope, $log, $controller, $filter, UtilService, Restangular, CMPFService,
                                                                                smppApplications, organizations, DESTINATION_NETWORKS) {
        $log.debug("ReportingReportsSMSCCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['orgType', 'name']);
        // Initialize application list by taking organization and application names.
        $scope.smppApplicationList = _.filter(smppApplicationList, function (smppApplication) {
            smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

            // Preparing the uib-dropdown content ad "<organization name> - <application name>"
            smppApplication.label = (smppApplication.organization ? smppApplication.organization.name + ' - ' : '') + smppApplication.name;

            $log.debug("Found SMPP Application: ", smppApplication, ", Organization: ", smppApplication.organization);

            return true;
        });
        $scope.smppApplicationList = $filter('orderBy')($scope.smppApplicationList, ['organization.name', 'name']);

        $scope.DESTINATION_NETWORKS = DESTINATION_NETWORKS;
        $scope.destinationNetwork = {
            selected: $scope.DESTINATION_NETWORKS[0]
        };

        // general reports
        var SMSC_General_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:general:SMSC_General_Traffic_Report.prpt');
        var SMSC_General_Delivery_Errors_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:general:SMSC_General_Delivery_Errors_Report.prpt'
        }];

        // delivery reports
        var SMSC_Total_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_Total_Delivery_Report.prpt');
        var SMSC_P2P_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_P2P_Delivery_Report.prpt');
        var SMSC_P2A_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_P2A_Delivery_Report.prpt');
        var SMSC_A2P_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_A2P_Delivery_Report.prpt');
        var SMSC_Delivery_Latency_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_Delivery_Latency_Report.prpt');
        var SMSC_Delivery_Latency_by_Destination_Network_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_Delivery_Latency_by_Destination_Network_Report.prpt');
        var SMSC_Delivery_Errors_by_App_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_Delivery_Errors_by_App_Report.prpt');


        // Delivery status reports
        var SMSC_Mobile_Delivery_Status_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:ds:SMSC_Mobile_Delivery_Status_Report.prpt');
        var SMSC_Application_Delivery_Status_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:ds:SMSC_Application_Delivery_Status_Report.prpt');
        var SMSC_Delivery_Status_by_App_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:ds:SMSC_Delivery_Status_by_App_Report.prpt');
        // gsm reports
        var SMSC_MT_Delivery_Peak_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MT_Delivery_Peak_Traffic_Report.prpt');
        var SMSC_MT_Delivery_Attempts_by_Subscriber_Status_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MT_Delivery_Attempts_by_Subscriber_Status_Report.prpt');
        var SMSC_MT_Delivery_Attempts_by_Destination_Network_Summary_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:gsm:SMSC_MT_Delivery_Attempts_by_Destination_Network_Summary_Report.prpt'
        }];
        var SMSC_MT_Delivery_Attempts_by_Destination_Network_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MT_Delivery_Attempts_by_Destination_Network_Report.prpt');

        var SMSC_MT_Delivery_Errors_by_Destination_Network_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:gsm:SMSC_MT_Delivery_Errors_by_Destination_Network_Report.prpt'
        }];
        var SMSC_MO_Submit_Peak_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MO_Submit_Peak_Traffic_Report.prpt');
        var SMSC_MO_Submit_Requests_by_Originator_MSC_Summary_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:gsm:SMSC_MO_Submit_Requests_by_Originator_MSC_Summary_Report.prpt'
        }];
        var SMSC_MO_Submit_Errors_Report = [{name: 'ALL', url: ':home:vcp:SMSC:gsm:SMSC_MO_Submit_Errors_Report.prpt'}];
        var SMSC_MO_Submit_Errors_by_Originator_MSC_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:gsm:SMSC_MO_Submit_Errors_by_Originator_MSC_Report.prpt'
        }];

        var SMSC_P2P_Own_Direct_SS7_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_P2P_Own_Direct_SS7_Report.prpt');
        var SMSC_P2P_Own_HUB_GSM_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_P2P_Own_HUB_GSM_Report.prpt');
        var SMSC_P2P_Own_HUB_SMPP_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_P2P_Own_HUB_SMPP_Report.prpt');
        var SMSC_P2P_Other_Direct_SS7_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_P2P_Other_Direct_SS7_Report.prpt');
        var SMSC_P2P_Other_HUB_GSM_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_P2P_Other_HUB_GSM_Report.prpt');
        var SMSC_P2P_Other_HUB_SMPP_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_P2P_Other_HUB_SMPP_Report.prpt');
        var SMSC_A2P_Own_Direct_SS7_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_A2P_Own_Direct_SS7_Report.prpt');
        var SMSC_A2P_Own_HUB_GSM_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_A2P_Own_HUB_GSM_Report.prpt');
        var SMSC_A2P_Own_HUB_SMPP_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_A2P_Own_HUB_SMPP_Report.prpt');
        var SMSC_A2P_Other_Direct_SS7_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_A2P_Other_Direct_SS7_Report.prpt');
        var SMSC_A2P_Other_HUB_GSM_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_A2P_Other_HUB_GSM_Report.prpt');
        var SMSC_A2P_Other_HUB_SMPP_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_A2P_Other_HUB_SMPP_Report.prpt');
        var SMSC_Total_HUB_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_Total_HUB_Report.prpt');
        var SMSC_HUB_to_HUB_Transit_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_H2H_SMPP_Transit_Report.prpt');

        var SMSC_Virgin_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_Virgin_Report.prpt');
        var SMSC_International_to_STC_Error_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:hub:SMSC_International_to_STC_Error_Report.prpt'
        }];
        var SMSC_Large_Account_to_International_Traffic_Error_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:hub:SMSC_Large_Account_to_International_Traffic_Error_Report.prpt'
        }];
        var SMSC_International_to_Large_Account_Traffic_Error_Report =[{
            name: 'ALL',
            url: ':home:vcp:SMSC:hub:SMSC_International_to_Large_Account_Traffic_Error_Report.prpt'
        }];
        var SMSC_OrigSTC_to_International_Error_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:hub:SMSC_OrigSTC_to_International_Error_Report.prpt'
        }];
        var SMSC_International_Outgoing_Traffic_by_ShortCode_Report =  UtilService.defineReportsAsDHM(':home:vcp:SMSC:hub:SMSC_International_Outgoing_Traffic_by_ShortCode_Report.prpt');

        // smpp reports
        var SMSC_Traffic_by_ASP_Summary_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:smpp:SMSC_Traffic_by_ASP_Summary_Report.prpt'
        }];
        var SMSC_P2A_Peak_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_P2A_Peak_Traffic_Report.prpt');
        var SMSC_P2A_Traffic_by_ASP_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_P2A_Traffic_by_ASP_Report.prpt');
        var SMSC_P2A_Traffic_by_App_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_P2A_Traffic_by_App_Report.prpt');

        var SMSC_P2A_Traffic_by_App_and_ShortCode_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_P2A_Traffic_by_App_and_ShortCode_Report.prpt');

        var SMSC_P2A_Traffic_Errors_by_App_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:smpp:SMSC_P2A_Traffic_Errors_by_App_Report.prpt'
        }];
        var SMSC_A2P_Peak_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_A2P_Peak_Traffic_Report.prpt');
        var SMSC_A2P_Traffic_by_ASP_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_A2P_Traffic_by_ASP_Report.prpt');
        var SMSC_A2P_Traffic_by_App_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_A2P_Traffic_by_App_Report.prpt');
        var SMSC_A2P_Traffic_by_App_and_ShortCode_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_A2P_Traffic_by_App_and_ShortCode_Report.prpt');
        var SMSC_A2P_Traffic_Errors_by_App_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:smpp:SMSC_A2P_Traffic_Errors_by_App_Report.prpt'
        }];

        $scope.ORIGINAL_REPORTS = [
            // general reports
            {
                group: 'General Reports',
                label: 'SMSC General Traffic Report',
                intervals: SMSC_General_Traffic_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'General Reports',
                label: 'SMSC General Delivery Errors Report',
                intervals: SMSC_General_Delivery_Errors_Report,
                additionalFields: ['hosts']
            },
            // custom reports
            {
                group: 'Delivery Reports',
                label: 'SMSC Total Delivery Report',
                intervals: SMSC_Total_Delivery_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'Delivery Reports',
                label: 'SMSC P2P Delivery Report',
                intervals: SMSC_P2P_Delivery_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'Delivery Reports',
                label: 'SMSC P2A Delivery Report',
                intervals: SMSC_P2A_Delivery_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'Delivery Reports',
                label: 'SMSC A2P Delivery Report',
                intervals: SMSC_A2P_Delivery_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'Delivery Reports',
                label: 'SMSC Delivery Latency Report',
                intervals: SMSC_Delivery_Latency_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'Delivery Reports',
                label: 'SMSC Delivery Latency by Destination Network Report',
                intervals: SMSC_Delivery_Latency_by_Destination_Network_Report,
                additionalFields: ['mcc', 'mnc', 'hosts']
            },
            {
                group: 'Delivery Reports',
                label: 'SMSC Delivery Errors by Application Report',
                intervals: SMSC_Delivery_Errors_by_App_Report,
                additionalFields: ['hosts']
            },
            // delivery status reports
            {
                group: 'Delivery Status Reports',
                label: 'SMSC Mobile Delivery Status Report',
                intervals: SMSC_Mobile_Delivery_Status_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'Delivery Status Reports',
                label: 'SMSC App Delivery Status Report',
                intervals: SMSC_Application_Delivery_Status_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'Delivery Status Reports',
                label: 'SMSC Delivery Status by App Report',
                intervals: SMSC_Delivery_Status_by_App_Report,
                additionalFields: ['appId', 'hosts']
            },
            // gsm reports
            {
                group: 'GSM Reports',
                label: 'SMSC MT Delivery Peak Traffic Report',
                intervals: SMSC_MT_Delivery_Peak_Traffic_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT Delivery Attempts by Subscriber Status Report',
                intervals: SMSC_MT_Delivery_Attempts_by_Subscriber_Status_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT Delivery Attempts by Destination Network Summary Report',
                intervals: SMSC_MT_Delivery_Attempts_by_Destination_Network_Summary_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT Delivery Attempts by Destination Network Report',
                intervals: SMSC_MT_Delivery_Attempts_by_Destination_Network_Report,
                additionalFields: ['mcc', 'mnc', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT Delivery Errors by Destination Network Report',
                intervals: SMSC_MT_Delivery_Errors_by_Destination_Network_Report,
                additionalFields: ['mcc', 'mnc', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MO Submit Peak Traffic Report',
                intervals: SMSC_MO_Submit_Peak_Traffic_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MO Submit Requests by Originator MSC Summary Report',
                intervals: SMSC_MO_Submit_Requests_by_Originator_MSC_Summary_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MO Submit Errors Report',
                intervals: SMSC_MO_Submit_Errors_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MO Submit Errors by Originator MSC Report',
                intervals: SMSC_MO_Submit_Errors_by_Originator_MSC_Report,
                additionalFields: ['origMSC', 'hosts']
            },
            // Hub reports
            {
                group: 'Hub Reports',
                label: 'SMSC Own P2P to Direct SS7 Report',
                intervals: SMSC_P2P_Own_Direct_SS7_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Own P2P to HUB GSM Report',
                intervals: SMSC_P2P_Own_HUB_GSM_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Own P2P to HUB SMPP Report',
                intervals: SMSC_P2P_Own_HUB_SMPP_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Other P2P from Direct SS7 Report',
                intervals: SMSC_P2P_Other_Direct_SS7_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Other P2P from HUB GSM Report',
                intervals: SMSC_P2P_Other_HUB_GSM_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Other P2P from HUB SMPP Report',
                intervals: SMSC_P2P_Other_HUB_SMPP_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Own A2P to Direct SS7 Report',
                intervals: SMSC_A2P_Own_Direct_SS7_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Own A2P to HUB GSM Report',
                intervals: SMSC_A2P_Own_HUB_GSM_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Own A2P to HUB SMPP Report',
                intervals: SMSC_A2P_Own_HUB_SMPP_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Other A2P from Direct SS7 Report',
                intervals: SMSC_A2P_Other_Direct_SS7_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Other A2P from HUB GSM Report',
                intervals: SMSC_A2P_Other_HUB_GSM_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Other A2P from HUB SMPP Report',
                intervals: SMSC_A2P_Other_HUB_SMPP_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Total HUB Report',
                intervals: SMSC_Total_HUB_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC HUB to HUB SMPP Transit Report',
                intervals: SMSC_HUB_to_HUB_Transit_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Virgin Report',
                intervals: SMSC_Virgin_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC International to STC Error Report',
                intervals: SMSC_International_to_STC_Error_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Large Account to International Traffic Error Report',
                intervals: SMSC_Large_Account_to_International_Traffic_Error_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC International to STC Large Account Traffic Error Report',
                intervals: SMSC_International_to_Large_Account_Traffic_Error_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC International Outgoing Traffic by Short Code Report',
                intervals: SMSC_International_Outgoing_Traffic_by_ShortCode_Report
            },
            {
                group: 'Hub Reports',
                label: 'SMSC Orig STC to GSM International Error Report',
                intervals: SMSC_OrigSTC_to_International_Error_Report
            },
            // SMPP reports
            {
                group: 'SMPP Reports',
                label: 'SMSC Traffic by ASP Summary Report',
                intervals: SMSC_Traffic_by_ASP_Summary_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC P2A Peak Traffic Report',
                intervals: SMSC_P2A_Peak_Traffic_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC P2A Traffic by ASP Report',
                intervals: SMSC_P2A_Traffic_by_ASP_Report,
                additionalFields: ['aspId', 'hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC P2A Traffic by App Report',
                intervals: SMSC_P2A_Traffic_by_App_Report,
                additionalFields: ['appId', 'hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC P2A Traffic by App and ShortCode Report',
                intervals: SMSC_P2A_Traffic_by_App_and_ShortCode_Report,
                additionalFields: ['appId', 'shortCode', 'hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC P2A Traffic Errors by App Report',
                intervals: SMSC_P2A_Traffic_Errors_by_App_Report,
                additionalFields: ['appId', 'hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC A2P Peak Traffic Report',
                intervals: SMSC_A2P_Peak_Traffic_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC A2P Traffic by ASP Report',
                intervals: SMSC_A2P_Traffic_by_ASP_Report,
                additionalFields: ['aspId', 'hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC A2P Traffic by App Report',
                intervals: SMSC_A2P_Traffic_by_App_Report,
                additionalFields: ['appId', 'hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC A2P Traffic by App and ShortCode Report',
                intervals: SMSC_A2P_Traffic_by_App_and_ShortCode_Report,
                additionalFields: ['appId', 'shortCode', 'hosts']},
            {
                group: 'SMPP Reports',
                label: 'SMSC A2P Traffic Errors by App Report',
                intervals: SMSC_A2P_Traffic_Errors_by_App_Report,
                additionalFields: ['appId', 'hosts']
            },
        ];

        $scope.REPORTS = angular.copy($scope.ORIGINAL_REPORTS);
        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            mcc: null,
            mnc: null,
            appId: null,
            aspId: null,
            origMSC: null,
            shortCode: null,
            hosts: null
        };

        $scope.$watch('reportCategory', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (newValue.formats) {
                    $scope.formatPentaho = newValue.formats[0];
                } else {
                    $scope.formatPentaho = $scope.FORMATS_PENTAHO[0];
                }
            }
        });

    });

    ReportingReportsSMSCModule.controller('ReportingReportsSMSCScheduleCtrl', function ($scope, $log, $controller, smppApplications, organizations) {
        $log.debug("ReportingReportsSMSCScheduleCtrl");

        $controller('ReportingReportsSMSCCtrl', {
            $scope: $scope,
            smppApplications: smppApplications,
            organizations: organizations
        });

        $scope.REPORTS = _.filter($scope.ORIGINAL_REPORTS, function (report) {
            return !report.onlyOndemand;
        });
        $scope.reportCategory = $scope.REPORTS[0];

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
