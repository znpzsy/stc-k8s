(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.subscriber-profile', []);

    var SISubscriberProfileModule = angular.module('ccportal.subscriber-info.subscriber-profile');

    SISubscriberProfileModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.subscriber-profile', {
            url: "/subscriber-profile",
            templateUrl: "subscriber-info/subscriber-profile/subscriber-profile.html",
            controller: 'SISubscriberProfileCtrl',
            data: {
                statePrefix: 'subscriber-info.'
            },
            resolve: {
                subscriberProfile: function (UtilService) {
                    var subscriberProfile = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                    return subscriberProfile;
                }
            }
        });

    });

    // Subscriber Profile Controller
    SISubscriberProfileModule.controller('SISubscriberProfileCtrl', function ($scope, $log, Restangular, UtilService, subscriberProfile) {
        $log.debug('SISubscriberProfileCtrl');

        $scope.subscriber = subscriberProfile;
    });

})();
