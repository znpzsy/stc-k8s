(function () {

    'use strict';

    angular.module('adminportal.products', [
        'adminportal.products.apimanager',
        'adminportal.products.bulkmessaging',
        'adminportal.products.charginggw',
        'adminportal.products.messaginggw',
        'adminportal.products.dcb',
        'adminportal.products.otp'
    ]);

    var ProductsModule = angular.module('adminportal.products');

    ProductsModule.config(function ($stateProvider) {

        $stateProvider.state('products', {
            url: "/products",
            templateUrl: 'products/products.html'
        });

    });

})();
