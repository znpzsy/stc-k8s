(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.bulkoperations', [
        'adminportal.subsystems.contentmanagement.bulkoperations.management'
    ]);

    var ContentManagementOperationsModule = angular.module('adminportal.subsystems.contentmanagement.bulkoperations');

    ContentManagementOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.bulkoperations', {
            abstract: true,
            url: "/bulk-operations",
            templateUrl: "subsystems/contentmanagement/bulkoperations/bulkoperations.html",
        });

    });

})();