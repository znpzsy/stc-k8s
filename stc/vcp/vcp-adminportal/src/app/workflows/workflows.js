(function () {

    'use strict';

    angular.module('adminportal.workflows', [
        'adminportal.workflows.constants',
        'adminportal.workflows.directives',
        'adminportal.workflows.filters',
        'adminportal.workflows.dashboards',
        'adminportal.workflows.operations',
        'adminportal.workflows.troubleshooting'
    ]);

    var WorkflowsModule = angular.module('adminportal.workflows');

    WorkflowsModule.config(function ($stateProvider) {

        $stateProvider.state('workflows', {
            abstract: true,
            url: "/tasks",
            templateUrl: 'workflows/workflows.html',
            data: {
                headerKey: 'Workflows.PageHeader',
                permissions: [
                    'BPM__OPERATIONS_TASK_READ'
                ]
            }
        });

    });

})();