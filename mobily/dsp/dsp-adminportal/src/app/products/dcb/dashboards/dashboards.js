(function () {

    'use strict';

    angular.module('adminportal.products.dcb.dashboards', []);

    var DcbDashboardsModule = angular.module('adminportal.products.dcb.dashboards');

    DcbDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.dcb.dashboards', {
            url: "/dashboard",
            templateUrl: "products/dcb/dashboards/dashboards.html",
            controller: 'DcbDashboardsCtrl',
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            },
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                }
            }
        });

    });

    DcbDashboardsModule.controller('DcbDashboardsCtrl', function ($scope, $log, $interval, $translate, Restangular, PlotService,
                                                                  AdmPortalDashboardPromiseTracker, DcbService, services) {
        $log.debug("DcbDashboardsCtrl");

        $scope.tileInfo = {
            chargeRate: 0,
            chargeSuccessRatio: 0,
            refundRate: 0,
            refundSuccessRatio: 0
        };

        var serviceMap = {};
        _.each(services.services, function (service) {
            serviceMap[service.id] = service.name + " (" + service.id + ")";
        });

        var preparePieChartArray = function (dataMapObject) {
            var pieChartArray = [];

            _.each(dataMapObject, function (value, serviceId) {
                if (value > 0) {
                    pieChartArray.push({
                        label: serviceMap[serviceId] || serviceId,
                        data: value
                    });
                }
            });

            return pieChartArray;
        };

        var dashboarding = function (promiseTracker) {
            DcbService.getDashboard(promiseTracker).then(function (response) {
                $log.debug('DCB Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // Values of the tiles.
                $scope.tileInfo = {
                    chargeRate: Number(apiResponse.chargeAmountRate),
                    chargeSuccessRatio: Number(apiResponse.chargeAmountSuccessRatio),
                    refundRate: Number(apiResponse.refundAmountRate),
                    refundSuccessRatio: Number(apiResponse.refundAmountSuccessRatio)
                };

                // Values of the pie charts.
                $scope.chargeTrxCountData = preparePieChartArray(apiResponse.serviceChargeAmountCountMap);
                $scope.chargeTrxCountData = PlotService.getLargeDataGroupByValue($scope.chargeTrxCountData, 10);
                PlotService.drawPie('#pie-chart1', $scope.chargeTrxCountData, true);

                $scope.chargeTotalAmountData = preparePieChartArray(apiResponse.serviceChargeAmountAmountMap);
                $scope.chargeTotalAmountData = PlotService.getLargeDataGroupByValue($scope.chargeTotalAmountData, 10);
                PlotService.drawPie('#pie-chart2', $scope.chargeTotalAmountData, true);

                $scope.chargeFailureReasonData = preparePieChartArray(apiResponse.chargeAmountResponseTypeMap);
                $scope.chargeFailureReasonData = PlotService.getLargeDataGroupByValue($scope.chargeFailureReasonData, 10);
                PlotService.drawPie('#pie-chart3', $scope.chargeFailureReasonData, true);

                $scope.refundTrxCountData = preparePieChartArray(apiResponse.serviceRefundAmountCountMap);
                $scope.refundTrxCountData = PlotService.getLargeDataGroupByValue($scope.refundTrxCountData, 10);
                PlotService.drawPie('#pie-chart4', $scope.refundTrxCountData, true);

                $scope.refundTotalAmountData = preparePieChartArray(apiResponse.serviceRefundAmountAmountMap);
                $scope.refundTotalAmountData = PlotService.getLargeDataGroupByValue($scope.refundTotalAmountData, 10);
                PlotService.drawPie('#pie-chart5', $scope.refundTotalAmountData, true);

                $scope.refundFailureReasonData = preparePieChartArray(apiResponse.refundAmountResponseTypeMap);
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
