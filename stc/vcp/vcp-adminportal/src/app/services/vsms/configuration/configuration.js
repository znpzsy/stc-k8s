(function () {

    'use strict';

    angular.module('adminportal.services.vsms.configuration', [
        "adminportal.services.vsms.configuration.settings"
    ]);

    var VSMSConfigurationModule = angular.module('adminportal.services.vsms.configuration');

    VSMSConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.configuration', {
            abstract: true,
            url: "/configurations",
            templateUrl: "services/vsms/configuration/configuration.html"
        });

    });

})();
