(function () {

    'use strict';

    angular.module('adminportal.subsystems.screeningmanager', [
        "adminportal.subsystems.screeningmanager.dashboards",
        "adminportal.subsystems.screeningmanager.configuration"
    ]);

    var ScreeningmanagerModule = angular.module('adminportal.subsystems.screeningmanager');

    ScreeningmanagerModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.screeningmanager', {
            abstract: true,
            url: "/screening-manager",
            templateUrl: 'subsystems/sm/screeningmanager.html',
            data: {
                headerKey: 'Subsystems.ScreeningManager.PageHeader',
                permissions: [
                    'SUBSYSTEMS_SCREENINGMGMT'
                ]
            }
        });

    });

})();
