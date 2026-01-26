(function () {

    'use strict';

    angular.module('adminportal.services.cmb.dashboards', []);

    var CmbDashboardsModule = angular.module('adminportal.services.cmb.dashboards');

    CmbDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('services.cmb.dashboards', {
            url: "/dashboard",
            templateUrl: "services/cmb/dashboards/dashboards.html",
            controller: 'CmbDashboardsCtrl'
        });

    });

    CmbDashboardsModule.controller('CmbDashboardsCtrl', function ($scope, $log, $interval, P4MService, Restangular, PlotService,
                                                                  AdmPortalDashboardPromiseTracker) {
        $log.debug("CmbDashboardsCtrl");

        $scope.pcmTileInfo = {
            dailyRequestCount: 0,
            dailySuccessRatio: 0,
            dailyUniqueCalledCount: 0,
            dailyUniqueCallingCount: 0
        };

        var dashboarding = function (promiseTracker) {
            P4MService.getPcmDashboard(promiseTracker).then(function (response) {
                $log.debug('Pcm Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // Values of the tiles.
                $scope.cmbTileInfo = apiResponse.cmbTileInfo;

                // Values of the pie charts.
                $scope.failureMapEntryData = [];
                var failureMap = apiResponse.cmbPieChartInfo.dailyFailureInfo.failureMap;
                for (var i = 0; i < failureMap.entry.length; i++) {
                    var failureMapEntry = failureMap.entry[i];
                    if (failureMapEntry.value > 0) {
                        $scope.failureMapEntryData.push({
                            label: failureMapEntry.key,
                            data: failureMapEntry.value
                        });
                    }
                }

                PlotService.drawPie('#pie-chart1', $scope.failureMapEntryData);

            }, function (response) {

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
