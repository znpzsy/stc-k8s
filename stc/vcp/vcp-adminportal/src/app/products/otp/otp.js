(function () {

    'use strict';

    angular.module('adminportal.products.otp', [
        'adminportal.products.otp.troubleshooting',
        "adminportal.products.otp.constants",
        "adminportal.products.otp.filters"
    ]);

    var OTPModule = angular.module('adminportal.products.otp');

    OTPModule.config(function ($stateProvider) {

        $stateProvider.state('products.otp', {
            abstract: true,
            url: "/one-time-password",
            templateUrl: 'products/otp/otp.html',
            data: {
                headerKey: 'Products.OTP.PageHeader',
                permissions: [
                    'READ_ALL_TROUBLESHOOTING'
                ]
            }
        });

    });

})();
