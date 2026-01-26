(function () {

    'use strict';

    angular.module('adminportal.products.smsf.dashboards', []);

    var UscDashboardsModule = angular.module('adminportal.products.smsf.dashboards');

    UscDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsf.dashboards', {
            url: "/dashboard",
            templateUrl: "products/smsf/dashboards/dashboards.html",
            controller: 'SmsfDashboardsCtrl'
        });

    });

    UscDashboardsModule.controller('SmsfDashboardsCtrl', function ($scope, $log, $q, $translate, $interval, notification, SmsfDashboardService,
                                                                   Restangular, PlotService, AdmPortalDashboardPromiseTracker) {
        $log.debug("SmsfDashboardsCtrl");

        $scope.tileInfo = {};
        $scope.incomingSmsTraffic = {};
        $scope.outgoingSmsTraffic = {};
        $scope.failedSmsDeliveryAttempts = {};

        var initProperties = function () {
            $scope.tileInfo = {
                incomingSmsPerSecond: 0,
                outgoingSmsPerSecond: 0,
                smsSuccessRatioOutOfReceived: 0,
                smsSuccessRatioOutOfAttempted: 0,
                smsSuccessRatioOutOfAccepted: 0,
                moCountByErrorList: [],
                mtCountByErrorList: []
            };

            $scope.incomingSmsTraffic = [];
            $scope.outgoingSmsTraffic = [];
            $scope.failedSmsDeliveryAttempts = [];
        };
        var dashboarding = function (promiseTracker) {
            initProperties();

            var dashboardPromises = [
                SmsfDashboardService.getDashboardData(promiseTracker),
                SmsfDashboardService.getDashboardMOFailure(promiseTracker),
                SmsfDashboardService.getDashboardMTFailure(promiseTracker)
            ];

            $q.all(dashboardPromises).then(function (responses) {
                var smscDashboardResponse = Restangular.stripRestangular(responses[0]);
                var moFailureDashboardResponse = Restangular.stripRestangular(responses[1]);
                var mtFailureDashboardResponse = Restangular.stripRestangular(responses[2]);

                $log.debug('SMSF Dashboard: ', smscDashboardResponse, ', MOFailure Dashboard: ', moFailureDashboardResponse, ', MTFailure Dashboard: ', mtFailureDashboardResponse);

                $scope.tileInfo = {
                    incomingSmsPerSecond: smscDashboardResponse.incomingSmsPerSecond,
                    outgoingSmsPerSecond: smscDashboardResponse.outgoingSmsPerSecond,
                    smsSuccessRatioOutOfReceived: smscDashboardResponse.smsSuccessRatioOutOfReceived,
                    smsSuccessRatioOutOfAttempted: smscDashboardResponse.smsSuccessRatioOutOfAttempted,
                    smsSuccessRatioOutOfAccepted: smscDashboardResponse.smsSuccessRatioOutOfAccepted
                };

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
