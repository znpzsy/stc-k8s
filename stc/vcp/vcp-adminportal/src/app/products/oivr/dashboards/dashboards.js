(function () {

    'use strict';

    angular.module('adminportal.products.oivr.dashboards', []);

    var OIVRDashboardsModule = angular.module('adminportal.products.oivr.dashboards');

    OIVRDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.oivr.dashboards', {
            url: "/dashboard",
            templateUrl: "products/oivr/dashboards/dashboards.html",
            controller: 'OIVRDashboardsCtrl'
        });

    });

    OIVRDashboardsModule.controller('OIVRDashboardsCtrl', function ($scope, $log, $q, $translate, $interval, notification, OIVRDashboardService,
                                                                   Restangular, PlotService, AdmPortalDashboardPromiseTracker) {
        $log.debug("OIVRDashboardsCtrl");

        $scope.tileInfo = {};
        $scope.incomingSmsTraffic = {};
        $scope.outgoingSmsTraffic = {};

        var initProperties = function () {
            $scope.tileInfo = {
                totalCallAttempt: 0,
                totalCallSuccess: 0,
                totalCallFail: 0,
                totalCallSuccessRate: 0,
                totalAvgCallDuration: 0
            };

            $scope.totalCallAttemptPerCampaign = [];
            $scope.totalCallAttemptPerClient = [];
        };

        var preparePieChartArray = function (dataArray) {
            var pieChartArray = [];

            _.each(dataArray, function (pieChartItem) {
                if (pieChartItem.totalRequestCallAttempt > 0) {
                    pieChartArray.push({
                        label: pieChartItem.id,
                        data: pieChartItem.totalRequestCallAttempt
                    });
                }
            });

            return pieChartArray;
        };

        var dashboarding = function (promiseTracker) {
            initProperties();

            OIVRDashboardService.getDashboardRates(promiseTracker).then(function (response) {
                $log.debug('OIVR Dashboard Rates received: ', response);

                $scope.tileInfo = {
                    totalCallAttempt: response.totalCallAttempt,
                    totalCallSuccess: response.totalCallSuccess,
                    totalCallFail: response.totalCallFail,
                    totalCallSuccessRate: response.totalCallSuccessRate,
                    totalAvgCallDuration: response.totalAvgCallDuration
                };

                if(response.totalCallAttemptPerCampaign && response.totalCallAttemptPerCampaign.length > 0) {
                    _.each(response.totalCallAttemptPerCampaign, function (client) {
                        $scope.totalCallAttemptPerCampaign.push({
                            label: client.id,
                            data: client.totalRequestCallAttempt
                        });
                    })
                   // $scope.totalCallAttemptPerCampaign = preparePieChartArray(response.totalCallAttemptPerCampaign);
                }
                if (response.totalCallAttemptPerClient && response.totalCallAttemptPerClient.length > 0) {
                    $scope.totalCallAttemptPerClient = preparePieChartArray(response.totalCallAttemptPerClient);
                    /*_.each(response.totalCallAttemptPerClient, function (client) {
                        $scope.totalCallAttemptPerClient.push({
                            label: client.id,
                            data: client.totalRequestCallAttempt
                        });
                    });*/
                }

                $log.debug('OIVR Dashboard - totalCallAttemptPerCampaign ', $scope.totalCallAttemptPerCampaign);
                $log.debug('OIVR Dashboard - totalCallAttemptPerClient ', $scope.totalCallAttemptPerClient);

                PlotService.drawPie('#pie-chart1', $scope.totalCallAttemptPerCampaign, true);
                PlotService.drawPie('#pie-chart2', $scope.totalCallAttemptPerClient, true);


            }, function (error) {
                $log.debug('Cannot read statistics. Error: ', error);
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
