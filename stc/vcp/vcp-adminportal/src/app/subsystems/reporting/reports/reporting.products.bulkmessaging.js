(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.bulkmessaging', []);

    var ReportingReportsBulkMessagingModule = angular.module('adminportal.subsystems.reporting.reports.products.bulkmessaging');

    ReportingReportsBulkMessagingModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.bulkmessaging', {
            abstract: true,
            url: "/bulk-messaging",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                viewKey: 'BMS',
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.BulkMessaging',
                onDemandState: 'subsystems.reporting.reports.products.bulkmessaging.report',
                scheduleState: 'subsystems.reporting.reports.products.bulkmessaging.schedule'
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
                },
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccountsCustom(0, DEFAULT_REST_QUERY_LIMIT, true, true);
                }
            }
        }).state('subsystems.reporting.reports.products.bulkmessaging.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsBulkMessagingCtrl',
            data: {
                permissions: [
                    'REPORTS_ONDEMAND_BMS'
                ]
            }
        }).state('subsystems.reporting.reports.products.bulkmessaging.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsBulkMessagingScheduleCtrl',
            data: {
                permissions: [
                    'REPORTS_SCHEDULED_BMS'
                ]
            }
        });

    });

    ReportingReportsBulkMessagingModule.controller('ReportingReportsBulkMessagingCtrl', function ($rootScope, $scope, $log, $controller, $filter, UtilService, Restangular, SessionService, CMPFService,
                                                                                                  REPORTING_BMS_CHANNELS, organizations, userAccounts) {
        $log.debug("ReportingReportsBulkMessagingCtrl");

        $scope.REPORTING_BMS_CHANNELS = REPORTING_BMS_CHANNELS;

        var userAccountList = Restangular.stripRestangular(userAccounts).userAccounts;
        userAccountList = _.filter(userAccountList, function (userAccount) {
            userAccount.userGroupNames = _.pluck(userAccount.userGroups, 'name').toString();

            var bulkUserProfile = CMPFService.extractBulkUserProfile(userAccount);

            return !_.isEmpty(bulkUserProfile);
        });
        $scope.userAccountList = $filter('orderBy')(userAccountList, ['userName']);
        $scope.userAccountList = $filter('UsersByOrganizationName')($scope.userAccountList, CMPFService.DEFAULT_ORGANIZATION_NAME);

        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['name']);

        // SMS
        var BMS_SMS_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:vcp:BMS:BMS_SMS_Traffic_Summary_Report.prpt');
        var BMS_SMS_Campaign_Summary_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_SMS_Campaign_Summary_Report.prpt');
        var BMS_SMS_Campaign_Detail_By_Organization_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_SMS_Campaign_Detail_By_Organization_Report.prpt');
        var BMS_SMS_Campaign_Detail_By_User_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_SMS_Campaign_Detail_By_User_Report.prpt');
        var BMS_SMS_Interactive_Campaign_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_SMS_Interactive_Campaign_Report.prpt');

        // MMS
        var BMS_MMS_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:vcp:BMS:BMS_MMS_Traffic_Summary_Report.prpt');
        var BMS_MMS_Campaign_Summary_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_MMS_Campaign_Summary_Report.prpt');
        var BMS_MMS_Campaign_Detail_By_Organization_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_MMS_Campaign_Detail_By_Organization_Report.prpt');
        var BMS_MMS_Campaign_Detail_By_User_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_MMS_Campaign_Detail_By_User_Report.prpt');

        // IVR
        var BMS_IVR_Traffic_Summary_Report = UtilService.defineReportsAsDHM(':home:vcp:BMS:BMS_IVR_Traffic_Summary_Report.prpt');
        var BMS_IVR_Campaign_Summary_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_IVR_Campaign_Summary_Report.prpt');
        var BMS_IVR_Campaign_Detail_By_Organization_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_IVR_Campaign_Detail_By_Organization_Report.prpt');
        var BMS_IVR_Campaign_Detail_By_User_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_IVR_Campaign_Detail_By_User_Report.prpt');
        var BMS_IVR_Interactive_Campaign_Report = UtilService.defineReportsAsAll(':home:vcp:BMS:BMS_IVR_Interactive_Campaign_Report.prpt');
        // Fastkey
        // var FKCM_HLR_Forwarding_Report = UtilService.defineReportsAsAll(':home:vcp:FKCM:FKCM_HLR_Forwarding_Report.prpt');
        // var FKCM_Play_by_SingleTone_Report = UtilService.defineReportsAsAll(':home:vcp:FKCM:FKCM_Play_by_SingleTone_Report.prpt');
        // var FKCM_TotalPlay_Report = UtilService.defineReportsAsAll(':home:vcp:FKCM:FKCM_TotalPlay_Report.prpt');

        var REPORTS = {
            'Bulk SMS': [
                {
                    group: 'Traffic Reports',
                    label: 'BMS SMS Traffic Summary Report',
                    intervals: BMS_SMS_Traffic_Summary_Report
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS SMS Campaign Summary Report',
                    intervals: BMS_SMS_Campaign_Summary_Report,
                    additionalFields: ['campaignId']
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS SMS Campaign Detail By Organization Report',
                    intervals: BMS_SMS_Campaign_Detail_By_Organization_Report,
                    additionalFields: ['campaignId']
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS SMS Campaign Detail by User Report',
                    intervals: BMS_SMS_Campaign_Detail_By_User_Report,
                    additionalFields: ['user', 'campaignId']
                }
                // {
                //     group: 'Campaign Reports',
                //     label: 'BMS Interactive SMS Campaign Report',
                //     intervals: BMS_SMS_Interactive_Campaign_Report,
                //     additionalFields: ['bmsId']
                // }
            ],
            'Bulk MMS': [
                {
                    group: 'Traffic Reports',
                    label: 'BMS MMS Traffic Summary Report',
                    intervals: BMS_MMS_Traffic_Summary_Report
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS MMS Campaign Summary Report',
                    intervals: BMS_MMS_Campaign_Summary_Report,
                    additionalFields: ['campaignId']
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS MMS Campaign Detail Report',
                    intervals: BMS_MMS_Campaign_Detail_By_Organization_Report,
                    additionalFields: ['campaignId']
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS MMS Campaign Detail by User Report',
                    intervals: BMS_MMS_Campaign_Detail_By_User_Report,
                    additionalFields: ['user', 'campaignId']
                }
            ],
            'Bulk IVR': [
                {
                    group: 'Traffic Reports',
                    label: 'BMS IVR Traffic Summary Report',
                    intervals: BMS_IVR_Traffic_Summary_Report
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS IVR Campaign Summary Report',
                    intervals: BMS_IVR_Campaign_Summary_Report,
                    additionalFields: ['campaignId']
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS IVR Campaign Detail Report',
                    intervals: BMS_IVR_Campaign_Detail_By_Organization_Report,
                    additionalFields: ['campaignId']
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS IVR Campaign Detail by User Report',
                    intervals: BMS_IVR_Campaign_Detail_By_User_Report,
                    additionalFields: ['user', 'campaignId']
                },
                {
                    group: 'Campaign Reports',
                    label: 'BMS Interactive IVR Campaign Report',
                    intervals: BMS_IVR_Interactive_Campaign_Report,
                    additionalFields: ['bmsId']
                }
            ]
        };

        // Listen changes on the channel to change the report list immediately.
        $scope.changeBMSChannel = function (channel) {
            $scope.REPORTS = REPORTS[channel];

            $scope.reportCategory = $scope.REPORTS[0];
            $scope.interval = $scope.reportCategory.intervals[0];

            $scope.$emit('ReportCategoryChanged', $scope.interval);
        };

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.channel = $scope.REPORTING_BMS_CHANNELS[0];
        $scope.REPORTS = REPORTS['Bulk SMS'];
        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            user: null,
            campaignId: null
        };

        $scope.permanentParams = {
            organization: $rootScope.systemUserOrganizationName
        };

        if (!$rootScope.isAdminUser) {
            $scope.userAccountList = $filter('UsersByOrganizationName')($scope.userAccountList, $scope.permanentParams.organization);

            if (!$rootScope.isBMSAdminUser) {
                $scope.permanentParams.user = SessionService.getUsername();
            } else {
                $scope.additionalParams.user = null;
            }
        } else {
            $scope.additionalParams.user = null;
        }
    });

    ReportingReportsBulkMessagingModule.controller('ReportingReportsBulkMessagingScheduleCtrl', function ($scope, $log, $controller, organizations, userAccounts) {
        $log.debug("ReportingReportsBulkMessagingScheduleCtrl");

        $controller('ReportingReportsBulkMessagingCtrl', {
            $scope: $scope,
            organizations: organizations,
            userAccounts: userAccounts
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
