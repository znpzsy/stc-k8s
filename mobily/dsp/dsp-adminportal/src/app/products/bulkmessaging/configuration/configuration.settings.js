(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.configuration.settings', [
        'adminportal.products.bulkmessaging.configuration.settings.common',
        'adminportal.products.bulkmessaging.configuration.settings.bulksms',
        'adminportal.products.bulkmessaging.configuration.settings.bulkmms',
        'adminportal.products.bulkmessaging.configuration.settings.bulkivr'
    ]);

    var BulkMessagingConfigurationSettingsModule = angular.module('adminportal.products.bulkmessaging.configuration.settings');

    BulkMessagingConfigurationSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.configuration.settings', {
            abstract: true,
            url: "/settings",
            template: "<div ui-view></div>"
        });

    });

})();
