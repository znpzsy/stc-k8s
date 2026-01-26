(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations', [
        'adminportal.subsystems.provisioning.operations.organizations',
        'adminportal.subsystems.provisioning.operations.users',
        'adminportal.subsystems.provisioning.operations.services',
        'adminportal.subsystems.provisioning.operations.subscribers',
    ]);

    var ProvisioningOperationsModule = angular.module('adminportal.subsystems.provisioning.operations');

    ProvisioningOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: 'subsystems/provisioning/operations/operations.html'
        });

    });

})();