(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting.reports.subscription', []);

    var ReportingReportsSubscriptionModule = angular.module('partnerportal.partner-info.reporting.reports.subscription');

    ReportingReportsSubscriptionModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.reporting.reports.subscription', {
            abstract: true,
            url: "/subscription",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'PartnerInfo.Reporting.Subscription',
                permissions: [
                    'PRM__REPORTS_ONDEMAND_READ'
                ]
            },
            resolve: {
                services: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getServicesByOrganizationId(organizationId);
                },
                offers: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getOffersByOrganizationId(organizationId);
                }
            }
        }).state('partner-info.reporting.reports.subscription.report', {
            url: "",
            templateUrl: 'partner-info/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsSubscriptionCtrl'
        });

    });

    ReportingReportsSubscriptionModule.controller('ReportingReportsSubscriptionCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, CMPFService, ContentManagementService,
                                                                                                services, offers, CMS_RBT_CONTENT_TYPES, SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES,
                                                                                                SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT) {
        $log.debug("ReportingReportsSubscriptionCtrl");

        $scope.organizationId = $scope.getOrganizationId();
        $scope.organizationName = $scope.getOrganizationName();

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['name']);

        var offerList = Restangular.stripRestangular(offers).offers;
        $scope.offerList = $filter('orderBy')(offerList, ['name']);

        $scope.contentTypeList = CMS_RBT_CONTENT_TYPES;
        $scope.SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES = SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES;
        $scope.SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT = SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT;

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
                label: 'Subscription Traffic Details by Offer Report',
                intervals: SSM_Traffic_Details_By_Offer_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmOfferId']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'Total Subscriptions by Offer Report',
                intervals: SSM_Total_Subscriptions_By_Offer_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmOfferId']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'Total Subscriptions by Service Report',
                intervals: SSM_Total_Subscriptions_By_Service_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmServiceId']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'Total Subscriptions by Period Report',
                intervals: SSM_Total_Subscriptions_By_Period_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmServiceId']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'New Subscription by Offer Report',
                intervals: SSM_New_Subscription_By_Offer_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmOfferId', 'dspchannel']
            },
            {
                group: 'DSP Service Subscription Reports',
                label: 'Unsubscription Reason by Offer Report',
                intervals: SSM_Unsubscription_Reason_By_Offer_By_Organization_Report,
                additionalFields: ['organizationId', 'ssmOfferId', 'dspchannel']
            },
            // RBT
            {
                group: 'RBT Content Subscription Reports',
                label: 'Subscription Traffic Details by Content Report',
                intervals: RBT_Traffic_Details_By_Content_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType']
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'Total Subscriptions by Content Report',
                intervals: RBT_Total_Subscriptions_By_Content_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType']
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'Total Subscriptions by Period Report',
                intervals: RBT_Total_Subscriptions_By_Period_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType']
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'New Subscription by Content Report',
                intervals: RBT_New_Subscription_By_Content_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType', 'rbtchannel']
            },
            {
                group: 'RBT Content Subscription Reports',
                label: 'Unsubscription Reason by Content Report',
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
        $scope.permanentParams = {
            organizationId: $scope.organizationId
        };
        $scope.additionalParams = {
            serviceId: null,
            offerId: null,
            contentType: null,
            channel: null,
            topN: null
        };
    });

})();
