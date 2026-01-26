(function () {

    'use strict';

    angular.module('adminportal.products.apimanager.dashboards', []);

    var ApiManagerDashboardsModule = angular.module('adminportal.products.apimanager.dashboards');

    ApiManagerDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.apimanager.dashboards', {
            url: "/dashboard",
            templateUrl: "products/apimanager/dashboards/dashboards.html",
            controller: 'ApiManagerDashboardsCtrl',
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

    ApiManagerDashboardsModule.controller('ApiManagerDashboardsCtrl', function ($scope, $log, $interval, $q, PlotService, UtilService, Restangular,
                                                                                AdmPortalDashboardPromiseTracker, ApiManagerProvService) {
        $log.debug("ApiManagerDashboardsCtrl");

        var initialize = function () {
            $scope.tileInfo = {
                apis: 0,
                dailyApiCalls: 0,
                offers: 0,
                subscriptions: 0,
                applications: 0,
                developers: 0
            };

            $scope.topApisByUsageData = [];
            $scope.topOffersByUsageData = [];
            $scope.topAppsByUsageData = [];
        };

        initialize();

        var preparePieChartArray = function (dataArray) {
            var pieChartArray = [];

            _.each(dataArray, function (pieChartItem) {
                if (pieChartItem.count > 0) {
                    pieChartArray.push({
                        label: pieChartItem.term,
                        data: pieChartItem.count
                    });
                }
            });

            return pieChartArray;
        };

        var dashboarding = function (promiseTracker) {
            // Get begin and end datetime values as miliseconds of the current day to use to get dashboard values of the day.
            var from = UtilService.getTodayBegin().getTime();
            var to = UtilService.getTodayEnd().getTime();

            ApiManagerProvService.getDashboard(from, to, promiseTracker).then(function (response) {
                $log.debug('Api Manager Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // Values of the tiles.
                $scope.tileInfo.apis = apiResponse.apis;
                $scope.tileInfo.offers = apiResponse.offers;
                $scope.tileInfo.subscriptions = apiResponse.subscriptions;
                $scope.tileInfo.applications = apiResponse.apps;
                $scope.tileInfo.developers = apiResponse.devs;
                $scope.tileInfo.dailyApiCalls = apiResponse.transactions[0].doc_count + apiResponse.transactions[1].doc_count;


                // Values of the pie charts.
                var topApisByUsageData = preparePieChartArray(apiResponse.topApis);
                var topOffersByUsageData = preparePieChartArray(apiResponse.topOffers);
                var topAppsByUsageData = preparePieChartArray(apiResponse.topApps);

                $scope.topApisByUsageData = PlotService.getLargeDataGroupByValue(topApisByUsageData, 10);
                PlotService.drawPie('#pie-chart1', $scope.topApisByUsageData, true);

                $scope.topOffersByUsageData = PlotService.getLargeDataGroupByValue(topOffersByUsageData, 10);
                PlotService.drawPie('#pie-chart2', $scope.topOffersByUsageData, true);

                $scope.topAppsByUsageData = PlotService.getLargeDataGroupByValue(topAppsByUsageData, 10);
                PlotService.drawPie('#pie-chart3', $scope.topAppsByUsageData, true);
            }, function (response) {
                initialize();

                $log.debug('Cannot read statistics. Error: ', response);
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

})();
