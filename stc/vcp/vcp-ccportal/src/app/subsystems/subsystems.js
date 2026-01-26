(function () {

    'use strict';

    angular.module('ccportal.subsystems', [
        'ccportal.subsystems.constants',
        'ccportal.subsystems.filters',
        'ccportal.subsystems.directives',
        'ccportal.subsystems.subscriptionmanagement'
    ]);

    var SubsystemsModule = angular.module('ccportal.subsystems');

    SubsystemsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems', {
            url: "/subsystems",
            templateUrl: 'subsystems/subsystems.html'
        });

    });

})();