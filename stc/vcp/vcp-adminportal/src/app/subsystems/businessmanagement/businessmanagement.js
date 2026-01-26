(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement', [
        "adminportal.subsystems.businessmanagement.dashboards",
        "adminportal.subsystems.businessmanagement.operations",
        "adminportal.subsystems.businessmanagement.configuration"
    ]);

    var BusinessManagementModule = angular.module('adminportal.subsystems.businessmanagement');

    BusinessManagementModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement', {
            abstract: true,
            url: "/business-management",
            templateUrl: 'subsystems/businessmanagement/businessmanagement.html',
            data: {
                headerKey: 'Subsystems.BusinessManagement.PageHeader'
            }
        });

    });

})();
