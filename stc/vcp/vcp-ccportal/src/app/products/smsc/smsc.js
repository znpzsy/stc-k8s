(function () {

    'use strict';

    angular.module('ccportal.products.smsc', [
        'ccportal.products.smsc.constants',
        'ccportal.products.smsc.filters',
        'ccportal.products.smsc.directives',
        'ccportal.products.smsc.activity-history'
    ]);

    var SMSCModule = angular.module('ccportal.products.smsc');

    SMSCModule.config(function ($stateProvider) {

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
