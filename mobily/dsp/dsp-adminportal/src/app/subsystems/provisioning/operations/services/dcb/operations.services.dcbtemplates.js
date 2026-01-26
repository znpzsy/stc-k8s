(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.dcbtemplates', [
        'adminportal.subsystems.provisioning.operations.services.dcbtemplates.dcbprofile',
        'adminportal.subsystems.provisioning.operations.services.dcbtemplates.servicemessages',
        'adminportal.subsystems.provisioning.operations.services.dcbtemplates.serviceinvoicemessages'
    ]);

    var ProvisioningOperationsServicesDcbTemplatesModule = angular.module('adminportal.subsystems.provisioning.operations.services.dcbtemplates');

    ProvisioningOperationsServicesDcbTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.dcbtemplates', {
            url: "/dcb-templates/:serviceId",
            templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbtemplates.html',
            data: {
                backState: 'subsystems.provisioning.operations.services.list',
                permissions: [
                    'ALL__TEMPLATES_READ'
                ]
            },
            controller: function ($scope, service) {
                $scope.service = service;
            },
            resolve: {
                service: function ($stateParams, CMPFService) {
                    return CMPFService.getService($stateParams.serviceId);
                }
            }
        });

    });

})();