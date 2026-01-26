(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns', [
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.bulksms',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.bulkivr'
    ]);

    var BulkMessagingInteractiveCampaignsOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns');

    BulkMessagingInteractiveCampaignsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.interactivecampaigns', {
            url: "/interactive-campaigns",
            templateUrl: "products/bulkmessaging/operations/operations.campaigns.main.html",
            data: {
                permissions: [
                    'BMS__OPERATIONS_CAMPAIGN_READ'
                ]
            }
        });

    });

})();
