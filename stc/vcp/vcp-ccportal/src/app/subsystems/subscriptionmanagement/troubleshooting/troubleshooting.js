(function () {

    'use strict';

    angular.module('ccportal.subsystems.subscriptionmanagement.troubleshooting', [
        'ccportal.subsystems.subscriptionmanagement.troubleshooting.servicesubscription',
        'ccportal.subsystems.subscriptionmanagement.troubleshooting.contentsubscription'
    ]);

    var SubscriptionManagementTroubleshootingModule = angular.module('ccportal.subsystems.subscriptionmanagement.troubleshooting');

    SubscriptionManagementTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.troubleshooting', {
            url: "/troubleshooting",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'READ_ALL_TROUBLESHOOTING'
                ]
            }
        });

    });

})();


