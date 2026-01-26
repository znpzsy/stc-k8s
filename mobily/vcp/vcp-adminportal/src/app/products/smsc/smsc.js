(function () {

    'use strict';

    angular.module('adminportal.products.smsc', [
        'adminportal.products.smsc.constants',
        'adminportal.products.smsc.directives',
        'adminportal.products.smsc.filters',
        'adminportal.products.smsc.dashboards',
        'adminportal.products.smsc.configuration',
        'adminportal.products.smsc.message-templates',
        'adminportal.products.smsc.screening-lists',
        'adminportal.products.smsc.operations',
        'adminportal.products.smsc.troubleshooting',
        'adminportal.products.smsc.troubleshootingremote'
    ]);

    var SmscModule = angular.module('adminportal.products.smsc');

    SmscModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc', {
            abstract: true,
            url: "/smsc",
            templateUrl: 'products/smsc/smsc.html',
            data: {
                headerKey: 'Products.SMSC.PageHeader',
                permissions: [
                    'PRODUCTS_SMSC'
                ]
            }
        });

    });

})();
