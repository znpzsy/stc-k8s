(function () {

    'use strict';

    angular.module('ccportal.products.antispamsms', [
        "ccportal.products.antispamsms.constants",
        "ccportal.products.antispamsms.directives",
        "ccportal.products.antispamsms.filters",
        "ccportal.products.antispamsms.troubleshooting",
        "ccportal.products.antispamsms.troubleshootingremote"
    ]);

    var AntiSpamSMSModule = angular.module('ccportal.products.antispamsms');

    AntiSpamSMSModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms', {
            abstract: true,
            url: "/antispam-sms",
            templateUrl: 'products/antispamsms/antispamsms.html',
            data: {
                headerKey: 'Products.AntiSpamSMS.PageHeader',
                permissions: [
                    'PRODUCTS_ANTISPAM'
                ]
            }
        });

    });

})();
