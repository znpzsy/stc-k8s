(function () {

    'use strict';

    angular.module('ccportal.services.pokecall', [
        'ccportal.services.pokecall.activity-history',
        'ccportal.services.pokecall.activity-history-remote'
    ]);

    var PokeCallModule = angular.module('ccportal.services.pokecall');

    PokeCallModule.config(function ($stateProvider) {

        $stateProvider.state('services.pokecall', {
            abstract: true,
            url: "/poke-call",
            templateUrl: 'services/pokecall/pokecall.html',
            data: {
                headerKey: 'Services.PokeCall.PageHeader',
                isService: true,
                permissions: [
                    'SERVICES_PC'
                ]
            }
        });

    });

})();
