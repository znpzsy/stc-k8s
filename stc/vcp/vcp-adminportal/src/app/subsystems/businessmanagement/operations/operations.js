(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations', [
        'adminportal.subsystems.businessmanagement.operations.channels',
        'adminportal.subsystems.businessmanagement.operations.servicecategories',
        //'adminportal.subsystems.businessmanagement.operations.servicelabels',
        'adminportal.subsystems.businessmanagement.operations.servicetypes',
        'adminportal.subsystems.businessmanagement.operations.settlementtypes',
        'adminportal.subsystems.businessmanagement.operations.agreements',
        'adminportal.subsystems.businessmanagement.operations.businesstypes'
        //'adminportal.subsystems.businessmanagement.operations.projects'
    ]);

    var BusinessManagementOperationsModule = angular.module('adminportal.subsystems.businessmanagement.operations');

    BusinessManagementOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: 'subsystems/businessmanagement/operations/operations.html'
        });

    });

})();