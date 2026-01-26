(function () {

    'use strict';

    angular.module('ccportal.services', [
        'ccportal.services.cmb',
        'ccportal.services.coc',
        'ccportal.services.mca',
        'ccportal.services.vm',
        'ccportal.services.vsms',
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
