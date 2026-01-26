(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.dashboards', []);

    var ProvisioningDashboardsModule = angular.module('adminportal.subsystems.provisioning.dashboards');

    ProvisioningDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.dashboards', {
            url: "/dashboard",
            templateUrl: "subsystems/provisioning/dashboards/dashboards.html",
            controller: 'ProvisioningDashboardsCtrl'
        });

    });

    ProvisioningDashboardsModule.controller('ProvisioningDashboardsCtrl', function ($scope, $log, $interval, $q, $state, $filter, Restangular, AdmPortalDashboardPromiseTracker,
                                                                                    $controller) {
        $log.debug("ProvisioningDashboardsCtrl");

        $scope.subscribers = 0;
        $scope.serviceProviders = 0;
        $scope.services = 0;
        $scope.userAccounts = 0;
        $scope.userGroups = 0;

        var dashboarding = function (promiseTracker) {
            $controller('SubscribersDashboardsCtrl', {$scope: $scope, promiseTracker: promiseTracker});

            $controller('ServiceProvidersDashboardsCtrl', {$scope: $scope, promiseTracker: promiseTracker});

            $controller('ServicesDashboardsCtrl', {$scope: $scope, promiseTracker: promiseTracker});

            $controller('UserAccountsDashboardsCtrl', {$scope: $scope, promiseTracker: promiseTracker});

            $controller('UserGroupsDashboardsCtrl', {$scope: $scope, promiseTracker: promiseTracker});
        };

        dashboarding();

        var rebuild = $interval(function () {
            $log.debug('reloading');
            dashboarding(AdmPortalDashboardPromiseTracker);
        }, 90000);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(rebuild)) {
                $log.debug('Cancelled timer');
                $interval.cancel(rebuild);
                rebuild = undefined;
            }
        });
    });

    ProvisioningDashboardsModule.controller('SubscribersDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, promiseTracker) {
        CMPFService.getSubscribers(0, 0, promiseTracker).then(function (response) {
            $scope.subscribers = Restangular.stripRestangular(response).metaData.totalCount;
        }, function (response) {
            $log.error('Cannot read subscribers. Error: ', response);
        });
    });

    ProvisioningDashboardsModule.controller('ServiceProvidersDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, promiseTracker) {
        CMPFService.getPartners(0, 0, promiseTracker).then(function (response) {
            $scope.serviceProviders = Restangular.stripRestangular(response).metaData.totalCount;
        }, function (response) {
            $log.error('Cannot read service providers. Error: ', response);
        });
    });

    ProvisioningDashboardsModule.controller('ServicesDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, PlotService, DEFAULT_REST_QUERY_LIMIT,
                                                                                promiseTracker) {
        CMPFService.getServices(0, DEFAULT_REST_QUERY_LIMIT, true, false, promiseTracker).then(function (response) {
            $scope.servicesByOrganizationData = [];
            $scope.servicesByStatusData = [];

            var apiResponse = Restangular.stripRestangular(response);

            $scope.services = apiResponse.metaData.totalCount;

            var servicesGroupedByOrganization = _.groupBy(apiResponse.services, function (service) {
                if (service.organization) {
                    return service.organization.name;
                } else {
                    return 'Undefined';
                }
            });

            var total = 0;
            _.each(servicesGroupedByOrganization, function (services, organization) {
                total += services.length;

                $scope.servicesByOrganizationData.push({
                    label: organization,
                    data: services.length
                });
            });

            var servicesGroupedByStatus = _.groupBy(apiResponse.services, function (service) {
                return service.state;
            });

            var total = 0;
            _.each(servicesGroupedByStatus, function (services, status) {
                total += services.length;

                $scope.servicesByStatusData.push({
                    label: status,
                    data: services.length
                });
            });

            // Calculate the percentage of the data.
            $scope.servicesByOrganizationData = PlotService.getLargeDataGroupByValue($scope.servicesByOrganizationData, 10);
            $scope.servicesByStatusData = PlotService.getLargeDataGroupByValue($scope.servicesByStatusData, 10);

            PlotService.drawPie('#pie-chart1', $scope.servicesByOrganizationData, true);
            PlotService.drawPie('#pie-chart2', $scope.servicesByStatusData, true);
        }, function (response) {
            $scope.servicesByOrganizationData = [];
            $scope.servicesByStatusData = [];

            $log.error('Cannot read services. Error: ', response);
        });
    });

    ProvisioningDashboardsModule.controller('UserAccountsDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, promiseTracker) {
        CMPFService.getUserAccounts(0, 0, false, promiseTracker).then(function (response) {
            $scope.userAccounts = Restangular.stripRestangular(response).metaData.totalCount;
        }, function (response) {
            $log.debug('Cannot read user accounts. Error: ', response);
        });
    });

    ProvisioningDashboardsModule.controller('UserGroupsDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, promiseTracker) {
        CMPFService.getUserGroups(0, 0, promiseTracker).then(function (response) {
            $scope.userGroups = Restangular.stripRestangular(response).metaData.totalCount;
        }, function (response) {
            $log.debug('Cannot read user groups. Error: ', response);
        });
    });

})();
