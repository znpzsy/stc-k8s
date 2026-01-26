(function () {

    'use strict';

    angular.module('adminportal.products.usc', [
        "adminportal.products.usc.constants",
        "adminportal.products.usc.filters",
        "adminportal.products.usc.directives",
        "adminportal.products.usc.dashboards",
        "adminportal.products.usc.operations",
        "adminportal.products.usc.configuration",
        "adminportal.products.usc.troubleshooting"
    ]);

    var UscModule = angular.module('adminportal.products.usc');

    UscModule.config(function ($stateProvider) {

        $stateProvider.state('products.usc', {
            abstract: true,
            url: "/ussd-service-center",
            templateUrl: 'products/usc/usc.html',
            data: {
                headerKey: 'Products.USC.PageHeader',
                permissions: [
                    'PRODUCTS_USC'
                ]
            }
        });

    });

})();
