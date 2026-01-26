(function () {

    'use strict';

    angular.module('adminportal.services.vm.dashboards', []);

    var VMDashboardsModule = angular.module('adminportal.services.vm.dashboards');

    VMDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.dashboards', {
            url: "/dashboard",
            templateUrl: "services/vm/dashboards/dashboards.html",
            controller: 'VMDashboardsCtrl',
            resolve: {}
        });

    });

    VMDashboardsModule.controller('VMDashboardsCtrl', function ($scope, $log, $interval, notification, Restangular, PlotService, VMDashboardService,
                                                                CMPFService, AdmPortalDashboardPromiseTracker) {
        $log.debug("VMDashboardsCtrl");

        $scope.tileInfo = {
            vmDepositStatsInfo: {
                dailyAvgDepositDuration: 0,
                dailyAvgMsgDuration: 0,
                dailySuccessRatio: 0
            },
            vmNotificationStatsInfo: {
                dailySmsCount: 0
            },
            vmRetrievalStatsInfo: {
                dailyAvgRetrievalDuration: 0,
                dailySuccessRatio: 0
            }
        };

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
            // Get Voice Mail dashboard data
            VMDashboardService.getVMDashboard(promiseTracker).then(function (response) {
                $log.debug('Voice Mail Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);
                var vmPieChartInfo = apiResponse.vmPieChartInfo;

                // Values of the pie charts.
                $scope.dailyRequestInfoData = preparePieChartArray(vmPieChartInfo.dailyRequestInfo, ['deposit', 'retrieval'], ['Deposit', 'Retrieve']);
                $scope.dailyDepositFailureInfoData = prepareFailurePieChartArray(vmPieChartInfo.dailyDepositFailureInfo.failureMap.entry);
                $scope.dailyRetrievalFailureInfoData = prepareFailurePieChartArray(vmPieChartInfo.dailyRetrievalFailureInfo.failureMap.entry);

                // Values of the tiles.
                $scope.tileInfo = apiResponse.vmTileInfo;

                $scope.dailyRequestInfoData = PlotService.getLargeDataGroupByValue($scope.dailyRequestInfoData, 10);
                PlotService.drawPie('#pie-chart1', $scope.dailyRequestInfoData, true);
                $scope.dailyDepositFailureInfoData = PlotService.getLargeDataGroupByValue($scope.dailyDepositFailureInfoData, 10);
                PlotService.drawPie('#pie-chart2', $scope.dailyDepositFailureInfoData, true);
                $scope.dailyRetrievalFailureInfoData = PlotService.getLargeDataGroupByValue($scope.dailyRetrievalFailureInfoData, 10);
                PlotService.drawPie('#pie-chart3', $scope.dailyRetrievalFailureInfoData, true);
            }, function (response) {
                $scope.dailyRequestInfoData = [];
                $scope.dailyDepositFailureInfoData = [];
                $scope.dailyRetrievalFailureInfoData = [];

                $log.debug('Cannot read dashboard data. Error: ', response);
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
