(function () {

    'use strict';

    angular.module('adminportal.products.smsc.configuration', [
        'adminportal.products.smsc.configuration.settings.messagestore',
        'adminportal.products.smsc.configuration.settings.applicationgateway'
    ]);

    var SmscConfigurationModule = angular.module('adminportal.products.smsc.configuration');

    SmscConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.configuration', {
            abstract: true,
            url: "/configurations",
            templateUrl: "products/smsc/configuration/configuration.html"
        }).state('products.smsc.configuration.settings', {
            abstract: true,
            url: "/settings",
            template: "<div ui-view></div>"
        });

    });

})();
