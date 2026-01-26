(function () {

    'use strict';

    angular.module('ccportal.services.mca.preferences', [
        'ccportal.services.mca.preferences.details'
    ]);

    var MCAPreferencesModule = angular.module('ccportal.services.mca.preferences');

    MCAPreferencesModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.preferences', {
            abstract: true,
            url: "/preferences",
            templateUrl: 'services/mca/preferences/mca-preferences.html'
        });

    });

})();
