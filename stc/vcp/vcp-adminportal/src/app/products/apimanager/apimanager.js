(function () {

    'use strict';

    angular.module('adminportal.products.apimanager', [
        "adminportal.products.apimanager.constants",
        "adminportal.products.apimanager.filters",
        "adminportal.products.apimanager.directives",
        'adminportal.products.apimanager.dashboards',
        'adminportal.products.apimanager.troubleshooting'
    ]);

    var APIManagerModule = angular.module('adminportal.products.apimanager');

    APIManagerModule.config(function ($stateProvider) {

        $stateProvider.state('products.apimanager', {
            abstract: true,
            url: "/apimanager",
            templateUrl: 'products/apimanager/apimanager.html',
            data: {
                headerKey: 'Products.ApiManager.PageHeader',
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

})();
