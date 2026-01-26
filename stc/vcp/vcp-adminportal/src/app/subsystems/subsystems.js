(function () {

    'use strict';

    angular.module('adminportal.subsystems', [
        'adminportal.subsystems.constants',
        'adminportal.subsystems.filters',
        'adminportal.subsystems.directives',
        'adminportal.subsystems.provisioning',
        'adminportal.subsystems.screeningmanager',
        'adminportal.subsystems.licensing',
        'adminportal.subsystems.diagnostics',
        'adminportal.subsystems.reporting',
        // DSP Related
        'adminportal.subsystems.contentmanagement',
        'adminportal.subsystems.subscriptionmanagement',
    ]);

    var SubsystemsModule = angular.module('adminportal.subsystems');

    SubsystemsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems', {
            url: "/subsystems",
            templateUrl: 'subsystems/subsystems.html'
        });

    });

})();
