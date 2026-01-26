(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.configuration', [
        // Settings
        "adminportal.products.antispamsms.configuration.settings.filtering",
        "adminportal.products.antispamsms.configuration.settings.frauddetection",
        "adminportal.products.antispamsms.configuration.settings.imsimasking",
        "adminportal.products.antispamsms.configuration.settings.scamodification",
        "adminportal.products.antispamsms.configuration.settings.smscgtcorrection",
        "adminportal.products.antispamsms.configuration.settings.srifsmcounter",
        "adminportal.products.antispamsms.configuration.settings.switchmvno"
    ]);

    var AntiSpamSMSConfigurationModule = angular.module('adminportal.products.antispamsms.configuration');

    AntiSpamSMSConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.configuration', {
            abstract: true,
            url: "/configurations",
            templateUrl: "products/antispamsms/configuration/configuration.html"
        }).state('products.antispamsms.configuration.settings', {
            abstract: true,
            url: "/settings",
            template: '<div ui-view></div>'
        });

    });

})();
