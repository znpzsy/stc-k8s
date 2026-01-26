(function () {

    'use strict';

    angular.module('adminportal.products.messaginggw', [
        "adminportal.products.messaginggw.constants",
        "adminportal.products.messaginggw.filters",
        "adminportal.products.messaginggw.directives",
        'adminportal.products.messaginggw.dashboards',
        'adminportal.products.messaginggw.operations',
        'adminportal.products.messaginggw.troubleshooting'
    ]);

    var MessagingGwModule = angular.module('adminportal.products.messaginggw');

    MessagingGwModule.config(function ($stateProvider) {

        $stateProvider.state('products.messaginggw', {
            abstract: true,
            url: "/messaging-gateway",
            templateUrl: 'products/messaginggw/messaginggw.html',
            data: {
                headerKey: 'Products.MessagingGw.PageHeader',
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

})();
