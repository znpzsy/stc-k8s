(function () {

    'use strict';

    angular.module('ccportal.usersettings', []);

    var SettingsModule = angular.module('ccportal.usersettings');

    SettingsModule.config(function ($stateProvider) {

        // This state has been defined for internal application based states for example setting state for logged in users.
        $stateProvider.state('application', {
            abstract: true
        });

        $stateProvider.state('application.usersettings', {
            url: "/application-usersettings",
            templateUrl: 'usersettings/usersettings.html',
            data: {
                headerKey: 'Header.UserSettings.PageHeader'
            }
        });

    });

})();
