(function () {

    'use strict';

    angular.module('ccportal.products.charginggw', [
        "ccportal.products.charginggw.constants",
        "ccportal.products.charginggw.filters",
        "ccportal.products.charginggw.directives",
        'ccportal.products.charginggw.troubleshooting'
    ]);

    var ChargingGwModule = angular.module('ccportal.products.charginggw');

    ChargingGwModule.config(function ($stateProvider) {

        $stateProvider.state('products.charginggw', {
            abstract: true,
            url: "/charging-gateway",
            templateUrl: 'products/charginggw/charginggw.html',
            data: {
                headerKey: 'Products.ChargingGw.PageHeader'
            }
        });

    });

})();
