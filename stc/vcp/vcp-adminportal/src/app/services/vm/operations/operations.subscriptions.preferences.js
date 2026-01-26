(function () {

    'use strict';

    angular.module('adminportal.services.vm.operations.subscriptions.preferences', []);

    var VMOperationsSubscriptionsPreferencesModule = angular.module('adminportal.services.vm.operations.subscriptions.preferences');

    VMOperationsSubscriptionsPreferencesModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.operations.subscriptions.preferences', {
            abstract: true,
            url: "",
            templateUrl: 'services/vm/operations/operations.subscriptions.html',
            controller: 'VMOperationsSubscriptionsCtrl'
        }).state('services.vm.operations.subscriptions.preferences.view', {
            url: "/preferences",
            views: {
                'searchForm': {
                    templateUrl: 'services/vm/operations/operations.search.html'
                },
                'subscriptionPreferencesForm': {
                    templateUrl: 'services/vm/operations/operations.subscriptions.preferences.html'
                }
            }
        });

    });

})();
