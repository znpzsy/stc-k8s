(function () {

    'use strict';

    angular.module('ccportal.services.cmb', [
        "ccportal.services.cmb.constants",
        "ccportal.services.cmb.filters",
        "ccportal.services.cmb.directives",
        //'ccportal.services.cmb.screening-lists',
        'ccportal.services.cmb.troubleshooting'
    ]);

    var CMBModule = angular.module('ccportal.services.cmb');

    CMBModule.config(function ($stateProvider) {

        $stateProvider.state('services.cmb', {
            abstract: true,
            url: "/call-me-back",
            templateUrl: 'services/cmb/cmb.html',
            data: {
                headerKey: 'Services.CMB.PageHeader',
                isService: true
            }
        });

    });

})();
