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
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.SMSC',
                onDemandState: 'subsystems.reporting.reports.products.smsc.report',
                scheduleState: 'subsystems.reporting.reports.products.smsc.schedule',
                permissions: [
                    'PRODUCTS_SMSC'
                ]
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
            controller: 'ReportingReportsSMSCCtrl'
        }).state('subsystems.reporting.reports.products.smsc.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsSMSCScheduleCtrl'
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
        var SMSC_General_Delivery_Errors_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:general:SMSC_General_Delivery_Errors_per_Period_Report.prpt');
        // delivery reports
        var SMSC_Total_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_Total_Delivery_Report.prpt');
        var SMSC_P2P_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_P2P_Delivery_Report.prpt');
        var SMSC_P2A_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_P2A_Delivery_Report.prpt');
        var SMSC_A2P_Delivery_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_A2P_Delivery_Report.prpt');
        var SMSC_Delivery_Latency_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_Delivery_Latency_Report.prpt');
        var SMSC_Delivery_Latency_by_Destination_Network_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_Delivery_Latency_by_Destination_Network_Report.prpt');
        var SMSC_Delivery_by_Recipient_Subscriber_Group_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_Delivery_by_Recipient_Subscriber_Group_Report.prpt');
        var SMSC_Delivery_Errors_by_Recipient_Subscriber_Group_Report = [
            {
                name: 'HOURLY',
                url: ':home:vcp:SMSC:delivery:SMSC_Delivery_Errors_by_Recipient_Subscriber_Group_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var SMSC_Delivery_Errors_by_Recipient_Subscriber_Group_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:delivery:SMSC_Delivery_Errors_by_Recipient_Subscriber_Group_per_Period_Report.prpt');
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
        var SMSC_MT_Delivery_Attempts_by_Destination_MSC_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MT_Delivery_Attempts_by_Destination_MSC_Report.prpt');
        var SMSC_MT_Delivery_Errors_by_Destination_Network_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:gsm:SMSC_MT_Delivery_Errors_by_Destination_Network_Report.prpt'
        }];
        var SMSC_MT_Delivery_Errors_by_Destination_Network_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MT_Delivery_Errors_by_Destination_Network_per_Period_Report.prpt');
        var SMSC_MT_FSM_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MT_FSM_Traffic_Summary_Report.prpt');
        var SMSC_MT_FSM_Traffic_Summary_by_Application_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MT_FSM_Traffic_Summary_by_Application_Report.prpt');
        var SMSC_MT_FSM_Errors_Report = [{name: 'ALL', url: ':home:vcp:SMSC:gsm:SMSC_MT_FSM_Errors_Report.prpt'}];
        var SMSC_MT_FSM_Errors_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MT_FSM_Errors_per_Period_Report.prpt');
        var SMSC_MT_FSM_Errors_by_Application_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:gsm:SMSC_MT_FSM_Errors_by_Application_Report.prpt'
        }];
        var SMSC_MT_FSM_Errors_by_Application_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MT_FSM_Errors_by_Application_per_Period_Report.prpt');
        var SMSC_MO_Submit_Peak_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MO_Submit_Peak_Traffic_Report.prpt');
        var SMSC_MO_Submit_Requests_by_Originator_MSC_Summary_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:gsm:SMSC_MO_Submit_Requests_by_Originator_MSC_Summary_Report.prpt'
        }];
        var SMSC_MO_Submit_Errors_Report = [{name: 'ALL', url: ':home:vcp:SMSC:gsm:SMSC_MO_Submit_Errors_Report.prpt'}];
        var SMSC_MO_Submit_Errors_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MO_Submit_Errors_per_Period_Report.prpt');
        var SMSC_MO_Submit_Errors_by_Originator_MSC_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:gsm:SMSC_MO_Submit_Errors_by_Originator_MSC_Report.prpt'
        }];
        var SMSC_MO_Submit_Errors_by_Originator_MSC_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_MO_Submit_Errors_by_Originator_MSC_per_Period_Report.prpt');
        var SMSC_SRI_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_SRI_Traffic_Summary_Report.prpt');
        var SMSC_SRI_Traffic_Summary_by_Application_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_SRI_Traffic_Summary_by_Application_Report.prpt');
        var SMSC_SRI_Errors_Report = [{name: 'ALL', url: ':home:vcp:SMSC:gsm:SMSC_SRI_Errors_Report.prpt'}];
        var SMSC_SRI_Errors_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_SRI_Errors_per_Period_Report.prpt');
        var SMSC_SRI_Errors_by_Application_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:gsm:SMSC_SRI_Errors_by_Application_Report.prpt'
        }];
        var SMSC_SRI_Errors_by_Application_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:gsm:SMSC_SRI_Errors_by_Application_per_Period_Report.prpt');
        // smpp reports
        var SMSC_Traffic_by_ASP_Summary_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:smpp:SMSC_Traffic_by_ASP_Summary_Report.prpt'
        }];
        var SMSC_P2A_Peak_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_P2A_Peak_Traffic_Report.prpt');
        var SMSC_P2A_Traffic_by_ASP_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_P2A_Traffic_by_ASP_Report.prpt');
        var SMSC_P2A_Traffic_by_App_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_P2A_Traffic_by_App_Report.prpt');
        var SMSC_P2A_Traffic_by_App_and_ShortCode_Report = [
            {
                name: 'DAILY_SPECIAL',
                url: ':home:vcp:SMSC:smpp:SMSC_P2A_Traffic_by_App_and_ShortCode_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var SMSC_P2A_Traffic_Errors_by_App_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:smpp:SMSC_P2A_Traffic_Errors_by_App_Report.prpt'
        }];
        var SMSC_P2A_Traffic_Errors_by_App_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_P2A_Traffic_Errors_by_App_per_Period_Report.prpt');
        var SMSC_A2P_Peak_Traffic_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_A2P_Peak_Traffic_Report.prpt');
        var SMSC_A2P_Traffic_by_ASP_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_A2P_Traffic_by_ASP_Report.prpt');
        var SMSC_A2P_Traffic_by_App_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_A2P_Traffic_by_App_Report.prpt');
        var SMSC_A2P_Traffic_by_App_and_ShortCode_Report = [
            {
                name: 'DAILY_SPECIAL',
                url: ':home:vcp:SMSC:smpp:SMSC_A2P_Traffic_by_App_and_ShortCode_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var SMSC_A2P_Traffic_Errors_by_App_Report = [{
            name: 'ALL',
            url: ':home:vcp:SMSC:smpp:SMSC_A2P_Traffic_Errors_by_App_Report.prpt'
        }];
        var SMSC_A2P_Traffic_Errors_by_App_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:SMSC:smpp:SMSC_A2P_Traffic_Errors_by_App_per_Period_Report.prpt');

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
            {
                group: 'General Reports',
                label: 'SMSC General Delivery Errors per Period Report',
                intervals: SMSC_General_Delivery_Errors_per_Period_Report,
                additionalFields: ['hosts']
            },
            // delivery reports
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
                label: 'SMSC Delivery by Recipient Subscriber Group Report',
                intervals: SMSC_Delivery_by_Recipient_Subscriber_Group_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'Delivery Reports',
                label: 'SMSC Delivery Errors by Recipient Subscriber Group Report',
                intervals: SMSC_Delivery_Errors_by_Recipient_Subscriber_Group_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'Delivery Reports',
                label: 'SMSC Delivery Errors by Recipient Subscriber Group per Period Report',
                intervals: SMSC_Delivery_Errors_by_Recipient_Subscriber_Group_per_Period_Report,
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
                label: 'SMSC MT Delivery Attempts by Destination MSC Report',
                intervals: SMSC_MT_Delivery_Attempts_by_Destination_MSC_Report,
                additionalFields: ['origMSC', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT Delivery Errors by Destination Network Report',
                intervals: SMSC_MT_Delivery_Errors_by_Destination_Network_Report,
                additionalFields: ['mcc', 'mnc', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT Delivery Errors by Destination Network per Period Report',
                intervals: SMSC_MT_Delivery_Errors_by_Destination_Network_per_Period_Report,
                additionalFields: ['mcc', 'mnc', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT FSM Traffic Summary Report',
                intervals: SMSC_MT_FSM_Traffic_Summary_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT FSM Traffic Summary by App Report',
                intervals: SMSC_MT_FSM_Traffic_Summary_by_Application_Report,
                additionalFields: ['appId', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT FSM Errors Report',
                intervals: SMSC_MT_FSM_Errors_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT FSM Errors per Period Report',
                intervals: SMSC_MT_FSM_Errors_per_Period_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT FSM Errors by App Report',
                intervals: SMSC_MT_FSM_Errors_by_Application_Report,
                additionalFields: ['appId', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MT FSM Errors by App per Period Report',
                intervals: SMSC_MT_FSM_Errors_by_Application_per_Period_Report,
                additionalFields: ['appId', 'hosts']
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
                label: 'SMSC MO Submit Errors per Period Report',
                intervals: SMSC_MO_Submit_Errors_per_Period_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MO Submit Errors by Originator MSC Report',
                intervals: SMSC_MO_Submit_Errors_by_Originator_MSC_Report,
                additionalFields: ['origMSC', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC MO Submit Errors by Originator MSC per Period Report',
                intervals: SMSC_MO_Submit_Errors_by_Originator_MSC_per_Period_Report,
                additionalFields: ['origMSC', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC SRI Traffic Summary Report',
                intervals: SMSC_SRI_Traffic_Summary_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC SRI Traffic Summary by App Report',
                intervals: SMSC_SRI_Traffic_Summary_by_Application_Report,
                additionalFields: ['appId', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC SRI Errors Report',
                intervals: SMSC_SRI_Errors_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC SRI Errors per Period Report',
                intervals: SMSC_SRI_Errors_per_Period_Report,
                additionalFields: ['hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC SRI Errors by App Report',
                intervals: SMSC_SRI_Errors_by_Application_Report,
                additionalFields: ['appId', 'hosts']
            },
            {
                group: 'GSM Reports',
                label: 'SMSC SRI Errors by App per Period Report',
                intervals: SMSC_SRI_Errors_by_Application_per_Period_Report,
                additionalFields: ['appId', 'hosts']
            },
            // smpp reports
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
                additionalFields: ['appId', 'shortCode'],
                constantParams: {'reportId': 'P2A_by_Application_and_ShortCode'},
                formats: [{name: 'CSV', value: 'table/csv;page-mode=stream', inline: false}],
                onlyOndemand: true
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC P2A Traffic Errors by App Report',
                intervals: SMSC_P2A_Traffic_Errors_by_App_Report,
                additionalFields: ['appId', 'hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC P2A Traffic Errors by App per Period Report',
                intervals: SMSC_P2A_Traffic_Errors_by_App_per_Period_Report,
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
                additionalFields: ['appId', 'shortCode'],
                constantParams: {'reportId': 'A2P_by_Application_and_ShortCode'},
                formats: [{name: 'CSV', value: 'table/csv;page-mode=stream', inline: false}],
                onlyOndemand: true
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC A2P Traffic Errors by App Report',
                intervals: SMSC_A2P_Traffic_Errors_by_App_Report,
                additionalFields: ['appId', 'hosts']
            },
            {
                group: 'SMPP Reports',
                label: 'SMSC A2P Traffic Errors by App per Period Report',
                intervals: SMSC_A2P_Traffic_Errors_by_App_per_Period_Report,
                additionalFields: ['appId', 'hosts']
            }
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
