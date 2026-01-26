(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging', [
        "adminportal.products.bulkmessaging.constants",
        "adminportal.products.bulkmessaging.filters",
        "adminportal.products.bulkmessaging.directives",
        'adminportal.products.bulkmessaging.dashboards',
        'adminportal.products.bulkmessaging.campaigns',
        'adminportal.products.bulkmessaging.operations',
        'adminportal.products.bulkmessaging.monitoring',
        'adminportal.products.bulkmessaging.configuration',
        'adminportal.products.bulkmessaging.troubleshooting'
    ]);

    var BulkMessagingModule = angular.module('adminportal.products.bulkmessaging');

    BulkMessagingModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging', {
            abstract: true,
            url: "/bulkmessaging",
            templateUrl: 'products/bulkmessaging/bulkmessaging.html',
            data: {
                headerKey: 'Products.BulkMessaging.PageHeader',
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

})();
