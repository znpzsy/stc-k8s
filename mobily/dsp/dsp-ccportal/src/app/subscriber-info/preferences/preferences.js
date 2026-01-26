(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.preferences', [
        'ccportal.subscriber-info.preferences.subscriberdobsettings'
    ]);

    var SIPreferencesModule = angular.module('ccportal.subscriber-info.preferences');

    SIPreferencesModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.preferences', {
            abstract: true,
            url: "/preferences",
            templateUrl: "subscriber-info/preferences/preferences.html"
        });

    });

})();


