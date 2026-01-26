(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.dashboards', []);

    var SubscriptionManagementDashboardsModule = angular.module('adminportal.subsystems.subscriptionmanagement.dashboards');

    SubscriptionManagementDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.dashboards', {
            url: "/dashboard",
            templateUrl: "subsystems/subscriptionmanagement/dashboards/dashboards.html",
            controller: 'SubscriptionManagementDashboardsCtrl',
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

    SubscriptionManagementDashboardsModule.controller('SubscriptionManagementDashboardsCtrl', function ($scope, $log, $interval, $q, $state, $filter, Restangular, AdmPortalDashboardPromiseTracker,
                                                                                                        $controller) {
        $log.debug("SubscriptionManagementDashboardsCtrl");

        $scope.tiles = {
            subscribers: 0,
            offers: 0,
            subscriptions: 0
        };

        $scope.offersByOrganizationData = [];
        $scope.offersByStatusData = [];

        var dashboarding = function (promiseTracker) {
            $controller('SubscriptionManagementSubscribersDashboardsCtrl', {
                $scope: $scope,
                promiseTracker: promiseTracker
            });

            $controller('SubscriptionManagementOffersDashboardsCtrl', {
                $scope: $scope,
                promiseTracker: promiseTracker
            });
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

    SubscriptionManagementDashboardsModule.controller('SubscriptionManagementSubscribersDashboardsCtrl', function ($scope, $log, SSMSubscribersService, Restangular,
                                                                                                                   promiseTracker) {
        SSMSubscribersService.getCounts(promiseTracker).then(function (response) {
            $scope.tiles.subscribers = response.subscriberCount;
            $scope.tiles.subscriptions = response.subscriptionCount;
        }, function (response) {
            $log.debug('Cannot read subscribers. Error: ', response);
        });
    });

    SubscriptionManagementDashboardsModule.controller('SubscriptionManagementOffersDashboardsCtrl', function ($scope, $log, CMPFService, Restangular, PlotService, DEFAULT_REST_QUERY_LIMIT,
                                                                                                              promiseTracker) {
        CMPFService.getAllOffers(false, true, false, promiseTracker).then(function (response) {
            $scope.tiles.offers = Restangular.stripRestangular(response).metaData.totalCount;

            $scope.offersByOrganizationData = [];
            $scope.offersByStatusData = [];

            var apiResponse = Restangular.stripRestangular(response);

            // Offers by Organization
            var offersGroupedByOrganization = _.groupBy(apiResponse.offers, function (offer) {
                if (offer.organization) {
                    return offer.organization.name;
                } else {
                    return 'Undefined';
                }
            });

            var total = 0;
            _.each(offersGroupedByOrganization, function (offers, organization) {
                total += offers.length;

                $scope.offersByOrganizationData.push({
                    label: organization,
                    data: offers.length
                });
            });

            // Offers by Status
            var offersGroupedByStatus = _.groupBy(apiResponse.offers, function (offer) {
                return offer.state;
            });

            var total = 0;
            _.each(offersGroupedByStatus, function (offers, status) {
                total += offers.length;

                $scope.offersByStatusData.push({
                    label: status,
                    data: offers.length
                });
            });

            // Calculate the percentage of the data.
            $scope.offersByOrganizationData = PlotService.getLargeDataGroupByValue($scope.offersByOrganizationData, 10);
            $scope.offersByStatusData = PlotService.getLargeDataGroupByValue($scope.offersByStatusData, 10);

            PlotService.drawPie('#pie-chart1', $scope.offersByOrganizationData, true);
            PlotService.drawPie('#pie-chart2', $scope.offersByStatusData, true);
        }, function (response) {
            $scope.offersByOrganizationData = [];
            $scope.offersByStatusData = [];

            $log.error('Cannot read offers. Error: ', response);
        });
    });
})();
