(function () {

    'use strict';

    angular.module('adminportal.products.charginggw', [
        "adminportal.products.charginggw.constants",
        "adminportal.products.charginggw.filters",
        "adminportal.products.charginggw.directives",
        'adminportal.products.charginggw.dashboards',
        'adminportal.products.charginggw.troubleshooting'
    ]);

    var ChargingGwModule = angular.module('adminportal.products.charginggw');

    ChargingGwModule.config(function ($stateProvider) {

        $stateProvider.state('products.charginggw', {
            abstract: true,
            url: "/charging-gateway",
            templateUrl: 'products/charginggw/charginggw.html',
            data: {
                headerKey: 'Products.ChargingGw.PageHeader',
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

})();
