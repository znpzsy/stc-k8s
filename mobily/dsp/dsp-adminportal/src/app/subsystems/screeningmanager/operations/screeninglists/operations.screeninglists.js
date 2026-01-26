(function () {

    'use strict';

    angular.module('adminportal.subsystems.screeningmanager.operations.screeninglists', [
        'adminportal.subsystems.screeningmanager.operations.screeninglists.service',
        'adminportal.subsystems.screeningmanager.operations.screeninglists.global'
    ]);

    var ScreeningManagementOperationsScreeningListsServiceModule = angular.module('adminportal.subsystems.screeningmanager.operations.screeninglists');

    ScreeningManagementOperationsScreeningListsServiceModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.screeningmanager.operations.screeninglists', {
            abstract: true,
            url: "/screening-lists",
            template: '<div ui-view></div>'
        });

    });

})();