(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.products.apimanager', []);

    var ReportingReportsAPIManagerModule = angular.module('adminportal.subsystems.reporting.reports.products.apimanager');

    ReportingReportsAPIManagerModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.products.apimanager', {
            abstract: true,
            url: "/api-manager",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ProductReports.ApiManager',
                onDemandState: 'subsystems.reporting.reports.products.apimanager.report',
                scheduleState: 'subsystems.reporting.reports.products.apimanager.schedule'
            },
            resolve: {
                apis: function (ApiManagerProvService) {
                    return ApiManagerProvService.getApis();
                },
                developers: function (ApiManagerProvService) {
                    return ApiManagerProvService.getDevelopers();
                },
                offers: function (ApiManagerProvService) {
                    return ApiManagerProvService.getOffers();
                },
                endpoints: function (ApiManagerProvService) {
                    return ApiManagerProvService.getEndpoints();
                }
            }
        }).state('subsystems.reporting.reports.products.apimanager.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsAPIManagerCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_ONDEMAND_READ'
                ]
            }
        }).state('subsystems.reporting.reports.products.apimanager.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsAPIManagerScheduleCtrl',
            data: {
                permissions: [
                    'ALL__REPORTS_SCHEDULED_READ'
                ]
            }
        });

    });

    ReportingReportsAPIManagerModule.controller('ReportingReportsAPIManagerCtrl', function ($rootScope, $scope, $log, $controller, $filter, UtilService, Restangular, CMPFService,
                                                                                            ApiManagerProvService, apis, developers, offers, endpoints) {
        $log.debug("ReportingReportsAPIManagerCtrl");

        $scope.developerList = Restangular.stripRestangular(developers);
        $scope.developerList = $filter('orderBy')($scope.developerList, ['name']);

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

        $scope.offerList = Restangular.stripRestangular(offers);
        $scope.offerList = $filter('orderBy')($scope.offerList, ['name']);

        $scope.endpointList = Restangular.stripRestangular(endpoints);
        $scope.endpointList = $filter('orderBy')($scope.endpointList, ['name']);

        $scope.getApplications = function (devName) {
            $scope.applicationList = [];
            if (devName) {
                ApiManagerProvService.getApplications(devName).then(function (response) {
                    $scope.applicationList = Restangular.stripRestangular(response);
                    $scope.applicationList = $filter('orderBy')($scope.applicationList, ['name']);
                });
            }
        };

        $scope.setApiProperties = function (api) {
            $scope.additionalParams.apiName = null;
            $scope.additionalParams.apiMethodName = null;
            if (api) {
                $scope.additionalParams.apiName = api.apiNameVersion;
            }
        };

        var APIMANAGER_Usage_per_API_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Usage_per_API_Report.prpt');
        var APIMANAGER_Usage_per_Offer_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Usage_per_Offer_Report.prpt');
        var APIMANAGER_Usage_per_Endpoint_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Usage_per_Endpoint_Report.prpt');
        var APIMANAGER_Usage_per_Application_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Usage_per_Application_Report.prpt');
        var APIMANAGER_Usage_per_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Usage_per_API_Method_Report.prpt');
        var APIMANAGER_Usage_per_Application_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Usage_per_Application_and_API_Method_Report.prpt');
        var APIMANAGER_Usage_per_Endpoint_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Usage_per_Endpoint_and_API_Method_Report.prpt');

        var APIMANAGER_Top_Offers_by_Usage_per_Period_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Top_Offers_by_Usage_per_Period_Report.prpt');
        var APIMANAGER_Top_Endpoints_by_Usage_per_Period_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Top_Endpoints_by_Usage_per_Period_Report.prpt');
        var APIMANAGER_Top_Developers_by_Usage_per_Period_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Top_Developers_by_Usage_per_Period_Report.prpt');
        var APIMANAGER_Top_Applications_by_Usage_per_Period_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Top_Applications_by_Usage_per_Period_Report.prpt');
        var APIMANAGER_Top_APIs_by_Usage_per_Period_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Top_APIs_by_Usage_per_Period_Report.prpt');

        var APIMANAGER_Top_APIs_by_Usage_Report = UtilService.defineReportsAsH(':home:csp:APIMANAGER:APIMANAGER_Top_APIs_by_Usage_Report.prpt');
        var APIMANAGER_Top_Offers_by_Usage_Report = UtilService.defineReportsAsH(':home:csp:APIMANAGER:APIMANAGER_Top_Offers_by_Usage_Report.prpt');
        var APIMANAGER_Top_Applications_by_Usage_Report = UtilService.defineReportsAsH(':home:csp:APIMANAGER:APIMANAGER_Top_Applications_by_Usage_Report.prpt');
        var APIMANAGER_Top_Developers_by_Usage_Report = UtilService.defineReportsAsH(':home:csp:APIMANAGER:APIMANAGER_Top_Developers_by_Usage_Report.prpt');
        var APIMANAGER_Top_Endpoints_by_Usage_Report = UtilService.defineReportsAsH(':home:csp:APIMANAGER:APIMANAGER_Top_Endpoints_by_Usage_Report.prpt');

        var APIMANAGER_Latency_per_Endpoint_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Latency_per_Endpoint_Report.prpt');
        var APIMANAGER_Latency_per_Application_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Latency_per_Application_Report.prpt');
        var APIMANAGER_Latency_per_API_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Latency_per_API_Report.prpt');
        var APIMANAGER_Latency_per_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Latency_per_API_Method_Report.prpt');
        var APIMANAGER_Latency_per_Application_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Latency_per_Application_and_API_Method_Report.prpt');
        var APIMANAGER_Latency_per_Endpoint_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Latency_per_Endpoint_and_API_Method_Report.prpt');

        var APIMANAGER_Failure_Causes_per_Endpoint_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Failure_Causes_per_Endpoint_Report.prpt');
        var APIMANAGER_Failure_Causes_per_Application_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Failure_Causes_per_Application_Report.prpt');
        var APIMANAGER_Failure_Causes_per_API_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Failure_Causes_per_API_Report.prpt');
        var APIMANAGER_Failure_Causes_per_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Failure_Causes_per_API_Method_Report.prpt');
        var APIMANAGER_Failure_Causes_per_Application_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Failure_Causes_per_Application_and_API_Method_Report.prpt');
        var APIMANAGER_Failure_Causes_per_Endpoint_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Failure_Causes_per_Endpoint_and_API_Method_Report.prpt');

        var APIMANAGER_Bandwidth_Consumption_per_Endpoint_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Bandwidth_Consumption_per_Endpoint_Report.prpt');
        var APIMANAGER_Bandwidth_Consumption_per_Application_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Bandwidth_Consumption_per_Application_Report.prpt');
        var APIMANAGER_Bandwidth_Consumption_per_API_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Bandwidth_Consumption_per_API_Report.prpt');
        var APIMANAGER_Bandwidth_Consumption_per_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Bandwidth_Consumption_per_API_Method_Report.prpt');
        var APIMANAGER_Bandwidth_Consumption_per_Application_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Bandwidth_Consumption_per_Application_and_API_Method_Report.prpt');
        var APIMANAGER_Bandwidth_Consumption_per_Endpoint_and_API_Method_Report = UtilService.defineReportsAsDHM(':home:csp:APIMANAGER:APIMANAGER_Bandwidth_Consumption_per_Endpoint_and_API_Method_Report.prpt');

        $scope.REPORTS = [
            {
                group: 'Top Reports',
                label: 'API Manager Top APIs by Usage Report',
                intervals: APIMANAGER_Top_APIs_by_Usage_Report,
                additionalFields: []
            },
            {
                group: 'Top Reports',
                label: 'API Manager Top APIs by Usage per Period Report',
                intervals: APIMANAGER_Top_APIs_by_Usage_per_Period_Report,
                additionalFields: []
            },
            {
                group: 'Top Reports',
                label: 'API Manager Top Applications by Usage Report',
                intervals: APIMANAGER_Top_Applications_by_Usage_Report,
                additionalFields: ["developerName"]
            },
            {
                group: 'Top Reports',
                label: 'API Manager Top Applications by Usage per Period Report',
                intervals: APIMANAGER_Top_Applications_by_Usage_per_Period_Report,
                additionalFields: ["developerName"]
            },
            {
                group: 'Top Reports',
                label: 'API Manager Top Developers by Usage Report',
                intervals: APIMANAGER_Top_Developers_by_Usage_Report,
                additionalFields: []
            },
            {
                group: 'Top Reports',
                label: 'API Manager Top Developers by Usage per Period Report',
                intervals: APIMANAGER_Top_Developers_by_Usage_per_Period_Report,
                additionalFields: []
            },
            {
                group: 'Top Reports',
                label: 'API Manager Top Endpoints by Usage Report',
                intervals: APIMANAGER_Top_Endpoints_by_Usage_Report,
                additionalFields: []
            },
            {
                group: 'Top Reports',
                label: 'API Manager Top Endpoints by Usage per Period Report',
                intervals: APIMANAGER_Top_Endpoints_by_Usage_per_Period_Report,
                additionalFields: []
            },
            {
                group: 'Top Reports',
                label: 'API Manager Top Offers by Usage Report',
                intervals: APIMANAGER_Top_Offers_by_Usage_Report,
                additionalFields: []
            },
            {
                group: 'Top Reports',
                label: 'API Manager Top Offers by Usage per Period Report',
                intervals: APIMANAGER_Top_Offers_by_Usage_per_Period_Report,
                additionalFields: []
            },
            {
                group: 'Usage Reports',
                label: 'API Manager Usage per API Report ',
                intervals: APIMANAGER_Usage_per_API_Report,
                additionalFields: ["apiName"]
            },
            {
                group: 'Usage Reports',
                label: 'API Manager Usage per API Method Report ',
                intervals: APIMANAGER_Usage_per_API_Method_Report,
                additionalFields: ["apiName", "apiMethodName"]
            },
            {
                group: 'Usage Reports',
                label: 'API Manager Usage per Application Report',
                intervals: APIMANAGER_Usage_per_Application_Report,
                additionalFields: ["developerName", "applicationName"]
            },
            {
                group: 'Usage Reports',
                label: 'API Manager Usage per Application and API Method Report',
                intervals: APIMANAGER_Usage_per_Application_and_API_Method_Report,
                additionalFields: ["developerName", "applicationName", "apiName", "apiMethodName"]
            },
            {
                group: 'Usage Reports',
                label: 'API Manager Usage per Endpoint Report',
                intervals: APIMANAGER_Usage_per_Endpoint_Report,
                additionalFields: ["endpoint"]
            },
            {
                group: 'Usage Reports',
                label: 'API Manager Usage per Endpoint and API Method Report',
                intervals: APIMANAGER_Usage_per_Endpoint_and_API_Method_Report,
                additionalFields: ["endpoint", "apiName", "apiMethodName"]
            },
            {
                group: 'Usage Reports',
                label: 'API Manager Usage per Offer Report',
                intervals: APIMANAGER_Usage_per_Offer_Report,
                additionalFields: ["offerName"]
            },
            {
                group: 'Failure Reports',
                label: 'API Manager Failure Causes per API Report',
                intervals: APIMANAGER_Failure_Causes_per_API_Report,
                additionalFields: ["apiName"]
            },
            {
                group: 'Failure Reports',
                label: 'API Manager Failure Causes per API Method Report',
                intervals: APIMANAGER_Failure_Causes_per_API_Method_Report,
                additionalFields: ["apiName", "apiMethodName"]
            },
            {
                group: 'Failure Reports',
                label: 'API Manager Failure Causes per Application Report',
                intervals: APIMANAGER_Failure_Causes_per_Application_Report,
                additionalFields: ["developerName", "applicationName"]
            },
            {
                group: 'Failure Reports',
                label: 'API Manager Failure Causes per Application and API Method Report',
                intervals: APIMANAGER_Failure_Causes_per_Application_and_API_Method_Report,
                additionalFields: ["developerName", "applicationName", "apiName", "apiMethodName"]
            },
            {
                group: 'Failure Reports',
                label: 'API Manager Failure Causes per Endpoint Report',
                intervals: APIMANAGER_Failure_Causes_per_Endpoint_Report,
                additionalFields: ["endpoint"]
            },
            {
                group: 'Failure Reports',
                label: 'API Manager Failure Causes per Endpoint and API Method Report',
                intervals: APIMANAGER_Failure_Causes_per_Endpoint_and_API_Method_Report,
                additionalFields: ["endpoint", "apiName", "apiMethodName"]
            },
            {
                group: 'Latency Reports',
                label: 'API Manager Latency per API Report',
                intervals: APIMANAGER_Latency_per_API_Report,
                additionalFields: ["apiName"]
            },
            {
                group: 'Latency Reports',
                label: 'API Manager Latency per API Method Report',
                intervals: APIMANAGER_Latency_per_API_Method_Report,
                additionalFields: ["apiName", "apiMethodName"]
            },
            {
                group: 'Latency Reports',
                label: 'API Manager Latency per Application Report',
                intervals: APIMANAGER_Latency_per_Application_Report,
                additionalFields: ["developerName", "applicationName"]
            },
            {
                group: 'Latency Reports',
                label: 'API Manager Latency per Application and API Method Report',
                intervals: APIMANAGER_Latency_per_Application_and_API_Method_Report,
                additionalFields: ["developerName", "applicationName", "apiName", "apiMethodName"]
            },
            {
                group: 'Latency Reports',
                label: 'API Manager Latency per Endpoint Report',
                intervals: APIMANAGER_Latency_per_Endpoint_Report,
                additionalFields: ["endpoint"]
            },
            {
                group: 'Latency Reports',
                label: 'API Manager Latency per Endpoint and API Method Report',
                intervals: APIMANAGER_Latency_per_Endpoint_and_API_Method_Report,
                additionalFields: ["endpoint", "apiName", "apiMethodName"]
            },
            {
                group: 'Bandwidth Consumption Reports',
                label: 'API Manager Bandwidth Consumption per API Report',
                intervals: APIMANAGER_Bandwidth_Consumption_per_API_Report,
                additionalFields: ["apiName"]
            },
            {
                group: 'Bandwidth Consumption Reports',
                label: 'API Manager Bandwidth Consumption per API Method Report',
                intervals: APIMANAGER_Bandwidth_Consumption_per_API_Method_Report,
                additionalFields: ["apiName", "apiMethodName"]
            },
            {
                group: 'Bandwidth Consumption Reports',
                label: 'API Manager Bandwidth Consumption per Application Report',
                intervals: APIMANAGER_Bandwidth_Consumption_per_Application_Report,
                additionalFields: ["developerName", "applicationName"]
            },
            {
                group: 'Bandwidth Consumption Reports',
                label: 'API Manager Bandwidth Consumption per Application and API Method Report',
                intervals: APIMANAGER_Bandwidth_Consumption_per_Application_and_API_Method_Report,
                additionalFields: ["developerName", "applicationName", "apiName", "apiMethodName"]
            },
            {
                group: 'Bandwidth Consumption Reports',
                label: 'API Manager Bandwidth Consumption per Endpoint Report',
                intervals: APIMANAGER_Bandwidth_Consumption_per_Endpoint_Report,
                additionalFields: ["endpoint"]
            },
            {
                group: 'Bandwidth Consumption Reports',
                label: 'API Manager Bandwidth Consumption per Endpoint and API Method Report',
                intervals: APIMANAGER_Bandwidth_Consumption_per_Endpoint_and_API_Method_Report,
                additionalFields: ["endpoint", "apiName", "apiMethodName"]
            }
        ];

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.additionalParams = {
            apiName: null,
            offerName: null,
            endpoint: null,
            developerName: null,
            applicationName: null,
            apiMethodName: null
        };
    });

    ReportingReportsAPIManagerModule.controller('ReportingReportsAPIManagerScheduleCtrl', function ($scope, $log, $controller, apis, developers, offers, endpoints) {
        $log.debug("ReportingReportsAPIManagerScheduleCtrl");

        $controller('ReportingReportsAPIManagerCtrl', {
            $scope: $scope,
            apis: apis,
            developers: developers,
            offers: offers,
            endpoints: endpoints
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

})();
