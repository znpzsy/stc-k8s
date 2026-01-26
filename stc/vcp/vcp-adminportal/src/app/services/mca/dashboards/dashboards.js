(function () {

    'use strict';

    angular.module('adminportal.services.mca.dashboards', []);

    var McaDashboardsModule = angular.module('adminportal.services.mca.dashboards');

    McaDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.dashboards', {
            url: "/dashboard",
            template: "<div ui-view></div>"
        }).state('services.mca.dashboards.basic', {
            url: "/basicMca",
            templateUrl: "services/mca/dashboards/dashboards.html",
            controller: 'McaDashboardsCtrl',
            resolve: {
                dashboardOption: function () {
                    return 'Mawjood';
                }
            }
        }).state('services.mca.dashboards.extra', {
            url: "/mca",
            templateUrl: "services/mca/dashboards/dashboards.html",
            controller: 'McaPlusDashboardsCtrl',
            resolve: {
                dashboardOption: function () {
                    return 'MawjoodExtra';
                }
            }
        });

    });



    McaDashboardsModule.controller('McaDashboardsCommonCtrl', function ($scope, $log, $q, $interval, $timeout, Restangular, notification, $translate, PlotService,
                                                                        CMPFService, MCADashboardService, AdmPortalDashboardPromiseTracker, dashboardOption) {
        $log.debug("McaDashboardsCtrl");

        var isMawjood = dashboardOption === 'Mawjood';

        var initProperties = function () {
            // initialize Mawjood
            $scope.mca = {
                dailyIncomingCall: 0,
                callRate: 0,
                mcaSmsSuccess: 0,
                mcaSmsRate: 0,
            };
            $scope.mcaNotificationsData = [];
            $scope.mcaRedirectionReasonsData = [];

            // initialize Mawjood Extra
            $scope.mcaPlus = {
                dailyIncomingCall: 0,
                callRate: 0,
                mcaSmsSuccess: 0,
                mcaSmsRate: 0,
                nmSmsSuccess: 0,
                nmSmsRate: 0
            };
            $scope.mcaPlusNotificationsData = [];
            $scope.mcaPlusRedirectionReasonsData = [];

        };

        var getStatistics = function (promiseTracker) {
            return MCADashboardService.getStatistics(promiseTracker).then(function (response) {
                $log.debug('Api response: ', response);
                return Restangular.stripRestangular(response);

            }, function (response) {
                $log.debug('Cannot read MCA Dashboard statistics. Error: ', response);
                return {};
            });
        };

        var drawPieChart = function (holder, data) {
            $timeout(function () {
                PlotService.drawPie(holder, data, true);
            }, 0);
        }

        var createPieData = function (stats, keys, labels) {
            var data = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (stats[key] > 0) {
                    data.push({ label: labels[i], data: stats[key] });
                }
            }
            return data;
        }

        // Used to get the value of an object property by its path
        function safeGet(obj, path, fallback) {
            return _.get ? _.get(obj, path, fallback) : (obj && obj[path] != null ? obj[path] : fallback);
        }

        // Sets Redirection Reason Chart Labels & Data
        var drawRedirectionReasonsPieChart = function (pieChartData) {
            // Redirection reasons
            var redirectionKeys = [
                'dailyIncomingBusy',
                'dailyIncomingNotAnswered',
                'dailyIncomingUnreachable',
                'dailyIncomingUnconditional',
                'dailyIncomingUndefined'
            ];
            var redirectionLabels = [
                'Busy',
                'Not Answered',
                'Unreachable',
                'Unconditional',
                'Undefined'
            ];
            var redirectionData = createPieData(pieChartData, redirectionKeys, redirectionLabels);
            var redirectionTarget = isMawjood ? '#pie-chart1' : '#pie-chart4';

            if (isMawjood) {
                $scope.mcaRedirectionReasonsData = redirectionData;
            } else {
                $scope.mcaPlusRedirectionReasonsData = redirectionData;
            }
            drawPieChart(redirectionTarget, redirectionData);
        };

        var drawNotificationsPieChart = function (pieChartData) {
            // Notification types
            var notificationsData = [];
            if (pieChartData.mcaSms && pieChartData.mcaSms.success > 0) {
                notificationsData.push({ label: 'Missed Call Alert', data: pieChartData.mcaSms.success });
            }
            if (pieChartData.nmSms && pieChartData.nmSms.success > 0) {
                notificationsData.push({ label: 'Notify Me', data: pieChartData.nmSms.success });
            }
            var notifTarget = isMawjood ? '#pie-chart2' : '#pie-chart5';

            if (isMawjood) {
                $scope.mcaNotificationsData = notificationsData;
            } else {
                $scope.mcaPlusNotificationsData = notificationsData;
            }
            drawPieChart(notifTarget, notificationsData);

            /*var pieChartName = $scope.dashboardOption == 'Mawjood' ? '#pie-chart2' : '#pie-chart5';
            $scope.notificationsData = [];
            if (pieChartData.mcaSms && pieChartData.mcaSms.success > 0) {
                $scope.notificationsData.push({label: "Missed Call Alert", data: pieChartData.mcaSms.success});
            }
            if (pieChartData.nmSms && pieChartData.nmSms.success > 0) {
                $scope.notificationsData.push({label: "Notify Me", data: pieChartData.nmSms.success});
            }


            if($scope.dashboardOption == 'Mawjood') {
                $scope.mcaNotificationsData = $scope.notificationsData;
            } else {
                $scope.mcaPlusNotificationsData = $scope.notificationsData;
            }

            drawPieChart(pieChartName, $scope.notificationsData);*/
        };

        var dashboarding = function (promiseTracker) {
            initProperties();
            getStatistics(promiseTracker).then(function (apiResponse) {

                var basic = apiResponse.basicAllRates || {};

                // Set Mawjood
                $scope.mca.dailyIncomingCall = basic.dailyIncomingCall || 0;
                $scope.mca.callRate = basic.callRate || 0;
                $scope.mca.mcaSmsSuccess = safeGet(basic, 'mcaSms.success', 0);
                $scope.mca.mcaSmsRate = basic.mcaSmsRate || 0;

                // Set Mawjood Plus
                $scope.mcaPlus.dailyIncomingCall = apiResponse.dailyIncomingCall || 0;
                $scope.mcaPlus.callRate = apiResponse.callRate || 0;
                $scope.mcaPlus.mcaSmsSuccess = safeGet(apiResponse, 'mcaSms.success', 0);
                $scope.mcaPlus.mcaSmsRate = apiResponse.mcaSmsRate || 0;
                $scope.mcaPlus.nmSmsSuccess = safeGet(apiResponse, 'nmSms.success', 0);
                $scope.mcaPlus.nmSmsRate = apiResponse.nmSmsRate || 0;
                $scope.mcaPlus.annSmsSuccess = safeGet(apiResponse, 'annSms.success', 0);
                $scope.mcaPlus.annSmsRate = apiResponse.annSmsRate || 0;

                var pieStats = isMawjood ? basic : apiResponse;

                drawRedirectionReasonsPieChart(pieStats);
                drawNotificationsPieChart(pieStats);
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

    // TODO: This is a copy of McaDashboardsCommonCtrl.  Refactor to remove duplication.
    // Service endpoint does not return the data for Mawjood for now. So, we are using the same logic for both Mawjood and Mawjood Extra.
    // Temporary solution until further clarification.
    McaDashboardsModule.controller('McaDashboardsCtrl', function ($scope, $controller, $log, dashboardOption) {
        $log.debug("McaDashboardsCtrl");

        $scope.dashboardOption = dashboardOption;
        $controller('McaDashboardsCommonCtrl', {$scope: $scope, dashboardOption: dashboardOption});

    });

    McaDashboardsModule.controller('McaPlusDashboardsCtrl', function ($scope, $controller, $log, dashboardOption) {
        $log.debug("McaPlusDashboardsCtrl");

        $scope.dashboardOption = dashboardOption;
        $controller('McaDashboardsCommonCtrl', {$scope: $scope, dashboardOption: dashboardOption});

    });
})();
