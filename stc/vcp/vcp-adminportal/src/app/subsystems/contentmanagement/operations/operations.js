(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations', [
        'adminportal.subsystems.contentmanagement.operations.rbt'
    ]);

    var ContentManagementOperationsModule = angular.module('adminportal.subsystems.contentmanagement.operations');

    ContentManagementOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations', {
            abstract: true,
            url: "/operations",
            template: "<div ui-view></div>"
        });

    });

})();