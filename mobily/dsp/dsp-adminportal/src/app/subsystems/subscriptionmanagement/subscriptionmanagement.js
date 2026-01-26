(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement', [
        "adminportal.subsystems.subscriptionmanagement.dashboards",
        "adminportal.subsystems.subscriptionmanagement.templates",
        "adminportal.subsystems.subscriptionmanagement.operations",
        "adminportal.subsystems.subscriptionmanagement.troubleshooting"
    ]);

    var SubscriptionManagementModule = angular.module('adminportal.subsystems.subscriptionmanagement');

    SubscriptionManagementModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement', {
            abstract: true,
            url: "/subscription-management",
            templateUrl: 'subsystems/subscriptionmanagement/subscriptionmanagement.html',
            data: {
                headerKey: 'Subsystems.SubscriptionManagement.PageHeader'
            }
        });

    });

})();
