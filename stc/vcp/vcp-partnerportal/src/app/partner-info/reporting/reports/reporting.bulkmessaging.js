(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting.reports.bulkmessaging', []);

    var ReportingReportsBulkMessagingModule = angular.module('partnerportal.partner-info.reporting.reports.bulkmessaging');

    ReportingReportsBulkMessagingModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.reporting.reports.bulkmessaging', {
            abstract: true,
            url: "/bulk-messaging",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'PartnerInfo.Reporting.BulkMessaging',
                permissions: [
                    'PRM__REPORTS_ONDEMAND_READ'
                ]
            },
            resolve: {
                userAccounts: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, organizationId);
                }
            }
        }).state('partner-info.reporting.reports.bulkmessaging.report', {
            url: "",
            templateUrl: 'partner-info/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsBulkMessagingCtrl'
        });

    });

    ReportingReportsBulkMessagingModule.controller('ReportingReportsBulkMessagingCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, SessionService, CMPFService,
                                                                                                  REPORTING_BMS_CHANNELS, userAccounts) {
        $log.debug("ReportingReportsBulkMessagingCtrl");

        $scope.REPORTING_BMS_CHANNELS = REPORTING_BMS_CHANNELS;

        $scope.organizationId = $scope.getOrganizationId();
        $scope.organizationName = $scope.getOrganizationName();

        var userAccountList = Restangular.stripRestangular(userAccounts).userAccounts;
        userAccountList = _.filter(userAccountList, function (userAccount) {
            userAccount.activeDirectoryAuth = $filter('YesNoFilter')($filter('activeDirectoryAuthFilter')(userAccount.password));
            userAccount.userGroupNames = _.pluck(userAccount.userGroups, 'name').toString();

            var bulkUserProfile = CMPFService.extractBulkUserProfile(userAccount);

            return !_.isEmpty(bulkUserProfile);
        });
        $scope.userAccountList = $filter('orderBy')(userAccountList, ['userName']);

        // SMS
        var BMS_SMS_Campaign_Detail_By_Organization_Report = UtilService.defineReportsAsAll(':home:csp:BMS:BMS_SMS_Campaign_Detail_By_Organization_Report.prpt');
        var BMS_SMS_Campaign_Detail_By_User_Report = UtilService.defineReportsAsAll(':home:csp:BMS:BMS_SMS_Campaign_Detail_By_User_Report.prpt');

        // MMS
        var BMS_MMS_Campaign_Detail_By_Organization_Report = UtilService.defineReportsAsAll(':home:csp:BMS:BMS_MMS_Campaign_Detail_By_Organization_Report.prpt');
        var BMS_MMS_Campaign_Detail_By_User_Report = UtilService.defineReportsAsAll(':home:csp:BMS:BMS_MMS_Campaign_Detail_By_User_Report.prpt');

        var REPORTS = {
            'Bulk SMS': [
                {
                    group: 'Campaign Reports',
                    label: 'SMS Campaign Detail Report',
                    intervals: BMS_SMS_Campaign_Detail_By_Organization_Report,
                    additionalFields: ['organization', 'campaignId']
                },
                {
                    group: 'Campaign Reports',
                    label: 'MS Campaign Detail by User Report',
                    intervals: BMS_SMS_Campaign_Detail_By_User_Report,
                    additionalFields: ['organization', 'user', 'campaignId']
                }
            ],
            'Bulk MMS': [
                {
                    group: 'Campaign Reports',
                    label: 'MMS Campaign Detail Report',
                    intervals: BMS_MMS_Campaign_Detail_By_Organization_Report,
                    additionalFields: ['organization', 'campaignId']
                },
                {
                    group: 'Campaign Reports',
                    label: 'MMS Campaign Detail by User Report',
                    intervals: BMS_MMS_Campaign_Detail_By_User_Report,
                    additionalFields: ['organization', 'user', 'campaignId']
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
        $scope.permanentParams = {
            organization: $scope.organizationId
        };
        $scope.additionalParams = {
            user: null,
            campaignId: null
        };
    });

})();
