(function () {

    'use strict';

    angular.module('adminportal.products.ussi.dashboards', []);

    var UscDashboardsModule = angular.module('adminportal.products.ussi.dashboards');

    UscDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.ussi.dashboards', {
            url: "/dashboard",
            templateUrl: "products/ussi/dashboards/dashboards.html",
            controller: 'UssiDashboardsCtrl'
        });

    });

    UscDashboardsModule.controller('UssiDashboardsCtrl', function ($scope, $log, $q, $translate, $interval, notification, UssiDashboardService,
                                                                  Restangular, PlotService, AdmPortalDashboardPromiseTracker) {
        $log.debug("UssiDashboardsCtrl");

        $scope.throughput = 0;
        $scope.sipSuccessRate = 0;
        $scope.mapSuccessRate = 0;

        var dashboarding = function (promiseTracker) {

            UssiDashboardService.getDashboardData(promiseTracker).then(function (response) {
                $log.debug('All USSIGW Dashboard Data Summary : ', response);

                $scope.mapSuccessRate = Restangular.stripRestangular(response).mapSuccessRatio;
                $scope.sipSuccessRate = Restangular.stripRestangular(response).sipSuccessRatio;
            }, function (response) {
                $log.error('Cannot read USSIGW Dashboard Data : ', response);
            });

            UssiDashboardService.getDashboardTps(promiseTracker).then(function (response) {
                $scope.throughput = response.tps;
                $log.debug('TPS : ', $scope.throughput);
            }, function (response) {
                $log.debug('Cannot read USSIGW TPS Stats : ', response);
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
