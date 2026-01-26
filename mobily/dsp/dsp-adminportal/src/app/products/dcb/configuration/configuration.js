(function () {

    'use strict';

    angular.module('adminportal.products.dcb.configuration', [
        'adminportal.products.dcb.configuration.settings'
    ]);

    var DcbConfigurationModule = angular.module('adminportal.products.dcb.configuration');

    DcbConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('products.dcb.configuration', {
            abstract: true,
            url: "/configuration",
            templateUrl: "products/dcb/configuration/configuration.html",
            data: {
                permissions: [
                    'ALL__CONFIGURATION_READ'
                ]
            }
        });

    });

})();
