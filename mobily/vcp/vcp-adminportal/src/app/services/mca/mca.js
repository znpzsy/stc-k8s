(function () {

    'use strict';

    angular.module('adminportal.services.mca', [
        "adminportal.services.mca.constants",
        "adminportal.services.mca.filters",
        "adminportal.services.mca.dashboards",
        "adminportal.services.mca.advertisement",
        'adminportal.services.mca.messagetemplates',
        "adminportal.services.mca.troubleshooting",
        "adminportal.services.mca.troubleshootingremote"
    ]);

    var MCAModule = angular.module('adminportal.services.mca');

    MCAModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca', {
            abstract: true,
            url: "/missed-call-notification",
            templateUrl: 'services/mca/mca.html',
            data: {
                headerKey: 'Services.MCA.PageHeader',
                permissions: [
                    'SERVICES_MCN'
                ]
            }
        });

    });

})();
