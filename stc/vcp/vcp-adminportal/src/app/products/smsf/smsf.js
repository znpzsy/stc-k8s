(function () {

    'use strict';

    angular.module('adminportal.products.smsf', [
        "adminportal.products.smsf.constants",
        "adminportal.products.smsf.filters",
        "adminportal.products.smsf.directives",
        "adminportal.products.smsf.dashboards",
        "adminportal.products.smsf.configuration",
        "adminportal.products.smsf.troubleshooting"
    ]);

    var UscModule = angular.module('adminportal.products.smsf');

    UscModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsf', {
            abstract: true,
            url: "/smsf",
            templateUrl: 'products/smsf/smsf.html',
            data: {
                headerKey: 'Products.SMSF.PageHeader',
                permissions: [
                    'PRODUCTS_SMSF'
                ]
            }
        });

    });

})();
