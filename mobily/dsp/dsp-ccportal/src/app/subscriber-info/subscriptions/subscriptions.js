(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.subscriptions', [
        'ccportal.subscriber-info.subscriptions.serviceoffers',
        'ccportal.subscriber-info.subscriptions.contentoffers'
    ]);

    var SISubscriptionsModule = angular.module('ccportal.subscriber-info.subscriptions');

    SISubscriptionsModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.subscriptions', {
            abstract: true,
            url: "/subscriptions",
            template: "<div ui-view></div>",
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
