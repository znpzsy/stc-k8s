(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.configuration', [
        'adminportal.subsystems.businessmanagement.configuration.settings'
    ]);

    var BusinessManagementConfigurationModule = angular.module('adminportal.subsystems.businessmanagement.configuration');

    BusinessManagementConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.configuration', {
            abstract: true,
            url: "/configuration",
            templateUrl: "subsystems/businessmanagement/configuration/configuration.html",
            data: {
                permissions: [
                    'READ_CONFIGURATION'
                ]
            }
        });

    });

})();
