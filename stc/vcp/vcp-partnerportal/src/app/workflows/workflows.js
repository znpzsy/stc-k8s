(function () {

    'use strict';

    angular.module('partnerportal.workflows', [
        'partnerportal.workflows.constants',
        'partnerportal.workflows.directives',
        'partnerportal.workflows.filters',
        'partnerportal.workflows.operations',
        'partnerportal.workflows.troubleshooting'
    ]);

    var WorkflowsModule = angular.module('partnerportal.workflows');

    WorkflowsModule.config(function ($stateProvider) {

        $stateProvider.state('workflows', {
            abstract: true,
            url: "/tasks",
            templateUrl: 'workflows/workflows.html',
            data: {
                headerKey: 'Workflows.PageHeader',
                permissions: [
                    'BPM__TASK_READ'
                ]
            }
        });

    });

})();