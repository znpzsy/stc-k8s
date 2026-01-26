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
                viewKey: 'SSM',
                pageHeaderKey: 'Subsystems.Reporting.SubsystemReports.SubscriptionManagement',
                onDemandState: 'subsystems.reporting.reports.subsystems.ssm.report',
                scheduleState: 'subsystems.reporting.reports.subsystems.ssm.schedule'
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
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
                    'REPORTS_ONDEMAND_SSM'
                ]
            }
        }).state('subsystems.reporting.reports.subsystems.ssm.schedule', {
            url: "/subscription-management/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsSSMScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_SSM'
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

        // var SSM_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:vcp:SSM:SSM_Traffic_Summary_Report.prpt');
        // var SSM_Traffic_Details_By_Offer_By_Organization_Report = UtilService.defineReportsAsDHM(':home:vcp:SSM:SSM_Traffic_Details_By_Offer_By_Organization_Report.prpt');
        // var SSM_Total_Subscriptions_By_Offer_By_Organization_Report = [
        //     {
        //         name: 'DAILY',
        //         url: ':home:vcp:SSM:SSM_Total_Subscriptions_By_Offer_By_Organization_Report.prpt',
        //         reportType: 'Daily'
        //     }
        // ];
        // var SSM_Total_Subscriptions_By_Service_By_Organization_Report = [
        //     {
        //         name: 'DAILY',
        //         url: ':home:vcp:SSM:SSM_Total_Subscriptions_By_Service_By_Organization_Report.prpt',
        //         reportType: 'Daily'
        //     }
        // ];
        // var SSM_Total_Subscriptions_By_Period_By_Organization_Report = [
        //     {
        //         name: 'DAILY',
        //         url: ':home:vcp:SSM:SSM_Total_Subscriptions_By_Period_By_Organization_Report.prpt',
        //         reportType: 'Daily'
        //     }
        // ];
        // var SSM_New_Subscription_By_Offer_By_Organization_Report = UtilService.defineReportsAsDHM(':home:vcp:SSM:SSM_New_Subscription_By_Offer_By_Organization_Report.prpt');
        // var SSM_Unsubscription_Reason_By_Offer_By_Organization_Report = UtilService.defineReportsAsDHM(':home:vcp:SSM:SSM_Unsubscription_Reason_By_Offer_By_Organization_Report.prpt');
        // var RBT_Content_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:vcp:CSM:RBT_Content_Traffic_Summary_Report.prpt');
        // var RBT_Total_Subscriptions_By_Content_By_Organization_Report = [
        //     {
        //         name: 'DAILY',
        //         url: ':home:vcp:CSM:RBT_Total_Subscriptions_By_Content_By_Organization_Report.prpt',
        //         reportType: 'Daily'
        //     }
        // ];
        // var RBT_Total_Subscriptions_By_Period_By_Organization_Report = [
        //     {
        //         name: 'DAILY',
        //         url: ':home:vcp:CSM:RBT_Total_Subscriptions_By_Period_By_Organization_Report.prpt',
        //         reportType: 'Daily'
        //     }
        // ];
        // var RBT_New_Subscription_By_Content_By_Organization_Report = UtilService.defineReportsAsDHM(':home:vcp:CSM:RBT_New_Subscription_By_Content_By_Organization_Report.prpt');
        // var RBT_Unsubscription_Reason_By_Content_By_Organization_Report = UtilService.defineReportsAsDHM(':home:vcp:CSM:RBT_Unsubscription_Reason_By_Content_By_Organization_Report.prpt');
        // var RBT_Trending_by_Content_Report = UtilService.defineReportsAsDHM(':home:vcp:CSM:RBT_Trending_by_Content_Report.prpt');
        // var RBT_Recommendation_Engine_Success_Overview_Report = [
        //     {
        //         name: 'DAILY',
        //         url: ':home:vcp:CSM:RBT_Recommendation_Engine_Success_Overview_Report.prpt',
        //         reportType: 'Daily'
        //     }
        // ];
        // var RBT_Recommendation_Engine_Success_Report = [
        //     {
        //         name: 'DAILY',
        //         url: ':home:vcp:CSM:RBT_Recommendation_Engine_Success_Report.prpt',
        //         reportType: 'Daily'
        //     }
        // ];

        var RBT_Traffic_Details_By_Content_By_Organization_Report = UtilService.defineReportsAsDHM(':home:vcp:CSM:RBT_Traffic_Details_By_Content_By_Organization_Report.prpt');

        // MCN Reports - Mawjood Extra
        var MCN_Mawjood_Extra_Total_Subscription_Report = UtilService.defineReportsAsDM(':home:vcp:MissedCallNotification:MCN_Mawjood_Extra_Total_Subscription_Report.prpt');
        var MCN_Mawjood_Extra_Total_Subscription_Request_Report = UtilService.defineReportsAsDM(':home:vcp:MissedCallNotification:MCN_Mawjood_Extra_Total_Subscription_Request_Report.prpt');

        $scope.REPORTS = [

            {
                group: 'RBT Content Subscription Reports',
                label: 'Subscription Traffic Details by Content by Organization Report',
                intervals: RBT_Traffic_Details_By_Content_By_Organization_Report,
                additionalFields: ['organizationId', 'contentType']
            },
            {
                group: 'MCN Subscription Reports',
                label: 'Mawjood Extra Total Subscription Report',
                intervals: MCN_Mawjood_Extra_Total_Subscription_Report
            },
            {
                group: 'MCN Subscription Reports',
                label: 'Mawjood Extra Total Subscription Request Report',
                intervals: MCN_Mawjood_Extra_Total_Subscription_Request_Report
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
