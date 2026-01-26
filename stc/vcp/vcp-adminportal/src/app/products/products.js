(function () {

    'use strict';

    angular.module('adminportal.products', [
        'adminportal.products.smsc',
        'adminportal.products.antispamsms',
        'adminportal.products.mmsc',
        'adminportal.products.usc',
        'adminportal.products.ussi',
        'adminportal.products.smsf',
        // DSP Related
        'adminportal.products.apimanager',
        'adminportal.products.bulkmessaging',
        'adminportal.products.oivr',
        'adminportal.products.messaginggw',
        'adminportal.products.charginggw',
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