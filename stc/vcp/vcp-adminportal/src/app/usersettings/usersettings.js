(function () {

    'use strict';

    angular.module('adminportal.usersettings', []);

    var SettingsModule = angular.module('adminportal.usersettings');

    SettingsModule.config(function ($stateProvider) {

        $stateProvider.state('application.usersettings', {
            url: "/application.usersettings",
            templateUrl: 'usersettings/usersettings.html',
            data: {
                headerKey: 'Header.UserSettings.PageHeader'
            }
        });

    });

})();
