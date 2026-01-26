(function () {

    'use strict';

    angular.module('adminportal.services.pokecall', [
        "adminportal.services.pokecall.dashboards",
        "adminportal.services.pokecall.configuration",
        "adminportal.services.pokecall.troubleshooting",
        "adminportal.services.pokecall.troubleshootingremote"
    ]);

    var PokeCallModule = angular.module('adminportal.services.pokecall');

    PokeCallModule.config(function ($stateProvider) {

        $stateProvider.state('services.pokecall', {
            abstract: true,
            url: "/poke-call",
            templateUrl: 'services/pokecall/pokecall.html',
            data: {
                headerKey: 'Services.PokeCall.PageHeader',
                permissions: [
                    'SERVICES_PC'
                ]
            }
        });

    });

})();
