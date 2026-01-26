(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.troubleshooting', [
        'adminportal.subsystems.subscriptionmanagement.troubleshooting.servicesubscription',
        'adminportal.subsystems.subscriptionmanagement.troubleshooting.contentsubscription'
    ]);

    var SubscriptionManagementTroubleshootingModule = angular.module('adminportal.subsystems.subscriptionmanagement.troubleshooting');

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


