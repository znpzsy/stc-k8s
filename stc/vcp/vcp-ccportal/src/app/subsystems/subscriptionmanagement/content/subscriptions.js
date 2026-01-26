(function () {

    'use strict';


    angular.module('ccportal.subsystems.subscriptionmanagement.content', [
        'ccportal.subsystems.subscriptionmanagement.content.contentoffers',
        'ccportal.subsystems.subscriptionmanagement.content.troubleshooting'
    ]);

    var SISubscriptionsModule = angular.module('ccportal.subsystems.subscriptionmanagement.content');

    SISubscriptionsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.content', {
            abstract: true,
            url: "/service",
            templateUrl: "subsystems/subscriptionmanagement/content/subscriptions.html",
            data: {
                doNotQuerySubscriberAtStateChange: true,
                permissions: [
                    'CC__OFFER_READ',
                    'CC__SERVICE_READ',
                    'CC__SUBSCRIPTION_READ'
                ]
            },
            resolve: {
                subscriber: function (SSMSubscribersService, SessionService) {
                    var msisdn = SessionService.getMsisdn();

                    return SSMSubscribersService.getSubscriberByMsisdn(msisdn);
                }
            }
        });

    });

})();


