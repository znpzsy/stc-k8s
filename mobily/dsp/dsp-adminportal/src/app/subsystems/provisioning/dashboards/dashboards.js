(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.dashboards', []);

    var ProvisioningDashboardsModule = angular.module('adminportal.subsystems.provisioning.dashboards');

    ProvisioningDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.dashboards', {
            url: "/dashboard",
            templateUrl: "subsystems/provisioning/dashboards/dashboards.html",
            controller: 'ProvisioningDashboardsCtrl',
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

    ProvisioningDashboardsModule.controller('ProvisioningDashboardsCtrl', function ($scope, $log, $interval, $q, $state, $filter, Restangular, AdmPortalDashboardPromiseTracker,
                                                                                    $controller, PlotService, CMPFService) {
        $log.debug("ProvisioningDashboardsCtrl");

        $scope.tiles = {
            serviceProviders: 0,
            services: 0,
            shortCodes: 0,
            departments: 0,
            teams: 0,
            userAccounts: 0
        };

        $scope.servicesByOrganizationData = [];
        $scope.servicesByStatusData = [];
        $scope.shortCodesByStatusData = [];

        var dashboarding = function (promiseTracker) {
            $scope.servicesByOrganizationData = [];
            $scope.servicesByStatusData = [];
            $scope.shortCodesByStatusData = [];

            $controller('ServiceProvidersDashboardsCtrl', {$scope: $scope, promiseTracker: promiseTracker});

            $controller('ServicesDashboardsCtrl', {$scope: $scope, promiseTracker: promiseTracker});

            $controller('UserAccountsDashboardsCtrl', {$scope: $scope, promiseTracker: promiseTracker});

            $controller('DefaultOrganizationDashboardsCtrl', {$scope: $scope, promiseTracker: promiseTracker});
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

    ProvisioningDashboardsModule.controller('ServiceProvidersDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, promiseTracker) {
        CMPFService.getPartners(0, 0, false, false, null, promiseTracker).then(function (response) {
            $scope.tiles.serviceProviders = Restangular.stripRestangular(response).metaData.totalCount;
        }, function (response) {
            $scope.tiles.serviceProviders = 0;

            $log.error('Cannot read service providers. Error: ', response);
        });
    });

    ProvisioningDashboardsModule.controller('ServicesDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, PlotService, DEFAULT_REST_QUERY_LIMIT,
                                                                                promiseTracker) {
        CMPFService.getAllServices(true, false, null, promiseTracker).then(function (response) {
            var apiResponse = Restangular.stripRestangular(response);

            $scope.tiles.services = apiResponse.metaData.totalCount;

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
            $scope.tiles.services = 0;

            $scope.servicesByOrganizationData = [];
            $scope.servicesByStatusData = [];

            $log.error('Cannot read services. Error: ', response);
        });
    });

    ProvisioningDashboardsModule.controller('UserAccountsDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, promiseTracker) {
        CMPFService.getUserAccounts(0, 0, promiseTracker).then(function (response) {
            $scope.tiles.userAccounts = Restangular.stripRestangular(response).metaData.totalCount;
        }, function (response) {
            $scope.tiles.userAccounts = 0;

            $log.error('Cannot read user accounts. Error: ', response);
        });
    });

    ProvisioningDashboardsModule.controller('DefaultOrganizationDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, DEFAULT_REST_QUERY_LIMIT, PlotService,
                                                                                           promiseTracker) {
        CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME, promiseTracker).then(function (response) {
            // Tiles
            var departmentsOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_DEPARTMENTS_ORGANIZATION_NAME});
            var departments = CMPFService.getDepartments(departmentsOrganization);
            $scope.tiles.departments = departments.length;

            var teamsOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME});
            var teams = CMPFService.getTeams(teamsOrganization);
            $scope.tiles.teams = teams.length;

            var shortCodesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME});
            var shortCodes = CMPFService.getShortCodes(shortCodesOrganization);
            $scope.tiles.shortCodes = shortCodes.length;

            // Pie charts
            _.each(shortCodes, function(shortCode) {
                var foundData = _.findWhere($scope.shortCodesByStatusData, {label: shortCode.Status});
                if (foundData) {
                    foundData.data += 1;
                } else {
                    $scope.shortCodesByStatusData.push({
                        label: shortCode.Status,
                        data: 1
                    });
                }
            });
            $scope.shortCodesByStatusData = PlotService.getLargeDataGroupByValue($scope.shortCodesByStatusData, 10);
            PlotService.drawPie('#pie-chart3', $scope.shortCodesByStatusData, true);
        }, function (response) {
            $scope.tiles.departments = 0;
            $scope.tiles.teams = 0;
            $scope.tiles.shortCodes = 0;

            $scope.shortCodesByStatusData = [];
        });
    });

})();
