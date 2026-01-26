(function () {

    'use strict';

    

    // angular.module('ccportal.services.rbt.operations', [
    //     'ccportal.services.rbt.operations.activedefaulttone',
    //     'ccportal.services.rbt.operations.specialconditionassignment'
    // ]);

    // var RBTOperationsModule = angular.module('ccportal.services.rbt.operations');

    angular.module('ccportal.subsystems.subscriptionmanagement.service', [
        'ccportal.subsystems.subscriptionmanagement.service.serviceoffers',
        'ccportal.subsystems.subscriptionmanagement.service.troubleshooting',
        //'subsystems.subscriptionmanagement.service.contentoffers'
    ]);

    var SISubscriptionsModule = angular.module('ccportal.subsystems.subscriptionmanagement.service');

    SISubscriptionsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.service', {
            abstract: true,
            url: "/service",
            templateUrl: "subsystems/subscriptionmanagement/service/subscriptions.html",
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
