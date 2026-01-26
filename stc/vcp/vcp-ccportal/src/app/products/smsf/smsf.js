(function () {

    'use strict';

    angular.module('ccportal.products.smsf', [
        'ccportal.products.smsf.constants',
        'ccportal.products.smsf.filters',
        'ccportal.products.smsf.directives',
        'ccportal.products.smsf.activity-history'
    ]);

    var SMSFModule = angular.module('ccportal.products.smsf');

    SMSFModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsf', {
            abstract: true,
            url: "/smsf",
            templateUrl: 'products/smsf/smsf.html',
            data: {
                headerKey: 'Products.SMSF.PageHeader'
            }
        });

    });

})();
