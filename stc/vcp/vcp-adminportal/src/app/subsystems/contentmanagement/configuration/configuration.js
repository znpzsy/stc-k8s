(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.configuration', [
        'adminportal.subsystems.contentmanagement.configuration.settings'
    ]);

    var ContentManagementConfigurationModule = angular.module('adminportal.subsystems.contentmanagement.configuration');

    ContentManagementConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.configuration', {
            abstract: true,
            url: "/configuration",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.html",
            data: {
                permissions: [
                    'READ_CONFIGURATION'
                ]
            }
        });

    });

})();
