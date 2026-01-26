(function () {

    'use strict';

    angular.module('ccportal.subsystems.subscriptionmanagement', [
        'ccportal.subsystems.subscriptionmanagement.constants',
        'ccportal.subsystems.subscriptionmanagement.directives',
        'ccportal.subsystems.subscriptionmanagement.service',
        'ccportal.subsystems.subscriptionmanagement.content',
        // 'ccportal.subsystems.subscriptionmanagement.content.subscriptions',
        // 'ccportal.subsystems.subscriptionmanagement.contentsubscription',
        // "ccportal.subsystems.subscriptionmanagement.troubleshooting"
    ]);

    var SubscriptionManagementModule = angular.module('ccportal.subsystems.subscriptionmanagement');

    SubscriptionManagementModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement', {
            abstract: true,
            url: "/subscription-management",
            templateUrl: 'subsystems/subscriptionmanagement/subscriptionmanagement.html',
            data: {
                headerKey: 'Subsystems.SubscriptionManagement.PageHeader'
            },
            controller: 'SubscriptionManagementController'
            // resolve: {
            //     subscriber: function (SSMSubscribersService, SessionService) {
            //         var msisdn = SessionService.getMsisdn();
            //
            //         return SSMSubscribersService.getSubscriberByMsisdn(msisdn);
            //     }
            // }
        });

    });

    // Define the controller
    SubscriptionManagementModule.controller('SubscriptionManagementController', function($scope, $translate, $log, notification, Restangular, SessionService, UtilService, RBTBackendService) {
        $log.debug('SubscriptionManagementController');

        $scope.openRBTPortalApp = function(RbtPortalUri) {
            // Get subscriber msisdn
            var msisdn = SessionService.getMsisdn();

            // Call RBT backend for token
            RBTBackendService.getToken().then(function (response) {
                $log.debug('Token received from RBT backend. Response: ', response);
                var tokenResponse = Restangular.stripRestangular(response);

                if (tokenResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                } else {

                    $log.debug('Redirecting to RBT portal: ', tokenResponse);
                    var payload = {
                        timestamp: new Date().getTime(),
                        msisdn: msisdn,
                        auth: tokenResponse
                    };

                    $log.debug('getRedirectURL called with payload: ', payload);
                    window.open(UtilService.getRedirectUrl(payload, RbtPortalUri), "_blank").focus();

                    notification({
                        type: 'success',
                        text: $translate.instant('Subsystems.SubscriptionManagement.ContentSubscriptionRedirection')
                    });

                    $scope.cancel();
                }


            }, function (response) {
                $log.debug('Cannot authenticate to RBT backend response: ', response);

                if (response.data && response.data.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.data.errorCode,
                            errorText: response.data.message
                        })
                    });
                }
            });

        };

    });

})();

