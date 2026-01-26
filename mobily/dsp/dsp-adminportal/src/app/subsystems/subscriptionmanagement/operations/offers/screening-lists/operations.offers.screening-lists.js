(function () {
    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers.screening-lists', [
        'adminportal.subsystems.subscriptionmanagement.operations.offers.screening-lists.global'
    ]);

    var SubscriptionManagementOperationsOffersScreeningListsModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers.screening-lists');

    SubscriptionManagementOperationsOffersScreeningListsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations.offers.screening-lists', {
            abstract: true,
            url: "/:offerId/manage-screening-lists",
            data: {
                backState: 'subsystems.subscriptionmanagement.operations.offers.list'
            },
            template: '<div ui-view></div>',
            resolve: {
                offer: function ($stateParams, CMPFService) {
                    return CMPFService.getOffer($stateParams.offerId, false, false);
                }
            }
        });

    });

})();
