/**
 * Created by tayfuno on 7/24/14.
 */
(function () {

    'use strict';

    angular.module('adminportal.services.cc.dashboards', []);

    var CCDashboardsModule = angular.module('adminportal.services.cc.dashboards');

    CCDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('services.cc.dashboards', {
            url: "/dashboard",
            templateUrl: "services/cc/dashboards/dashboards.html",
            controller: 'CCDashboardsCtrl'
        });

    });

    CCDashboardsModule.controller('CCDashboardsCtrl', function ($scope, $log, $filter, $interval, P4MService, Restangular, PlotService,
                                                                AdmPortalDashboardPromiseTracker) {
        $log.debug("CCDashboardsCtrl");

        $scope.ccTileInfo = {
            dailyAverageDuration: 0,
            dailyRequestCount: 0,
            dailySuccessRatio: 0,
            dailyTotalDuration: 0,
            dailyUniqueCalledCount: 0,
            dailyUniqueCallingCount: 0
        };

        var dashboarding = function (promiseTracker) {
            $scope.dailyRequestInfoData = [];
            $scope.dailyUniqueUserInfoCallingData = [];
            $scope.dailyUniqueUserInfoCalledData = [];

            P4MService.getCcDashboard(promiseTracker).then(function (response) {
                $log.debug('Cc Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);
                // Values of the pie charts.
                var dailyRequestInfo = apiResponse.ccPieChartInfo.dailyRequestInfo;
                if (dailyRequestInfo.ivrRequest > 0) {
                    $scope.dailyRequestInfoData.push({
                        label: 'IVR',
                        data: dailyRequestInfo.ivrRequest
                    });
                }
                if (dailyRequestInfo.smsRequest > 0) {
                    $scope.dailyRequestInfoData.push({
                        label: 'SMS',
                        data: dailyRequestInfo.smsRequest
                    });
                }
                if (dailyRequestInfo.ussdRequest > 0) {
                    $scope.dailyRequestInfoData.push({
                        label: 'USSD',
                        data: dailyRequestInfo.ussdRequest
                    });
                }

                // Values of the pie charts.
                var dailyUniqueUserInfoCalling = apiResponse.ccPieChartInfo.dailyUniqueUserInfoCalling.userInfoMap;
                for (i = 0; i < dailyUniqueUserInfoCalling.entry.length; i++) {
                    var dailyUniqueUserInfoCallingEntry = dailyUniqueUserInfoCalling.entry[i];
                    if (dailyUniqueUserInfoCallingEntry.value > 0) {
                        $scope.dailyUniqueUserInfoCallingData.push({
                            label: (dailyUniqueUserInfoCallingEntry.key === 'MBB' ? 'Broadband' : dailyUniqueUserInfoCallingEntry.key),
                            data: dailyUniqueUserInfoCallingEntry.value
                        });
                    }
                }

                var dailyUniqueUserInfoCalled = apiResponse.ccPieChartInfo.dailyUniqueUserInfoCalled.userInfoMap;
                for (var i = 0; i < dailyUniqueUserInfoCalled.entry.length; i++) {
                    var dailyUniqueUserInfoCalledEntry = dailyUniqueUserInfoCalled.entry[i];
                    if (dailyUniqueUserInfoCalledEntry.value > 0) {
                        $scope.dailyUniqueUserInfoCalledData.push({
                            label: (dailyUniqueUserInfoCalledEntry.key === 'MBB' ? 'Broadband' : dailyUniqueUserInfoCalledEntry.key),
                            data: dailyUniqueUserInfoCalledEntry.value
                        });
                    }
                }

                $scope.failureMapEntryData = [];
                var failureMap = apiResponse.ccPieChartInfo.dailyFailureInfo.failureMap;
                for (i = 0; i < failureMap.entry.length; i++) {
                    var failureMapEntry = failureMap.entry[i];
                    if (failureMapEntry.value > 0) {
                        $scope.failureMapEntryData.push({
                            label: failureMapEntry.key,
                            data: failureMapEntry.value
                        });
                    }
                }

                // Values of the tiles.
                $scope.ccTileInfo = apiResponse.ccTileInfo;
                // Converting to minute from second.
                $scope.ccTileInfo.dailyTotalDuration = apiResponse.ccTileInfo.dailyTotalDuration / 60;

                PlotService.drawPie('#pie-chart1', $scope.dailyRequestInfoData, true);
                PlotService.drawPie('#pie-chart2', $scope.dailyUniqueUserInfoCallingData, true);
                PlotService.drawPie('#pie-chart3', $scope.dailyUniqueUserInfoCalledData, true);
                PlotService.drawPie('#pie-chart4', $scope.failureMapEntryData);
            }, function (response) {
                $scope.dailyUniqueUserInfoCallingData = [];
                $scope.dailyUniqueUserInfoCalledData = [];
                $scope.failureMapEntryData = [];

                $log.error('Cannot read statistics. Error: ', response);
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
