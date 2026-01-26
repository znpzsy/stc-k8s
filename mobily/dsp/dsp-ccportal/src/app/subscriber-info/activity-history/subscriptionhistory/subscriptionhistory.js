(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.activityhistory.subscriptionhistory', [
        'ccportal.subscriber-info.activityhistory.subscriptionhistory.servicesubscription',
        'ccportal.subscriber-info.activityhistory.subscriptionhistory.contentsubscription'
    ]);

    var ActivityHistorySubscriptionHistoryModule = angular.module('ccportal.subscriber-info.activityhistory.subscriptionhistory');

    ActivityHistorySubscriptionHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.activityhistory.subscriptionhistory', {
            url: "/subscription-history",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'CC__SUBSCRIPTION_READ'
                ]
            }
        });

    });

})();