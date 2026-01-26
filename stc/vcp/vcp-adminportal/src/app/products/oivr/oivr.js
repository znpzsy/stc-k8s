(function () {

    'use strict';

    angular.module('adminportal.products.oivr', [
        "adminportal.products.oivr.constants",
        "adminportal.products.oivr.filters",
        "adminportal.products.oivr.directives",
        "adminportal.products.oivr.dashboards",
        "adminportal.products.oivr.configuration",
        "adminportal.products.oivr.troubleshooting"
    ]);

    var OIVRModule = angular.module('adminportal.products.oivr');

    OIVRModule.config(function ($stateProvider) {

        $stateProvider.state('products.oivr', {
            abstract: true,
            url: "/oivr",
            templateUrl: 'products/oivr/oivr.html',
            data: {
                headerKey: 'Products.OIVR.PageHeader',
                permissions: [
                    'ALL__PRODUCTS_OIVR'
                ]
            }
        });

    });

})();
