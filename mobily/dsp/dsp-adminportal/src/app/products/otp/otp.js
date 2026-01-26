(function () {

    'use strict';

    angular.module('adminportal.products.otp', [
        'adminportal.products.otp.troubleshooting'
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
                    'ALL__TROUBLESHOOTING_READ'
                ]
            }
        });

    });

})();
