(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.configuration', [
        'adminportal.products.bulkmessaging.configuration.settings'
    ]);

    var BulkMessagingConfigurationModule = angular.module('adminportal.products.bulkmessaging.configuration');

    BulkMessagingConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.configuration', {
            abstract: true,
            url: "/configuration",
            templateUrl: "products/bulkmessaging/configuration/configuration.html",
            data: {
                permissions: [
                    'READ_CONFIGURATION'
                ]
            }
        });

    });

})();
