(function () {

    'use strict';

    angular.module('ccportal.products.usc', [
        'ccportal.products.usc.constants',
        'ccportal.products.usc.filters',
        'ccportal.products.usc.directives',
        'ccportal.products.usc.activity-history'
    ]);

    var USCModule = angular.module('ccportal.products.usc');

    USCModule.config(function ($stateProvider) {

        $stateProvider.state('products.usc', {
            abstract: true,
            url: "/ussd-service-center",
            templateUrl: 'products/usc/ussd-service-center.html',
            data: {
                headerKey: 'Products.USC.PageHeader'
            }
        });

    });

})();
