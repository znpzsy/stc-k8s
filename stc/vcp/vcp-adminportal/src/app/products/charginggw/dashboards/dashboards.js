(function () {

    'use strict';

    angular.module('adminportal.products.charginggw.dashboards', []);

    var ChargingGwDashboardsModule = angular.module('adminportal.products.charginggw.dashboards');

    ChargingGwDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.charginggw.dashboards', {
            url: "/dashboard",
            templateUrl: "products/charginggw/dashboards/dashboards.html",
            controller: 'ChargingGwDashboardsCtrl',
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

    ChargingGwDashboardsModule.controller('ChargingGwDashboardsCtrl', function ($scope, $log, $interval, $translate, Restangular, PlotService,
                                                                                AdmPortalDashboardPromiseTracker, ChargingGwService) {
        $log.debug("ChargingGwDashboardsCtrl");

        $scope.tileInfo = {
            debitRate: 0,
            debitSuccessRatio: 0,
            refundRate: 0,
            refundSuccessRatio: 0
        };

        var preparePieChartArray = function (dataArray) {
            var pieChartArray = [];

            _.each(dataArray, function (pieChartItem) {
                if (pieChartItem.value > 0) {
                    pieChartArray.push({
                        label: pieChartItem.name,
                        data: pieChartItem.value
                    });
                }
            });

            return pieChartArray;
        };

        var dashboarding = function (promiseTracker) {
            ChargingGwService.getDashboard(promiseTracker).then(function (response) {
                $log.debug('Charging GW Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                var pieChartInfo = apiResponse.pieChart;

                // Values of the pie charts.
                $scope.debitTrxCountData = preparePieChartArray(pieChartInfo.debitTrxCount);
                $scope.debitTotalAmountData = preparePieChartArray(pieChartInfo.debitTotalAmount);
                $scope.debitFailureReasonData = preparePieChartArray(pieChartInfo.debitFailureReason);

                $scope.refundTrxCountData = preparePieChartArray(pieChartInfo.refundTrxCount);
                $scope.refundTotalAmountData = preparePieChartArray(pieChartInfo.refundTotalAmount);
                $scope.refundFailureReasonData = preparePieChartArray(pieChartInfo.refundFailureReason);

                // Values of the tiles.
                $scope.tileInfo = apiResponse.tileInfo;

                $scope.debitTrxCountData = PlotService.getLargeDataGroupByValue($scope.debitTrxCountData, 10);
                PlotService.drawPie('#pie-chart1', $scope.debitTrxCountData, true);
                $scope.debitTotalAmountData = PlotService.getLargeDataGroupByValue($scope.debitTotalAmountData, 10);
                PlotService.drawPie('#pie-chart2', $scope.debitTotalAmountData, true);
                $scope.debitFailureReasonData = PlotService.getLargeDataGroupByValue($scope.debitFailureReasonData, 10);
                PlotService.drawPie('#pie-chart3', $scope.debitFailureReasonData, true);

                $scope.refundTrxCountData = PlotService.getLargeDataGroupByValue($scope.refundTrxCountData, 10);
                PlotService.drawPie('#pie-chart4', $scope.refundTrxCountData, true);
                $scope.refundTotalAmountData = PlotService.getLargeDataGroupByValue($scope.refundTotalAmountData, 10);
                PlotService.drawPie('#pie-chart5', $scope.refundTotalAmountData, true);
                $scope.refundFailureReasonData = PlotService.getLargeDataGroupByValue($scope.refundFailureReasonData, 10);
                PlotService.drawPie('#pie-chart6', $scope.refundFailureReasonData, true);
            }, function (response) {
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

})
();
