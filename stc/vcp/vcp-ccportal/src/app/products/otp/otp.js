(function () {

    'use strict';

    angular.module('ccportal.products.otp', [
        'ccportal.products.messaginggw.constants',
        'ccportal.products.otp.filters',
        'ccportal.products.otp.directives',
        'ccportal.products.otp.troubleshooting'
    ]);

    var MessagingGwModule = angular.module('ccportal.products.otp');

    MessagingGwModule.config(function ($stateProvider) {

        $stateProvider.state('products.otp', {
            abstract: true,
            url: "/otp",
            templateUrl: 'products/otp/otp.html',
            data: {
                headerKey: 'Products.OTP.PageHeader'
            }
        });

    });

})();


