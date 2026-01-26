(function () {

    'use strict';

    angular.module('adminportal.services.rbt.configuration.settings', [
        'adminportal.services.rbt.configuration.settings.rbt',
        'adminportal.services.rbt.configuration.settings.pt',
        'adminportal.services.rbt.configuration.settings.hangup'
    ]);

    var RBTConfigurationSettingsModule = angular.module('adminportal.services.rbt.configuration.settings');

    RBTConfigurationSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.configuration.settings', {
            abstract: true,
            url: "/settings",
            template: "<div ui-view></div>"
        });

    });

})();
