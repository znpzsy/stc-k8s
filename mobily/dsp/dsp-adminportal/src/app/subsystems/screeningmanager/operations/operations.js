(function () {

    'use strict';

    angular.module('adminportal.subsystems.screeningmanager.operations', [
        'adminportal.subsystems.screeningmanager.operations.screeninglists'
    ]);

    var SMOperationsModule = angular.module('adminportal.subsystems.screeningmanager.operations');

    SMOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.screeningmanager.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: 'subsystems/screeningmanager/operations/operations.html'
        });

    });

})();
