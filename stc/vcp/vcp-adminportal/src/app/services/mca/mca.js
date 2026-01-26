(function () {

    'use strict';

    angular.module('adminportal.services.mca', [
        "adminportal.services.mca.constants",
        "adminportal.services.mca.filters",
        "adminportal.services.mca.dashboards",
        //"adminportal.services.mca.advertisement",
        "adminportal.services.mca.operations",
        "adminportal.services.mca.configuration",
        'adminportal.services.mca.messagetemplates',
        "adminportal.services.mca.troubleshooting"
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
            },
            resolve: {
                childstate: function ($state, $log) {
                    $log.debug("childstate - $state", $state);
                    $log.debug("childstate - $state.current", $state.current);
                    $log.debug("childstate - $state.current.name", $state.current.name);
                    $log.debug("childstate - $state.current.url", $state.current.url);
                    return $state.current;
                }}
        });

    });

})();
