(function () {

    'use strict';

    angular.module('ccportal.services.rbt', [
        'ccportal.services.rbt.constants',
        'ccportal.services.rbt.filters',
        'ccportal.services.rbt.directives',
        'ccportal.services.rbt.troubleshooting',
        'ccportal.services.rbt.troubleshootingremote'
    ]);

    var MCAModule = angular.module('ccportal.services.rbt');

    MCAModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt', {
            abstract: true,
            url: '/ring-back-tone',
            templateUrl: 'services/rbt/ring-back-tone.html',
            data: {
                headerKey: 'Services.RBT.PageHeader',
                isService: true,
                permissions: [
                    'SERVICES_RBT'
                ]
            }
        });

    });

})();
