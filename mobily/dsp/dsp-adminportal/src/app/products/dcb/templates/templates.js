(function () {

    'use strict';

    angular.module('adminportal.products.dcb.templates', [
        'adminportal.products.dcb.templates.dcbprofile',
        'adminportal.products.dcb.templates.servicemessages',
        'adminportal.products.dcb.templates.serviceinvoicemessages'
    ]);

    var DcbTemplatesModule = angular.module('adminportal.products.dcb.templates');

    DcbTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('products.dcb.templates', {
            abstract: true,
            url: "/templates",
            templateUrl: "products/dcb/templates/templates.html",
            data: {
                permissions: [
                    'ALL__TEMPLATES_READ'
                ]
            },
            resolve: {
                dcbSettingsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_DCB_SETTINGS_ORGANIZATION_NAME);
                }
            }
        });

    });

})();
