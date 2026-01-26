(function () {

    'use strict';

    angular.module('adminportal.services.vsms', [
        "adminportal.services.vsms.constants",
        "adminportal.services.vsms.filters",
        "adminportal.services.vsms.directives",
        "adminportal.services.vsms.dashboards",
        "adminportal.services.vsms.message-templates",
        "adminportal.services.vsms.operations",
        "adminportal.services.vsms.configuration",
        "adminportal.services.vsms.troubleshooting"
    ]);

    var VSMSModule = angular.module('adminportal.services.vsms');

    VSMSModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms', {
            abstract: true,
            url: "/voice-sms",
            templateUrl: 'services/vsms/vsms.html',
            data: {
                headerKey: 'Services.VSMS.PageHeader',
                permissions: [
                    'SERVICES_VSMS'
                ]
            }
        });

    });

})();
