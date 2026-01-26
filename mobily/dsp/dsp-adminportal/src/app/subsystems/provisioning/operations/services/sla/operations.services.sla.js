(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.sla', [
        'adminportal.subsystems.provisioning.operations.services.sla.dcbslasettings',
        'adminportal.subsystems.provisioning.operations.services.sla.smsslaprofile',
        'adminportal.subsystems.provisioning.operations.services.sla.mmsslaprofile',
        'adminportal.subsystems.provisioning.operations.services.sla.webwapslaprofile'
    ]);

    var ProvisioningOperationsServicesSlaModule = angular.module('adminportal.subsystems.provisioning.operations.services.sla');

    ProvisioningOperationsServicesSlaModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.sla', {
            abstract: true,
            url: "/sla-settings",
            template: '<div ui-view></div>'
        });

    });

})();