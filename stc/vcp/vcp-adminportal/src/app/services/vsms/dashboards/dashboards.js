(function () {

    'use strict';

    angular.module('adminportal.services.vsms.dashboards', []);

    var VSMSDashboardsModule = angular.module('adminportal.services.vsms.dashboards');

    VSMSDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.dashboards', {
            url: "/dashboard",
            templateUrl: "services/vsms/dashboards/dashboards.html",
            controller: 'VSMSDashboardsCtrl'
        });

    });

    VSMSDashboardsModule.controller('VSMSDashboardsCtrl', function ($scope, $log, $interval, VSMSDashboardService, Restangular, PlotService,
                                                                    AdmPortalDashboardPromiseTracker) {
        $log.debug("VSMSDashboardsCtrl");

        $scope.tileInfo = {
            dailyRequestCount: 0,
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

        var dashboarding = function (promiseTracker) {
            VSMSDashboardService.getVSMSDashboard(promiseTracker).then(function (response) {
                $log.debug('Voice SMS Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);
                var vmPieChartInfo = apiResponse.vmPieChartInfo;

                // Values of the pie charts.
                $scope.dailyRequestInfoData = [];
                if (vmPieChartInfo.dailyRequestInfo) {
                    var dailyRequestInfoDeposit = vmPieChartInfo.dailyRequestInfo.deposit;
                    if (dailyRequestInfoDeposit) {
                        $scope.dailyRequestInfoData.push({
                            label: 'Deposit',
                            data: dailyRequestInfoDeposit
                        });
                    }

                    var dailyRequestInfoRetrieval = vmPieChartInfo.dailyRequestInfo.retrieval;
                    if (dailyRequestInfoRetrieval) {
                        $scope.dailyRequestInfoData.push({
                            label: 'Retrieve',
                            data: dailyRequestInfoRetrieval
                        });
                    }
                }

                $scope.dailyDepositFailureInfoData = [];
                if (vmPieChartInfo.dailyDepositFailureInfo) {
                    var dailyDepositFailureInfo = vmPieChartInfo.dailyDepositFailureInfo.failureMap;
                    for (var i = 0; i < dailyDepositFailureInfo.entry.length; i++) {
                        var dailyDepositFailureInfoEntry = dailyDepositFailureInfo.entry[i];
                        if (dailyDepositFailureInfoEntry.value > 0) {
                            $scope.dailyDepositFailureInfoData.push({
                                label: dailyDepositFailureInfoEntry.key,
                                data: dailyDepositFailureInfoEntry.value
                            });
                        }
                    }
                }

                $scope.dailyRetrievalFailureInfoData = [];
                if (vmPieChartInfo.dailyRetrievalFailureInfo) {
                    var dailyRetrievalFailureInfo = vmPieChartInfo.dailyRetrievalFailureInfo.failureMap;
                    for (var i = 0; i < dailyRetrievalFailureInfo.entry.length; i++) {
                        var dailyRetrievalFailureInfoEntry = dailyRetrievalFailureInfo.entry[i];
                        if (dailyRetrievalFailureInfoEntry.value > 0) {
                            $scope.dailyRetrievalFailureInfoData.push({
                                label: dailyRetrievalFailureInfoEntry.key,
                                data: dailyRetrievalFailureInfoEntry.value
                            });
                        }
                    }
                }

                // Values of the tiles.
                $scope.tileInfo = apiResponse.vmTileInfo;

                PlotService.drawPie('#pie-chart1', $scope.dailyRequestInfoData, true);
                $scope.dailyDepositFailureInfoData = PlotService.getLargeDataGroupByValue($scope.dailyDepositFailureInfoData, 10);
                PlotService.drawPie('#pie-chart2', $scope.dailyDepositFailureInfoData, true);
                $scope.dailyRetrievalFailureInfoData = PlotService.getLargeDataGroupByValue($scope.dailyRetrievalFailureInfoData, 10);
                PlotService.drawPie('#pie-chart3', $scope.dailyRetrievalFailureInfoData, true);
            }, function (response) {
                $scope.dailyRequestInfoData = [];
                $scope.dailyDepositFailureInfoData = [];
                $scope.dailyRetrievalFailureInfoData = [];

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
