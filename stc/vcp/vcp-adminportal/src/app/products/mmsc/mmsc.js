(function () {

    'use strict';

    angular.module('adminportal.products.mmsc', [
        "adminportal.products.mmsc.constants",
        "adminportal.products.mmsc.filters",
        "adminportal.products.mmsc.directives",
        "adminportal.products.mmsc.dashboards",
        "adminportal.products.mmsc.operations",
        "adminportal.products.mmsc.configuration",
        "adminportal.products.mmsc.troubleshooting"
    ]);

    var MmscModule = angular.module('adminportal.products.mmsc');

    MmscModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc', {
            abstract: true,
            url: "/mmsc",
            templateUrl: 'products/mmsc/mmsc.html',
            data: {
                headerKey: 'Products.MMSC.PageHeader',
                permissions: [
                    'PRODUCTS_MMSC'
                ]
            }
        });

    });

})();
