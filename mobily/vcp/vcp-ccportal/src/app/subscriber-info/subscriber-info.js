(function () {

    'use strict';

    angular.module('ccportal.subscriber-info', [
        'ccportal.subscriber-info.directives',
        'ccportal.subscriber-info.subscriber-profile'
        // TODO - Removed temporarly 'ccportal.subscriber-info.activity-history',
        // TODO - Removed temporarly 'ccportal.subscriber-info.screening-manager-activity-history'
    ]);

    var SubscriberInfoModule = angular.module('ccportal.subscriber-info');

    SubscriberInfoModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info', {
            abstract: true,
            url: "/subscriber-info",
            templateUrl: 'subscriber-info/subscriber-info.html',
            data: {
                headerKey: 'Dashboard.PageHeader'
            }
        });

    });

})();
