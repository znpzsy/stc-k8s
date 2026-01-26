(function () {

    'use strict';

    angular.module('adminportal.products.usc.dashboards', []);

    var UscDashboardsModule = angular.module('adminportal.products.usc.dashboards');

    UscDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.usc.dashboards', {
            url: "/dashboard",
            templateUrl: "products/usc/dashboards/dashboards.html",
            controller: 'UscDashboardsCtrl'
        });

    });

    UscDashboardsModule.controller('UscDashboardsCtrl', function ($scope, $log, $q, $translate, $interval, notification, UssdGwProvService, UssdBrowserService,
                                                                  Restangular, PlotService, AdmPortalDashboardPromiseTracker) {
        $log.debug("UscDashboardsCtrl");

        $scope.totalAppCount = 0;
        $scope.smppConnectionCount = 0;
        $scope.ussdSessionCount = 0;
        $scope.avgSessionDuration = 0;
        $scope.throughput = 0;
        $scope.avgResponseTime = 99;// TODO

        var dashboarding = function (promiseTracker) {

            UssdBrowserService.getUssdSessions(promiseTracker).then(function (response) {
                $log.debug('Ussd Browser Stats : ', response);

                var apiResponse = Restangular.stripRestangular(response);

                $scope.sessionsByOrig = [];
                if (apiResponse.totalMTSessions > 0) {
                    $scope.sessionsByOrig.push({label: 'AO', data: apiResponse.totalMTSessions});
                }
                if (apiResponse.totalMOSessions > 0) {
                    $scope.sessionsByOrig.push({label: 'MO', data: apiResponse.totalMOSessions});
                }
                PlotService.drawPie('#pie-chart-sessionsByOrig', $scope.sessionsByOrig, true);

                $scope.sessionsByApp = [];
                angular.forEach(apiResponse.sessionsByApplication, function (value, key) {
                    if (value.appMOSessions + value.appMTSessions > 0) {
                        this.push({label: value.applicationName, data: value.appMOSessions + value.appMTSessions});
                    }
                }, $scope.sessionsByApp);
                $scope.sessionsByApp = PlotService.getLargeDataGroupByValue($scope.sessionsByApp, 10);
                PlotService.drawPie('#pie-chart-sessionsByApp', $scope.sessionsByApp, true);
            }, function (response) {
                $scope.sessionsByOrig = [];
                $scope.sessionsByApp = [];

                $log.error('Cannot read Ussd Browser Stats. Error: ', response);
            });

            UssdGwProvService.getAllSessionsSummary(promiseTracker).then(function (response) {
                $log.debug('All Ussd Sessions Summary : ', response);
                $scope.ussdSessionCount = Restangular.stripRestangular(response).ussdSessionSummary.numOfSessions;
            }, function (response) {
                $log.error('Cannot read Ussd sessions : ', response);
            });

            UssdGwProvService.getSmppConnections(promiseTracker).then(function (response) {
                $log.debug('Smpp connections : ', response);
                $scope.smppConnectionCount = Restangular.stripRestangular(response).numOfConnections;
            }, function (response) {
                $log.error('Cannot read smpp connections : ', response);
            });

            var getAllUssdApps = function () {
                return UssdGwProvService.getAllUssdApplications(promiseTracker).then(function (response) {
                    $log.debug('Ussd Gw SMPP applications : ', response);
                    $scope.smppAppCount = Restangular.stripRestangular(response).length;
                    return $scope.smppAppCount
                }, function (response) {
                    $log.debug('Cannot read Smpp Applications : ', response);
                    throw( new Error($translate.instant('CommonMessages.ServiceIsNotAvailable')));
                });
            };

            var getWsApps = function () {
                return UssdBrowserService.getApplications(promiseTracker).then(function (response) {
                    $log.debug('Ussd Browser WS applications: ', response);
                    $scope.wsAppCount = Restangular.stripRestangular(response).length;
                    return $scope.wsAppCount;
                }, function (response) {
                    $log.debug('Cannot read WS applications. Error: ', response);
                    throw( new Error($translate.instant('CommonMessages.ServiceIsNotAvailable')));
                });
            };

            var drawPieChart = function () {
                $scope.totalAppCount = $scope.wsAppCount + $scope.smppAppCount;

                $scope.appChartData = [];
                if ($scope.smppAppCount > 0) {
                    $scope.appChartData.push({label: 'SMPP', data: $scope.smppAppCount});
                }
                if ($scope.wsAppCount > 0) {
                    $scope.appChartData.push({label: 'Web Services', data: $scope.wsAppCount});
                }
                PlotService.drawPie('#pie-chart-applications', $scope.appChartData, true);
            };

            var reportProblems = function (fault) {
                $scope.appChartData = [];

                $log.error(String(fault));
                notification({
                    type: 'warning',
                    text: String(fault)
                });
            };

            getAllUssdApps().then(getWsApps).then(drawPieChart).catch(reportProblems);

            UssdGwProvService.getTPS(promiseTracker).then(function (response) {
                $scope.throughput = response.last;
                $log.debug('TPS : ', $scope.throughput);
            }, function (response) {
                $log.debug('Cannot read UssdGw TPS Stats : ', response);
            });

            UssdGwProvService.getSessionDuration(promiseTracker).then(function (response) {
                $scope.avgSessionDuration = response.avg;
                $log.debug('Session Duration : ', $scope.avgSessionDuration);
            }, function (response) {
                $log.debug('Cannot read UssdGw Session Stats : ', response);
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
