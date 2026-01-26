(function () {

    'use strict';

    angular.module('ccportal.subscriber-info', [
        'ccportal.subscriber-info.constants',
        'ccportal.subscriber-info.filters',
        'ccportal.subscriber-info.directives',
        'ccportal.subscriber-info.subscriber-profile',
        'ccportal.subscriber-info.preferences',
        'ccportal.subscriber-info.dcb',
        'ccportal.subscriber-info.rbt',
        'ccportal.subscriber-info.services',
        'ccportal.subscriber-info.subscriptions',
        'ccportal.subscriber-info.messaginggw',
        'ccportal.subscriber-info.charginggw',
        'ccportal.subscriber-info.activityhistory'
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
