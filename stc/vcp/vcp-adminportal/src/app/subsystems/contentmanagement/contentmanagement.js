(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement', [
        "adminportal.subsystems.contentmanagement.dashboards",
        "adminportal.subsystems.contentmanagement.operations",
        "adminportal.subsystems.contentmanagement.bulkoperations",
        "adminportal.subsystems.contentmanagement.configuration",
        "adminportal.subsystems.contentmanagement.troubleshooting"
    ]);

    var ContentManagementModule = angular.module('adminportal.subsystems.contentmanagement');

    ContentManagementModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement', {
            abstract: true,
            url: "/content-management",
            templateUrl: 'subsystems/contentmanagement/contentmanagement.html',
            data: {
                headerKey: 'Subsystems.ContentManagement.PageHeader'
            }
        });

    });

})();
