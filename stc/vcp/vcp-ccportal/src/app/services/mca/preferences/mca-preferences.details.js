(function () {

    'use strict';

    angular.module('ccportal.services.mca.preferences.details', []);

    var MCAPreferencesDetailsModule = angular.module('ccportal.services.mca.preferences.details');

    MCAPreferencesDetailsModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.preferences.details', {
            url: "/details",
            templateUrl: 'services/mca/preferences/mca-preferences.details.html',
            controller: 'MCAPreferencesCtrl',
            resolve: {
                subscription: function (SSMSubscribersService) {
                    return SSMSubscribersService.getMCNSubscriptionDetailByMsisdn();
                }
            }
        });

    });

    MCAPreferencesDetailsModule.controller('MCAPreferencesCtrl', function ($scope, $log, $state, $q, $translate, notification, UtilService, SessionService, subscription) {
        $log.debug('MCAPreferencesCtrl');

        $scope.subscriberDetail = subscription;

        // This state should only be accessible if the user has a MawjoodExtra subscription
        if(!SessionService.hasMawjoodExtraSubscription()){
            $state.go('services.mca.activity-history');
            return;
        }


        // Check if the response contains an offer subscription named MawjoodExtra
        if(subscription.serviceOfferSubscriptions && subscription.serviceOfferSubscriptions.length > 0){
            var mawjoodExtraOffer = _.find(subscription.serviceOfferSubscriptions, function(subs){
                return subs.offerName === 'MawjoodExtra';
            });
            if (mawjoodExtraOffer) {
                var language = mawjoodExtraOffer.language ? mawjoodExtraOffer.language : '';
                var attributes = mawjoodExtraOffer.attributes ? mawjoodExtraOffer.attributes : []
                var annStatus = _.find(attributes, function(attribute){ return attribute.name === 'annStatus' || attribute.name === 'ANN_STATUS' });
                var annNumber = _.find(attributes, function(attribute){ return attribute.name === 'annNumber' || attribute.name === 'ANN_NUMBER' });
                var mobilePhone = _.find(attributes, function(attribute){ return attribute.name === 'MOBILE_PHONE' });
                var svcType = _.find(attributes, function(attribute){ return attribute.name === 'SVC_TYPE' });
                // var isFixedLine = _.find(attributes, function(attribute){ return attribute.name === 'IS_FIXED_LINE' });
                // SVC_TYPE=00100 (Fixed)
                // SVC_TYPE=00001 (Mobile)

                $scope.subscriptionDetail = {
                    language: language,
                    annNumber: annNumber ? annNumber.value : '',
                    annStatus: annStatus ? annStatus.value === "true" : false,
                    mobilePhone: mobilePhone ? mobilePhone.value : '',
                    isFixedLine: svcType.value === '00100', //isFixedLine ? isFixedLine.value : '',
                    attributes: attributes
                };
            } else {
                $scope.subscriptionDetail = {
                    annNumber: '',
                    annStatus: false,
                    mobilePhone:  '',
                    isFixedLine: false,
                    attributes: []
                };
            }
        }

    });

})();
