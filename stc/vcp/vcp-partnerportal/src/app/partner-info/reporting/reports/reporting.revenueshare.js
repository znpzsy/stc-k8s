(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting.reports.revenueshare', []);

    var ReportingReportsRevenueShareModule = angular.module('partnerportal.partner-info.reporting.reports.revenueshare');

    ReportingReportsRevenueShareModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.reporting.reports.revenueshare', {
            abstract: true,
            url: "/revenue-share",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'PartnerInfo.Reporting.RevenueShare',
                permissions: [
                    'PRM__FINANCIALREPORTS_ONDEMAND_READ'
                ]
            },
            resolve: {
                businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                }
            }
        }).state('partner-info.reporting.reports.revenueshare.report', {
            url: "",
            templateUrl: 'partner-info/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsRevenueShareCtrl'
        });

    });

    ReportingReportsRevenueShareModule.controller('ReportingReportsRevenueShareCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, CMPFService,
                                                                                                CMS_RBT_CONTENT_TYPES, businessTypesOrganization) {
        $log.debug("ReportingReportsRevenueShareCtrl");

        $scope.contentTypeList = CMS_RBT_CONTENT_TYPES;

        $scope.organizationId = $scope.getOrganizationId();
        $scope.organizationName = $scope.getOrganizationName();

        var businessTypesOrganizationItem = businessTypesOrganization.organizations[0];
        $scope.businessTypes = CMPFService.getBusinessTypes(businessTypesOrganizationItem);
        $scope.businessTypes = $filter('orderBy')($scope.businessTypes, 'Name');

        // DSP
        var DSP_Service_Usage_Summary_Report = UtilService.defineReportsAsDM(':home:csp:Revenue:DSP_Service_Usage_Summary_Report.prpt');
        var DSP_Revenue_Summary_Report = UtilService.defineReportsAsDM(':home:csp:Revenue:DSP_Revenue_Summary_Report.prpt');
        var DSP_Service_Usage_Report = [
            {name: 'DAILY', url: ':home:csp:Revenue:Partner:DSP_Service_Usage_Report.prpt', reportType: 'Daily'}
        ];
        var DSP_Service_Usage_by_Partner_per_Period_Report = [
            {name: 'DAILY', url: ':home:csp:Revenue:DSP_Service_Usage_by_Partner_per_Period_Report.prpt', reportType: 'Daily'},
            {name: 'MONTHLY', url: ':home:csp:Revenue:DSP_Service_Usage_by_Partner_per_Period_Report.prpt', reportType: 'Monthly'}
        ];
        var DSP_Revenue_Share_Partner_Report = [
            {name: 'MONTHLY_SPECIAL', url: ':home:csp:Revenue:DSP_Revenue_Share_Partner_Report.prpt', reportType: 'Monthly'}
        ];
        var DSP_Revenue_by_Partner_Report = [
            {name: 'MONTHLY', url: ':home:csp:Revenue:DSP_Revenue_by_Partner_Report.prpt', reportType: 'Monthly'}
        ];
        var DSP_Revenue_by_Service_Report = [
            {name: 'MONTHLY', url: ':home:csp:Revenue:DSP_Revenue_by_Service_Report.prpt', reportType: 'Monthly'}
        ];
        var DSP_Revenue_by_Service_Category_Report = [
            {name: 'MONTHLY', url: ':home:csp:Revenue:DSP_Revenue_by_Service_Category_Report.prpt', reportType: 'Monthly'}
        ];
        var DSP_Revenue_by_Short_Code_Report = [
            {name: 'MONTHLY', url: ':home:csp:Revenue:DSP_Revenue_by_Short_Code_Report.prpt', reportType: 'Monthly'}
        ];
        var DSP_Revenue_by_BusinessType_Report = [
            {name: 'DAILY', url: ':home:csp:Revenue:DSP_Revenue_by_BusinessType_Report.prpt', reportType: 'Daily'}
        ];
        var DSP_Revenue_by_ServiceType_Report = [
            {name: 'DAILY', url: ':home:csp:Revenue:DSP_Revenue_by_ServiceType_Report.prpt', reportType: 'Daily'}
        ];
        // RBT
        var RBT_Content_Usage_Summary_Report = UtilService.defineReportsAsDM(':home:csp:RBTContentRevenue:RBT_Content_Usage_Summary_Report.prpt');
        var RBT_Content_Revenue_Summary_Report = UtilService.defineReportsAsDM(':home:csp:RBTContentRevenue:RBT_Content_Revenue_Summary_Report.prpt');
        var RBT_Content_Usage_by_Partner_Report = [
            {name: 'MONTHLY', url: ':home:csp:RBTContentRevenue:RBT_Content_Usage_by_Partner_Report.prpt', reportType: 'Monthly'}
        ];
        var RBT_Content_Revenue_by_Partner_Report = [
            {name: 'MONTHLY', url: ':home:csp:RBTContentRevenue:RBT_Content_Revenue_by_Partner_Report.prpt', reportType: 'Monthly'}
        ];
        var RBT_Content_Revenue_by_Single_Tone_Report = [
            {name: 'MONTHLY', url: ':home:csp:RBTContentRevenue:RBT_Content_Revenue_by_Single_Tone_Report.prpt', reportType: 'Monthly'}
        ];
        var RBT_Content_Revenue_by_Tone_Bundle_Report = [
            {name: 'MONTHLY', url: ':home:csp:RBTContentRevenue:RBT_Content_Revenue_by_Tone_Bundle_Report.prpt', reportType: 'Monthly'}
        ];
        var RBT_Content_Revenue_Share_Report = [
            {name: 'MONTHLY_SPECIAL', url: ':home:csp:RBTContentRevenue:RBT_Content_Revenue_Share_Report.prpt', reportType: 'Monthly'}
        ];

        $scope.REPORTS = [
            // // DSP Summary Reports
            // {
            //     group: 'DSP Summary Reports',
            //     label: 'Service Usage Summary Report',
            //     intervals: DSP_Service_Usage_Summary_Report,
            //     additionalFields: ['organizationId']
            // },
            // {
            //     group: 'DSP Summary Reports',
            //     label: 'Service Revenue Summary Report',
            //     intervals: DSP_Revenue_Summary_Report
            // },
            // // DSP Service Revenue Reports
            // {
            //     group: 'DSP Service Revenue Reports',
            //     label: 'Service Usage Report',
            //     intervals: DSP_Service_Usage_Report,
            //     additionalFields: ['organizationId', 'topN']
            // },
            // {
            //     group: 'DSP Service Revenue Reports',
            //     label: 'Service Usage per Period Report',
            //     intervals: DSP_Service_Usage_by_Partner_per_Period_Report,
            //     additionalFields: ['organizationId', 'topN']
            // },
            // {
            //     group: 'DSP Service Revenue Reports',
            //     label: 'Service Revenue Report',
            //     intervals: DSP_Revenue_by_Partner_Report,
            //     additionalFields: ['organizationId', 'topN']
            // },
            // {
            //     group: 'DSP Service Revenue Reports',
            //     label: 'Service Revenue by Service Report',
            //     intervals: DSP_Revenue_by_Service_Report,
            //     additionalFields: ['organizationId', 'topN']
            // },
            // {
            //     group: 'DSP Service Revenue Reports',
            //     label: 'Service Revenue by Service Category Report',
            //     intervals: DSP_Revenue_by_Service_Category_Report,
            //     additionalFields: ['organizationId', 'topN']
            // },
            // {
            //     group: 'DSP Service Revenue Reports',
            //     label: 'Service Revenue by Short Code Report',
            //     intervals: DSP_Revenue_by_Short_Code_Report,
            //     additionalFields: ['organizationId', 'topN']
            // },
            // {
            //     group: 'DSP Service Revenue Reports',
            //     label: 'Service Revenue by Business Type Report',
            //     intervals: DSP_Revenue_by_BusinessType_Report,
            //     additionalFields: ['organizationId', 'businessType']
            // },
            // {
            //     group: 'DSP Service Revenue Reports',
            //     label: 'Service Revenue by Service Type Report',
            //     intervals: DSP_Revenue_by_ServiceType_Report,
            //     additionalFields: ['organizationId']
            // },
            // // DSP Revenue Share Reports
            // {
            //     group: 'DSP Revenue Share Reports',
            //     label: 'Service Revenue Share Report',
            //     intervals: DSP_Revenue_Share_Partner_Report,
            //     additionalFields: ['organizationId']
            // },
            // RBT Summary Reports
            {
                group: 'RBT Summary Reports',
                label: 'Content Usage Summary Report',
                intervals: RBT_Content_Usage_Summary_Report,
                additionalFields: ['organizationId']
            },
            {
                group: 'RBT Summary Reports',
                label: 'Content Revenue Summary Report',
                intervals: RBT_Content_Revenue_Summary_Report,
                additionalFields: ['organizationId']
            },
            // RBT Content Revenue Reports
            {
                group: 'RBT Content Revenue Reports',
                label: 'Content Usage Report',
                intervals: RBT_Content_Usage_by_Partner_Report,
                additionalFields: ['organizationId', 'topN']
            },
            {
                group: 'RBT Content Revenue Reports',
                label: 'Content Revenue Report',
                intervals: RBT_Content_Revenue_by_Partner_Report,
                additionalFields: ['organizationId', 'topN']
            },
            {
                group: 'RBT Content Revenue Reports',
                label: 'Content Revenue by Single Tone Report',
                intervals: RBT_Content_Revenue_by_Single_Tone_Report,
                additionalFields: ['organizationId', 'topN']
            },
            {
                group: 'RBT Content Revenue Reports',
                label: 'Content Revenue by Tone Bundle Report',
                intervals: RBT_Content_Revenue_by_Tone_Bundle_Report,
                additionalFields: ['organizationId', 'contentType', 'topN']
            },
            // RBT Revenue Share Reports
            {
                group: 'RBT Revenue Share Reports',
                label: 'Content Revenue Share Report',
                intervals: RBT_Content_Revenue_Share_Report,
                additionalFields: ['organizationId']
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
            businessType: null,
            contentType: null,
            topN: null
        };
    });

})();
