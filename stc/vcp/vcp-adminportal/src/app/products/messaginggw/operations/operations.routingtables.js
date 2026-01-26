(function () {

    'use strict';

    angular.module('adminportal.products.messaginggw.operations.routingtables', [
        'adminportal.products.messaginggw.operations.routingtables.applicationrouting'
    ]);

    var MessagingGwOperationsRoutingTablesModule = angular.module('adminportal.products.messaginggw.operations.routingtables');

    MessagingGwOperationsRoutingTablesModule.config(function ($stateProvider) {

        $stateProvider.state('products.messaginggw.operations.routingtables', {
            abstract: true,
            url: "/routingtables",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'MSGW__OPERATIONS_ROUTINGTABLE_READ'
                ]
            },
        })

    });

})();
