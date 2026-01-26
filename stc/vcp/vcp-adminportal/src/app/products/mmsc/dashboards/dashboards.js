(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.dashboards', []);

    var MmscDashboardsModule = angular.module('adminportal.products.mmsc.dashboards');

    MmscDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.dashboards', {
            url: "/dashboard",
            templateUrl: "products/mmsc/dashboards/dashboards.html",
            controller: 'MmscDashboardsCtrl'
        });

    });

    MmscDashboardsModule.controller('MmscDashboardsCtrl', function ($scope, $log, $interval, $timeout, MmscDashboardService, Restangular, PlotService,
                                                                    AdmPortalDashboardPromiseTracker) {

        $log.debug("MmscDashboardsCtrl");

        $scope.tileInfo = {
            incomingMMSRate: 0,
            mmsCapableDevices: 0,
            outgoingMMSRate: 0,
            successRatio: 0,
            avgNotificationTime: 0,
            mmBoxSize: 0
        };

        var resetPieChartArrays = function () {
            $scope.incomingTrafficData = [];
            $scope.outgoingTrafficData = [];
            $scope.failureMapEntryData = [];
            $scope.incomingTrafficDetailDataMM7 = [];
            $scope.outgoingTrafficDetailDataMM7 = [];
            $scope.failureInfoDetailDataMM7 = [];
            $scope.incomingTrafficDetailDataMM4 = [];
            $scope.outgoingTrafficDetailDataMM4 = [];
            $scope.failureInfoDetailDataMM4 = [];
        };

        var dashboarding = function (promiseTracker) {
            MmscDashboardService.getMmscDashboard(promiseTracker).then(function (response) {
                resetPieChartArrays();

                $log.debug('MMSC Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (!apiResponse.code) {
                    // Values of the pie charts.
                    var incomingTraffic = apiResponse.pieChartInfo.incomingTraffic;
                    _.each(incomingTraffic, function (value, name) {
                        if (value > 0) {
                            $scope.incomingTrafficData.push({
                                label: name,
                                data: value
                            });
                        }
                    });

                    var outgoingTraffic = apiResponse.pieChartInfo.outgoingTraffic;
                    _.each(outgoingTraffic, function (value, name) {
                        if (value > 0) {
                            $scope.outgoingTrafficData.push({
                                label: name,
                                data: value
                            });
                        }
                    });

                    var failureMap = apiResponse.pieChartInfo.dailyFailureInfo.failureMap;
                    for (var i = 0; i < failureMap.entry.length; i++) {
                        var failureMapEntry = failureMap.entry[i];
                        if (failureMapEntry.value > 0) {
                            $scope.failureMapEntryData.push({
                                label: failureMapEntry.key,
                                data: failureMapEntry.value
                            });
                        }
                    }

                    var incomingTrafficDetailMM7 = apiResponse.pieChartInfo.incomingTrafficDetailMM7.trafficMap;
                    for (var i = 0; i < incomingTrafficDetailMM7.entry.length; i++) {
                        var entry = incomingTrafficDetailMM7.entry[i]
                        if (entry.value > 0) {
                            $scope.incomingTrafficDetailDataMM7.push({
                                label: entry.key,
                                data: entry.value
                            });
                        }
                    }

                    var outgoingTrafficDetailMM7 = apiResponse.pieChartInfo.outgoingTrafficDetailMM7.trafficMap;
                    for (var i = 0; i < outgoingTrafficDetailMM7.entry.length; i++) {
                        var entry = outgoingTrafficDetailMM7.entry[i]
                        if (entry.value > 0) {
                            $scope.outgoingTrafficDetailDataMM7.push({
                                label: entry.key,
                                data: entry.value
                            });
                        }
                    }

                    var failureInfoDetailMM7 = apiResponse.pieChartInfo.failureInfoDetailMM7.failureMap;
                    for (var i = 0; i < failureInfoDetailMM7.entry.length; i++) {
                        var entry = failureInfoDetailMM7.entry[i]
                        if (entry.value > 0) {
                            $scope.failureInfoDetailDataMM7.push({
                                label: entry.key,
                                data: entry.value
                            });
                        }
                    }

                    var incomingTrafficDetailMM4 = apiResponse.pieChartInfo.incomingTrafficDetailMM4.trafficMap;
                    for (var i = 0; i < incomingTrafficDetailMM4.entry.length; i++) {
                        var entry = incomingTrafficDetailMM4.entry[i]
                        if (entry.value > 0) {
                            $scope.incomingTrafficDetailDataMM4.push({
                                label: entry.key,
                                data: entry.value
                            });
                        }
                    }

                    var outgoingTrafficDetailMM4 = apiResponse.pieChartInfo.outgoingTrafficDetailMM4.trafficMap;
                    for (var i = 0; i < outgoingTrafficDetailMM4.entry.length; i++) {
                        var entry = outgoingTrafficDetailMM4.entry[i]
                        if (entry.value > 0) {
                            $scope.outgoingTrafficDetailDataMM4.push({
                                label: entry.key,
                                data: entry.value
                            });
                        }
                    }

                    var failureInfoDetailMM4 = apiResponse.pieChartInfo.failureInfoDetailMM4.failureMap;
                    for (var i = 0; i < failureInfoDetailMM4.entry.length; i++) {
                        var entry = failureInfoDetailMM4.entry[i]
                        if (entry.value > 0) {
                            $scope.failureInfoDetailDataMM4.push({
                                label: entry.key,
                                data: entry.value
                            });
                        }
                    }
                    // Values of the tiles.
                    $scope.tileInfo = apiResponse.tileInfo;
                    if ($scope.tileInfo.mmsCapableDevices) {
                        $scope.tileInfo.mmsCapableDevices = Number($scope.tileInfo.mmsCapableDevices);
                    }

                    // Converting to second from milisecond.
                    $scope.tileInfo.avgNotificationTime = apiResponse.tileInfo.avgNotificationTime / 1000;
                }

                $scope.incomingTrafficData = PlotService.getLargeDataGroupByValue($scope.incomingTrafficData, 10);
                PlotService.drawPie('#pie-chart-chart1', $scope.incomingTrafficData, true);
                $scope.outgoingTrafficData = PlotService.getLargeDataGroupByValue($scope.outgoingTrafficData, 10);
                PlotService.drawPie('#pie-chart-chart2', $scope.outgoingTrafficData, true);
                $scope.failureMapEntryData = PlotService.getLargeDataGroupByValue($scope.failureMapEntryData, 10);
                PlotService.drawPie('#pie-chart-chart3', $scope.failureMapEntryData, true);
                $scope.incomingTrafficDetailDataMM7 = PlotService.getLargeDataGroupByValue($scope.incomingTrafficDetailDataMM7, 10);
                PlotService.drawPie('#pie-chart-chart4', $scope.incomingTrafficDetailDataMM7, true);
                $scope.outgoingTrafficDetailDataMM7 = PlotService.getLargeDataGroupByValue($scope.outgoingTrafficDetailDataMM7, 10);
                PlotService.drawPie('#pie-chart-chart5', $scope.outgoingTrafficDetailDataMM7, true);
                $scope.failureInfoDetailDataMM7 = PlotService.getLargeDataGroupByValue($scope.failureInfoDetailDataMM7, 10);
                PlotService.drawPie('#pie-chart-chart6', $scope.failureInfoDetailDataMM7, true);
                $scope.incomingTrafficDetailDataMM4 = PlotService.getLargeDataGroupByValue($scope.incomingTrafficDetailDataMM4, 10);
                PlotService.drawPie('#pie-chart-chart7', $scope.incomingTrafficDetailDataMM4, true);
                $scope.outgoingTrafficDetailDataMM4 = PlotService.getLargeDataGroupByValue($scope.outgoingTrafficDetailDataMM4, 10);
                PlotService.drawPie('#pie-chart-chart8', $scope.outgoingTrafficDetailDataMM4, true);
                $scope.failureInfoDetailDataMM4 = PlotService.getLargeDataGroupByValue($scope.failureInfoDetailDataMM4, 10);
                PlotService.drawPie('#pie-chart-chart9', $scope.failureInfoDetailDataMM4, true);
            }, function (response) {
                resetPieChartArrays();

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
