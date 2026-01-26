(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations', [
        'adminportal.subsystems.subscriptionmanagement.operations.offers',
        //'adminportal.subsystems.subscriptionmanagement.operations.shortcodes',
        'adminportal.subsystems.subscriptionmanagement.operations.subscribers'
        //'adminportal.subsystems.subscriptionmanagement.operations.customerprofilings'
    ]);

    var SubscriptionManagementOperationsModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations');

    SubscriptionManagementOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: 'subsystems/subscriptionmanagement/operations/operations.html'
        });

    });

})();