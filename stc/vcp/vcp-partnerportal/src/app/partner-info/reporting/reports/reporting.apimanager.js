(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting.reports.apimanager', []);

    var ReportingReportsApiManagerModule = angular.module('partnerportal.partner-info.reporting.reports.apimanager');

    ReportingReportsApiManagerModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.reporting.reports.apimanager', {
            abstract: true,
            url: "/api-manager",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'PartnerInfo.Reporting.ApiManager',
                permissions: [
                    'PRM__REPORTS_ONDEMAND_READ'
                ]
            },
            resolve: {
                apis: function (ApiManagerProvService) {
                    return ApiManagerProvService.getApis();
                },
                applications: function ($rootScope, ApiManagerProvService) {
                    return ApiManagerProvService.getApplications($rootScope.getOrganizationName());
                }
            }
        }).state('partner-info.reporting.reports.apimanager.report', {
            url: "",
            templateUrl: 'partner-info/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsApiManagerCtrl'
        });

    });

    ReportingReportsApiManagerModule.controller('ReportingReportsApiManagerCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, ApiManagerProvService,
                                                                                            apis, applications) {
        $log.debug("ReportingReportsApiManagerCtrl");

        $scope.organizationId = $scope.getOrganizationId();
        $scope.organizationName = $scope.getOrganizationName();

        $scope.apiList = [];
        $scope.apis = Restangular.stripRestangular(apis);
        $scope.apis = $filter('orderBy')($scope.apis, ['name']);
        var i = 0;
        _.each($scope.apis, function (api) {
            _.each(api.versions, function (version) {
                $scope.apiList[i] = {
                    apiName: api.name,
                    versionName: version.version,
                    apiNameVersion: api.name + '-' + version.version,
                    methods: version.methods,
                    index: i
                };
                i++;
            });
        });

        $scope.applicationList = Restangular.stripRestangular(applications);
        $scope.applicationList = $filter('orderBy')($scope.applicationList, ['name']);

        $scope.setApiProperties = function (api) {
            $scope.additionalParams.apiName = null;
            $scope.additionalParams.apiMethodName = null;
            if (api) {
                $scope.additionalParams.apiName = api.apiNameVersion;
            }
        };

        var APIMANAGER_Usage_per_Application_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Usage_per_Application_and_API_Method_Report.prpt');
        var APIMANAGER_Usage_per_Application_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Usage_per_Application_Report.prpt');

        var APIMANAGER_Latency_per_Application_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Latency_per_Application_Report.prpt');
        var APIMANAGER_Latency_per_Application_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Latency_per_Application_and_API_Method_Report.prpt');

        var APIMANAGER_Failure_Causes_per_Application_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Failure_Causes_per_Application_Report.prpt');
        var APIMANAGER_Failure_Causes_per_Application_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Failure_Causes_per_Application_and_API_Method_Report.prpt');

        var APIMANAGER_Bandwidth_Consumption_per_Application_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Bandwidth_Consumption_per_Application_Report.prpt');
        var APIMANAGER_Bandwidth_Consumption_per_Application_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Bandwidth_Consumption_per_Application_and_API_Method_Report.prpt');

        $scope.REPORTS = [
            {
                group: 'Usage Reports',
                label: 'API Usage per Application Report',
                intervals: APIMANAGER_Usage_per_Application_Report,
                additionalFields: ["developerName", "applicationName"]
            },
            {
                group: 'Usage Reports',
                label: 'API Usage per Application and API Method Report',
                intervals: APIMANAGER_Usage_per_Application_and_API_Method_Report,
                additionalFields: ["developerName", "applicationName", "apiName", "apiMethodName"]
            },
            {
                group: 'Failure Reports',
                label: 'API Failure Causes per Application Report',
                intervals: APIMANAGER_Failure_Causes_per_Application_Report,
                additionalFields: ["developerName", "applicationName"]
            },
            {
                group: 'Failure Reports',
                label: 'API Failure Causes per Application and API Method Report',
                intervals: APIMANAGER_Failure_Causes_per_Application_and_API_Method_Report,
                additionalFields: ["developerName", "applicationName", "apiName", "apiMethodName"]
            },
            {
                group: 'Latency Reports',
                label: 'API Latency per Application Report',
                intervals: APIMANAGER_Latency_per_Application_Report,
                additionalFields: ["developerName", "applicationName"]
            },
            {
                group: 'Latency Reports',
                label: 'API Latency per Application and API Method Report',
                intervals: APIMANAGER_Latency_per_Application_and_API_Method_Report,
                additionalFields: ["developerName", "applicationName", "apiName", "apiMethodName"]
            },
            {
                group: 'Bandwidth Consumption Reports',
                label: 'API Bandwidth Consumption per Application Report',
                intervals: APIMANAGER_Bandwidth_Consumption_per_Application_Report,
                additionalFields: ["developerName", "applicationName"]
            },
            {
                group: 'Bandwidth Consumption Reports',
                label: 'API Bandwidth Consumption per Application and API Method Report',
                intervals: APIMANAGER_Bandwidth_Consumption_per_Application_and_API_Method_Report,
                additionalFields: ["developerName", "applicationName", "apiName", "apiMethodName"]
            }
        ];

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.permanentParams = {
            organizationId: $scope.organizationId,
            developerName: $scope.organizationName
        };
        $scope.additionalParams = {
            apiName: null,
            applicationName: null,
            apiMethodName: null
        };
    });

})();
