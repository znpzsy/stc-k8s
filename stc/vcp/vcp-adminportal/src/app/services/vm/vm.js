(function () {

    'use strict';

    angular.module('adminportal.services.vm', [
        "adminportal.services.vm.constants",
        "adminportal.services.vm.filters",
        "adminportal.services.vm.directives",
        "adminportal.services.vm.dashboards",
        "adminportal.services.vm.message-templates",
        "adminportal.services.vm.operations",
        "adminportal.services.vm.configuration",
        "adminportal.services.vm.troubleshooting"
    ]);

    var VMModule = angular.module('adminportal.services.vm');

    VMModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm', {
            abstract: true,
            url: "/voice-mail",
            templateUrl: 'services/vm/vm.html',
            data: {
                headerKey: 'Services.VM.PageHeader',
                permissions: [
                    'SERVICES_VM'
                ]
            }
        });

    });

})();
