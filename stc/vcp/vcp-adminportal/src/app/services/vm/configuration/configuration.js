(function () {

    'use strict';

    angular.module('adminportal.services.vm.configuration', [
        "adminportal.services.vm.configuration.settings"
    ]);

    var VMConfigurationModule = angular.module('adminportal.services.vm.configuration');

    VMConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.configuration', {
            abstract: true,
            url: "/configurations",
            templateUrl: "services/vm/configuration/configuration.html"
        });

    });

})();
