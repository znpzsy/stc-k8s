(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.activityhistory', [
        'ccportal.subscriber-info.activityhistory.dcbhistory',
        'ccportal.subscriber-info.activityhistory.otphistory',
        'ccportal.subscriber-info.activityhistory.subscriptionhistory',
        'ccportal.subscriber-info.activityhistory.messaginghistory',
        'ccportal.subscriber-info.activityhistory.charginghistory',
        'ccportal.subscriber-info.activityhistory.screeninghistory'
    ]);

    var ActivityHistoryModule = angular.module('ccportal.subscriber-info.activityhistory');

    ActivityHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.activityhistory', {
            abstract: true,
            url: "/activity-history",
            template: '<div ui-view></div>'
        });

    });

})();
