(function () {

    'use strict';

    angular.module('ccportal.services', [
        'ccportal.services.coc',
        'ccportal.services.mca',
        'ccportal.services.pokecall',
        'ccportal.services.vm',
        'ccportal.services.rbt'
    ]);

    var ServicesModule = angular.module('ccportal.services');

    ServicesModule.config(function ($stateProvider) {

        $stateProvider.state('services', {
            url: "/services",
            templateUrl: 'services/services.html'
        });

    });

})();
