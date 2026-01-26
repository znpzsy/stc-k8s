(function () {

    'use strict';

    angular.module('ccportal.products.ussi', [
        'ccportal.products.ussi.constants',
        'ccportal.products.ussi.filters',
        'ccportal.products.ussi.directives',
        'ccportal.products.ussi.activity-history'
    ]);

    var USCModule = angular.module('ccportal.products.ussi');

    USCModule.config(function ($stateProvider) {

        $stateProvider.state('products.ussi', {
            abstract: true,
            url: "/ussi-service-center",
            templateUrl: 'products/ussi/ussi-service-center.html',
            data: {
                headerKey: 'Products.USSI.PageHeader'
            }
        });

    });

})();
