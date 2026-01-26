(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.dashboards', [
        'adminportal.subsystems.contentmanagement.dashboards.dsp',
        'adminportal.subsystems.contentmanagement.dashboards.rbt'
    ]);

    var ContentManagementDashboardsModule = angular.module('adminportal.subsystems.contentmanagement.dashboards');

    ContentManagementDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.dashboards', {
            abstract: true,
            url: "/dashboard",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

})();
