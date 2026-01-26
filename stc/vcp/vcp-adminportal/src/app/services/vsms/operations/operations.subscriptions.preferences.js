(function () {

    'use strict';

    angular.module('adminportal.services.vsms.operations.subscriptions.preferences', []);

    var VSMSOperationsSubscriptionsPreferencesModule = angular.module('adminportal.services.vsms.operations.subscriptions.preferences');

    VSMSOperationsSubscriptionsPreferencesModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.operations.subscriptions.preferences', {
            abstract: true,
            url: "",
            templateUrl: 'services/vsms/operations/operations.subscriptions.html',
            controller: 'VSMSOperationsSubscriptionsCtrl'
        }).state('services.vsms.operations.subscriptions.preferences.view', {
            url: "/preferences",
            views: {
                'searchForm': {
                    templateUrl: 'services/vsms/operations/operations.search.html'
                },
                'subscriptionPreferencesForm': {
                    templateUrl: 'services/vsms/operations/operations.subscriptions.preferences.html'
                }
            }
        });

    });

})();
