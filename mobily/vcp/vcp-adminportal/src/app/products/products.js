(function () {

    'use strict';

    angular.module('adminportal.products', [
        'adminportal.products.smsc',
        'adminportal.products.antispamsms',
        'adminportal.products.mmsc',
        'adminportal.products.usc',
        'adminportal.products.ussi'

    ]);

    var ProductsModule = angular.module('adminportal.products');

    ProductsModule.config(function ($stateProvider) {

        $stateProvider.state('products', {
            url: "/products",
            templateUrl: 'products/products.html'
        });

    });

})();