(function () {

    'use strict';

    angular.module('adminportal.services.rbt', [
        "adminportal.services.rbt.constants",
        "adminportal.services.rbt.filters",
        "adminportal.services.rbt.directives",
        "adminportal.services.rbt.dashboards",
        "adminportal.services.rbt.configuration",
        "adminportal.services.rbt.troubleshooting",
        "adminportal.services.rbt.troubleshootingremote"
    ]);

    var RBTModule = angular.module('adminportal.services.rbt');

    RBTModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt', {
            abstract: true,
            url: "/ring-back-tone",
            templateUrl: 'services/rbt/rbt.html',
            data: {
                headerKey: 'Services.RBT.PageHeader',
                permissions: [
                    'SERVICES_RBT'
                ]
            }
        });

    });

})();
