(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.subsystems.ssm', []);

    var ReportingReportsSSMModule = angular.module('adminportal.subsystems.reporting.reports.subsystems.ssm');

    ReportingReportsSSMModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.subsystems.ssm', {
            abstract: true,
            url: "/subscription-management",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.SubsystemReports.SubscriptionManagement',
                onDemandState: 'subsystems.reporting.reports.subsystems.ssm.report',
                scheduleState: 'subsystems.reporting.reports.subsystems.ssm.schedule'
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                },
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                },
                offers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOffers();
                }
            }
        }).state('subsystems.reporting.reports.subsystems.ssm.report', {
            url: "",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsSSMCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_ONDEMAND_READ'
                ]
            }
        }).state('subsystems.reporting.reports.subsystems.ssm.schedule', {
            url: "/subscription-management/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsSSMScheduleCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_SCHEDULED_READ'
                ]
            }
        });

    });

    ReportingReportsSSMModule.controller('ReportingReportsSSMCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, CMPFService, ContentManagementService,
                                                                              organizations, services, offers, CMS_RBT_CONTENT_TYPES, SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES,
                                                                              SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT) {
        $log.debug("ReportingReportsSSMCtrl");

        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['name']);

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['name']);

        var offers = Restangular.stripRestangular(offers).offers;
        $scope.offerList = $filter('orderBy')(offers, ['name']);

        $scope.contentTypeList = CMS_RBT_CONTENT_TYPES;
        $scope.SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES = SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES;
        $scope.SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT = SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT;

        var SSM_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:SSM:SSM_Traffic_Summary_Report.prpt');
        var SSM_Traffic_Details_By_Offer_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:SSM:SSM_Traffic_Details_By_Offer_By_Organization_Report.prpt');
        var SSM_Total_Subscriptions_By_Offer_By_Organization_Report = [
            {
                name: 'DAILY',
                url: ':home:csp:SSM:SSM_Total_Subscriptions_By_Offer_By_Organization_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var SSM_Total_Subscriptions_By_Service_By_Organization_Report = [
            {
                name: 'DAILY',
                url: ':home:csp:SSM:SSM_Total_Subscriptions_By_Service_By_Organization_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var SSM_Total_Subscriptions_By_Period_By_Organization_Report = [
            {
                name: 'DAILY',
                url: ':home:csp:SSM:SSM_Total_Subscriptions_By_Period_By_Organization_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var SSM_New_Subscription_By_Offer_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:SSM:SSM_New_Subscription_By_Offer_By_Organization_Report.prpt');
        var SSM_Unsubscription_Reason_By_Offer_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:SSM:SSM_Unsubscription_Reason_By_Offer_By_Organization_Report.prpt');

        var RBT_Content_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:csp:CSM:RBT_Content_Traffic_Summary_Report.prpt');
        var RBT_Traffic_Details_By_Content_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:CSM:RBT_Traffic_Details_By_Content_By_Organization_Report.prpt');
        var RBT_Total_Subscriptions_By_Content_By_Organization_Report = [
            {
                name: 'DAILY',
                url: ':home:csp:CSM:RBT_Total_Subscriptions_By_Content_By_Organization_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var RBT_Total_Subscriptions_By_Period_By_Organization_Report = [
            {
                name: 'DAILY',
                url: ':home:csp:CSM:RBT_Total_Subscriptions_By_Period_By_Organization_Report.prpt',
                reportType: 'Daily'
            }
        ];
        var RBT_New_Subscription_By_Content_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:CSM:RBT_New_Subscription_By_Content_By_Organization_Report.prpt');
        var RBT_Unsubscription_Reason_By_Content_By_Organization_Report = UtilService.defineReportsAsDHM(':home:csp:CSM:RBT_Unsubscription_Reason_By_Content_By_Organization_Report.prpt');
        var RBT_Trending_by_Content_Report = UtilService.defineReportsAsDHM(':home:csp:CSM:RBT_Trending_by_Content_Report.prpt');

        $scope.REPORTS = [
            // DSP
            {
                group: 'DSP Service Subscription Reports',
                label: 'Subscription Traffic Summary Report',
                intervals: SSM_Traffic_Summary_Report
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'Subscription Traffic Details by Offer by Organization Report',
                intervals: SSM_Traffic_Details_By_Offer_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmOfferId']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'Total Subscriptions by Offer by Organization Report',
                intervals: SSM_Total_Subscriptions_By_Offer_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmOfferId']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'Total Subscriptions by Service by Organization Report',
                intervals: SSM_Total_Subscriptions_By_Service_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmServiceId']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'Total Subscriptions by Period by Organization Report',
                intervals: SSM_Total_Subscriptions_By_Period_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmServiceId']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'New Subscription by Offer by Organization Report',
                intervals: SSM_New_Subscription_By_Offer_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmOfferId', 'dspchannel']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'Unsubscription Reason by Offer by Organization Report',
                intervals: SSM_Unsubscription_Reason_By_Offer_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmOfferId', 'dspchannel']
            },
            // RBT
            {
                group: 'RBT Content Subscription Reports',
                label: 'Subscription Traffic Summary Report',
                intervals: RBT_Content_Traffic_Summary_Report
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'Subscription Traffic Details by Content by Organization Report',
                intervals: RBT_Traffic_Details_By_Content_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType']
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'Total Subscriptions by Content by Organization Report',
                intervals: RBT_Total_Subscriptions_By_Content_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType']
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'Total Subscriptions by Period by Organization Report',
                intervals: RBT_Total_Subscriptions_By_Period_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType']
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'New Subscription by Content by Organization Report',
                intervals: RBT_New_Subscription_By_Content_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType', 'rbtchannel']
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'Unsubscription Reason by Content by Organization Report',
                intervals: RBT_Unsubscription_Reason_By_Content_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType', 'rbtchannel']
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'Trending by Content Report',
                intervals: RBT_Trending_by_Content_Report,
                additionalFields: ['organizationId', 'contentType', 'topN']
            }
        ];

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            organizationId: null,
            serviceId: null,
            offerId: null,
            contentType: null,
            channel: null,
            topN: null
        };
    });

    ReportingReportsSSMModule.controller('ReportingReportsSSMScheduleCtrl', function ($scope, $log, $controller, services, offers, organizations) {
        $log.debug("ReportingReportsSSMScheduleCtrl");

        $controller('ReportingReportsSSMCtrl', {
            $scope: $scope,
            services: services,
            offers: offers,
            organizations: organizations
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
