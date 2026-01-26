(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.users', [
        'base64',
        'adminportal.subsystems.provisioning.operations.users.departments',
        'adminportal.subsystems.provisioning.operations.users.teams',
        'adminportal.subsystems.provisioning.operations.users.accounts',
        'adminportal.subsystems.provisioning.operations.users.roles',
        'adminportal.subsystems.provisioning.operations.users.groups',
        // Common
        'adminportal.subsystems.provisioning.operations.users.modals'
    ]);

    var ProvisioningUsersOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.users');

    ProvisioningUsersOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.users', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>"
        });

    });

})();