(function () {

    'use strict';

    angular.module('ccportal.services.mca', [
        'ccportal.services.mca.activity-history',
        'ccportal.services.mca.activity-history-remote'
    ]);

    var MCAModule = angular.module('ccportal.services.mca');

    MCAModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca', {
            abstract: true,
            url: "/missed-call-notification",
            templateUrl: 'services/mca/missed-call-alert.html',
            data: {
                headerKey: 'Services.MCA.PageHeader',
                isService: true,
                permissions: [
                    'SERVICES_MCN'
                ]
            }
        });

    });

})();
