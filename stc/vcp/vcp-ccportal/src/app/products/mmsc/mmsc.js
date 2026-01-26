(function () {

    'use strict';

    angular.module('ccportal.products.mmsc', [
        'ccportal.products.mmsc.constants',
        'ccportal.products.mmsc.filters',
        'ccportal.products.mmsc.directives',
        'ccportal.products.mmsc.activity-history'
    ]);

    var MMSCModule = angular.module('ccportal.products.mmsc');

    MMSCModule.config(function ($stateProvider) {

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
