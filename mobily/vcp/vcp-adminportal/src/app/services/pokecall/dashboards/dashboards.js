(function () {

    'use strict';

    angular.module('adminportal.services.pokecall.dashboards', []);

    var PokeCallDashboardsModule = angular.module('adminportal.services.pokecall.dashboards');

    PokeCallDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('services.pokecall.dashboards', {
            url: "/dashboard",
            templateUrl: "services/pokecall/dashboards/dashboards.html",
            controller: 'PokeCallDashboardsCtrl'
        });

    });

    PokeCallDashboardsModule.controller('PokeCallDashboardsCtrl', function ($scope, $log, $interval, P4MService, Restangular, PlotService,
                                                                            AdmPortalDashboardPromiseTracker) {
        $log.debug("PokeCallDashboardsCtrl");

        $scope.pokeTileInfo = {
            dailyRequestCount: 0,
            dailySuccessCallRatio: 0,
            tile3: 'TBD',
            tile4: 'TBD',
            tile5: 'TBD',
            tile6: 'TBD'
        };

        $scope.failureMapEntryData = [];

        var dashboarding = function (promiseTracker) {
            P4MService.getPokeCallServiceDashboard(promiseTracker).then(function (response) {
                $log.debug('Poke Call Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // Values of the pie charts.
                $scope.failureMapEntryData = [];
                var failureMap = apiResponse.pokePieChartInfo.dailyFailureInfo.failureMap;
                for (var i = 0; i < failureMap.entry.length; i++) {
                    var failureMapEntry = failureMap.entry[i];
                    if (failureMapEntry.value > 0) {
                        $scope.failureMapEntryData.push({
                            label: failureMapEntry.key,
                            data: failureMapEntry.value
                        });
                    }
                }

                // Values of the tiles.
                $scope.pokeTileInfo.dailyRequestCount = apiResponse.pokeTileInfo.dailyRequestCount;
                $scope.pokeTileInfo.dailySuccessCallRatio = apiResponse.pokeTileInfo.dailySuccessCallRatio;

                PlotService.drawPie('#pie-chart1', $scope.failureMapEntryData);
            }, function (response) {
                $scope.pokeTileInfo = {
                    dailyRequestCount: 0,
                    dailySuccessCallRatio: 0,
                    tile3: 'TBD',
                    tile4: 'TBD',
                    tile5: 'TBD',
                    tile6: 'TBD'
                };

                $scope.failureMapEntryData = [];

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
