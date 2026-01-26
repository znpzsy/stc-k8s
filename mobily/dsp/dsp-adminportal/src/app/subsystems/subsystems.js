(function () {

    'use strict';

    angular.module('adminportal.subsystems', [
        'adminportal.subsystems.constants',
        'adminportal.subsystems.filters',
        'adminportal.subsystems.directives',
        'adminportal.subsystems.businessmanagement',
        'adminportal.subsystems.provisioning',
        'adminportal.subsystems.screeningmanager',
        'adminportal.subsystems.subscriptionmanagement',
        'adminportal.subsystems.contentmanagement',
        'adminportal.subsystems.diagnostics',
        'adminportal.subsystems.reporting'
    ]);

    var SubsystemsModule = angular.module('adminportal.subsystems');

    SubsystemsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems', {
            url: "/subsystems",
            templateUrl: 'subsystems/subsystems.html'
        });

    });

})();