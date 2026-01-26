(function () {

    'use strict';

    angular.module('adminportal.products.dcb', [
        "adminportal.products.dcb.constants",
        "adminportal.products.dcb.filters",
        "adminportal.products.dcb.directives",
        "adminportal.products.dcb.dashboards",
        "adminportal.products.dcb.troubleshooting",
        "adminportal.products.dcb.configuration",
        "adminportal.products.dcb.templates"
    ]);

    var DcbModule = angular.module('adminportal.products.dcb');

    DcbModule.config(function ($stateProvider) {

        $stateProvider.state('products.dcb', {
            abstract: true,
            url: "/direct-carrier-billing",
            templateUrl: 'products/dcb/dcb.html',
            data: {
                headerKey: 'Products.DirectCarrierBilling.PageHeader',
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

})();
