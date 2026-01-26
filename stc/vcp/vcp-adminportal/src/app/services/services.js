(function () {

    'use strict';

    angular.module('adminportal.services', [
        'adminportal.services.cc',
        'adminportal.services.mca',
        'adminportal.services.cmb',
        'adminportal.services.vm',
        'adminportal.services.vsms',
        'adminportal.services.rbt'
    ]);

    var ServicesModule = angular.module('adminportal.services');

    ServicesModule.config(function ($stateProvider) {

        $stateProvider.state('services', {
            url: "/services",
            templateUrl: 'services/services.html'
        });

    });

})();