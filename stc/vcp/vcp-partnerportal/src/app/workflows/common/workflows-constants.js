(function () {
    'use strict';

    /* Constants */
    angular.module('partnerportal.workflows.constants', []);

    var WorkflowsConstants = angular.module('partnerportal.workflows.constants');

    WorkflowsConstants.constant('WORKFLOWS_STATUSES', {
        APPROVED: 'APPROVED',
        PENDING: 'PENDING',
        FINISHED: 'FINISHED',
        COMPLETED: 'COMPLETED',
        REJECTED: 'REJECTED',
        DELETED: 'DELETED',
        NOTIFICATION: 'NOTIFICATION'
    });

    WorkflowsConstants.constant('WORKFLOWS_RESOURCE_TYPES', [
        {value: 'PARTNER', label: 'PARTNER'},
        //{value: 'SERVICE', label: 'SERVICE'},
        {value: 'CONTENT_METADATA', label: 'CONTENT'},
        // {value: 'OFFER', label: 'OFFER'},
        // {value: 'SHORT_CODE', label: 'SHORT CODE'},
        {value: 'RBT', label: 'RBT'}
    ]);

    WorkflowsConstants.constant('WORKFLOWS_OPERATION_TYPES', ['CREATE', 'UPDATE', 'SUSPEND', 'UNSUSPEND', 'HIDE', 'UNHIDE', 'OFFLINE', 'DELETE']);

    WorkflowsConstants.constant('WORKFLOWS_PROCESS_STATUSES', ['APPROVED', 'REJECTED', 'COMPLETED', 'DELETED']);

})();

