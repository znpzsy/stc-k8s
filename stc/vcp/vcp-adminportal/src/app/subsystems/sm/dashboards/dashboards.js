(function () {

    'use strict';

    angular.module('adminportal.subsystems.screeningmanager.dashboards', []);

    var ScreeningmanagerDashboardsModule = angular.module('adminportal.subsystems.screeningmanager.dashboards');

    ScreeningmanagerDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.screeningmanager.dashboards', {
            url: "/dashboard",
            templateUrl: "subsystems/sm/dashboards/dashboards.html",
            controller: 'ScreeningmanagerDashboardsCtrl'
        });

    });

    ScreeningmanagerDashboardsModule.controller('ScreeningmanagerDashboardsCtrl', function ($scope, $log, $interval, $filter, ScreeningManagerService,
                                                                                            Restangular, PlotService, AdmPortalDashboardPromiseTracker) {
        $log.debug("ScreeningmanagerDashboardsCtrl");

        $scope.blackListCount = 0;
        $scope.whiteListCount = 0;
        $scope.subscriberCount = 0;
        $scope.scopeCount = 0;
        $scope.ruleCount = 0;
        $scope.tile6 = 0;

        var getScopes = function (promiseTracker) {
            ScreeningManagerService.getScopes(promiseTracker).then(function (response) {
                $log.debug('Success. Response: ', response);
                var scopes = Restangular.stripRestangular(response).scopesStatsResponse;
                $scope.scopeCount = scopes.distinctScopeCount;

                $scope.scopesData = [];
                angular.forEach(scopes.scopeStats, function (value, key) {
                    value.screeningScopeReference = $filter('ScreeningScopeFilter')(value.screeningScopeReference);
                    if (value.count > 0) {
                        this.push({label: value.screeningScopeReference, data: value.count});
                    }
                }, $scope.scopesData);
                $scope.scopesData = PlotService.getLargeDataGroupByValue($scope.scopesData, 10);
                PlotService.drawPie('#pie-scopes', $scope.scopesData, true);
            }, function (response) {
                $scope.scopesData = [];

                $log.debug('Cannot read scope list. Error: ', response);
            });
        };

        var getScreenings = function (promiseTracker) {
            ScreeningManagerService.getScreenings(promiseTracker).then(function (response) {
                $log.debug('Success. Response: ', response);
                var screenings = Restangular.stripRestangular(response).modesScreeningsStatsResponse;
                $scope.blackListCount = screenings.blacklistedCount;
                $scope.whiteListCount = screenings.whitelistedCount;

                var modesStats = screenings.modesStats;
                $scope.ruleCount = modesStats.acceptAllCount + modesStats.rejectAllCount + modesStats.acceptWhitelistCount + modesStats.rejectBlacklistCount;

                $scope.modeData = [];
                if (modesStats.acceptAllCount > 0) {
                    $scope.modeData.push({label: "Accept All", data: modesStats.acceptAllCount});
                }
                if (modesStats.rejectAllCount > 0) {
                    $scope.modeData.push({label: "Reject All", data: modesStats.rejectAllCount});
                }
                if (modesStats.acceptWhitelistCount > 0) {
                    $scope.modeData.push({label: "Accept Whitelist", data: modesStats.acceptWhitelistCount});
                }
                if (modesStats.rejectBlacklistCount > 0) {
                    $scope.modeData.push({label: "Reject Blacklist", data: modesStats.rejectBlacklistCount});
                }
                PlotService.drawPie('#pie-rules', $scope.modeData, true);

                var selectiveSubscribers = modesStats.acceptWhitelistCount + modesStats.rejectBlacklistCount;
                $scope.specificity = (selectiveSubscribers / $scope.ruleCount) * 100;
            }, function (response) {
                $scope.modeData = [];

                $log.debug('Cannot read operator list. Error: ', response);
            });
        };

        var getSubscribers = function (promiseTracker) {
            ScreeningManagerService.getSubscribers(promiseTracker).then(function (response) {
                $log.debug('Success. Response: ', response);
                $scope.subscriberCount = Restangular.stripRestangular(response).subscriberStatsResponse.count;
            }, function (response) {
                $log.debug('Cannot read scope list. Error: ', response);
            });
        };

        var getConstraints = function (promiseTracker) {
            ScreeningManagerService.getConstraints(promiseTracker).then(function (response) {
                $log.debug('Success. Response: ', response);
                var constraintsStats = Restangular.stripRestangular(response).constraintsStatsResponse;
                $scope.tile6 = constraintsStats.totalCount;

                $scope.constraintsData = [];
                if (constraintsStats.recurringConstraintCount > 0) {
                    $scope.constraintsData.push({label: "Recurring", data: constraintsStats.recurringConstraintCount + 1});
                }
                if (constraintsStats.absoluteConstraintCount > 0) {
                    $scope.constraintsData.push({label: "Absolute", data: constraintsStats.absoluteConstraintCount + 1});
                }
                PlotService.drawPie('#pie-constraints', $scope.constraintsData, true);
            }, function (response) {
                $scope.constraintsData = [];

                $log.debug('Cannot read operator list. Error: ', response);
            });
        };

        var dashboarding = function (promiseTracker) {
            $log.debug('loading');
            getScreenings(promiseTracker);
            getSubscribers(promiseTracker);
            getScopes(promiseTracker);
            getConstraints(promiseTracker);
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
