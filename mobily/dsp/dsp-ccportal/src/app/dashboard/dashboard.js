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

    DashboardModule.controller('DashboardCtrl', function ($scope, $log, $state, $translate, $location, UtilService, SSMSubscribersService, notification, $stateParams) {
        // Remove subscriber profile information from session store
        UtilService.removeFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

        $scope.find = function (subscriber) {
            if (subscriber && subscriber.msisdn) {
                var msisdn = angular.copy(subscriber.msisdn);

                if (!msisdn.startsWith(UtilService.COUNTRY_CODE)) {
                    msisdn = UtilService.COUNTRY_CODE + msisdn;
                }

                SSMSubscribersService.getSubscriberByMsisdn(msisdn).then(function (subscriberResponse) {
                    // Checks if passed a redirect parameter through query string.
                    $state.params.doNotQuerySubscriberAtStateChange = true;
                    $state.go('subscriber-info.subscriber-profile');
                }, function (subscriberErrorResponse) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Dashboard.Form.Messages.NotFound', {msisdn: msisdn})
                    });
                });
            }
        };
    });

})();
