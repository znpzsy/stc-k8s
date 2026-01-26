(function () {

    'use strict';

    angular.module('adminportal.products.ussi', [
        "adminportal.products.ussi.constants",
        "adminportal.products.ussi.filters",
        "adminportal.products.ussi.directives",
        "adminportal.products.ussi.dashboards",
        "adminportal.products.ussi.configuration",
        "adminportal.products.ussi.troubleshooting",
        "adminportal.products.ussi.troubleshootingremote"
    ]);

    var UscModule = angular.module('adminportal.products.ussi');

    UscModule.config(function ($stateProvider) {

        $stateProvider.state('products.ussi', {
            abstract: true,
            url: "/ussi-service-center",
            templateUrl: 'products/ussi/ussi.html',
            data: {
                headerKey: 'Products.USSI.PageHeader',
                permissions: [
                    'PRODUCTS_USC'
                ]
            }
        });

    });

})();
