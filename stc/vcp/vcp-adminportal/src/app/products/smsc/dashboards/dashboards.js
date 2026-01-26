(function () {

    'use strict';

    angular.module('adminportal.products.smsc.dashboards', []);

    var SmscDashboardsModule = angular.module('adminportal.products.smsc.dashboards');

    SmscDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.dashboards', {
            url: "/dashboard",
            templateUrl: "products/smsc/dashboards/dashboards.html",
            controller: 'SmscDashboardsCtrl'
        });

    });

    SmscDashboardsModule.controller('SmscDashboardsCtrl', function ($scope, $log, $interval, $q, $filter, SmscDashboardService, Restangular, PlotService,
                                                                    AdmPortalDashboardPromiseTracker, SMSC_EDR_RESULT_REASON) {
        $log.debug("SmscDashboardsCtrl");

        $scope.tileInfo = {};
        $scope.incomingSmsTraffic = {};
        $scope.outgoingSmsTraffic = {};
        $scope.failedSmsDeliveryAttempts = {};

        var initProperties = function () {
            $scope.tileInfo = {
                incomingSmsPerSecondForLastHour: 0,
                fdaSuccessRatioOutOfAllSuccess: 0,
                outgoingSmsPerSecondForLastHour: 0,
                smsSuccessRatioOutOfReceived: 0,
                avgTransactionTimeInMsec: 0,
                retryCapacityRatio: 0,
                smsSuccessRatioOutOfAccepted: 0
            };

            $scope.incomingSmsTraffic = [];
            $scope.outgoingSmsTraffic = [];
            $scope.failedSmsDeliveryAttempts = [];
        };

        var dashboarding = function (promiseTracker) {
            initProperties();

            var dashboardPromises = [
                SmscDashboardService.getSmscDashboard(promiseTracker),
                SmscDashboardService.getSfeDashboard(promiseTracker)
            ];

            $q.all(dashboardPromises).then(function (responses) {
                var smscDashboardResponse = Restangular.stripRestangular(responses[0]);
                var sfeDashboardResponse = Restangular.stripRestangular(responses[1]);

                $log.debug('SMSC Dashboard: ', smscDashboardResponse, ', SFE Dashboard', sfeDashboardResponse);

                if (smscDashboardResponse.appOrigIncomingSmsCount > 0) {
                    $scope.incomingSmsTraffic.push({
                        label: "Application",
                        data: smscDashboardResponse.appOrigIncomingSmsCount
                    });
                }
                if (smscDashboardResponse.gsmOrigIncomingSmsCount > 0) {
                    $scope.incomingSmsTraffic.push({
                        label: "Mobile",
                        data: smscDashboardResponse.gsmOrigIncomingSmsCount
                    });
                }

                if (smscDashboardResponse.appDestinedOutgoingSmsCount > 0) {
                    $scope.outgoingSmsTraffic.push({
                        label: "Application",
                        data: smscDashboardResponse.appDestinedOutgoingSmsCount
                    });
                }
                if (smscDashboardResponse.gsmDestinedOutgoingSmsCount > 0) {
                    $scope.outgoingSmsTraffic.push({
                        label: "Mobile",
                        data: smscDashboardResponse.gsmDestinedOutgoingSmsCount
                    });
                }

                var failureArray = smscDashboardResponse.countByErrorList;
                _.each(failureArray, function (item) {
                    if (item.count > 0) {
                        var label = 'N/A';
                        var reason = _.findWhere(SMSC_EDR_RESULT_REASON, {
                            reason_context: item.errorContext,
                            reason_code: item.errorCode
                        });
                        if (reason) {
                            label = reason.text + ' [' + item.errorContext + ' - ' + item.errorCode + ']';
                        }

                        $scope.failedSmsDeliveryAttempts.push({
                            label: label,
                            data: item.count
                        });
                    }
                });

                $scope.tileInfo = {
                    incomingSmsPerSecondForLastHour: smscDashboardResponse.incomingSmsPerSecondForLastHour,
                    fdaSuccessRatioOutOfAllSuccess: smscDashboardResponse.fdaSuccessRatioOutOfAllSuccess,
                    outgoingSmsPerSecondForLastHour: smscDashboardResponse.outgoingSmsPerSecondForLastHour,
                    smsSuccessRatioOutOfReceived: smscDashboardResponse.smsSuccessRatioOutOfReceived,
                    avgTransactionTimeInMsec: smscDashboardResponse.avgTransactionTimeInMsec,
                    retryCapacityRatio: sfeDashboardResponse.retryCapacityRatio,
                    smsSuccessRatioOutOfAccepted: smscDashboardResponse.smsSuccessRatioOutOfAccepted
                };

                PlotService.drawPie('#pie-chart-chart1', $scope.incomingSmsTraffic, true);
                PlotService.drawPie('#pie-chart-chart2', $scope.outgoingSmsTraffic, true);
                PlotService.drawPie('#pie-chart-chart3', $scope.failedSmsDeliveryAttempts, false, 0.01, 0.05);
            }, function (response) {
                $scope.incomingSmsTraffic = [];
                $scope.outgoingSmsTraffic = [];
                $scope.failedSmsDeliveryAttempts = [];

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
