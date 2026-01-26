(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning', [
        "adminportal.subsystems.provisioning.dashboards",
        "adminportal.subsystems.provisioning.operations"
    ]);

    var ProvisioningModule = angular.module('adminportal.subsystems.provisioning');

    ProvisioningModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning', {
            abstract: true,
            url: "/provisioning",
            templateUrl: 'subsystems/provisioning/provisioning.html',
            data: {
                headerKey: 'Subsystems.Provisioning.PageHeader'
            }
        });

    });

})();
