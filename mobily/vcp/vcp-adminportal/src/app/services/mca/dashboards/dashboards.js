(function () {

    'use strict';

    angular.module('adminportal.services.mca.dashboards', []);

    var McaDashboardsModule = angular.module('adminportal.services.mca.dashboards');

    McaDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.dashboards', {
            url: "/dashboard",
            templateUrl: "services/mca/dashboards/dashboards.html",
            controller: 'McaDashboardsCtrl'
        });

    });

    McaDashboardsModule.controller('McaDashboardsCtrl', function ($scope, $log, $q, $interval, Restangular, notification, $translate, PlotService,
                                                                  CMPFService, MCADashboardService, AdmPortalDashboardPromiseTracker) {
        $log.debug("McaDashboardsCtrl");

        var initProperties = function () {
            $scope.tile = {
                dailyIncomingCall: 0,
                callRate: 0,
                mcaSmsSuccess: 0,
                mcaSmsRate: 0,
                nmSmsSuccess: 0,
                nmSmsRate: 0
            };

            $scope.notificationsData = [];
            $scope.redirectionReasonsData = [];
        };

        var getStatistics = function (promiseTracker) {
            return MCADashboardService.getStatistics(promiseTracker).then(function (response) {
                var apiResponse = Restangular.stripRestangular(response);

                return apiResponse;
            }, function (response) {
                $log.debug('Cannot read MCA Dashboard statistics. Error: ', response);

                return response;
            });
        };

        var drawRedirectionReasonsPieChart = function (pieChartData) {
            $scope.redirectionReasonsData = [];
            if (pieChartData.dailyIncomingBusy > 0) {
                $scope.redirectionReasonsData.push({
                    label: "Busy",
                    data: pieChartData.dailyIncomingBusy
                });
            }
            if (pieChartData.dailyIncomingNotAnswered > 0) {
                $scope.redirectionReasonsData.push({
                    label: "Not Answered",
                    data: pieChartData.dailyIncomingNotAnswered
                });
            }
            if (pieChartData.dailyIncomingUnreachable > 0) {
                $scope.redirectionReasonsData.push({
                    label: "Unreachable",
                    data: pieChartData.dailyIncomingUnreachable
                });
            }
            if (pieChartData.dailyIncomingUnconditional > 0) {
                $scope.redirectionReasonsData.push({
                    label: "Unconditional",
                    data: pieChartData.dailyIncomingUnconditional
                });
            }
            if (pieChartData.dailyIncomingUndefined > 0) {
                $scope.redirectionReasonsData.push({
                    label: "Undefined",
                    data: pieChartData.dailyIncomingUndefined
                });
            }

            PlotService.drawPie('#pie-chart1', $scope.redirectionReasonsData, true);
        };

        var drawNotificationsPieChart = function (pieChartData) {
            $scope.notificationsData = [];
            if (pieChartData.mcaSms && pieChartData.mcaSms.success > 0) {
                $scope.notificationsData.push({label: "Missed Call Alert", data: pieChartData.mcaSms.success});
            }
            if (pieChartData.nmSms && pieChartData.nmSms.success > 0) {
                $scope.notificationsData.push({label: "Notify Me", data: pieChartData.nmSms.success});
            }

            PlotService.drawPie('#pie-chart2', $scope.notificationsData, true);
        };

        var dashboarding = function (promiseTracker) {
            initProperties();
            getStatistics(promiseTracker).then(function (response) {
                var apiResponse = Restangular.stripRestangular(response);

                $scope.tile.dailyIncomingCall = apiResponse.dailyIncomingCall ? apiResponse.dailyIncomingCall : 0;
                $scope.tile.callRate = apiResponse.callRate ? apiResponse.callRate : 0;

                $scope.tile.mcaSmsSuccess = apiResponse.mcaSms ? apiResponse.mcaSms.success : 0;
                $scope.tile.mcaSmsRate = apiResponse.mcaSmsRate ? apiResponse.mcaSmsRate : 0;

                $scope.tile.nmSmsSuccess = apiResponse.nmSms ? apiResponse.nmSms.success : 0;
                $scope.tile.nmSmsRate = apiResponse.nmSmsRate ? apiResponse.nmSmsRate : 0;

                drawRedirectionReasonsPieChart(response);
                drawNotificationsPieChart(response);
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
