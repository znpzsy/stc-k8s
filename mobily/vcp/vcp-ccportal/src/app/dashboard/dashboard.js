(function () {

    'use strict';

    angular.module('ccportal.dashboard', []);

    var DashboardModule = angular.module('ccportal.dashboard');

    DashboardModule.config(function ($stateProvider) {

        $stateProvider.state('dashboards', {
            url: "/dashboard",
            templateUrl: 'dashboard/dashboard.html',
            controller: 'DashboardCtrl',
            data: {
                headerKey: 'Dashboard.PageHeader'
            }
        });

    });

    DashboardModule.controller('DashboardCtrl', function ($rootScope, $scope, $log, $location, $state, $stateParams, $translate, notification, UtilService,
                                                          CMPFCacheService) {
        // Remove subscriber profile information from session store
        UtilService.removeFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

        $scope.find = function (subscriber) {
            CMPFCacheService.getSubscriber(subscriber.msisdn).then(function () {
                $state.params.doNotQuerySubscriber = true;
                $state.go('subscriber-info.subscriber-profile');
            }, function () {
                notification({
                    type: 'warning',
                    text: $translate.instant('Dashboard.Form.Messages.NotFound', {msisdn: subscriber.msisdn})
                });
            });
        };
    });

})();
