(function () {

    'use strict';

    angular.module('adminportal.products.messaginggw.dashboards', []);

    var MessagingGwDashboardsModule = angular.module('adminportal.products.messaginggw.dashboards');

    MessagingGwDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.messaginggw.dashboards', {
            url: "/dashboard",
            templateUrl: "products/messaginggw/dashboards/dashboards.html",
            controller: 'MessagingGwDashboardsCtrl',
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

    MessagingGwDashboardsModule.controller('MessagingGwDashboardsCtrl', function ($scope, $log, $interval, $q, Restangular, PlotService,
                                                                                  AdmPortalDashboardPromiseTracker, MessagingGwDashboardService) {
        $log.debug("MessagingGwDashboardsCtrl");

        $scope.sms = {
            tileInfo: {
                mtSmsRate: 0,
                mtSmsSuccessRatio: 0,
                moSmsRate: 0,
                moSmsSuccessRatio: 0,
                tile5: 0,
                tile6: 0
            }
        };

        $scope.mms = {
            tileInfo: {
                mtMmsRate: 0,
                mtMmsSuccessRatio: 0,
                moMmsRate: 0,
                moMmsSuccessRatio: 0,
                tile5: 0,
                tile6: 0
            }
        };

        var preparePieChartArray = function (dataArray, labelProperty, dataProperty) {
            var pieChartArray = [];

            _.each(dataArray, function (pieChartItem) {
                if (pieChartItem[dataProperty] > 0) {
                    pieChartArray.push({
                        label: pieChartItem[labelProperty],
                        data: pieChartItem[dataProperty]
                    });
                }
            });

            return pieChartArray;
        };

        var initializeArrays = function () {
            $scope.mtSmsCountByApplicationData = [];
            $scope.moSmsCountByApplicationData = [];
            $scope.smsDeliveryFailureByErrorData = [];

            $scope.mtMmsCountByApplicationData = [];
            $scope.moMmsCountByApplicationData = [];
            $scope.mmsDeliveryFailureByErrorData = [];
        };

        var dashboarding = function (promiseTracker) {
            var dashboardPromises = [
                MessagingGwDashboardService.getLastHourDashboard(promiseTracker),
                MessagingGwDashboardService.getLastDayDashboard(promiseTracker)
            ];

            $q.all(dashboardPromises).then(function (responses) {
                var lastHourDashboardResponse = Restangular.stripRestangular(responses[0]); // For tiles
                var lastDayDashboardResponse = Restangular.stripRestangular(responses[1]); // For pie charts

                $log.debug('Messaging Gateway - Last Hour Dashboard: ', lastHourDashboardResponse, ', Last Day Dashboard', lastDayDashboardResponse);

                // Tiles
                $scope.sms.tileInfo.mtSmsRate = lastHourDashboardResponse.mtSmsRate;
                $scope.sms.tileInfo.mtSmsSuccessRatio = lastHourDashboardResponse.mtSmsSuccessRatio;
                $scope.sms.tileInfo.moSmsRate = lastHourDashboardResponse.moSmsRate;
                $scope.sms.tileInfo.moSmsSuccessRatio = lastHourDashboardResponse.moSmsSuccessRatio;
                $scope.mms.tileInfo.mtMmsRate = lastHourDashboardResponse.mtMmsRate;
                $scope.mms.tileInfo.mtMmsSuccessRatio = lastHourDashboardResponse.mtMmsSuccessRatio;
                $scope.mms.tileInfo.moMmsRate = lastHourDashboardResponse.moMmsRate;
                $scope.mms.tileInfo.moMmsSuccessRatio = lastHourDashboardResponse.moMmsSuccessRatio;

                $scope.mtSmsCountByApplicationData = preparePieChartArray(lastDayDashboardResponse.mtSmsCountByApplication, 'applicationName', 'count');
                $scope.moSmsCountByApplicationData = preparePieChartArray(lastDayDashboardResponse.moSmsCountByApplication, 'applicationName', 'count');
                $scope.smsDeliveryFailureByErrorData = preparePieChartArray(lastDayDashboardResponse.smsDeliveryFailureByError, 'errorCodeDescription', 'count');

                PlotService.drawPie('#pie-chart-chart1', $scope.mtSmsCountByApplicationData, false, 0.03, 0.06);
                PlotService.drawPie('#pie-chart-chart2', $scope.moSmsCountByApplicationData, false, 0.03,0.06);
                PlotService.drawPie('#pie-chart-chart3', $scope.smsDeliveryFailureByErrorData, true);

                $scope.mtMmsCountByApplicationData = preparePieChartArray(lastDayDashboardResponse.mtMmsCountByApplication, 'applicationName', 'count');
                $scope.moMmsCountByApplicationData = preparePieChartArray(lastDayDashboardResponse.moMmsCountByApplication, 'applicationName', 'count');
                $scope.mmsDeliveryFailureByErrorData = preparePieChartArray(lastDayDashboardResponse.mmsDeliveryFailureByError, 'errorCodeDescription', 'count');

                PlotService.drawPie('#pie-chart-chart4', $scope.mtMmsCountByApplicationData, false, 0.03,0.06);
                PlotService.drawPie('#pie-chart-chart5', $scope.moMmsCountByApplicationData, false, 0.03,0.06);
                PlotService.drawPie('#pie-chart-chart6', $scope.mmsDeliveryFailureByErrorData, true);
            }, function (response) {
                $log.debug('Cannot read messaging gateway dashboard. Error: ', response);

                initializeArrays();
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
