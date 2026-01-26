(function () {

    'use strict';

    angular.module('adminportal.services.rbt.dashboards', []);

    var RBTDashboardsModule = angular.module('adminportal.services.rbt.dashboards');

    RBTDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.dashboards', {
            url: "/dashboard",
            templateUrl: "services/rbt/dashboards/dashboards.html",
            controller: 'RBTDashboardsCtrl',
            resolve: {}
        });

    });

    RBTDashboardsModule.controller('RBTDashboardsCtrl', function ($scope, $log, $interval, notification, Restangular, PlotService,
                                                                  RBTDashboardService, AdmPortalDashboardPromiseTracker) {
        $log.debug("RBTDashboardsCtrl");

        $scope.tiles = {
            tile1: 0,
            tile2: 0,
            tile3: 0,
            tile4: 0,
            tile5: 0,
            tile6: 0
        };

        $scope.dailyRequestInfoData = [];
        $scope.dailyRbtFailureInfoData = [];
        $scope.dailyMsFailureInfoData = [];

        var preparePieChartArray = function (dataObject, properties, labels) {
            var pieChartArray = [];

            _.each(properties, function (property, index) {
                if (dataObject[property] > 0) {
                    pieChartArray.push({
                        label: labels[index],
                        data: dataObject[property]
                    });
                }
            });

            return pieChartArray;
        };

        var prepareFailurePieChartArray = function (dataArray) {
            var pieChartArray = [];

            _.each(dataArray, function (pieChartItem) {
                if (pieChartItem.value > 0) {
                    pieChartArray.push({
                        label: pieChartItem.key,
                        data: pieChartItem.value
                    });
                }
            });

            return pieChartArray;
        };

        var dashboarding = function (promiseTracker) {
            RBTDashboardService.getRBTDashboard(promiseTracker).then(function (response) {
                $log.debug('RBT Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // Values of the tiles.
                $scope.tiles.tile1 = apiResponse.rbtTileInfo.dailyIncomingCalls;

                $scope.tiles.tile2 = apiResponse.rbtTileInfo.incomingCallRate;
                $scope.tiles.tile3 = apiResponse.rbtTileInfo.signatureSuccessRatio;
                $scope.tiles.tile4 = apiResponse.rbtTileInfo.contentPlayed;
                $scope.tiles.tile5 = apiResponse.rbtTileInfo.avgPlaybackTime;
                $scope.tiles.tile6 = apiResponse.rbtTileInfo.hangupSuccessRatio;

                // Values of the pie charts.
                var rbtPieChartInfo = apiResponse.rbtPieChartInfo;

                $scope.dailyRequestInfoData = preparePieChartArray(rbtPieChartInfo.dailyRequestInfo, ['rbt', 'signature'], ['Ring Back Tone', 'Signature']);
                $scope.dailyRbtFailureInfoData = prepareFailurePieChartArray(rbtPieChartInfo.dailyRbtFailureInfo.failureMap.entry);
                $scope.dailyMsFailureInfoData = prepareFailurePieChartArray(rbtPieChartInfo.dailyMsFailureInfo.failureMap.entry);

                $scope.dailyRequestInfoData = PlotService.getLargeDataGroupByValue($scope.dailyRequestInfoData, 10);
                PlotService.drawPie('#pie-chart1', $scope.dailyRequestInfoData, true);
                $scope.dailyRbtFailureInfoData = PlotService.getLargeDataGroupByValue($scope.dailyRbtFailureInfoData, 10);
                PlotService.drawPie('#pie-chart2', $scope.dailyRbtFailureInfoData, true);
                $scope.dailyMsFailureInfoData = PlotService.getLargeDataGroupByValue($scope.dailyMsFailureInfoData, 10);
                PlotService.drawPie('#pie-chart3', $scope.dailyMsFailureInfoData, true);
            }, function (response) {
                $log.debug('Cannot read rbt statistics. Error: ', response);

                $scope.dailyRequestInfoData = [];
                $scope.dailyRbtFailureInfoData = [];
                $scope.dailyMsFailureInfoData = [];
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
