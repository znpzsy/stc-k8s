(function () {

    'use strict';

    angular.module('ccportal.products.messaginggw', [
        'ccportal.products.messaginggw.constants',
        'ccportal.products.messaginggw.filters',
        'ccportal.products.messaginggw.directives',
        'ccportal.products.messaginggw.troubleshooting'
    ]);

    var MessagingGwModule = angular.module('ccportal.products.messaginggw');

    MessagingGwModule.config(function ($stateProvider) {

        $stateProvider.state('products.messaginggw', {
            abstract: true,
            url: "/messaging-gateway",
            templateUrl: 'products/messaginggw/messaginggw.html',
            data: {
                headerKey: 'Products.MessagingGw.PageHeader'
            }
        });

    });

})();


