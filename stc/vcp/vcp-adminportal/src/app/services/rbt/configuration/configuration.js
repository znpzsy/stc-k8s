(function () {

    'use strict';

    angular.module('adminportal.services.rbt.configuration', [
        "adminportal.services.rbt.configuration.settings"
    ]);

    var RBTConfigurationModule = angular.module('adminportal.services.rbt.configuration');

    RBTConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.configuration', {
            abstract: true,
            url: "/configurations",
            templateUrl: "services/rbt/configuration/configuration.html",
            data: {
                permissions: [
                    'RBT_SERVICE_CONFIGURATION_READ'
                ]
            }
        });

    });

})();
