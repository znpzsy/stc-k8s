(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms', [
        "adminportal.products.antispamsms.constants",
        "adminportal.products.antispamsms.directives",
        "adminportal.products.antispamsms.filters",
        "adminportal.products.antispamsms.dashboards",
        "adminportal.products.antispamsms.configuration",
        "adminportal.products.antispamsms.operations",
        "adminportal.products.antispamsms.troubleshooting",
        "adminportal.products.antispamsms.troubleshootingremote"
    ]);

    var AntiSpamSMSModule = angular.module('adminportal.products.antispamsms');

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
